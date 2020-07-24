debugger;
// var data_id = eform.parentForm("data_id").method("getValue"); 
// var patent_data_id = eform.parentForm("patent_data_id").method("getValue"); 
// var data_type = eform.parentForm("data_type").method("getValue"); 
var folderId = eform.parentForm("folder_id").method("getValue"); 

// eform("data_id").method("setValue",data_id); 
// eform("patent_data_id").method("setValue",patent_data_id); 
// eform("data_type").method("setValue",data_type);

/* 
* 表单提交前事件,返回false将不会提交表单
* formId：当前表单编号
*/
eform.engEvent("saveBefore", function (formId) {
    var perm_value = eform("perm_value").method('getValue');
    var token = UserLoginIntegrationByUserLoginName();
    var list = [];
	var MemberId = eform("identityId").method('getValue')-0;
	var MemberType=1;
    if(eform("perm_type").method('getValue')==5){
        MemberType = 2
    }
    else if(eform("perm_type").method('getValue')==4){
        MemberType = 4
    }
    else if(eform("perm_type").method('getValue')==3){
        MemberType = 8
    }
    if(perm_value==1){
        var json = {
            "MemberId": MemberId,
            "MemberType": MemberType,
            "PermCateId": 12 //管理权限
        }
        list.push(json);
       
    }else{
        var json = {
            "MemberId": MemberId,
            "MemberType": MemberType,
			"PermCateId": 7 //无权限
        }
        list.push(json);
    }
	debugger;
	setPermissions(folderId,list,token);
	
	
    return true;
});



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