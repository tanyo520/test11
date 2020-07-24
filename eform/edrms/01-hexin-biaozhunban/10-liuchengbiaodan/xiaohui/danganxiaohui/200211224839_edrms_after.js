/**
 * 页面初始化执行方法
 * 判断是否为发起节点，如是发起节点 则新增详情数据
 **/
var taskType = $.getQueryString('taskType'); // 1
var archTypeId_from = $.getQueryString('archTypeId'); // 1
var propertiesFormId = $.getQueryString('propertiesFormId'); // 1
debugger;

var archTableName_g = '';
var dossierTableName_g = '';

if (taskType == "begintask") {

    var archTypeName='';
    var sectId = '';
    var sectName = '';
    //根据档案类型id 获取档案表名和案卷表名
    eform.dataset("Selectarchtype", {Id: archTypeId_from}, function (results) {
        var archType = results.Data[0][0];
        archTableName_g = archType.arch_table_name;
        dossierTableName_g = archType.dossier_table_name;
        archTypeName = archType.name;
        sectId = archType.sect_id;
    }, false);
    eform.dataset("SelectSect", {Id: sectId}, function (result) {
        //获取全宗
        var data = result.Data[0][0];
        sectName = data.name;
    }, false);


    var flowtype = $.getQueryString('flowtype'); //
    eform("flowtype").method("setValue", flowtype);
    eform("flowStatus").method("setValue", "销毁中")
    var info = eform.parentForm("eformListGrid1").method("getSelectedRows"); //获取父页面的值
    var user = eval(eform.userInfo);
    for (var i = 0; i < info.length; i++) {
        var params = {
            flowDetailsTableName:'archdestroydetails',
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
            //插入销毁流程详情表
        }, false);
    }
    eform("eformDataTable1").method("load");
}


if ($.getQueryString("taskType") != "begintask" && eform.wf.currentActivity.activityNo != "firstTask") {
    var blockinfo = window.eform.getBlocks();
    for (var i = 0; i < blockinfo.length; i++) {
        eform.setReadonly(blockinfo[i].id, true, eform.objType.block);
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
 * 1.发起流程 将条目信息置为销毁中
 * 2.流程审批同意后，将条目信息状态置为已销毁
 * 3.流程审批终止后，将条目信息状态置为待销毁
 **/
eform("eformWorkFlowButton1").method("afterSubmit", function (param) {
    var flowtype = eform("flowtype").method("getValue");
    var action = param.action;
    // 判断流程提交成功
    if (param.result === true) {

        //首次发起
        if (action  === eform.wf.actionType.initiate) {
            var info = eform.parentForm("eformListGrid1").method("getSelectedRows"); //获取父页面的值
            var ids = '';
            for (var i = 0; i < info.length; i++) {
                ids = ids + ",'" + info[i].ID + "'"
            }
            ids = ids.substring(1);
            var entryState = '7';//销毁中
            flowtype = $.getQueryString('flowtype'); //
            if (flowtype == "0") {
                var param = {
                    ids: ids
                    , tableName: archTableName_g
                    , entryState: entryState
                };
                eform.dataset("updateEntryStateByIds", param, function (result) {
                    //批量修改档案状态
                }, false);
                eform.dataset("updateArchDirArchStatus", {ids:ids,archStatus:entryState}, function (result) {
                    //批量修改档案中间表状态
                }, false);
            }
            else if (flowtype == "1") {
                var params = {
                    dossierIds: ids
                    , archTableName: archTableName_g
                    , dossierTableName: dossierTableName_g
                    , entrystate: entryState
                };
                eform.dataset("updateDossierStateByDossierIds", params, function (result) {
                    //批量修改案卷状态和卷内档案状态
                }, false);
                eform.dataset("updateDossierDirArchStatus", {ids:ids,archStatus:entryState}, function (result) {
                    //批量修改案卷中间表状态
                }, false);
                eform.dataset("updateArchDirArchStatusByDossierIds", {dossierIds:ids,archStatus:entryState,archTableName:archTableName_g}, function (result) {
                    //批量修改卷内档案中间表状态
                }, false);
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
            //最后一步
            if(eform.wf.currentActivity.activityNo == "lastTask"){
                var detailsList = [];
                var archTableName = '';
                var dossierTableName = '';
                eform.dataset("Selectdestroydetails", {recordid:eform.recordId}, function (result) {
                    detailsList = result.Data[0];
                    archTableName = result.Data[0][0].archTableName;
                    dossierTableName = result.Data[0][0].dossierTableName;
                }, false);

                var ids = "";
                for (var i = 0; i < detailsList.length; i++) {
                    ids = ids + ",'" + detailsList[i].detailsId + "'"
                }
                ids = ids.substring(1);
                var entryState = '3';//已销毁
                if (flowtype == "0") {
                    var param = {
                        ids: ids
                        , tableName: archTableName
                        , entryState: entryState
                    };
                    eform.dataset("updateEntryStateByIds", param, function (result) {
                        //批量修改档案状态
                    }, false);
                    eform.dataset("updateArchDirArchStatus", {ids:ids,archStatus:entryState}, function (result) {
                        //批量修改档案中间表状态
                    }, false);

                    // var archList = [];
                    // eform.dataset("selectByIds", {ids:ids,tableName:archTableName}, function (result) {
                    //     archList = result.Data[0];
                    // }, false);
                    for (var j = 0; j < detailsList.length; j++) {
                        deleteES(detailsList[j].detailsId);
                    }

                    deleteFilePermission(ids);

                }
                else {
                    var params = {
                        dossierIds: ids
                        , archTableName: archTableName
                        , dossierTableName: dossierTableName
                        , entrystate: entryState
                    };
                    eform.dataset("updateDossierStateByDossierIds", params, function (result) {
                        //批量修改案卷状态和卷内档案状态
                    }, false);
                    eform.dataset("updateDossierDirArchStatus", {ids:ids,archStatus:entryState}, function (result) {
                        //批量修改案卷中间表状态
                    }, false);
                    eform.dataset("updateArchDirArchStatusByDossierIds", {dossierIds:ids,archStatus:entryState,archTableName:archTableName}, function (result) {
                        //批量修改卷内档案中间表状态
                    }, false);

                    var archData = [];
                    eform.dataset("SelectArchByDossierIds",{dossierIds:ids,tableName:archTableName}, function (result) {
                        if (result.Data.length > 0) {
                            archData = result.Data[0]
                        }
                    }, false);
                    for (var j = 0; j < archData.length; j++) {
                        var arch = archData[j];
                        ids = ids + ",'" + arch.Id + "'"
                        deleteES(arch.Id);
                    }

                    deleteFilePermission(ids);
                }

                //更新流程主表中的状态
                eform.dataset("UpdateDestoryFlowStatus", {recordid:eform.recordId,flowStatus:"审批通过"}, function (results) {
                }, false);

                window.postMessage({info: 'exit'}, '*');
            }
        }

        //取消流程
        else if (action === eform.wf.actionType.cancel) {
            var detailsList = [];
            var archTableName = '';
            var dossierTableName = '';
            eform.dataset("Selectdestroydetails", {recordid:eform.recordId}, function (result) {
                detailsList = result.Data[0];
                archTableName = result.Data[0][0].archTableName;
                dossierTableName = result.Data[0][0].dossierTableName;
            }, false);

            var ids = "";
            for (var i = 0; i < detailsList.length; i++) {
                ids = ids + ",'" + detailsList[i].detailsId + "'"
            }
            ids = ids.substring(1);
            var entryState = '2';//待销毁
            if (flowtype == "0") {
                var param = {
                    ids: ids
                    , tableName: archTableName
                    , entryState: entryState
                };
                eform.dataset("updateEntryStateByIds", param, function (result) {
                    //批量修改档案状态
                }, false);
                eform.dataset("updateArchDirArchStatus", {ids:ids,archStatus:entryState}, function (result) {
                    //批量修改档案中间表状态
                }, false);
            }
            else {
                var params = {
                    dossierIds: ids
                    , archTableName: archTableName
                    , dossierTableName: dossierTableName
                    , entrystate: entryState
                };
                eform.dataset("updateDossierStateByDossierIds", params, function (result) {
                    //批量修改案卷状态和卷内档案状态
                }, false);
                eform.dataset("updateDossierDirArchStatus", {ids:ids,archStatus:entryState}, function (result) {
                    //批量修改案卷中间表状态
                }, false);
                eform.dataset("updateArchDirArchStatusByDossierIds", {dossierIds:ids,archStatus:entryState,archTableName:archTableName}, function (result) {
                    //批量修改卷内档案中间表状态
                }, false);
            }

            //更新流程主表中的状态
            eform.dataset("UpdateDestoryFlowStatus", {recordid:eform.recordId,flowStatus: "流程终止"}, function (results) {
            }, false);

            window.postMessage({info: 'exit'}, '*');
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
        if (result.Data) { var fileinfo = result.Data[0];
        for (var j = 0; j < fileinfo.length; j++) {
            var fileid = {"fileid": fileinfo[j].FileId};
            var filename = {"filename": fileinfo[j].Name};
            files.push(fileid);
            filenames.push(filename);
            fileIds.push(fileinfo[j].FileId);
        }}
    }, false);

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

//删除ES
function deleteES(entityId){
    $.ajax({
        type: "get",
        async: false,
        url: "/insight/search/DeleteAsync?id=" +entityId + "&index=uis_items",
        success: function (e) {
            if (e.Result) {
                console.log("成功");
            }
            else {
                console.log("错误");
            }
        },
        error: function () {
            console.log("失败");
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
    var param = {
        arch_type_id:archTypeId
        ,formstate: archState
        ,form_type: formType
    }
    eform.dataset("selectForm", param,function(result){
        res = result.Data[0][0];
    },false);
    return res;
}

//获取admin的token
function getAdminToken(){
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


//给文件分配everyone“无权限”
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


//清除指定文件所有用户权限
function clearPermissionByFile(fileId,token) {
    var host =  window.location.host;
    var rs = {};
    $.ajax({
        type: "GET",
        url: "/api/services/FilePermission/ClearPermissionByFile",
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

function deleteFilePermission(ids) {

    //清除指定电子文件所有用户权限、给文件分配everyone“无权限”
    var token = getAdminToken();
    var fileList = [];
    eform.dataset("selectFileByEntityIds", {ids:ids}, function (result) {
        //通过条目或案卷ids查询电子文件
        fileList = result.Data[0];
    }, false);
    for(var i=0;i<fileList.length;i++){
        //清除指定电子文件所有用户权限
        clearPermissionByFile(fileList[i].FileId,token);

        //给文件分配everyone“无权限”
        var Permissions = [];
        var json ={
            "MemberId": 1,//everyone用户组identityId
            "MemberType":8 ,//1用户，2部门，4职位，8用户组
            "PermCateId": 1 //文件无权限
        }
        Permissions.push(json);
        setFilePermission(fileList[i].FileId,Permissions,token);
    }
}