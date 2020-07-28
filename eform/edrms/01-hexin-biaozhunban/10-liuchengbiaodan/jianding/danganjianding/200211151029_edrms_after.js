/**
 * 页面初始化执行方法
 * 判断是否为发起节点，如是发起节点 则新增详情数据
 **/
var taskType = $.getQueryString('taskType'); //
var taskId = $.getQueryString('taskId'); // 任务id
var archTypeId_from = $.getQueryString('archTypeId'); // 1
var propertiesFormId = $.getQueryString('propertiesFormId'); // 1
var curToken = $.cookie("token");
debugger;
var archPropertiesFormId = '';
var dossierPropertiesFormId = '';
var archTableName_g = '';
var dossierTableName_g = '';
var taskName=''; //任务名称


if (taskType == "begintask") {

    debugger;

    var archTypeName='';
    var sectId = '';
    var sectName = '';
    //根据档案类型id 获取档案表名和案卷表名
    eform.dataset("Selectarchtype", {Id: archTypeId_from}, function (results) {
        var archType = results.Data[0][0];
        archTableName_g = archType.arch_table_name;
        dossierTableName_g = archType.dossier_table_name;
        archPropertiesFormId = archType.archPropFormId;
        dossierPropertiesFormId = archType.dossierPropFormId;
        archTypeName = archType.name;
        sectId = archType.sect_id;
    }, false);
    eform.dataset("SelectSect", {Id: sectId}, function (result) {
        //获取全宗
        var data = result.Data[0][0];
        sectName = data.name;
    }, false);


    eform("identifyResult").method("hide");//发起节点 需要隐藏 鉴定结果控件

    var flowtype = $.getQueryString('flowtype'); //0档案 1案卷
    eform("flowtype").method("setValue", flowtype);
    eform("flowStatus").method("setValue", "鉴定中");
    var user = eval(eform.userInfo);
    var info = eform.parentForm("eformListGrid1").method("getSelectedRows"); //获取父页面的值
    for (var i = 0; i < info.length; i++) {
        var params = {
            flowDetailsTableName:'archAppraisaldetails',
            Id: $.genId(),
            createTime: eform("appdate").method("getValue"),
            modifiedTime: eform("appdate").method("getValue"),
            createId: user.ID,
            updateId: user.ID,
            name: info[i].name,
            user: info[i].user,
            Duration: info[i].duration,
            recordid: eform.recordId,
            formId: propertiesFormId,
            archTableName: archTableName_g,
            dossierTableName: dossierTableName_g,
            detailsId: info[i].ID,
            archTypeId:archTypeId_from,
            archTypeName:archTypeName,
            sectName:sectName
        };
        eform.dataset("insertFlowDetails", params, function (result) {
            //插入鉴定详情表
        }, false);
    }

    eform("eformDataTable1").method("load");
}


if (taskType != "begintask") {
    var blockinfo = window.eform.getBlocks();
    for (var i = 0; i < blockinfo.length; i++) {
        eform.setReadonly(blockinfo[i].id, true, eform.objType.block);
    }

    /**
     *  如果是审批人员的话 就显示 鉴定结果按钮
     */
    eform.dataset("selectNameByTaskId", {taskId:taskId}, function (result) {
        debugger;
        if(result.Data[0].length > 0){
            taskName=result.Data[0][0].NAME_;
        }

    }, false);


    if(taskName =='鉴定人员'){
        debugger;
        eform("identifyResult").method("show");
        eform("identifyResult").method("readonly", false);
    }

}


/**
 * 流程提交前事件
 **/
eform("eformWorkFlowButton1").method("beforeSubmit", function (action) {


    return true;
});

/**
 * 流程提交后事件
 * 1.发起流程 将条目信息置为鉴定中
 * 2.流程审批同意后，将条目信息状态置为待销毁
 * 3.取消 将条目信息置为已归档
 **/
eform("eformWorkFlowButton1").method("afterSubmit", function (param) {
    var flowtype = eform("flowtype").method("getValue");
    // 判断流程提交成功
    if (param.result === true) {

        var action= param.action;
        var archPropFormId='';
        var dossierPropFormId='';
        //首次发起
        if (action === eform.wf.actionType.initiate) {
            debugger;
            var info = eform.parentForm("eformListGrid1").method("getSelectedRows"); //获取父页面的值
            var ids = '';
            for (var i = 0; i < info.length; i++) {
                ids = ids + ",'" + info[i].ID + "'"
            }
            ids = ids.substring(1);

            flowtype = $.getQueryString('flowtype'); //
            if (flowtype == "0") {
                var param = {
                    ids: ids
                    , tableName: archTableName_g
                    , entryState: '5' //鉴定中
                };
                eform.dataset("updateEntryStateByIds", param, function (result) {
                    //批量修改档案状态
                }, false);
                eform.dataset("updateArchDirArchStatus", {ids:ids,archStatus:5}, function (result) {
                    //批量修改档案中间表状态
                }, false);
                var archList = [];
                eform.dataset("selectByIds", {ids:ids,tableName:archTableName_g}, function (result) {
                    archList = result.Data[0];
                }, false);
                for (var j = 0; j < archList.length; j++) {
                    var arch = archList[j];
                    arch.objectid=arch.Id;
                    insertES(arch,propertiesFormId,sectName,archTypeName,archTableName_g);
                }
            }
            else if (flowtype == "1") {
                var params = {
                    dossierIds: ids
                    , archTableName: archTableName_g
                    , dossierTableName: dossierTableName_g
                    , entrystate: '5' //鉴定中
                };
                eform.dataset("updateDossierStateByDossierIds", params, function (result) {
                    //批量修改案卷状态和卷内档案状态
                }, false);
                eform.dataset("updateDossierDirArchStatus", {ids:ids,archStatus:5}, function (result) {
                    //批量修改案卷中间表状态
                }, false);
                eform.dataset("updateArchDirArchStatusByDossierIds", {dossierIds:ids,archStatus:5,archTableName:archTableName_g}, function (result) {
                    //批量修改卷内档案中间表状态
                }, false);

                for (var i = 0; i < info.length; i++) {
                    var entityId = info[i].ID;
                    var dossier = {};
                    eform.dataset("selectArchById", {tableName: dossierTableName_g,archId: entityId}, function (result) {
                        dossier = result.Data[0][0];
                    }, false);
                    dossier.entrystate='5';
                    dossier.objectid=entityId;
                    insertDossierES(dossier,dossierPropertiesFormId,sectName,archTypeName,dossierTableName_g,archTableName_g);
                }
                var archData = [];
                eform.dataset("SelectArchByDossierIds",{dossierIds:ids,tableName:archTableName_g}, function (result) {
                    if (result.Data.length > 0) {
                        archData = result.Data[0]
                    }
                }, false);
                for (var j = 0; j < archData.length; j++) {
                    var arch = archData[j];
                    arch.objectid=arch.Id;
                    insertES(arch,archPropertiesFormId,sectName,archTypeName,archTableName_g);
                }

            }

            eform.parentForm("eformListGrid1").method("load"); //父页面表格刷新
            try{
                eform.parentForm("eformListGrid1").method("getControl").ChildFormDialog.close();
            }catch(e){
                $.messager.alert("提示", e);
                //alert(e) // 可执行
            }
            window.postMessage({info: 'exit'}, '*');
        }

        //同意
        else if (action === eform.wf.actionType.approve) {
            debugger;
            if (eform.wf.currentActivity.activityNo != "firstTask") {
                var identifyResult = eform('identifyResult').method('getValue'); //获取鉴定结果的值
                if (!identifyResult) {
                    window.top.$.messager.alert("提示", "请选择鉴定结果！");
                    return false;
                }
                var littleStatus = '2';//待销毁
                if (identifyResult == '延期') {
                    littleStatus = '10';//待延期
                }
                var detailsList = [];
                var archTableName = '';
                var dossierTableName = '';
                var archTypeId = '';
                var archTypeName = '';
                var sectName = '';
                var propertiesFormId = '';
                eform.dataset("SelectAppraisaldetails", {recordid: eform.recordId}, function (result) {
                    detailsList = result.Data[0];
                    archTableName = result.Data[0][0].archTableName;
                    dossierTableName = result.Data[0][0].dossierTableName;
                    archTypeId = result.Data[0][0].archTypeId;
                    archTypeName = result.Data[0][0].archTypeName;
                    sectName = result.Data[0][0].sectName;
                    propertiesFormId = result.Data[0][0].formId;
                }, false);

                var ids = "";
                for (var i = 0; i < detailsList.length; i++) {
                    ids = ids + ",'" + detailsList[i].detailsId + "'"
                }
                ids = ids.substring(1);

                if (flowtype == "0") {
                    var param = {
                        ids: ids
                        , tableName: archTableName
                        , entryState: littleStatus
                    };
                    eform.dataset("updateEntryStateByIds", param, function (result) {
                        //批量修改档案状态
                    }, false);
                    eform.dataset("updateArchDirArchStatus", {ids:ids,archStatus:littleStatus}, function (result) {
                        //批量修改档案中间表状态
                    }, false);

                    var archList = [];
                    eform.dataset("selectByIds", {ids:ids,tableName:archTableName}, function (result) {
                        archList = result.Data[0];
                    }, false);
                    for (var j = 0; j < archList.length; j++) {
                        var arch = archList[j];
                        arch.objectid=arch.Id;
                        insertES(arch,propertiesFormId,sectName,archTypeName,archTableName);
                    }
                }
                else {

                   // var archPropertiesFormId = selectArchTypeForm(archTypeId,0,0).form_id;//获取档案属性表单Id
                    //查询档案类型id 和 全宗名称 和档案类型名称
                    eform.dataset("Selectarchtype", {Id: archTypeId}, function (result) {
                        archPropFormId=result.Data[0][0].archPropFormId;
                        dossierPropFormId=result.Data[0][0].dossierPropFormId;
                    }, false);

                    var params = {
                        dossierIds: ids
                        , archTableName: archTableName
                        , dossierTableName: dossierTableName
                        , entrystate: littleStatus
                    };
                    eform.dataset("updateDossierStateByDossierIds", params, function (result) {
                        //批量修改案卷状态和卷内档案状态
                    }, false);
                    eform.dataset("updateDossierDirArchStatus", {ids:ids,archStatus:littleStatus}, function (result) {
                        //批量修改案卷中间表状态
                    }, false);
                    eform.dataset("updateArchDirArchStatusByDossierIds", {dossierIds:ids,archStatus:littleStatus,archTableName:archTableName}, function (result) {
                        //批量修改卷内档案中间表状态
                    }, false);

                    for (var i = 0; i < detailsList.length; i++) {
                        var entityId = detailsList[i].detailsId;
                        var dossier = {};
                        eform.dataset("selectArchById", {tableName: dossierTableName,archId: entityId}, function (result) {
                            dossier = result.Data[0][0];
                        }, false);
                        dossier.entrystate = littleStatus;
                        dossier.objectid=entityId;
                        insertDossierES(dossier,dossierPropFormId,sectName,archTypeName,dossierTableName,archTableName);
                    }
                    var archData = [];
                    eform.dataset("SelectArchByDossierIds",{dossierIds:ids,tableName:archTableName}, function (result) {
                        if (result.Data.length > 0) {
                            archData = result.Data[0]
                        }
                    }, false);
                    for (var j = 0; j < archData.length; j++) {
                        var arch = archData[j];
                        arch.objectid=arch.Id;
                        insertES(arch,archPropFormId,sectName,archTypeName,archTableName);
                    }
                }

                //更新流程主表中的状态
                eform.dataset("UpdateArchAppraisalFlowStatus",{recordid:eform.recordId,flowStatus: "审批通过"}, function (results) {
                }, false);
                // eform("flowStatus").method("setValue","审批通过");
            }
        }

        //取消
        else if (action === eform.wf.actionType.cancel) {
            debugger;
            var detailsList = [];
            var archTableName = '';
            var dossierTableName = '';
            eform.dataset("SelectAppraisaldetails", {recordid: eform.recordId}, function (result) {
                detailsList = result.Data[0];
                archTableName = result.Data[0][0].archTableName;
                dossierTableName = result.Data[0][0].dossierTableName;
                archTypeId = result.Data[0][0].archTypeId;
                archTypeName = result.Data[0][0].archTypeName;
                sectName = result.Data[0][0].sectName;
                propertiesFormId = result.Data[0][0].formId;
            }, false);

            var ids = "";
            for (var i = 0; i < detailsList.length; i++) {
                ids = ids + ",'" + detailsList[i].detailsId + "'"
            }
            ids = ids.substring(1);
            // var archPropertiesFormId = selectArchTypeForm(archTypeId,0,0).form_id;//获取档案属性表单Id
            //查询档案类型id 和 全宗名称 和档案类型名称
            eform.dataset("Selectarchtype", {Id: archTypeId}, function (result) {
                archPropFormId=result.Data[0][0].archPropFormId;
                dossierPropFormId=result.Data[0][0].dossierPropFormId;
            }, false);
            if (flowtype == "0") {
                var param = {
                    ids: ids
                    , tableName: archTableName
                    , entryState: '1' //已归档
                };
                eform.dataset("updateEntryStateByIds", param, function (result) {
                    //批量修改档案状态
                }, false);
                eform.dataset("updateArchDirArchStatus", {ids:ids,archStatus:1}, function (result) {
                    //批量修改档案中间表状态
                }, false);

                var archList = [];
                eform.dataset("selectByIds", {ids:ids,tableName:archTableName}, function (result) {
                    archList = result.Data[0];
                }, false);
                for (var j = 0; j < archList.length; j++) {
                    var arch = archList[j];
                    arch.objectid=arch.Id;
                    insertES(arch,archPropFormId,sectName,archTypeName,archTableName);
                }
            }
            else {

                var params = {
                    dossierIds: ids
                    , archTableName: archTableName
                    , dossierTableName: dossierTableName
                    , entrystate: '1' //已归档
                };
                eform.dataset("updateDossierStateByDossierIds", params, function (result) {
                    //批量修改案卷状态和卷内档案状态
                }, false);
                eform.dataset("updateDossierDirArchStatus", {ids:ids,archStatus:1}, function (result) {
                    //批量修改案卷中间表状态
                }, false);
                eform.dataset("updateArchDirArchStatusByDossierIds", {dossierIds:ids,archStatus:1,archTableName:archTableName}, function (result) {
                    //批量修改卷内档案中间表状态
                }, false);

                var archData = [];
                eform.dataset("SelectArchByDossierIds",{dossierIds:ids,tableName:archTableName}, function (result) {
                    if (result.Data.length > 0) {
                        archData = result.Data[0]
                    }
                }, false);

                for (var i = 0; i < detailsList.length; i++) {
                    var entityId = detailsList[i].detailsId;
                    var dossier = {};
                    eform.dataset("selectArchById", {tableName: dossierTableName,archId: entityId}, function (result) {
                        dossier = result.Data[0][0];
                    }, false);
                    dossier.entrystate='1';
                    dossier.objectid=entityId;
                    insertDossierES(dossier,dossierPropFormId,sectName,archTypeName,dossierTableName,archTableName);
                }

                for (var j = 0; j < archData.length; j++) {
                    var arch = archData[j];
                    arch.objectid=arch.Id;
                    insertES(arch,archPropFormId,sectName,archTypeName,archTableName);
                }
            }

            //更新流程主表中的状态
            eform.dataset("UpdateArchAppraisalFlowStatus",{recordid:eform.recordId,flowStatus:"流程终止"}, function (results) {
            }, false);
            // eform("flowStatus").method("setValue","拒绝审批")
        }
    }
});


//插入es
function insertES(info,archPropertyFormId,sectname,archtypename,archTableName){

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
    info["formid"]=archPropertyFormId;
    info["sectname"]=sectname;
    info["archtypename"]=archtypename;
    info["archTableName"]=archTableName;
    info["files"]=files;
    info["filenames"]=filenames;
    info["archtypenamekeyword"]=archtypename;
    info["storageIdPath"]=sectStorageIdPath(entityId,"0");
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

/**
 * 查询表单
 *@param archTypeId   档案类型id
 *@param archState      默认0
 *@param formType     表单类型  0文件属性，1文件列表，2案卷属性，3案卷列表
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
    sectIdPath = sectIdPath.substring(0,sectIdPath.length-1);

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
    archTypeIdPath = archTypeIdPath.substring(0,archTypeIdPath.length-1);

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
