var taskType = $.getQueryString('taskType'); // 1

var archTypeId_from = $.getQueryString('archTypeId'); // 1
var formId = $.getQueryString('PropertiesFormId'); // 1
var curToken = $.cookie("token");

var archTableName_g = '';
var dossierTableName_g = '';
if(taskType=="begintask"){
	var flowtype= $.getQueryString('flowtype'); //
	eform("flowtype").method("setValue",flowtype);
    eform("arch_type_id").method("setValue",archTypeId_from);
	//根据档案类型id 获取档案表名和案卷表名

	eform.dataset("Selectarchtype",{Id:archTypeId_from}, function (results) {
		var archType =  results.Data[0][0];
		archTableName_g = archType.arch_table_name; 
		dossierTableName_g = archType.dossier_table_name;
	}, false);

	var dbname = '';
	if(flowtype=='0'){
		dbname = archTableName_g;
	}else{
		dbname = dossierTableName_g;
	}

	var info= eform.parentForm("eformListGrid1").method("getSelectedRows"); //获取父页面的值
	var user = eval(eform.userInfo);
	for(var i=0;i<info.length;i++){
		var newid = $.genId();	
		var param = {
			Id:newid,
			createTime:eform("appdate").method("getValue"),
			modifiedTime:eform("appdate").method("getValue"),		
			createId: user.ID,
			updateId: user.ID,
			name:info[i].name,
			user:info[i].user,
			Duration:info[i].duration,
			recordid:eform.recordId,
			dbname:dbname,
			detailsId:info[i].ID,
			formId:formId
		};
		eform.dataset("Insertarchplacedetails", param, function(result) {
		}, false);
	}
	eform("eformDataTable1").method("load");
}


if (taskType != "begintask" && eform.wf.currentActivity.activityNo != "firstTask") {
	var blockinfo=window.eform.getBlocks();
	for(var i=0;i<blockinfo.length;i++){
	    if(blockinfo[i].id!='60e7b341-3c93-3517-e87e-fee2c3ae1307'){

            eform.setReadonly(blockinfo[i].id,true, eform.objType.block);
        }
	}

}

/*数据删除前事件，返回false不会执行删除操作(1.1版开始有效)
* rows 待删除的行对象列表
* operate 点击按钮的配置对象
*/
eform("eformDataTable1").method("onBeforeDeleteData",function (rows, operate) {

	var flowtype=eform("flowtype").method("getValue");

	if(flowtype=="0"){ //档案

		var archplacedetails = {};
		eform.dataset("Selectarchplacedetails",{recordid:eform.recordId},function(result){	
			archplacedetails = result.Data[0][0];
		},false);

		var paramss ={
			tableName:archplacedetails.dbname
			,recordid:eform.recordId
			,entrystate:'0'
		};									
		eform.dataset("Updatearchplacestate",paramss, function (results) {			
		}, false);	

	}
	else{ //案卷

		var archplacedetails = {};
		eform.dataset("Selectarchplacedetails",{recordid:eform.recordId},function(result){	
			archplacedetails = result.Data[0][0];
		},false);
		var archTypeId = archplacedetails.arch_type_id;

		//根据档案类型id 获取档案表名和案卷表名
		var archTableName = '';
		var dossierTableName = '';
		eform.dataset("Selectarchtype",{Id:archTypeId}, function (results) {
			var archType =  result.Data[0][0];
			archTableName = archType.arch_table_name; 
			dossierTableName = archType.dossier_table_name;
		}, false);

		//更新案卷 和 档案的状态
		var paramss ={
			archTableName:archTableName
			,dossierTableName:dossierTableName
			,recordid:eform.recordId
			,dossierstate:'0'
			,entrystate:'0'
		};				
		eform.dataset("UpdateDossierArchStates",paramss, function (results) {						
		}, false);
	}

	return true;

});


// 流程提交前事件
eform("eformWorkFlowButton1").method("beforeSubmit", function (action){

	return true;
});


// 流程提交后事件
eform("eformWorkFlowButton1").method("afterSubmit", function (param){

    var flowtype=eform("flowtype").method("getValue");
	// 判断流程提交成功
	if (param.result === true){

        var action = param.action;
		if (action === eform.wf.actionType.initiate){

            var info= eform.parentForm("eformListGrid1").method("getSelectedRows"); //获取父页面的值

            if(flowtype=="0"){
                var archIds = "";
                for(var i=0;i<info.length;i++){
                    archIds = archIds+",'"+ (info[i].ID==null?info[i].Id:info[i].ID) +"'"
                }
                archIds = archIds.substring(1);

                var params ={
                    archTableName :archTableName_g
                    ,archIds:archIds
                    ,entryState :'9'
                };
                eform.dataset("updateStateByArchIds", params, function (result) {
                    console.log(result);
                }, false);

            }
            else{

                var dossierIds = "";
                for(var i=0;i<info.length;i++){
                    dossierIds = dossierIds+",'"+ (info[i].ID==null?info[i].Id:info[i].ID) +"'"
                }
                dossierIds = dossierIds.substring(1);

                var params ={
                    archTableName :archTableName_g
                    ,dossierTableName:dossierTableName_g
                    ,dossierIds:dossierIds
                    ,entrystate :'9'
                    ,dossierstate:'9'
                };
                eform.dataset("updateDossierStateByDossierIds", params, function (result) {
                    console.log(result);
                }, false);

            }


            debugger;
			eform.parentForm("eformListGrid1").method("load"); //父页面表格刷新
            try{
                eform.parentForm("eformListGrid1").method("getControl").ChildFormDialog.close();
            }catch(e){
                $.messager.alert("提示", e);
                //alert(e) // 可执行
			}
            window.postMessage({info:'exit'}, '*');
		}else if(action === eform.wf.actionType.approve){	//审批人 同意
            if(eform.wf.currentActivity.activityNo !="firstTask"){

                debugger;
                var account = eform.userInfo.Account;
                var deptCode = eform.userInfo.MainDepartmentIdentityId;

                var archTypeId =eform("arch_type_id").method("getValue");

                var archTableName = '';
                var dossierTableName = '';
                var sectId = '';
                var archtypename = "";
                var sectname = "";
                var archPropFormId = "";
                var dossierPropFormId = "";
                eform.dataset("Selectarchtype", {Id:archTypeId}, function(result) {
                    archTableName = result.Data[0][0].arch_table_name;
                    dossierTableName = result.Data[0][0].dossier_table_name;
                    sectId = result.Data[0][0].sect_id;
                    archtypename = result.Data[0][0].name;
                    archPropFormId=result.Data[0][0].archPropFormId;
                    dossierPropFormId=result.Data[0][0].dossierPropFormId;
                }, false);
                eform.dataset("SelectSect", {Id: sectId}, function (result) {
                    var data = result.Data[0][0];
                    sectname = data.name;
                }, false);

                //档案
                if(flowtype=="0"){//档案

                    var info = [];
                    var params0 ={
                        tableName: archTableName
                        ,recordId:eform.recordId
                    };
                    eform.dataset("SelectArchByFlowRecordId",params0, function (results) {
                        info = results.Data[0]
                    }, false);

                    var archIds = "";
                    for(var i=0;i<info.length;i++){
                        var fn=(function(i){
                            archIds = archIds + ",'" + info[i].Id + "'";
                            var archive = info[i];
                            var entityId = archive.Id;
                            var archNumber = archive.number;
                            if(!archNumber){
                                //生成档号
                                archNumber = createNumber(account, deptCode, archTypeId, entityId, archTableName, '1', archive);
                            }
                            var param = {  Id:entityId, tablename: archTableName, number:archNumber};
                            eform.dataset("UpdateEntryStateAndNumber",param, function (result){
                                //更改档号、状态、归档人、归档时间
                            }, false);
                            archive.entrystate='1';
                            archive.objectid=entityId;
                            archive.number=archNumber;
                            //插入es
                            insertES(archive,archPropFormId,sectname,archtypename,archTableName);
                        });
                        fn(i);
                    }

                    archIds = archIds.substring(1);
                    eform.dataset("updateArchDirArchStatus", {ids: archIds,archStatus:'1'}, function (result) {
                        //修改档案中间表状态
                    }, false);


                }

                //案卷
                else{//案卷

                    //更新案卷
                    var dossierList = [];
                    eform.dataset("SelectArchByFlowRecordId",{tableName:dossierTableName,recordId:eform.recordId}, function (result){
                        dossierList=result.Data[0];
                    }, false);
                    var dossierIds = "";
                    for(var i=0;i<dossierList.length;i++){
                        var fn=(function(i){
                            var entityId = dossierList[i].Id;
                            dossierIds = dossierIds+",'"+ entityId +"'"
                            var dossier = {};
                            eform.dataset("selectArchById", {tableName: dossierTableName,archId: entityId}, function (result) {
                                dossier = result.Data[0][0];
                            }, false);
                            //生成案卷号
                            var dossierNumber = dossier.number;
                            if(!dossierNumber){
                                dossierNumber = createNumber(account, deptCode, archTypeId, entityId, dossierTableName, 2, dossier);
                            }
                            var param = {  Id: entityId,tablename:dossierTableName, number:dossierNumber};
                            eform.dataset("UpdateDossierStateAndNumber",param, function (result){
                                //更新案卷号和状态，归档人，归档时间
                            }, false);


                            dossier.entrystate = '1';
                            dossier.objectid = entityId;
                            dossier.number = dossierNumber;
                            insertDossierES(dossier,dossierPropFormId,sectname,archtypename,dossierTableName,archTableName);
                        });
                        fn(i);
                    }
                    dossierIds = dossierIds.substring(1);
                    eform.dataset("updateDossierDirArchStatus", {ids: dossierIds,archStatus: 1}, function (result) {
                        //修改案卷中间表状态
                    }, false);

                    var archList = [];
                    var params1 = {
                        archTableName: archTableName
                        ,dossierTableName :dossierTableName
                        ,recordId:eform.recordId
                    }
                    eform.dataset("SelectArchOfDossierByFlowRecordId",params1, function (result){
                        if(result.Data){
                            archList=result.Data[0];
						}
                    }, false);

                    if(archList.length>0){
                        //更新案卷中的档案条目
                        var archIds = '';
                        for(var i=0;i<archList.length;i++){
                            var fn=(function(i){
                                var archive = archList[i];
                                var entityId = archive.Id;
                                archIds = archIds + ",'" + archList[i].Id + "'";

                                //生成档号
                                var archNumber = archive.number;
                                if(!archNumber){
                                    if(top.window.ifInnerArchNoByDossierNo=='1'){
                                        var dossierNumber = '';
                                        eform.dataset("selectById",{tableName:dossierTableName,Id:archive.dossierId}, function (result){
                                            dossierNumber=result.Data[0][0];
                                        }, false);
                                        archNumber = dossierNumber+numFormat(i+1);
                                    }else{
                                        archNumber = createNumber(account, deptCode, archTypeId, entityId, archTableName,1, archive);
                                    }
                                }
                                var param = {  Id:entityId, tablename:archTableName, number:archNumber};
                                eform.dataset("UpdateEntryStateAndNumber",param, function (result){
                                    //更新档案号、状态、归档人、归档时间
                                }, false);
                                archive.entrystate='1';
                                archive.objectid=entityId;
                                archive.number=archNumber;
                                insertES(archive,archPropFormId,sectname,archtypename,archTableName);

                            });
                            fn(i);
                        }

                        archIds = archIds.substring(1);
                        eform.dataset("updateArchDirArchStatus", {ids: archIds,archStatus:'1'}, function (result) {
                            //修改档案中间表状态
                        }, false);
					}
                }
            }
        }
        else if (action == eform.wf.actionType.cancel) {   //终止
            var detailsList = [];
            var archTableName = '';
            var dossierTableName = '';


            var archTypeId =eform("arch_type_id").method("getValue");

            eform.dataset("Selectarchtype", {Id:archTypeId}, function(result) {
                archTableName = result.Data[0][0].arch_table_name;
                dossierTableName = result.Data[0][0].dossier_table_name;
                // sectId = result.Data[0][0].sect_id;
                // archtypename = result.Data[0][0].name;
            }, false);
            eform.dataset("Selectarchplacedetails", {recordid: eform.recordId}, function (result) {
                detailsList = result.Data[0];
            }, false);

            var ids = "";
            for (var i = 0; i < detailsList.length; i++) {
                ids = ids + ",'" + detailsList[i].detailsId + "'"
            }
            ids = ids.substring(1); //发起流程的案卷或档案ids的拼接

            if (flowtype == "0") {
                var param = {
                    ids: ids
                    , tableName: archTableName
                    , entryState: '0'  //整编库的待归档
                };
                eform.dataset("updateEntryStateByIds", param, function (result) {
                    //批量修改档案状态
                }, false);
                eform.dataset("updateArchDirArchStatus", {ids:ids,archStatus:0}, function (result) {
                    //批量修改档案中间表状态
                }, false);
            }
            else {
                var params = {
                    dossierIds: ids
                    , archTableName: archTableName
                    , dossierTableName: dossierTableName
                    , entrystate: '0' //整编库的待归档
                };
                eform.dataset("updateDossierStateByDossierIds", params, function (result) {
                    //批量修改案卷状态和卷内档案状态
                }, false);
                eform.dataset("updateDossierDirArchStatus", {ids:ids,archStatus:0}, function (result) {
                    //批量修改案卷中间表状态
                }, false);
                eform.dataset("updateArchDirArchStatusByDossierIds", {dossierIds:ids,archStatus:0,archTableName:archTableName}, function (result) {
                    //批量修改卷内档案中间表状态
                }, false);
            }

            //更新流程主表中的状态
            eform.dataset("UpdateArchPlaceFlowStatus",{recordid:eform.recordId,flowStatus:"流程终止"}, function (results) {
            }, false);

        }
	}
});



eform("eformDataTable1").method("onUrlFormatter", function (url, operateBtn) {
    debugger;
    var rowInfos = eform("eformDataTable1").method("getSelectedRows");//获取查询列表被选中的值


    if (operateBtn.formName == "查看") {
        var newFormUrl = eform.virtualPath + '/index?formid=' + rowInfos[0].formId + '&skin=techblue&id=' + rowInfos[0].detailsId;
        return newFormUrl;
    }
});

/*生成编号
	@account 当前用户账号
	@deptCode 当前用户所在部门编号
	@archTypeId 档案类型id
	@entityId 实体id
	@tableName 表名
	@type  1档案，2案卷
	@param 当前档案所有字段的json键值对
	*/
function createNumber(account, deptCode, archTypeId, entityId, tableName, type, param) {

    param.token = $.cookie("token");
    param.account4CreateNumber = account
    param.deptCode4CreateNumber = deptCode
    param.archTypeId4CreateNumber = archTypeId
    param.entityId4CreateNumber = entityId
    param.tableName4CreateNumber = tableName
    param.type4CreateNumber = type;
    param.ifYearAutoIncrement4CreateNumber = top.window.ifYearAutoIncrement;

    var archNo = '';
    $.ajax({
        type: "POST",
        async: false,
        url: "http://192.168.254.32:8002/edrmscore/api/number/createNumber",
        data: param,
        dataType: "json",
        success: function (res) {
            if (res.RESULT) {
                archNo = res.RESPONSE
            }
        }
    });
    return archNo;
}


//插入es
function insertES(info,filePropertyFormId,sectname,archtypename,archTableName){

    var entityId = info.objectid;

    //通过档案ID 获取 电子文件
    var fileIds = [];
    var files = [];
    var filenames = [];
    eform.dataset("selectAttachmentByArch", {archID: entityId}, function (result) {
        if (result.Data) {
        	var fileinfo = result.Data[0];
			for (var j = 0; j < fileinfo.length; j++) {
				var fileid = {"fileid": fileinfo[j].FileId};
				var filename = {"filename": fileinfo[j].Name};
				files.push(fileid);
				filenames.push(filename);
				fileIds.push(fileinfo[j].FileId);
			}
        }
    }, false);
    var sectIdPath = selectSectIdPath(info.sectid);
    var archTypeIdPath = selectArchTypeIdPath(info.archtypeid);
    info["sectIdPath"] = sectIdPath;
    info["archTypeIdPath"] = archTypeIdPath;
    info["sectAndArchTypePath"] = sectIdPath+"/"+archTypeIdPath;
    info["objectpath"]="0\\2\\";
    info["objectfactpath"]=["0\\2\\"];
    info["objecttype"]=2;
    info["formid"]=filePropertyFormId;
    info["sectname"]=sectname;
    info["archtypename"]=archtypename;
    info["archTableName"]=archTableName;
    info["files"]=files;
    info["filenames"]=filenames;
    info["archtypenamekeyword"]=archtypename;
    info["storageIdPath"]=sectStorageIdPath(entityId,"0");
  /*  for(var o  in info){

        if(isNaN(info[o])&&!isNaN(Date.parse(info[o]))) {
            info[o] =parseDateUtil(info[o]);
        }

    }*/
    delete info.delayTime;
    $.ajax({
        type: "post",
        async: false,
        url: "/insight/search/indexDocument",
        data: {
            Id: entityId,
            Index: "uis_items",
            FileIds: fileIds,
            Data: JSON.stringify(info)
        },
        success: function (e) {
            console.log("插入ES成功");
        },
        error: function () {
            console.log("插入ES失败");
        }
    })
}


//案卷插入es
function insertDossierES(info,filePropertyFormId,sectName,archTypeName,dossierTableName,archTableName){
    var entityId = info.objectid;
    //通过档案ID 获取 电子文件
    /*    var fileIds = [];
        var files = [];
        var filenames = [];
        eform.dataset("selectAttachmentByArch", {archID: entityId}, function (result) {if (result.Data) {
            var fileinfo = result.Data[0];
            for (var j = 0; j < fileinfo.length; j++) {
                var fileid = {"fileid": fileinfo[j].FileId};
                var filename = {"filename": fileinfo[j].Name};
                files.push(fileid);
                filenames.push(filename);
                fileIds.push(fileinfo[j].FileId);
            }}
        }, false);*/
    var sectIdPath = selectSectIdPath(info.sectid);
    var archTypeIdPath = selectArchTypeIdPath(info.archtypeid);
    info["objectpath"]="0\\2\\";
    info["objectfactpath"]=["0\\2\\"];
    info["objecttype"]=2;
    info["formid"]=filePropertyFormId;
    info["sectname"]=sectName;
    info["archtypename"]=archTypeName;
    info["archTableName"]=archTableName;
    info["dossierTableName"]=dossierTableName;
    //info["files"]=files;
    //info["filenames"]=filenames;
    info["archtypenamekeyword"]=archTypeName;
    info["sectIdPath"] = sectIdPath;
    info["archTypeIdPath"] = archTypeIdPath;
    info["sectAndArchTypePath"] = sectIdPath+"/"+archTypeIdPath;
    info["storageIdPath"]=sectStorageIdPath(entityId,"1");
    delete info.delayTime;
    $.ajax({
        type: "post",
        async: false,
        url: "http://localhost:8012/edrmscore/api/search/insertDossierES?token="+curToken,
        data:JSON.stringify( {
            id: entityId,
            forms: info
        }),
        contentType:'application/json',
        success: function (e) {
            console.log("插入ES成功");
        },
        error: function () {
            console.log("插入ES失败");
        }
    })
}

/**
 * 查询表单
 *@param archTypeId   档案类型id
 *@param archState      档案状态 0整编库，1档案库，2鉴定库，3销毁库，4回收站
 *@param formType     表单类型  0文件属性，1文件列表，2案卷属性，3案卷列表，4未组卷-文件列表，5归卷，6组卷
 **/
function selectArchTypeForm(archTypeId ,archState, formType ){
    var res = {}
    eform.dataset("Selectarchtype", {Id:archTypeId},function(result){
        res = result.Data[0][0];
    },false);
    if(formType=='0'){
        res.form_id = res.archPropFormId;
    }
    else if(formType=='1'){
        res.form_id = res.archListFormId;
    }
    else if(formType=='2'){
        res.form_id = res.dossierPropFormId;
    }
    else if(formType=='3'){
        res.form_id = res.dossierListFormId;
    }
    return res;
}


function closeWin(){
	//有关闭确认
	//if(confirm("您确定要关闭本页吗？")){
	window.opener=null;
	window.open('','_self');
	window.close();
	//}
}

function numFormat(num) {
    if(num<10){
        return "00"+num;
    }
    else if(num<100){
        return "0"+num;
    }else {
        return ""+num;
    }
}



//查询 sectId 全路径
function selectSectIdPath(sectId){

    //sectId全路径
    var sectIdPath = "";
    var parentSectId = sectId;
    while (parentSectId && parentSectId!='0'){
        sectIdPath = parentSectId + "/" + sectIdPath;
        var curSect = [];
        eform.dataset("SelectSect", {Id: parentSectId}, function (result) {
            curSect = result.Data[0][0];
        }, false);
        if (curSect){

            parentSectId = curSect.parent_erms_sect_id;
        }
    }
    sectIdPath = sectIdPath.substring(0,sectIdPath.length-2);

    return sectIdPath;

}

//查询 archTypeId 全路径
function selectArchTypeIdPath(archTypeId){
    //archTypeId全路径
    var archTypeIdPath = "";
    var parentArchTypeId = archTypeId;
    while (parentArchTypeId && parentArchTypeId != '0') {
        archTypeIdPath = parentArchTypeId + "/" + archTypeIdPath;
        var curArchType = [];
        eform.dataset("Selectarchtype", {Id: parentArchTypeId}, function (result) {
            curArchType = result.Data[0][0];
        }, false);
        if (curArchType){

            parentArchTypeId = curArchType.parent_arch_type_id;
        }
    }
    archTypeIdPath = archTypeIdPath.substring(0,archTypeIdPath.length-2);

    return archTypeIdPath;
}


//查询库房id全路径
function sectStorageIdPath(entryId,ifDossier){
    var tableName = "";
    //ifDossier ：1案卷 0 档案
    if(ifDossier=="0"){
        tableName = "storage_arch_relation";
    }else if (ifDossier=="1"){
        tableName = "storage_dossier_relation";
    }
    var idPath = "";
    eform.dataset("selectIdPathByEntryId",{tableName:tableName,entryId:entryId},function(result){

        if(result.Data[0][0]){
            idPath=result.Data[0][0].idPath;
        }
    },false);
    return idPath;
}
