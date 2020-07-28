/**************************************************页面初始化执行 start*************************************/
//var hiddenFolderId = '14'; //隐藏文件夹
var hiddenFolderId = top.window.globalvalue_hiddenFolderId;//隐藏文件夹ID

if(!hiddenFolderId){
	var token = getAdminToken();
	hiddenFolderId=getHiddenFolderId(token);
}

var dataArr = []; //全局变量

var taskType = $.getQueryString('taskType');


init();

//是否审批 监听事件
eform("Is_Approval").method("onClick",function (jqClick, allJqCheck){
	if( jqClick.context.value==1){
		eform("Auditor").method("show");//立卷的时候 显示 案卷档号策略 下拉列表
	}else{
		eform("Auditor").method("hide");//不立卷的时候 隐藏 案卷档号策略 下拉列表
	}
});

// $("#eformDataTable1").children(".control-iwrap").children(".panel-htop").css("height", '300px'); //固定表格高度
// $("#eformDataTable1").children(".control-iwrap").children(".panel-htop").css("overflow", 'auto');//滚动条

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

		var msg = '';
		if (eform("reorganizer").method("getValue").trim() == '') {
			msg += '请选择整编人员！<br>';
		}

		if(Is_Approval=="1"){
			if (eform("Auditor").method("getValue").trim() == '') {
				msg += '请选择审批人员！<br>';
			}
		}
		if (msg) {
			window.top.$.messager.alert("提示", msg);
			return false;
		}
		
		//不需要审批
		if(Is_Approval=="0"){
			var token = getAdminToken();
			var folder = createFolder("移交_"+new Date().getTime(),eform.recordId,'',hiddenFolderId,token);
			var folderId = folder.FolderId;
			var fileIds =localStorage.getItem("fileIds");
			var fileIdsresult=fileIds.split(",");

			var user = eval(eform.userInfo);


			var permissionList = [];
			var memberselect = eval(eform("reorganizer").method("getValue"));//整编人
			
			var starterJson = {
				"MemberId": memberselect[0].identityId,
				"MemberType":1 ,//1用户，2部门，4职位，8用户组
				"PermCateId": 2 //文件预览权限
			}
			permissionList.push(starterJson);
			
			var values = "";
			var nowStr = eform("datetime").method("getValue");
			for(var i=0;i<dataArr.length;i++){
				var newid = $.genId();
				var notes = eform("notes").method("getValue");
				values+=",('"+newid+"','"+user.ID+"','"+user.ID+"','"+nowStr+"','"+nowStr+"','"+user.Name+"','"+memberselect[0].guid+"','"+memberselect[0].text+"','"+dataArr[i][0].fileName+"','"+dataArr[i][0].fileId+"','"+dataArr[i][0].folderId+"','"+folderId+"','"+notes+"','1','"+eform.recordId+"','0')";
			}

			if(values){
				values = values.substring(1);
				var batchParam = {
					tableName :"transfer_info",
					fields :"(`Id`,`createId`,`updateId`,`createTime`,`modifiedTime`,`createname`,`reorganizer`,`reorganizername`,`name`,`file_id`,`source_folder_id`,`target_folder_id`,`notes`,`filestate`,`recordid`,`delStatus`)",
					values :values
				}
				eform.dataset("batchInsert", batchParam, function(result) {
					if(result.EffectOfRow>0){

						//移动电子文件
						MoveFilesToDesignatedFolder(fileIdsresult, folderId,token);

						for(var i=0;i<fileIdsresult.length;i++){
							//分配权限
							setFilePermission(fileIdsresult[i],permissionList,token);
						}
					}
				}, false);
			}

			window.top.$.messager.alert("提示", "发起成功！");

			window.parent.postMessage({info:'exit'}, '*');
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
			var token = getAdminToken();
			var folder = createFolder("移交_"+new Date().getTime(),eform.recordId,'',hiddenFolderId,token);
			var folderId = folder.FolderId;
			var fileIds =localStorage.getItem("fileIds");
			var fileIdsresult=fileIds.split(",");

			var user = eval(eform.userInfo);


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

			var memberselect = eval(eform("reorganizer").method("getValue"));//整编人
			var values = "";
			var nowStr = eform("datetime").method("getValue");
			for(var i=0;i<dataArr.length;i++){
				var newid = $.genId();
				var notes = eform("notes").method("getValue");
				values+=",('"+newid+"','"+user.ID+"','"+user.ID+"','"+nowStr+"','"+nowStr+"','"+user.Name+"','"+memberselect[0].guid+"','"+memberselect[0].text+"','"+dataArr[i][0].fileName+"','"+dataArr[i][0].fileId+"','"+dataArr[i][0].folderId+"','"+folderId+"','"+notes+"','3','"+eform.recordId+"','0')";
			}

			if(values){
				values = values.substring(1);
				var batchParam = {
					tableName :"transfer_info",
					fields :"(`Id`,`createId`,`updateId`,`createTime`,`modifiedTime`,`createname`,`reorganizer`,`reorganizername`,`name`,`file_id`,`source_folder_id`,`target_folder_id`,`notes`,`filestate`,`recordid`,`delStatus`)",
					values :values
				}
				eform.dataset("batchInsert", batchParam, function(result) {
					if(result.EffectOfRow>0){

						//移动电子文件
						MoveFilesToDesignatedFolder(fileIdsresult, folderId,token);

						for(var i=0;i<fileIdsresult.length;i++){
							//分配权限
							setFilePermission(fileIdsresult[i],permissionList,token);
						}
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
				var token = getAdminToken();
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
					//需要先删除发起人和审核人权限，再赋予整编人权限，以防万一整编人 是和 审核人或发起人一致
					//1、删除发起人、审核人预览权限
					deleteFilePermission(fileArr[i].fileId,deletePermissionList,token);

					//2、赋予整编人预览权限
					setFilePermission(fileArr[i].fileId,setPermissionList,token);

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


			//更新流程主表中的状态
			eform.dataset("UpdateTransferFlowStatus",{recordid:eform.recordId,flowStatus:"流程终止"}, function (results) {

				var token = getAdminToken();

				//将移动至隐藏文件夹的电子文件 移回原内容库文件夹
				var fileIdArr = [];
				for(var i=0;i<info.length;i++){
					fileIdArr.push(info[i].file_id);
				}
				MoveFilesToDesignatedFolder(fileIdArr,info[0].source_folder_id,token);

				//删除审核人的预览权限
				for(var i=0;i<info.length;i++){
					deleteFilePermission(info[i].file_id,deletePermissionList,token);
				}

			}, false);

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

	var panel = eform.loading("加载中"); // 打开遮罩层

	window.setTimeout(function(){
		//首次发起
		if(taskType=="begintask"){

			eform("flowStatus").method("setValue","移交中");
			var fileIds=localStorage.getItem("fileIds");
			var token = getAdminToken();
			var fileInfos = getInfosByFileIds( fileIds,token); //获取文件详情

			var curUser = eval(eform.userInfo);

			var transferFile = [];

			var barchParamStr = "";
			var timeStr = eform("datetime").method("getValue");
			for(var i=0;i<fileInfos.length;i++){
				var fileInfo = fileInfos[i];
				var folderId = fileInfo.ParentFolderId;
				var	fileName= fileInfo.FileName;
				var filecreatetime = fileInfo.FileCreateTime;

				var receiveData = [];

				var newid = $.genId();

				var json = {
					fileId:fileInfo.FileId,
					fileName:fileName,
					folderId:folderId
				}
				transferFile.push(json);

				receiveData.push(json);

				dataArr.push(receiveData);

				receiveData = $.toJSON(receiveData);

				newid = "'"+newid+"'";
				var createTime = "'"+timeStr+"'";
				var modifiedTime = "'"+timeStr+"'";
				var createId = "'"+curUser.ID+"'";
				var updateId = "'"+curUser.ID+"'";
				var fileId = "'"+receiveData+"'";
				filecreatetime = "'"+filecreatetime+"'";
				var transId = "'"+eform.recordId+"'";
				//(@Id, @createTime,@modifiedTime,@createId,@updateId,@fileId,@filecreatetime,@transId)
				barchParamStr += ",("+newid+","+createTime+","+modifiedTime+","+createId+","+updateId+","+fileId+","+filecreatetime+","+transId+")";
			}

			if(barchParamStr){
				barchParamStr = barchParamStr.substring(1);
			}
			var barchParam = {
				barchParam:barchParamStr
			}
			eform.dataset("batchInsertTransDetails", barchParam, function(result) {
				//批量插入
			}, false);

			eform("eformDataTable1").method("load");
			eform("transferfile").method("setValue", transferFile); //文件控件设置值

		}

		//不是第一个流程节点
		if(taskType != "begintask" && eform.wf.currentActivity.activityNo != "firstTask"){
			var blockinfo=window.eform.getBlocks();
			for(var i=0;i<blockinfo.length;i++){
				eform.setReadonly(blockinfo[i].id,true, eform.objType.block);
			}
		}

		eform.loaded(panel); // 关闭遮罩层

	},1);

}


/*通过多个文件id查询多个文件详细信息
* @param [fileId] 文件ID
*/
function getInfosByFileIds(fileIds,token) {
	var fileInfos = [];
	$.ajax({
		type: "get",
		async: false,
		url: "/api/services/File/GetFileInfosByFileIds",
		dataType: 'json',
		contentType: "application/json; charset=utf-8",
		data: {
			"fileIds": fileIds,
			"token": token
		},
		success: function (res) {			
			fileInfos = res.data;
		},
		error: function (res) {

		}
	});
	return fileInfos;
}


/*移动文件至目标文件夹
*@param [filedid] 文件ID
*@param [entryid] 目标文件夹ID
*/
function MoveFilesToDesignatedFolder(fileIdArr,entryid,token) {
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
				"FileIdList": fileIdArr,
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
function getAdminToken(){
	var token = '';
	eform.dataset("selectByKey", {tableName:'config',key:'adminToken'}, function(result) {
		if(result.Data[0] && result.Data[0][0]){
			token = result.Data[0][0].value;
		}
	}, false);
	return token;
}


//获取隐藏文件夹id
function getHiddenFolderId(adminToken){
	var host =  window.location.host;
	var hiddenFolderId = '';
	$.ajax({
		type: "POST",
		url: "/WebCore",
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



//创建隐藏文件夹
function createFolder(name,folderCode,remark,parentFolderId,token){
	var rs = {};
	$.ajax({
		type: "POST",
		url: "/api/services/Folder/CreateFolder",
		async:false,
		contentType:'application/json',
		data: JSON.stringify({
			"Name": name,
			"FolderCode": folderCode,
			"Remark": remark,
			"ParentFolderId": parentFolderId,
			"Token": token
		}),
		dataType: "json",
		success: function(res){
			rs = res.data
		}
	});
	return rs;
}