var data_id = eform.parentForm("data_id").method("getValue"); 
var root_data_id = eform.parentForm("root_data_id").method("getValue"); 
var patent_data_id = eform.parentForm("patent_data_id").method("getValue"); 
var data_type = eform.parentForm("data_type").method("getValue");
var folderId =  eform.parentForm("folder_id").method("getValue");

eform("data_id").method("setValue",data_id); 
eform("patent_data_id").method("setValue",patent_data_id); 
eform("data_type").method("setValue",data_type); 

var memberList = [];
//成员选择控件 监听事件
eform("eformSelectMember1").method("onChange",function (newValue, oldValue){
	memberList = newValue;
});

var formId = eform.formId;//获取当前表单id

//保存
window.save = function (callback) {
	var panel = eform.loading("正在创建，请稍等"); // 打开遮罩层
	var rs = mySave();
	if(rs==false){
		eform.loaded(panel); // 关闭遮罩层
		return false;
	}
	eform.loaded(panel); // 关闭遮罩层
	
	eform.parentForm("eformDataTable1").method("getControl").ChildFormDialog.close();//关闭弹窗
};

//保存并新建
window.saveandnew = function (callback) {

	var panel = eform.loading("正在创建，请稍等"); // 打开遮罩层
	var rs = mySave();
	if(rs==false){
		eform.loaded(panel); // 关闭遮罩层
		return false;
	}
	eform.loaded(panel); // 关闭遮罩层
};


function mySave() {
	var check_data_id = data_id;
	var check_data_type = data_type;

	if(memberList.length==0){
		window.top.$.messager.alert("提示","请至少选择一个成员！")
		return false;
	}

	var perm_value = eform("perm_value").method('getValue');

	var msg = "";
	for(var i=0;i<memberList.length;i++){
		var res = checkRepeat(check_data_id, check_data_type, memberList[i].guid );
		if(!res){
			msg+=memberList[i].text+"已有权限记录！<br>";
		}
	}
	if(msg){
		window.top.$.messager.alert("提示",msg);
		return false;
	}else{
		var list = [];
		var now = new Date();
		for(var i=0;i<memberList.length;i++){
			var param = {
				Id:$.genId()
				, createId:eform.userInfo.id
				, updateId:eform.userInfo.id
				, del_status:'0'
				, perm_type: memberList[i].memberType
				, perm_id: memberList[i].guid
				, identityId: memberList[i].identityId
				, member_name: memberList[i].text
				, perm_value: perm_value
				, data_type: data_type
				, data_id: data_id
				, patent_data_id: patent_data_id
				, field_name: ''
			}
			var MemberType=1;
			if(memberList[i].memberType==5){
				MemberType = 2
			}
			else if(memberList[i].memberType==4){
				MemberType = 4
			}
			else if(memberList[i].memberType==3){
				MemberType = 8
			}
			if(perm_value==1){//如果权限类别为 有权限
				var json = {
					"MemberId": memberList[i].identityId,
					"MemberType":MemberType ,//1用户，2部门，4职位，8用户组
					"PermCateId": 12 //管理权限
				}
				list.push(json);
			}else{
				var json = {
					"MemberId": memberList[i].identityId,
					"MemberType": MemberType,
					"PermCateId": 7 //无权限
				}
				list.push(json);
			}
			eform.dataset("insertDataPermissionNew", param, function (result1) {
			}, false);
		}
		var token = UserLoginIntegrationByUserLoginName();
		if(folderId!='null'){
			setPermissions(folderId,list,token);
		}
		window.top.$.messager.alert("提示", "保存成功！");
		eform.parentForm("eformDataTable1").method("load"); //父页面表格刷新
		return true;

	}
}


/*
*判断是否已经有权限 
*dataId 全宗或档案类型id
*dataType 数据类型 0全宗 1档案类型
*permId 成员的guid
*/
function checkRepeat(dataId,dataType,permId){
	var res = true;
	var param = {
		dataId:dataId
		,dataType:dataType
		,permId:permId
	};
	eform.dataset("getPermissionByCondition", param, function (result) {
		if(result.Data[0].length>0){
			res=false;
		}
	}, false);
	return res;
}

/**
 * 批量设置文件夹权限
 * @param {*} folderId 
 * @param {*} Permissions 
 * @param {*} token 
 */
function setPermissions(folderId,Permissions,token){
	var host =  window.location.host;
	var rs = {};
	$.ajax({
		type: "POST",
		url: window.location.protocol+"//"+host+"/api/services/FolderPermission/SetPermissions",
		async:false,
		contentType:'application/json',
		data: JSON.stringify({
			"ID": folderId,
			"Permissions": Permissions,
			"Token": token
		}),
		dataType: "json",
		success: function(res){
			rs = res
		}
	});
	return rs;
}

/**
 * 批量删除文件夹权限
 * @param {*} folderId 
 * @param {*} members 
 * @param {*} token 
 */
function deleteFolderPermission(folderId,members,token){
	var host =  window.location.host;
	var rs = {};
	$.ajax({
		type: "POST",
		url: window.location.protocol+"//"+host+"/api/services/FolderPermission/DeleteFolderPermission",
		async:false,
		contentType:'application/json',
		data: JSON.stringify({
			"FolderId": folderId,
			"Mermbers": members,
			"Token": token
		}),
		dataType: "json",
		success: function(res){
			rs = res
		}
	});
	return rs;
}

//获取admin的token
function UserLoginIntegrationByUserLoginName(){
	var host =  window.location.host;
	var token = '';
	$.ajax({
		type: "POST",
		url: window.location.protocol+"//"+host+"/api/services/Org/UserLoginIntegrationByUserLoginName",
		async:false,
		contentType:'application/json',
		data: JSON.stringify({
			"LoginName": 'admin',
			"IPAddress": host,
			"IntegrationKey": '46aa92ec-66af-4818-b7c1-8495a9bd7f17'
		}),
		dataType: "json",
		success: function(res){
			token = res.data
		}
	});
	return token;
}