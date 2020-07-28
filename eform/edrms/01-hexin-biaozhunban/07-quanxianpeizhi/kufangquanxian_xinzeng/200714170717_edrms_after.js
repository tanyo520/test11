var patent_data_id = $.getQueryString("pId");
var data_id = $.getQueryString("Id");
//var data_id = 'eb8972ce-c171-495b-b4df-391e01692bb2';
var token = $.cookie("token");
// 默认查看，0新增,1编辑
var viewtype = $.getQueryString("viewtype");
var viewtype = "0";
if (viewtype == '0') {
    eform("data_id").method("setValue", data_id);
    eform("patent_data_id").method("setValue", patent_data_id);
} else if (viewtype == '1') {
    data_id = eform("data_id").method("getValue");
    patent_data_id = eform("patent_data_id").method("getValue");
}

debugger

var memberList = [];
//成员选择控件 监听事件
eform("eformSelectMember1").method("onChange", function (newValue, oldValue) {

    memberList = newValue;
});

var formId = eform.formId;//获取当前表单id


//保存
window.save = function (callback) {
    var panel = eform.loading("正在创建，请稍等"); // 打开遮罩层
    var rs = mySave(panel);
    if (rs == false) {
        eform.loaded(panel); // 关闭遮罩层
        return false;
    }

    if (viewtype == '1') {
        edoc2Form.formParser.save(function (rid) {
            edoc2Form.formParser.changeFormToEdit(eform.recordId);
            edoc2Form.isNewRecord = false;

            eform.loaded(panel); // 关闭遮罩层
            window.top.$.messager.alert("提示", "保存成功！");
            eform.parentForm("eformDataTable1").method("load"); //父页面表格刷新
            eform.parentForm("eformDataTable1").method("getControl").ChildFormDialog.close();//关闭弹窗

            callback && callback();
        }, null, eform.recordId, "", true, false);
    } else {
        eform.loaded(panel); // 关闭遮罩层
        window.top.$.messager.alert("提示", "保存成功！");

        eform.parentForm("eformDataTable1").method("load"); //父页面表格刷新
        eform.parentForm("eformDataTable1").method("getControl").ChildFormDialog.close();//关闭弹窗
    }

};

//保存并新建
window.saveAndNew = function (callback) {

    var panel = eform.loading("正在创建，请稍等"); // 打开遮罩层
    var rs = mySave(panel);
    if (rs == false) {
        eform.loaded(panel); // 关闭遮罩层
        return false;
    }
    eform.loaded(panel); // 关闭遮罩层
    eform.parentForm("eformDataTable1").method("load"); //父页面表格刷新
    eform("eformSelectMember1").method("setValue", '');
    memberList = [];

    window.top.$.messager.alert("提示", "保存成功！");
    //重置form表单的主键
    var iframeFormid = $.getQueryString("formid", window.location.href);
    var iframeFormParser = window.instancesFormParser[iframeFormid];
    iframeFormParser.instanceFormConfig.recordId = iframeFormParser.eform.recordId = $.genId();
    //修复保存并新建后,隐藏域数据无法提交bug
    iframeFormParser.eform.isNewRecord = iframeFormParser.formData.isNewRecord = iframeFormParser.instanceFormConfig.isNewRecord = true;

};


function mySave(panel) {

    if (viewtype == '0')  {

        if (memberList.length == 0) {
            window.top.$.messager.alert("提示", "请至少选择一个成员！");
            eform.loaded(panel); // 关闭遮罩层
            return false;
        }

        var perm_value = eform("perm_value").method('getValue');
        var msg = "";
        for (var i = 0; i < memberList.length; i++) {
            var res = checkRepeat(data_id, memberList[i].guid);
            if (res) {
                msg += memberList[i].text + "已有权限记录！<br>";
            }
        }
        if (msg) {
            window.top.$.messager.alert("提示", msg);
            eform.loaded(panel); // 关闭遮罩层
            return false;
        }
        else {
            debugger;
            var b = batchInsertStoragePermissions(data_id, perm_value, memberList, patent_data_id);
            if (b == "0") {
                window.top.$.messager.alert("提示", "保存成功！");
            } else {
                window.top.$.messager.alert("提示", "保存失败！");
            }
            return false;
        }
    }

}

/*
* 表单提交前事件,返回false将不会提交表单
* @param formId：当前表单编号
*/
/*
eform.engEvent("saveBefore", function (formId) {

    var flag = true;
    // 打开遮罩层
    var panelG = eform.loading("正在创建...请稍等");

    window.setTimeout(function () {
    }, 1);

    if (viewtype == '0')  {

        if (memberList.length == 0) {
            window.top.$.messager.alert("提示", "请至少选择一个成员！");
            eform.loaded(panelG); // 关闭遮罩层
            return false;
        }

        var perm_value = eform("perm_value").method('getValue');
        var msg = "";
        for (var i = 0; i < memberList.length; i++) {
            var res = checkRepeat(data_id, memberList[i].guid);
            if (res) {
                msg += memberList[i].text + "已有权限记录！<br>";
            }
        }
        if (msg) {
            window.top.$.messager.alert("提示", msg);
            eform.loaded(panelG); // 关闭遮罩层
            return false;
        }
        else {
            debugger
            batchInsertStoragePermissions(data_id, perm_value, memberList);


            return true;

        }

    }

    eform.loaded(panelG); // 关闭遮罩层
    return true;

});
*/



/*
*判断是否已经有权限
*dataId 库房id
*permId 成员的guid
*/
function checkRepeat(dataId, permId) {
    var checkResult;
    var param = {
        data_id: dataId
        , perm_id: permId
    };

    /*eform.dataset("getPermissionByCondition", param, function (result) {
        if(result.Data[0].length>0){
            res=false;
        }
    }, false);*/
    $.ajax({
        type: "POST",
        async: false,
        url: "http://localhost:8012/edrmscore/api/storagePermission/selectStoragePermissionByPermId?token="+token,
        data: param,
        dataType: "json",
        success: function (res) {
            if (res.result) {

                checkResult = res.obj
            }
        }
    });
    return checkResult;
}


/**
 * 批量插入库房权限
 * @param dataId
 * @param perm_value
 * @param memberList
 * @param patent_data_id
 */
function batchInsertStoragePermissions(dataId, perm_value,memberList,patent_data_id) {
    var b = "1";
    $.ajax({
        type: "POST",
        async: false,
        url: "http://localhost:8012/edrmscore/api/storagePermission/batchInsertStoragePermission?token="+token,
        data: JSON.stringify({
            createId: eform.userInfo.id
            , updateId: eform.userInfo.id
            , del_status: '0'
            , memberList: memberList
            , perm_value: perm_value
            , data_id: dataId
            , patent_data_id: patent_data_id
        }) ,
        contentType:'application/json',
        success: function (res) {
            debugger;
            if (res.result) {
                b = res.code;
            }
        }
    });
    return b;
}