var reBorrowIds = '';

var exBorrowId = '';
var borrowType = $.getQueryString("borrowType"); // first：第一次，renew：续借
var archInfoId = $.getQueryString("archInfoId");
// taskType=inboxtask
var taskType = $.getQueryString("taskType");

if (borrowType != 'first') {
    //隐藏  编辑 操作按钮
}

var borrowCarIdArray = [];

if (borrowType) {
    debugger;
    eform("borrowType").method("setValue", borrowType);

    //从搜索结果、首页档案详情页、利用中心发起的借阅
    if (archInfoId) {
        var archTypeId = $.getQueryString("archTypeId");
        var archTableName = "";
        var archtypename = "";
        var sectId = "";
        var archInfo = {};
        eform.dataset("Selectarchtype", {Id: archTypeId}, function (result) {
            archTableName = result.Data[0][0].arch_table_name;
            archtypename = result.Data[0][0].name;
            sectId = result.Data[0][0].sect_id;
        }, false, false);
        var sectname = "";
        eform.dataset("SelectSect", {Id: sectId}, function (result) {
            var data = result.Data[0][0];
            sectname = data.name;
        }, false, false);
        eform.dataset("selectArchById", {tableName: archTableName, archId: archInfoId}, function (result1) {
            archInfo = result1.Data[0][0];
        }, false, false);
        //borrowCarIdArray.push(archInfo.ID);
        var params = {
            Id: $.genId()
            , createId: eform.userInfo.id
            , borrower: eform.userInfo.Name
            , updateId: eform.userInfo.id
            , sectName: sectname
            , archTypeName: archtypename
            , name: archInfo.name
            , number: archInfo.number
            , brrowid: eform.recordId
            , borrowStatus: '借阅审核中'
            , sectId: archInfo.sectid
            , archTypeId: archInfo.archtypeid
            , formId: ' '
            , archiveId: archInfo.Id
            , flag: '0'
            , ifRenew: '否'
            , startUseTime: '9999-12-31 23:59:59'
        };
        eform.dataset("insertBorrowArchNew", params, function (result1) {
            //插入借阅流程详情表
        }, false);
    }

    //从借阅车发起的借阅 或者 续借
    else {

        //获取父页面 被选中的档案
        var archList = eform.parentForm("eformListGrid1").method("getSelectedRows"); //获取父页面查询列表被选中的值

        for (var i = 0; i < archList.length; i++) {

            var archInfo = archList[i];

            //续借
            if (borrowType == 'renew') {
                exBorrowId = archInfo.brrowid;
                var borrowInfoId=archInfo.ID;
                var param12 = {
                    Id: borrowInfoId
                };

                eform.dataset("selectBorrowArchInfo", param12, function (result) {

                    if (result.Data) {
                        var data = result.Data[0][0];
                        data.borrowStatus = '借阅审核中';
                        data.flag = '0';
                        data.brrowid = eform.recordId;
                        data.exId = data.Id;
                        data.ifRenew = '是';
                        data.Id = $.genId();
                        //如果该条的顶级id不存在，则把顶级id赋值，若存在复制不作处理（用于统计该条续借次数）
                        if (data.parentBorrowId==null) {
                            data.parentBorrowId = borrowInfoId;
                        }
                        eform.dataset("insertBorrowArch", data, function (result1) {
                        }, false);

                    }
                }, false);
                reBorrowIds = reBorrowIds + ",'" + archList[i].ID + "'";
            }

            //第一次借阅
            else {
                borrowCarIdArray.push(archInfo.ID);

                var param123 = {
                    Id: $.genId()
                    , createId: eform.userInfo.id
                    , borrower: eform.userInfo.Name
                    , updateId: eform.userInfo.id
                    , sectName: archInfo.sectName
                    , archTypeName: archInfo.archTypeName
                    , name: archInfo.name
                    , number: archInfo.number
                    , brrowid: eform.recordId
                    , borrowStatus: '借阅审核中'
                    , sectId: archInfo.sectId
                    , archTypeId: archInfo.archTypeId
                    , formId: archInfo.formId
                    , archiveId: archInfo.archiveId
                    , flag: '0'
                    , ifRenew: '否'
                    , startUseTime: '9999-12-31 23:59:59'
                };

                eform.dataset("insertBorrowArchNew", param123, function (result1) {
                }, false);

            }


        }

    }

    //重新加载数据表格
    eform("eformDataTable1").method("load");
}

//重定义数据表格按钮跳转路径
eform("eformDataTable1").method("onUrlFormatter", function (url, operateBtn) {

    var row = eform("eformDataTable1").method("getSelectedRow");

    if (operateBtn.formName == "查看") {
        var Id = row.Id == null ? row.ID : row.Id;
        var newFormUrl = eform.virtualPath + '/index?formid=200206212742_edrms&Id=' + Id;
        return newFormUrl;
    }

    if (operateBtn.formName == "编辑") {
        debugger;
        var Id = row.Id == null ? row.ID : row.Id;
        var newFormUrl = eform.virtualPath + '/index?formid=200206212742_edrms&Id=' + Id + '&viewType=1&borrowType=' + borrowType;
        return newFormUrl;
    }
});

//子窗体按钮
eform("eformDataTable1").method("childFormButtonEvent", function (formId, ids, name, callback) {
    if (name == "保存") {
        eform("eformDataTable1").method("getControl").ChildFormDialog.iframe[0].contentWindow.window.save(function () {
            eform("eformDataTable1").method("getControl").ChildFormDialog.close();
            eform("eformDataTable1").method("load"); //父页面表格刷新
        });
    }
    callback && callback(); // 最后一行,该行代码必须
});


//流程提交前事件
eform("eformWorkFlowButton1").method("beforeSubmit", function (action) {
debugger;
    if (action === eform.wf.actionType.initiate) { // 判断是发起流程
        //获取 续借最大次数
        var useCount = 0;
        eform.dataset("selectDictByCode",{code:'useCount'},function(result){
            useCount = result.Data[0][0].value;
        },false);
        var param1 = {
            brrowid: eform.recordId
        };
        var msgTotal = '';
        eform.dataset("selectByBrrowId", param1, function (result) {

            var checker = eform("archuser").method("getValue");
            if (!checker) {
                msgTotal += '请选择审核人员！<br>';
            }

            var arr = result.Data[0];

            for (var i = 0; i < arr.length; i++) {
                var msg = '';
                if (!arr[i].brrowday) {
                    msg += '请完善借阅方式等信息'
                } else if (!isPositiveInteger(arr[i].brrowday)) {
                    msg += '请完善借阅方式等信息'
                }

                var borrowInfo = arr[i];
                //实物数量判断
                if (borrowInfo.brrows) {
                    var borrowNum = borrowInfo.brrownum;
                    var archiveId = borrowInfo.archiveId;
                    var archTypeId = borrowInfo.archTypeId;
                    var archTableName = '';
                    eform.dataset("selectById", {tableName: 'arch_type', Id: archTypeId}, function (result) {
                        archTableName = result.Data[0][0].arch_table_name;
                    }, false);
                    var entitynum = 0;
                    var ifInbound = ""; //是否上架0：未上架 1：上架
                    eform.dataset("selectById", {tableName: archTableName, Id: archiveId}, function (result) {
                        entitynum = result.Data[0][0].entitynum;
                        ifInbound = result.Data[0][0].ifInbound;
                    }, false);
                    if (parseFloat(borrowNum) > parseFloat(entitynum)) {
                        msg = '借阅数量超过库存数量'
                    }

                    if ((!ifInbound) || ifInbound == '0') {
                        msg = '该档案尚未上架';
                    }
                }
                //验证最大续借天数
                if (borrowType == 'renew') {
                    var realRenewCount = 0;
                    eform.dataset("selectCountByParentBorrowId", {parentBorrowId: arr[i].parentBorrowId}, function (result) {
                        realRenewCount = result.Data[0][0].realRenewCount;
                    }, false);
                    //如果实际借阅次数大于借阅最大次数，则提示并且input框赋值最大借阅天数
                    if ((realRenewCount+1) >= parseFloat(useCount)) {
                        msg = '借阅次数超过最大可借阅次数'
                    }
                }
                if (msg) {
                    msg = '第' + (i - (-1)) + '行 ' + msg + '<br>'
                }

                msgTotal += msg;
            }


        }, false);
        if (msgTotal) {
            window.top.$.messager.alert("提示", msgTotal);
            return false;
        }

    }

});


// 流程提交后事件
/**
 * 目前只有发起和审批节点，若多个节点，同意业务操作需要定制通过最后节点的变量来控制业务逻辑
 */
eform("eformWorkFlowButton1").method("afterSubmit", function (param) {
    console.log("---");
    console.log(param);
    debugger;
    // 判断流程提交成功
    if (param.result === true) {
        var token = getAdmitToken();
        //首次发起
        if (param.action === eform.wf.actionType.initiate) {

            var checker = eform("archuser").method("getValue");
            checker = JSON.parse(checker);

            //续借
            if (borrowType == 'renew') {
                //1. 将续借的档案改成 已续借
                //获取父页面 被选中的档案
                if (reBorrowIds) {
                    reBorrowIds = reBorrowIds.substring(1);
                    var param1 = {
                        ids: reBorrowIds
                        , borrowStatus: '已续借'
                    };
                    eform.dataset("updateBorrowStatusById", param1, function (result1) {
                    }, false);
                }
            }

            //从借阅车中删除 已发起借阅的档案
            else {
                var ids = "";
               if (borrowCarIdArray.length>0){
                   for (var i = 0; i < borrowCarIdArray.length; i++) {
                       ids += ",'" + borrowCarIdArray[i] + "'";
                   }
                   ids = ids.substring(1);
                   var param4deleteBorrowCar = {
                       ids: ids
                   };
                   eform.dataset("deleteBorrowInfo", param4deleteBorrowCar, function (result) {
                   }, false);
               }

                var list = [];
                eform.dataset("selectByBrrowId", {brrowid: eform.recordId}, function (result) {
                    list = result.Data[0];
                }, false);
                for (var i = 0; i < list.length; i++) {
                    var borrowInfo = list[i];
                    //实物数量减少
                    if(borrowInfo.brrows){
                        var borrowNum = borrowInfo.brrownum;
                        var archiveId = borrowInfo.archiveId;
                        var archTypeId = borrowInfo.archTypeId;
                        var archTableName = '';
                        eform.dataset("selectById", {tableName: 'arch_type', Id: archTypeId}, function (result) {
                            archTableName = result.Data[0][0].arch_table_name;
                        }, false);
                        var entitynum = 0;
                        var archRes = "";//档案条目详情
                        //根据条目id和后缀表名查询档案条目详情
                        eform.dataset("selectDetailByIdAndTableName", {tableName: archTableName, Id: archiveId, formType: '0'}, function (result) {
                            archRes = result.Data[0][0];
                            entitynum = archRes.entitynum;
                        }, false);
                        entitynum = parseFloat(entitynum) - parseFloat(borrowNum);
                        eform.dataset("updateEntityNumById", { tableName: archTableName, Id: archiveId, entitynum: entitynum }, function (result) {
                            //插入es
                            if(result.EffectOfRow>0){
                                archRes.objectid=archRes.Id;
                                archRes.entitynum = entitynum;
                                insertES(archRes, archTableName);
                            }
                        }, false);
                    }
                }

            }

            //2. 将新流程的档案flag改为1 updateFlagByBorrowId
            var param2 = {
                brrowid: eform.recordId
                , flag: '1'
            };
            eform.dataset("updateFlagByBorrowId", param2, function (result1) {
            }, false);

            //3.赋予审批人预览权限
            if (true) {
                var memberPermissionList = [];
                var json = {
                    "MemberId": checker[0].identityId,
                    "MemberType": 1,//1用户，2部门，4职位，8用户组
                    "PermCateId": 2 //文件预览权限
                }
                memberPermissionList.push(json);

                var archIds = "";
                var list = [];
                eform.dataset("selectByBrrowId", {brrowid: eform.recordId}, function (result) {
                    list = result.Data[0];
                }, false);
                for (var i = 0; i < list.length; i++) {
                    archIds += ",'" + list[i].archiveId + "'";
                }
                archIds = archIds.substring(1);
                var fileList = [];
                eform.dataset("selectFileByEntityIds", {ids: archIds}, function (result) {
                    fileList = result.Data[0];
                }, false);
                //var token = getAdmitToken();
                for (var i = 0; i < fileList.length; i++) {
                    setFilePermission(fileList[i].FileId, memberPermissionList, token);
                }
            }

            try {
                if (archInfoId) {
                    window.setTimeout(function () {
                        parent.$('.panel-tool-close').click();
                    }, 1000);
                } else {
                    eform.parentForm("eformListGrid1").method("load"); //父页面表格刷新
                    eform.parentForm("eformListGrid1").method("getControl").ChildFormDialog.close();
                }

            } catch (e) {
                window.top.$.messager.alert("提示", e);
            }

        }

        //同意
        else if (param.action === eform.wf.actionType.approve) {
            var starter = {};
            borrowType = eform("borrowType").method("getValue");

            //同意 审批后，将状态改成“待领用”；
            var param1 = {
                brrowid: eform.recordId
                , borrowStatus: '待领用'
                , ifRenew: '否'
            };

            //第一次借阅
            if (borrowType != 'renew') {
                //根据流程id 查询该流程下借阅的条目借阅详情
                var useDetails= {
                    brrowid: eform.recordId
                };
                eform.dataset("selectByBrrowId", useDetails, function (result) {
                    debugger;
                    var arr = result.Data[0];

                    eform.dataset("selectByGuId", {guid: arr[0].createId}, function (result) {
                        starter = result.Data[0][0];
                    }, false);
                    for (var i = 0; i < arr.length; i++) {
                        //仅电子的话直接赋予权限并且该状态为借阅中
                        if (arr[i].brrowe != null && (arr[i].brrows == null)) {
                            //借阅天数，领用时间，应归还时间
                            var borrowDays = arr[i].brrowday;
                            var startUseTime = new Date();
                            var returnTime = new Date();
                            returnTime = new Date(returnTime.getTime() + parseFloat(borrowDays) * 3600000 * 24);
                            startUseTime = eform.dateFormat(startUseTime, "yyyy-MM-dd hh:mm:ss");
                            returnTime = eform.dateFormat(returnTime, "yyyy-MM-dd hh:mm:ss");
                            var param2 = {
                                Id: arr[i].Id
                                , borrowStatus: '借阅中'
                                , startUseTime: startUseTime
                                , returnTime: returnTime
                            };
                            eform.dataset("draw", param2, function (result1) {
                            }, false);

                            //电子文件赋予借阅人权限
                            var PermCateId = '2';//预览权限

                            if (arr[i].brrowe.indexOf('打印') != -1) {
                                PermCateId = '6';//管理权限
                            }
                            else if (arr[i].brrowe.indexOf('下载') != -1) {
                                PermCateId = '3';//下载权限
                            }

                            var permissionList = [];
                            var json = {
                                "MemberId": starter.user_identityID,
                                "MemberType": 1,//1用户，2部门，4职位，8用户组
                                "PermCateId": PermCateId,
                                "StartTime": startUseTime,
                                "ExpiredTime": new Date(returnTime)
                            };
                            permissionList.push(json);

                            var fileList = [];
                            eform.dataset("selectFileByEntityIds", {ids: ("'" + arr[i].archiveId + "'")}, function (result) {
                                fileList = result.Data[0];
                            }, false);
                            //var token = getAdmitToken();
                            for (var j = 0; j < fileList.length; j++) {
                                setFilePermission(fileList[j].FileId, permissionList, token);
                            }

                        }
                        else {
                            var param3 = {
                                ids: "'"+arr[i].Id+"'"
                                , borrowStatus: '待领用'
                                , ifRenew: '否'
                            };
                             eform.dataset("updateBorrowStatusById", param3, function (result1) {
                             }, false);
                        }
                    }
                }, false);



            }

            //续借
            else {
                //如果是续借，4.2.1直接将状态改成“借阅中”
                param1.ifRenew = '是';
                param1.borrowStatus = '借阅中';
                eform.dataset("updateBorrowStatusByBorrowId", param1, function (result1) {
                }, false);


                //4.2.2 然后修改领用时间和归还时间
                var paramO = {
                    brrowid: eform.recordId
                }
                eform.dataset("selectByBrrowId", paramO, function (result) {
                    debugger;
                    var arr = result.Data[0];

                    eform.dataset("selectByGuId", {guid: arr[0].createId}, function (result) {
                        starter = result.Data[0][0];
                    }, false);

                    //var token = getAdmitToken();
                    for (var i = 0; i < arr.length; i++) {
                        if (arr[i].ifRenew == '是') {

                            var borrowDays = arr[i].brrowday;
                            var startUseTime = arr[i].startUseTime;

                            var returnTime = arr[i].returnTime;
                            returnTime = eform.dateFormat(new Date(new Date(returnTime).getTime() + parseFloat(borrowDays) * 3600000 * 24), "yyyy-MM-dd hh:mm:ss");

                            var param2 = {
                                Id: arr[i].Id
                                , borrowStatus: '借阅中'
                                , startUseTime: startUseTime
                                , returnTime: returnTime
                            };
                            eform.dataset("draw", param2, function (result1) {
                            }, false);

                            //电子文件赋予借阅人权限
                            var PermCateId = '2';//预览权限
                            if (arr[i].brrowe) {
                                if (arr[i].brrowe.indexOf('打印') != -1) {
                                    PermCateId = '6';//管理权限
                                }
                                else if (arr[i].brrowe.indexOf('下载') != -1) {
                                    PermCateId = '3';//下载权限
                                }

                                var permissionList = [];
                                var json = {
                                    "MemberId": starter.user_identityID,
                                    "MemberType": 1,//1用户，2部门，4职位，8用户组
                                    "PermCateId": PermCateId,
                                    "StartTime": startUseTime,
                                    "ExpiredTime": new Date(returnTime)
                                }
                                permissionList.push(json);

                                var fileList = [];
                                eform.dataset("selectFileByEntityIds", {ids: ("'" + arr[i].archiveId + "'")}, function (result) {
                                    fileList = result.Data[0];
                                }, false);
                                for (var j = 0; j < fileList.length; j++) {
                                    setFilePermission(fileList[j].FileId, permissionList, token);
                                }
                            }
                        }
                    }
                }, false);
            }


            //删除审核人预览权限
            var auditor = {};
            eform.dataset("selectById", {tableName: 'borrow', Id: eform.recordId}, function (result) {
                auditor = JSON.parse(result.Data[0][0].archuser)[0];
            }, false);
            if (true) {
                var memberPermissionList = [];
                var json = {
                    "MemberId": auditor.identityId,
                    "MemberType": 1,//1用户，2部门，4职位，8用户组
                    "PermType": 10 //分配权限
                }
                memberPermissionList.push(json);

                var archIds = "";
                var list = [];
                eform.dataset("selectByBrrowId", {brrowid: eform.recordId}, function (result) {
                    list = result.Data[0];
                }, false);
                for (var i = 0; i < list.length; i++) {
                    archIds += ",'" + list[i].archiveId + "'"
                }
                archIds = archIds.substring(1);
                var fileList = [];
                eform.dataset("selectFileByEntityIds", {ids: archIds}, function (result) {
                    fileList = result.Data[0];
                }, false);
                //var token = getAdmitToken();
                for (var i = 0; i < fileList.length; i++) {
                    deleteFilePermission(fileList[i].FileId, memberPermissionList, token);
                }
            }

        }

        //终止
        else if (param.action === eform.wf.actionType.cancel) {

            var paramW = {
                brrowid: eform.recordId
                , borrowStatus: '借阅失败'
                , ifRenew: '否'
            };
            eform.dataset("updateBorrowStatusByBorrowId", paramW, function (result1) {
            }, false);

            //删除审核人预览权限
            var auditor = {};
            eform.dataset("selectById", {tableName: 'borrow', Id: eform.recordId}, function (result) {
                auditor = JSON.parse(result.Data[0][0].archuser)[0];
            }, false);
            if (true) {
                var memberPermissionList = [];
                var json = {
                    "MemberId": auditor.identityId,
                    "MemberType": 1,//1用户，2部门，4职位，8用户组
                    "PermType": 10 //分配权限
                }
                memberPermissionList.push(json);

                var archIds = "";
                var list = [];
                eform.dataset("selectByBrrowId", {brrowid: eform.recordId}, function (result) {
                    list = result.Data[0];
                }, false);
                for (var i = 0; i < list.length; i++) {
                    archIds += ",'" + list[i].archiveId + "'"
                    var borrowInfo = list[i];
                    //实物数量回退
                    if (borrowInfo.brrows) {
                        var borrowNum = borrowInfo.brrownum;
                        var archiveId = borrowInfo.archiveId;
                        var archTypeId = borrowInfo.archTypeId;
                        var archTableName = '';
                        eform.dataset("selectById", {tableName: 'arch_type', Id: archTypeId}, function (result) {
                            archTableName = result.Data[0][0].arch_table_name;
                        }, false);
                        var entitynum = 0;
                       /* eform.dataset("selectById", {tableName: archTableName, Id: archiveId}, function (result) {
                            entitynum = result.Data[0][0].entitynum;
                        }, false);*/
                        var archRes = "";//档案条目详情
                        //根据条目id和后缀表名查询档案条目详情
                        eform.dataset("selectDetailByIdAndTableName", {tableName: archTableName, Id: archiveId, formType: '0'}, function (result) {
                            archRes = result.Data[0][0];
                            entitynum = archRes.entitynum;
                        }, false);
                        entitynum = parseFloat(entitynum) + parseFloat(borrowNum);
                        eform.dataset("updateEntityNumById", { tableName: archTableName, Id: archiveId, entitynum: entitynum }, function (result) {
                            if(result.EffectOfRow>0){
                                archRes.objectid=archRes.Id;
                                archRes.entitynum = entitynum;
                                insertES(archRes, archTableName);
                            }
                        }, false);
                    }

                }
                archIds = archIds.substring(1);
                var fileList = [];
                eform.dataset("selectFileByEntityIds", {ids: archIds}, function (result) {
                    fileList = result.Data[0];
                }, false);
                //var token = getAdmitToken();
                for (var i = 0; i < fileList.length; i++) {
                    deleteFilePermission(fileList[i].FileId, memberPermissionList, token);
                }

            }
        }
    }
});


if (taskType != "begintask" && eform.wf.currentActivity.activityNo != "firstTask") {
    debugger;
    var blockinfo = window.eform.getBlocks();
    for (var i = 0; i < blockinfo.length; i++) {
        eform.setReadonly(blockinfo[i].id, true, eform.objType.block);
    }
}

//是否为正整数
function isPositiveInteger(s) {
    if (s == 0) {
        return false;
    }
    var re = /^[0-9]+$/;
    return re.test(s)
}


//获取admin的token
function getAdmitToken() {
    var token = '';
    eform.dataset("selectByKey", {tableName: 'config', key: 'adminToken'}, function (result) {
        if (result.Data[0] && result.Data[0][0]) {
            token = result.Data[0][0].value;
        }
    }, false);
    return token;
}


//给文件分配权限
function setFilePermission(fileId,Permissions,token) {
    var rs = {};
    $.ajax({
        type: "POST",
        url: "/api/services/FilePermission/SetPermission",
        async: false,
        contentType: 'application/json',
        data: JSON.stringify({
            "FileId": fileId,
            "Permissions": Permissions,
            "Token": token
        }),
        dataType: "json",
        success: function (res) {
            rs = res
        }
    });
    return rs;
}


//删除文件的权限
function deleteFilePermission(fileId,Permissions,token) {
    var rs = {};
    $.ajax({
        type: "POST",
        url: "/api/services/FilePermission/DeleteFilePermission",
        async: false,
        contentType: 'application/json',
        data: JSON.stringify({
            "FileId": fileId,
            "Mermbers": Permissions,
            "Token": token
        }),
        dataType: "json",
        success: function (res) {
            rs = res
        }
    });
    return rs;
}


//插入es
function insertES(info,archTableName){

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
    //info["formid"]=archPropertyFormId;
    //info["sectname"]=sectname;
    //info["archtypename"]=archtypename;
    //info["archtypenamekeyword"]=archtypename;
    info["archTableName"]=archTableName;
    info["files"]=files;
    info["filenames"]=filenames;info["storageIdPath"]=sectStorageIdPath(entityId,"0");
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
//根据库房id查询库房全路径
function selectStorageIdPath(storageId){
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
