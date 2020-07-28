eform("testid").method("setValue", eform.recordId);

console.log(eform.recordId);

var exBorrowId = '';

var borrowType = $.getQueryString("borrowType"); // first：第一次，renew：续借
// taskType=inboxtask
var taskType = $.getQueryString("taskType");

console.log(borrowType);
var archInfoId = $.getQueryString("archInfoId");
var archTypeId = $.getQueryString("archTypeId");
/*******根据传递的档案ID 获取档案基本信息**/

var archTableName = '';
var sectId = '';
var archtypename = "";
eform.dataset("Selectarchtype", {Id: archTypeId}, function (result) {
    archTableName = result.Data[0][0].arch_table_name;
    sectId = result.Data[0][0].sect_id;
    archtypename = result.Data[0][0].name;
}, false);

var sectname = "";
eform.dataset("SelectSect", {Id: sectId}, function (result) {
    var data = result.Data[0][0];
    sectname = data.name;
}, false);

var archInfo = {};

eform.dataset("selectArchById", {tableName: archTableName, archId: archInfoId}, function (result1) {
    archInfo = result1.Data[0][0];
}, false);
//
// eform.dataset("SelectSect", {Id:archInfo.sectid}, function (result1) {
// 	archInfo.sectName=result1.Data[0][0].name;
// }, false);

// eform.dataset("Selectarchtype", {Id:archInfo.archtypeid}, function (result1) {
// 	archInfo.archTypeName=result1.Data[0][0].name;
// }, false);


if (borrowType != 'first') {
    //隐藏  编辑 操作按钮
}

var borrowCarIdArray = [];

if (borrowType) {
    borrowCarIdArray.push(archInfo.ID);

    var param = {
        Id: $.genId()
        , createId: eform.userInfo.id
        , updateId: eform.userInfo.id
        , sectName: sectname
        , archTypeName: archtypename
        , name: archInfo.name
        , number: archInfo.number
        , brrowid: eform.recordId
        , borrowStatus: '借阅流程中'
        , sectId: archInfo.sectid
        , archTypeId: archInfo.archtypeid
        , formId: ' '
        , archiveId: archInfo.Id
        , flag: '0'
        , ifRenew: '否'
    }


    console.log(param);
    eform.dataset("insertBorrowArchNew", param, function (result1) {
        console.log(result1)
    }, false);
    //重新加载数据表格
    eform("eformDataTable1").method("load");
}

//流程提交前事件
eform("eformWorkFlowButton1").method("beforeSubmit", function (action) {

    if (action === eform.wf.actionType.initiate) { // 判断是发起流程

        var checker = eform("archuser").method("getValue");
        if (!checker) {
            window.top.$.messager.alert("提示", '请选择审核人员！');
            return false;
        }

        var param = {
            brrowid: eform.recordId
        }
        var msgTotal = '';
        eform.dataset("selectByBrrowId", param, function (result) {
            console.log(result);
            var arr = result.Data[0];

            for (var i = 0; i < arr.length; i++) {
                var msg = '';
                if (!arr[i].brrowe) {
                    msg += '，借阅方式（电子）'
                }
                if (!arr[i].brrows) {
                    msg += '，借阅方式（实物）'
                }
                if (!arr[i].brrowpurpose) {
                    msg += '，借阅目的'
                }
                if(!arr[i].brrownum){
                    msg+='，借阅数量'
                }else if(!isPositiveInteger(arr[i].brrownum)){
                    msg+='，借阅数量只能是正整数'
                }
                if(!arr[i].brrowday){
                    msg+='，借阅天数'
                }else if(!isPositiveInteger(arr[i].brrowday)){
                    msg+='，借阅天数只能是正整数'
                }
                if (!arr[i].brrowreason) {
                    msg += '，借阅理由'
                }

                if (msg) {
                    msg = '第' + (i - (-1)) + '行' + msg + '<br>'
                }

                msgTotal += msg;
            }


        }, false);
        if (msgTotal) {
            msgTotal = '请完善<br>' + msgTotal;
            window.top.$.messager.alert("提示", msgTotal);
            return false;
        }

    }

});


// 流程提交后事件
eform("eformWorkFlowButton1").method("afterSubmit", function (param) {
    // 判断流程提交成功
    if (param.result === true) {

        //发起
        if (param.action === eform.wf.actionType.initiate) {

            console.log(borrowType);
            if (borrowType == 'renew') {
                //1. 将续借的档案改成 已续借
                //获取父页面 被选中的档案
                console.log('exBorrowId=' + exBorrowId);

                var param1 = {
                    brrowid: exBorrowId
                    , borrowStatus: '已续借'
                };
                eform.dataset("updateBorrowStatusByBorrowId", param1, function (result1) {
                    console.log(result1)
                }, false);
            } else {//从借阅车中删除 已发起借阅的档案
                var ids = "";
                for (var i = 0; i < borrowCarIdArray.length; i++) {
                    ids += ",'" + borrowCarIdArray[i] + "'";
                }
                ids = ids.substring(1);
                var param4deleteBorrowCar = {

                    ids: ids
                }
                eform.dataset("deleteBorrowInfo", param4deleteBorrowCar, function (result) {
                    if (result.EffectOfRow > 0) {
                        eform.parentForm("eformListGrid1").method("load"); //父页面表格刷新
                    }
                }, false);


            }

            //2. 将新流程的档案flag改为1 updateFlagByBorrowId
            var param2 = {
                brrowid: eform.recordId
                , flag: '1'
            };
            eform.dataset("updateFlagByBorrowId", param2, function (result1) {
                console.log(result1)
            }, false);

            try{
                window.setTimeout(function(){
                    parent.$('.panel-tool-close').click();
                },1000);
            }catch(e){
                $.messager.alert("提示", e);
                //alert(e) // 可执行
            }

        }

        //同意
        else if (param.action === eform.wf.actionType.approve) {

            //同意 审批后，将状态改成“待领用”；
            var param1 = {
                brrowid: eform.recordId
                , borrowStatus: '待领用'
                , ifRenew: '否'
            };


            if (borrowType != 'renew') {
                eform.dataset("updateBorrowStatusByBorrowId", param1, function (result1) {
                    console.log(result1)
                }, false);
            }
            else {
                //如果是续借，4.2.1直接将状态改成“已领用”
                param1.ifRenew = '是';
                param1.borrowStatus = '已领用';
                eform.dataset("updateBorrowStatusByBorrowId", param1, function (result1) {
                    console.log(result1)
                }, false);
                //4.2.2 然后修改领用时间和归还时间
                var param = {
                    brrowid: eform.recordId
                }
                eform.dataset("selectByBrrowId", param, function (result) {
                    var arr = result.Data[0];
                    for (var i = 0; i < arr.length; i++) {
                        if (arr[i].ifRenew == '是') {
                            var tableName = 'edrms_borrowarchinfo';
                            var borrowDays = arr[i].brrowday;
                            var startUseTime = new Date();

                            var returnTime = new Date();
                            returnTime = new Date(returnTime.getTime() + parseFloat(borrowDays) * 3600000 * 24);

                            startUseTime = eform.dateFormat(startUseTime, "yyyy-MM-dd hh:mm:ss");

                            returnTime = eform.dateFormat(returnTime, "yyyy-MM-dd hh:mm:ss");


                            var param2 = {
                                Id: arr[i].Id
                                , borrowStatus: '已领用'
                                , startUseTime: startUseTime
                                , returnTime: returnTime
                            };

                            eform.dataset("draw", param2, function (result1) {
                                console.log(result1);

                            }, false);
                        }
                    }
                }, false);
            }

        }
    }
});


if (taskType != "begintask" && eform.wf.currentActivity.activityNo != "firstTask") {
    var blockinfo = window.eform.getBlocks();
    for (var i = 0; i < blockinfo.length; i++) {
        eform.setReadonly(blockinfo[i].id, true, eform.objType.block);
    }
}

//是否为正整数
function isPositiveInteger(s){
    if(s==0){
        return false;
    }
    var re = /^[0-9]+$/ ;
    return re.test(s)
}