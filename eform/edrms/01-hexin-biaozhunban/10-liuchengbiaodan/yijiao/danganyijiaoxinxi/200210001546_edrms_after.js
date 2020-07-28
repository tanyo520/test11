// /**************************************************基础数据获取*************************************/


// var search = window.location.search;//获取浏览器url
// var fileIds =getSearchString('fileIds', search);  //获取文件Id
// var fileNames = getSearchString('fileNames', search); //

// var receiveData = [];
// var fileIdsresult=fileIds.split(",");
// var fileNamesresult=fileNames.split(",");
// for(var i=0;i<fileIdsresult.length;i++){
// 	receiveData.push({fileId:fileIdsresult[i],fileName:fileNamesresult[i]});
// }
// receiveData = $.toJSON(receiveData);
// eform("transferfile").method("setValue", receiveData);



// /**************************************************按钮事件*************************************/

// // 流程提交前事件
// eform("eformWorkFlowButton1").method("beforeSubmit", function (action){  
// 	var memberselect = eval(eform("reorganizer").method("getValue"));
// 	var user = eval(eform.userInfo);
// 	var Is_Approval=eform("Is_Approval").method("getValue");
// 	var filestate="";
// 	if (action === eform.wf.actionType.initiate){ // 判断是发起流程
// 		debugger;
// 		if(Is_Approval=="1"){
// 			filestate=3;
// 		}else{
// 			filestate=1;
// 			for(var i=0;i<fileIdsresult.length;i++){
// 				var newid = $.genId();	
// 				var param = {
// 					Id:newid,
// 					createId: user.ID,
// 					updateId: user.ID,
// 					reorganizer: memberselect[0].guid,
// 					reorganizername: memberselect[0].text,
// 					name:fileNamesresult[i],
// 					file_id:fileIdsresult[i],
// 					source_folder_id:"16",
// 					target_folder_id:"18",
// 					notes:eform("notes").method("getValue"),
// 					filestate:filestate
// 				};
// 				eform.dataset("Insertfiletransfer", param, function(result) {
// 					if(result.ResultCode=="0"){
// 						MoveFilesToDesignatedFolder(fileIdsresult[i],"18");
// 					}			
// 				}, false);
// 			}
// 		}


// 	}

// 	else if (action == ef.wf.actionType.approve) {
// 		filestate=1;
// 		for(var i=0;i<fileIdsresult.length;i++){
// 			var newid = $.genId();	
// 			var param = {
// 				Id:newid,
// 				createId: user.ID,
// 				updateId: user.ID,
// 				reorganizer: memberselect[0].guid,
// 				reorganizername: memberselect[0].text,
// 				name:fileNamesresult[i],
// 				file_id:fileIdsresult[i],
// 				source_folder_id:"16",
// 				target_folder_id:"18",
// 				notes:eform("notes").method("getValue"),
// 				filestate:filestate
// 			};
// 			eform.dataset("Insertfiletransfer", param, function(result) {
// 				if(result.ResultCode=="0"){
// 					MoveFilesToDesignatedFolder(fileIdsresult[i],"18");
// 				}			
// 			}, false);
// 		}

// 	}

// 	return true;
// });


// eform("Is_Approval").method("onChange",function (newValue, oldValue){
// 	if(newValue=="0"){
// 		eform("Auditor").method("hide");
// 	}
// 	else{
// 		eform("Auditor").method("show");
// 	}
// });




// /**************************************************固定函数*************************************/

// /*
// 	*
// 	*@param [key] 需要检索的键
// 	*@url [key] 传入的需要分割的url地址
// 	*/

// function getSearchString(key, Url) {
// 	var str = Url;
// 	str = str.substring(104, str.length); // 获取URL中?之后的字符（去掉第二位的问号）

// 	// 以&分隔字符串，获得类似name=xiaoli这样的元素数组
// 	var arr = str.split("&");
// 	var obj = new Object();

// 	// 将每一个数组元素以=分隔并赋给obj对象 
// 	for (var i = 0; i < arr.length; i++) {
// 		var tmp_arr = arr[i].split("=");
// 		obj[decodeURIComponent(tmp_arr[0])] = decodeURIComponent(tmp_arr[1]);
// 	}
// 	return obj[key];

// }


// function MoveFilesToDesignatedFolder(filedid,entryid) {
// 	var token = $.cookie("token");
// 	var array = [];
// 	array.push(filedid);
// 	var resultinfoMes = "";
// 	$.ajax({
// 		type: "POST",
// 		async: false,
// 		url: "/api/services/Doc/MoveFolderListAndFileList",
// 		dataType: 'json',
// 		contentType: "application/json; charset=utf-8",
// 		//调用的参数列表请查找文档具体方法调用的参数列表，大小写要相同
// 		data: JSON.stringify(
// 			{
// 				"FileIdList": array,
// 				"TargetFolderId": entryid,
// 				"FolderIdList": [],
// 				"Token": token
// 			}
// 		),
// 		success: function (data) {	
// 			var resultInfo = data.result;
// 			//成功了做相关处理
// 			resultinfoMes = resultInfo;
// 		},
// 		error: function (data) {
// 			resultinfoMes = "error";
// 		}
// 	});

// }