/**************************************************页面初始化执行 start*************************************/
//var hiddenFolderId = '14'; //隐藏文件夹
var hiddenFolderId = top.window.globalvalue_hiddenFolderId;//隐藏文件夹ID

if(!hiddenFolderId){
    var token = UserLoginIntegrationByUserLoginName();
    hiddenFolderId=getHiddenFolderId(token);
}
debugger;
var dataArr = []; //全局变量

var taskType = $.getQueryString('taskType');
var taskId = $.getQueryString('taskId'); // 任务id
var taskName=''; //任务名称
if (taskType != "begintask") {
    eform.dataset("selectNameByTaskId", {taskId:taskId}, function (result) {
        taskName=result.Data[0][0].NAME_;
    }, false);
}

init();
$("#eformDataTable1").children(".control-iwrap").children(".panel-htop").css("height", '300px'); //固定表格高度
$("#eformDataTable1").children(".control-iwrap").children(".panel-htop").css("overflow", 'auto');//滚动条


// $("#eformDataTable1").children(".control-iwrap").css("height", '300px'); //固定表格高度
// $("#eformDataTable1").children(".control-iwrap").css("overflow-y", 'auto');//滚动条
// $("#eformDataTable1").children(".control-iwrap").css("margin-right","5px");




/**************************************************页面初始化执行 end*************************************/



/**************************************************列表按钮事件 start*************************************/

/*
		发起流程 提交前事件
		*@param [action] 流程按钮操作
			1.initiate 发起流程  将对应记录插入详情表，移动文件
			2.approve 审核通过流程 修改对应移交记录状态
		*/
eform("eformWorkFlowButton1").method("beforeSubmit", function (action){

	var Is_Approval=eform("Is_Approval").method("getValue");

	//首次发起
	if (action === eform.wf.actionType.initiate){ // 判断是发起流程

		if(Is_Approval=="1"){

            var msg = '';
            if (eform("reorganizer").method("getValue").trim() == '') {
                msg += '请选择整编人员！<br>';
            }
            if (eform("Auditor").method("getValue").trim() == '') {
                msg += '请选择审批人员！<br>';
            }
            if (msg) {
                $.messager.alert("提示", msg);
                return false;
            }

		}

	}

	return true;
});



// 流程提交后事件
eform("eformWorkFlowButton1").method("afterSubmit", function (param){

    var filestate="";

	// 判断流程提交成功
	if (param.result === true){

	    //首次发起
		if (param.action === eform.wf.actionType.initiate){

			var fileIds =localStorage.getItem("fileIds");
			var fileIdsresult=fileIds.split(",");

			var user = eval(eform.userInfo);
            var token = UserLoginIntegrationByUserLoginName();

            var permissionList = [];

            var starterJson = {
                "MemberId": user.IdentityId,
                "MemberType":1 ,//1用户，2部门，4职位，8用户组
                "PermCateId": 2 //文件预览权限
            }
            permissionList.push(starterJson);//发起人

            var auditorselect = eval(eform("Auditor").method("getValue"));
            var auditorJson = {
                "MemberId": auditorselect[0].identityId,
                "MemberType":1 ,//1用户，2部门，4职位，8用户组
                "PermCateId": 2 //文件预览权限
            }
            permissionList.push(auditorJson);//审核人

            var memberselect = eval(eform("Auditor").method("getValue"));//整编人
			debugger;

			for(var i=0;i<dataArr.length;i++){
				var newid = $.genId();	
				var param = {
					Id:newid,
					createId: user.ID,
					updateId: user.ID,
					createTime:eform("datetime").method("getValue"),
					modifiedTime:eform("datetime").method("getValue"),
					createname:user.Name,
					reorganizer: memberselect[0].guid,
					reorganizername: memberselect[0].text,
					name:dataArr[i][0].fileName,
					file_id:dataArr[i][0].fileId,
					source_folder_id:dataArr[i][0].folderId,
					target_folder_id: hiddenFolderId,
					notes:eform("notes").method("getValue"),
					filestate:3,
                    delStatus:0,
					recordid:eform.recordId
				};
				eform.dataset("Insertfiletransfer", param, function(result) {
					if(result.ResultCode=="0"){
						MoveFilesToDesignatedFolder(fileIdsresult[i], hiddenFolderId,token);

						setFilePermission(fileIdsresult[i],permissionList,token);
					}			
				}, false);
			}


			window.parent.postMessage({info:'exit'}, '*');

		}

        //同意
        else if (param.action == eform.wf.actionType.approve) {

		    //审核节点
		    if(eform.wf.currentActivity.activityNo != "firstTask"){
                filestate=1;
                var param = {filestate:filestate,recordid:eform.recordId}
                eform.dataset("UpdateTransState", param, function(result) {
                }, false);

                //更新流程主表中的状态
                eform.dataset("UpdateTransferFlowStatus",{recordid:eform.recordId,flowStatus:"审批通过"}, function (results) {
                }, false);


                //赋予整编人预览权限
                var token = UserLoginIntegrationByUserLoginName();
                var setPermissionList = [];
                var deletePermissionList = [];
                var memberselect = [];
                var auditor = {};
                var fileArr = [];
                var transferEntity = {};
                eform.dataset("selectById",{tableName:'transfer',Id:eform.recordId}, function(result) {
                    transferEntity = result.Data[0][0];
                    memberselect = JSON.parse(result.Data[0][0].reorganizer);
                    auditor = JSON.parse(result.Data[0][0].Auditor)[0];
                    fileArr = JSON.parse(result.Data[0][0].transferfile);
                }, false);

                //整编人
                var reorganizerJson = {
                    "MemberId": memberselect[0].identityId,
                    "MemberType":1 ,//1用户，2部门，4职位，8用户组
                    "PermCateId": 2 //文件预览权限
                }
                setPermissionList.push(reorganizerJson);

                //发起人
                var starter = {}
                eform.dataset("selectByGuId",{guid:transferEntity.createId}, function(result) {
                    starter = result.Data[0][0];
                }, false);
                var starterJson = {
                    "MemberId": starter.user_identityID,
                    "MemberType":1, //1用户，2部门，4职位，8用户组
                    "PermType":10
                }
                deletePermissionList.push(starterJson);
                //审批人
                var auditorJson = {
                    "MemberId": auditor.identityId,
                    "MemberType":1, //1用户，2部门，4职位，8用户组
                    "PermType":10
                }
                deletePermissionList.push(auditorJson);


                for(var i=0;i<fileArr.length;i++){

                    //1、赋予整编人预览权限
                    setFilePermission(fileArr[i].fileId,setPermissionList,token);

                    //2、删除发起人、审核人预览权限
                    deleteFilePermission(fileArr[i].fileId,deletePermissionList,token);

                }

                window.parent.postMessage({info:'exit'}, '*');
            }

        }

        //终止
        else if (param.action == eform.wf.actionType.cancel) {

			var auditor = {};
            eform.dataset("selectById",{tableName:'transfer',Id:eform.recordId}, function(result) {
            	//查询流程主表
                auditor = JSON.parse(result.Data[0][0].Auditor)[0];
            }, false);
            var deletePermissionList = [];
            var auditorJson = {
                "MemberId": auditor.identityId,
                "MemberType":1, //1用户，2部门，4职位，8用户组
                "PermType":10
            }
            deletePermissionList.push(auditorJson);//审核人

			var info = [];
            var param = {recordid:eform.recordId};
            eform.dataset("selecttransferinfo", param, function(result) {
            	//查询流程详情表
                info=result.Data[0];
            }, false);

            var token = UserLoginIntegrationByUserLoginName();
            for(var i=0;i<info.length;i++){
                //删除审核人的预览权限
                deleteFilePermission(info[i].file_id,deletePermissionList,token);

                //将移动至隐藏文件夹的电子文件 移回原内容库文件夹
                MoveFilesToDesignatedFolder(info[i].file_id,info[i].source_folder_id,token);
            }

            //更新流程主表中的状态
            eform.dataset("UpdateTransferFlowStatus",{recordid:eform.recordId,flowStatus:"流程终止"}, function (results) {
            }, false);

            // eform("flowStatus").method("setValue","审批通过")

            window.parent.postMessage({info:'exit'}, '*');
        }

	}

});


/*
*@param [jqClick] 点击的checkbox或radio(jquery对象)
*@param [allJq] 所有的checkbox或radio(jquery对象)
是否需要审批选择时间 是(1)：审核人员显示，否(0)：审核人员隐藏
*/
eform("Is_Approval").method("onClick",function (jqClick, allJqCheck){

	if(jqClick[0].defaultValue=="0"){
		eform("Auditor").method("hide");
	}
	else{
		eform("Auditor").method("show");
	}
});




/**************************************************固定函数    start**************************************/

/*
*初始化方法，获取浏览器内文件ID以及文件名称
*/
function init(){

    //首次发起
    if(taskType=="begintask"){
        //var fileIds=$.getQueryString("fileIds");
        var panel = eform.loading("请稍等"); // 打开遮罩层
        eform("flowStatus").method("setValue","移交中");
        var fileIds=localStorage.getItem("fileIds");
        debugger
        var fileIdsresult=fileIds.split(",");
        var user = eval(eform.userInfo);
        var token = UserLoginIntegrationByUserLoginName();
        for(var i=0;i<fileIdsresult.length;i++){
            var receiveData = [];
            var fileInfo = getInfoByFileId( fileIdsresult[i],token ); //获取文件详情
            var folderId = fileInfo.ParentFolderId;
            var	fileName= fileInfo.FileName;
            var filecreatetime = fileInfo.FileCreateTime;
            var user = eval(eform.userInfo);
            receiveData.push({
                fileId:fileIdsresult[i],
                fileName:fileName,
                folderId:folderId
            });
            //获取浏览器里的文件夹名称以及ID 存放至数组中
            var newid = $.genId();

            dataArr.push(receiveData);


            receiveData = $.toJSON(receiveData);


            var param = {
                Id:newid,
                createTime:eform("datetime").method("getValue"),
                modifiedTime:eform("datetime").method("getValue"),
                createId:user.ID,
                updateId: user.ID,
                fileId:receiveData,
                filecreatetime:filecreatetime,
                transId:eform.recordId
            };
            eform.dataset("InsertTransDetails", param, function(result) {
            }, false);
        }
        eform("eformDataTable1").method("load");
        eform("transferfile").method("setValue", receiveData); //文件控件设置值
        eform.loaded(panel); // 关闭遮罩层



    }

    //不是第一个流程节点
    if(taskType != "begintask" && eform.wf.currentActivity.activityNo != "firstTask"){
        var blockinfo=window.eform.getBlocks();
        for(var i=0;i<blockinfo.length;i++){
            eform.setReadonly(blockinfo[i].id,true, eform.objType.block);
        }
    }


}


/*通过文件id查询文件详细信息
* @param [fileId] 文件ID
*/
function getInfoByFileId(fileId,token) {
	var fileInfo = {};
	$.ajax({
		type: "get",
		async: false,
		url: "/api/services/File/GetFileInfoById",
		dataType: 'json',
		contentType: "application/json; charset=utf-8",
		data: {
			"fileId": fileId,
			"token": token
		},
		success: function (res) {			
			fileInfo = res.data;
		},
		error: function (res) {

		}
	});
	return fileInfo;
}


/*移动文件至目标文件夹
*@param [filedid] 文件ID
*@param [entryid] 目标文件夹ID
*/
function MoveFilesToDesignatedFolder(filedid,entryid,token) {
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
				"TargetFolderId": entryid,
				"FolderIdList": [],
				"Token": token
			}
		),
		success: function (data) {	
			var resultInfo = data.result;
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


//获取隐藏文件夹id
function getHiddenFolderId(adminToken){
    var host =  window.location.host;
    var hiddenFolderId = '';
    $.ajax({
        type: "POST",
        url: window.location.protocol+"//"+host+"/WebCore",
        async:false,
        data:{
            "module": 'WebClient',
            "fun": "GetRootFolderList",
            "token": adminToken,
            "folderName":"",
            "pageNum":"1",
            "pageSize":"100"
        },
        success: function(res){
            debugger;
            var resL = JSON.parse(res);
            var list = resL.folderList;

            for(var i=0;i<list.length;i++){
                if(list[i].Name="档案隐藏文件夹"){
                    hiddenFolderId = list[i].Id;
                }
            }
        }
    });
    return hiddenFolderId;
}


//给文件分配预览权限
function setFilePermission(fileId,Permissions,token) {
    var host =  window.location.host;
    var rs = {};
    $.ajax({
        type: "POST",
        url: "/api/services/FilePermission/SetPermission",
        async:false,
        contentType:'application/json',
        data: JSON.stringify({
            "FileId": fileId,
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

//获取文件的权限列表
function getFilePermission(fileId,token) {
    var host =  window.location.host;
    var rs = {};
    $.ajax({
        type: "GET",
        url: "/api/services/FilePermission/GetFilePermission",
        async:false,
        data: {
            "fileId": fileId,
            "token": token
        },
        success: function(res){
            rs = res
        }
    });
    return rs;
}