var u_data_id = $.getQueryString("Id");
var pId = $.getQueryString("pId");
var isSect = $.getQueryString("isSect");
var name = $.getQueryString("name");

var folderId  = $.getQueryString("folderId");

eform("data_id").method('setValue',u_data_id);
eform("patent_data_id").method('setValue',pId);
eform("folder_id").method('setValue',folderId);

var currentDataStr = '全宗：'+name
var data_type='0'
if(isSect!=1){
	currentDataStr = '档案类型：'+name
	data_type='1';
}

eform("currentData").method('setValue', currentDataStr)
eform("data_type").method('setValue', data_type);
eform("root_data_id").method('setValue',$.getQueryString("rootId"));


/*url格式化事件，子窗体将连接到新的url地址
* url 原打开的表单地址
* operateBtn 点击的操作按钮配置信息
*/
eform("eformDataTable1").method("onUrlFormatter",function (url,operateBtn) {
	
	if (operateBtn.formName == "新增"){
		if(!eform("data_id").method('getValue')){
			window.top.$.messager.alert("提示","请先选择一个全宗或档案类型")
			return false;
		}
		else{
			var newFormUrl = eform.virtualPath + '/index?formid=200220100923_edrms&skin=techblue';
			return newFormUrl;
		}
	}

	else if(operateBtn.formName== "编辑"){
		var info = eform("eformDataTable1").method("getSelectedRows");//获取列表被选中的值
		if(info[0].ifFromParent==1){
			window.top.$.messager.alert("提示","不能编辑父级的权限")
			return false;
		}
		var newFormUrl = eform.virtualPath + '/index?formid=200226011406_edrms&skin=techblue&Id='+info[0].Id;
		return newFormUrl;
	}

});

//自定义操作按钮
eform("eformDataTable1").method("customButtonEvent", function (formId, ids, name, callback) {

	if (name == "删除") {
		var rows = eform("eformDataTable1").method("getSelectedRows");
		if (rows.length == 0) {
			window.top.$.messager.alert("提示", "请先选择需要删除的数据！");
			return false;
		}


		var flag = true;
		var ids = "";
		var members = [];
		for(var i=0;i<rows.length;i++){
			ids = ids + ",'" + rows[i].Id + "'";
			if(rows[i].ifFromParent==1){
				flag=false;
			}
			var json = {
				"MemberId": rows[i].identityId,
				"MemberType": rows[i].perm_type
			}
			if(json.MemberId && json.MemberType){
				members.push(json);
			}
		}
		if(!flag){
			window.top.$.messager.alert("提示","不能删除父级权限");
			return false;
		}

		window.top.$.messager.confirm("提示", "确认此操作吗？", function (bool) {

			if (bool === true) {

				var token = UserLoginIntegrationByUserLoginName();
				if(folderId!='null' && members.length>0 ){
					deleteFolderPermission(folderId,members,token);
				}

				ids = ids.substring(1);
				debugger;
				eform.dataset("deleteByIds", {tableName:'permission',ids:ids}, function (result1) {
					window.top.$.messager.alert("提示","操作成功！");
				}, false);

				eform("eformDataTable1").method("load"); //表格刷新
			}
		});
	}
	callback && callback();// 最后一行,该行代码必须
});



/*子窗体自定义按钮点击事件
* formId 表单ID
* id 选中记录编号
* name 按钮名称
* callback 点击后事件
*/
eform("eformDataTable1").method("childFormButtonEvent", function (formId, ids, name, callback) {
	if (name == "保存") {
		 eform("eformDataTable1").method("getControl").ChildFormDialog.iframe[0].contentWindow.window.save(function () {
            eform("eformDataTable1").method("getControl").ChildFormDialog.close();
            eform("eformDataTable1").method("load"); //父页面表格刷新
        });
	}
	else if (name == "保存并新增") {
		eform("eformDataTable1").method("getControl").ChildFormDialog.iframe[0].contentWindow.window.saveandnew(function () {
            eform("eformDataTable1").method("load"); //父页面表格刷新
        });
	}
	callback && callback();// 最后一行,该行代码必须
});


//获取admin的token
function UserLoginIntegrationByUserLoginName(){
	var host =  window.location.host;
	var token = '';
	$.ajax({
		type: "POST",
		url: "/api/services/Org/UserLoginIntegrationByUserLoginName",
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