/************************************************表格按钮操作事件**************************************/
/*
	*1.验证是否选择记录 单行
	*2.驳回  
	    2.1.移动文件至 移交前文件夹
		2.2.删除移交状态信息
	*/

eform("eformListGrid1").method("customButtonEvent",function (formId, ids, name, callback){
    var rows = eform("eformListGrid1").method("getSelectedRows");
	if(rows.length==0){
		window.top.$.messager.alert("提示", "请先选择记录！");
		return false;
	}
	if(name == "驳回"){
		window.top.$.messager.confirm("提示", "确认此操作吗", function (bool){ if (bool === true) {

			var deletePermissionList = [];
            var reorganizerJson = {
                "MemberId": eform.userInfo.IdentityId,
                "MemberType":1, //1用户，2部门，4职位，8用户组
                "PermType":10
            }
            deletePermissionList.push(reorganizerJson);

            var token = UserLoginIntegrationByUserLoginName();
			for(var i=0;i<rows.length;i++){

				var fileId = rows[i].file_id;
				var folderId = rows[i].source_folder_id;

                //移回原文件夹
                MoveFilesToDesignatedFolder(fileId, folderId,token);

				//删除整理人预览权限
				deleteFilePermission(fileId,deletePermissionList,token);

				var param = {
					Id:rows[i].ID					
				};
				eform.dataset("Deletefiletransfer", param, function(result) {
					if(result.ResultCode=="0"){	

						eform("eformListGrid1").method("load");
					}			
				}, false);

			}
			window.top.$.messager.alert("提示", "驳回成功");
		}});
	}

    else if(name == "预览"){
        window.open("/preview.html?fileid="+rows[0].file_id);
    }
	callback && callback();// 最后一行,该行代码必须
});




/************************************************表格按钮重定向事件**********************************/
/*
	*1.验证是否选择记录 单行
	*2.归档  跳转至新页面  200121112355
	*/
eform("eformListGrid1").method("onUrlFormatter",function (url, operateBtn) {	
	if(eform("eformListGrid1").method("getSelectedRows").length==0 ){
		window.top.$.messager.alert("提示", "请先选择记录！")
		return false;
	}

	if(operateBtn.formName== "整编"){

		// 		if(eform("eformListGrid1").method("getSelectedRows").length>1 ){
		// 		window.top.$.messager.alert("提示", "只能选择一条记录！")
		// 		return false;
		// 	}

		var newFormUrl = eform.virtualPath + '/index?formid=200121112355_edrms&skin=techblue';
		return  newFormUrl;			
	}
});




/************************************************固定函数**********************************************/

/*移动文件至目标文件夹
*@param [filedid] 文件ID
*@param [targetfolderid] 目标文件夹ID
*/
function MoveFilesToDesignatedFolder(filedid,targetfolderid,token) {
	//文件ids
	var array = [];
	array.push(filedid);
	var resultinfoMes = "";
	$.ajax({
		type: "POST",
		async: false,
		url: "/api/services/Doc/MoveFolderListAndFileList",
		dataType: 'json',
		contentType: "application/json; charset=utf-8",
		//调用的参数列表请查找文档具体方法调用的参数列表，大小写要相同
		data: JSON.stringify(
			{
				"FileIdList": array,
				"TargetFolderId": targetfolderid,
				"FolderIdList": [],
				"Token": token
			}
		),
		success: function (data) {
			debugger;
			var resultInfo = data.result;//目前返回值是815
			//成功了做相关处理
			resultinfoMes = resultInfo;
		},
		error: function (data) {
			resultinfoMes = "error";
		}
	});
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


//删除文件的预览权限
function deleteFilePermission(fileId,Permissions,token) {
    var host =  window.location.host;
    var rs = {};
    $.ajax({
        type: "POST",
        url: "/api/services/FilePermission/DeleteFilePermission",
        async:false,
        contentType:'application/json',
        data: JSON.stringify({
            "FileId": fileId,
            "Mermbers": Permissions,
            "Token": token
        }),
        dataType: "json",
        success: function(res){
            rs = res
        }
    });
    return rs;
}