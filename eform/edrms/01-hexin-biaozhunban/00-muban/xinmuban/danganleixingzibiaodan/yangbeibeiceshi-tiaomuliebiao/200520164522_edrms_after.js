var gjformid = '200505204948_edrms';//归卷表单id

var piLiangGuaJieFormId = '200210154132_edrms';//批量挂接表单id
var printFormId = '200216140908_edrms';//打印模板formId

var guiDangFormId = '200212224652_edrms';//归档流程表单id
var guidangProcessId = getProcessId('档案归档');//归档流程id

var jianDingFormId = '200211151029_edrms';//发起鉴定 流程表单id
var jianDingProcessId = getProcessId('档案鉴定');//发起鉴定 流程id

var xiaoHuiFormId = '200211224839_edrms';//发起销毁 流程表单id
var xiaoHuiProcessId = getProcessId('档案销毁');//发起销毁 流程id
var delayDateFormId ='200515093940_edrms' ;//延期表单id

$('.datagrid-toolbar td .l-btn').css('display','none');//隐藏所有的操作按钮

var entrystateStr = "";
var filterStr = "";
//档案状态
var entrystate = $.getQueryString("entrystate");// 档案状态 0整编库，1档案库，2鉴定库，3销毁库，4回收站
if(entrystate=='0'){
    entrystateStr='待归档';
    $('#13e0a61b-0043-391d-e6c2-df202b17caae').show();//显示“新增”按钮
    $('#4dc6f56d-ccb2-fd62-a8f9-c576134fa8c7').show();//显示“删除”按钮
    $('#4bb2e73b-0d57-191d-b1c0-57dad7dbca60').show();//显示“直接归档”按钮
    $('#f54e98ef-edf1-d678-2ffc-b9193f808a7d').show();//显示“发起归档”按钮
    $('#55ee2f1f-1151-a815-eb14-12b12b0818c8').show();//显示“批量挂接”按钮
    //$('#e9ecc931-b74d-6659-54be-7b51fd9a815c').show();//显示“导入”按钮

    filterStr = "( ( entrystate='0'  or  entrystate='9' ) and  ifDossiered ='0' )";
}
else if(entrystate=='1'){
    entrystateStr='已归档';
    $('#13e0a61b-0043-391d-e6c2-df202b17caae').show();//显示“新增”按钮
    $('#4dc6f56d-ccb2-fd62-a8f9-c576134fa8c7').show();//显示“删除”按钮
    $('#630bb3d4-6412-3a7c-1465-6e000e1a34e3').show();//显示“打印”按钮
    $('#55ee2f1f-1151-a815-eb14-12b12b0818c8').show();//显示“批量挂接”按钮
    //$('#e9ecc931-b74d-6659-54be-7b51fd9a815c').show();//显示“导入”按钮

    filterStr = "(entrystate='1' and  ifDossiered ='0' )";
}
else if(entrystate=='2'){
    $('#2369dff5-0d27-038b-0ef0-28ba5d2df048').show();//显示“发起鉴定”按钮
    $('#a74a72f1-2936-1cfc-6a85-1af7684223a0').show();//显示“发起销毁”按钮
    $('#466b4db4-9087-bc8c-d349-9e47962a3921').show();//显示“延期”按钮
    //获取 档案到期提前提醒天数
    eform.dataset("getDictValueByCode",{code:'archAlertDays'},function(result){
        var archAlertDays = JSON.parse(result.Data[0][0].DataSourceItems)[0].value;
		debugger;
        var alertTime = new Date();
        alertTime = new Date(alertTime.getTime()+parseFloat(archAlertDays)*3600000*24);
        alertTime = dateFormat(alertTime);
        filterStr = "(((entrystate='1' and deadTime <'" + alertTime + "') or  entrystate='2' or entrystate='5' or entrystate='7' or entrystate='10') and  ifDossiered ='0' ) " ;
    },false);

}
else if(entrystate=='3'){
    filterStr = "(entrystate='3' and  ifDossiered ='0' )";
}
else if(entrystate=='4'){
    $('#ac93cc9f-c40f-0bac-75a0-c0f2037b7c97').show();//显示“还原”按钮
    $('#da3c0f5d-b278-545b-36f4-005f675eae17').show();//显示“沉底删除”按钮

    filterStr = "(entrystate='4' and  ifDossiered ='0' )";
}

//$('#8d4330fa-44b1-00e3-1271-847c821fe39e').show();//显示“导出”按钮
$('#67530571-2a25-9d3e-c70f-193895c90faa').show();//显示“隐藏”按钮


var isSect = $.getQueryString("isSect");//1全宗 2未立卷的档案类型 3立卷的档案类型
if (isSect == '3' && (entrystate=='0'||entrystate=='1')) {
    $('#cd9653b1-2c7c-45d8-364a-8b9bdb72729d').show();//显示“归卷”按钮
    $('#18facde3-3b69-ddb8-f1de-9863e70ae53f').show();//显示“组卷”按钮
}

//通过表单id获取档案类型id
var formid = $.getQueryString('formid'); //
var archTypeId = '';
eform.dataset("selectByFormId", {formid:formid}, function(result) {
    archTypeId = result.Data[0][0].arch_type_id;
}, false);

var folderId = '';
var archTableName = '';
var dossierTableName = '';
var sectId = '';
var archtypename = "";
var fields_def = [];
eform.dataset("Selectarchtype", {Id:archTypeId}, function(result) {
    folderId = result.Data[0][0].folder_id;
    archTableName = result.Data[0][0].arch_table_name;
    dossierTableName = result.Data[0][0].dossier_table_name;
    sectId = result.Data[0][0].sect_id;
    archtypename = result.Data[0][0].name;
    fields_def = eval(result.Data[0][0].fields_def);
}, false);

var sectname = "";
eform.dataset("SelectSect", {Id: sectId}, function (result) {
    var data = result.Data[0][0];
    sectname = data.name;
}, false);


var param = {filter:filterStr };
eform("eformListGrid1").method("load", param);//重新加载查询列表数据


var resData = selectArchTypeForm(archTypeId , '0', '0');//获取 条目属性 表单
var archPropertiesFormId = resData.form_id;


eform("eformListGrid1").method("onUrlFormatter", function (url, operateBtn) {

    var rowInfos = eform("eformListGrid1").method("getSelectedRows");//获取查询列表被选中的值
    var flag = false;
    if(rowInfos.length>0){
        flag = true;
    }


    if (operateBtn.formName == "新增") {
        var newFormUrl = eform.virtualPath + '/index?formid=' + archPropertiesFormId + '&skin=techblue&viewtype=0&entrystate='+entrystate;
        return newFormUrl;
    }
    else if (operateBtn.formName == "查看") {
        var newFormUrl = eform.virtualPath + '/index?formid=' + archPropertiesFormId + '&skin=techblue&id=' + rowInfos[0].ID+'&entrystate='+entrystate;
        return newFormUrl;
    }
    else if (operateBtn.formName == "编辑") {
        var newFormUrl = eform.virtualPath + '/index?formid='+archPropertiesFormId+'&skin=techblue&id='+rowInfos[0].ID+
            '&viewtype=1&entrystate='+entrystate;
        return newFormUrl;
    }
    else if (operateBtn.formName == "批量挂接") {
        var newFormUrl = eform.virtualPath + '/index?formid='+piLiangGuaJieFormId+
            '&skin=techblue&archTypeId='+archTypeId+"&eformformid="+archPropertiesFormId+'&ifDossier=0&entrystate='+entrystate;
        return newFormUrl;
    }
    else if (operateBtn.formName == "归卷") {
        if (!flag) {
            window.top.$.messager.alert("提示", "请选择需要归卷的档案！");
            return;
        }

        var flag2 = false;
        for (var i = 0; i < rowInfos.length; i++) {
            if (rowInfos[i].entrystate != '0' && rowInfos[i].entrystate != '1') {
                flag2 = true;
            }
        }
        if (flag2) {
            window.top.$.messager.alert("提示", "请选择"+entrystateStr+"的档案！");
            return false;
        }

        var newFormUrl = eform.virtualPath+'/index?formid='+gjformid+'&skin=techblue&archTableName='+archTableName+
            '&dossierTableName='+dossierTableName+'&entrystate='+entrystate;
        return newFormUrl;
    }

    else if (operateBtn.formName == "延期") {
        if (!flag) {
            window.top.$.messager.alert("提示", "请选择需要延期的档案！")
            return;
        }
        for(var i=0;i<rowInfos.length;i++){
            if(rowInfos[i].entrystate!="10"){
                window.top.$.messager.alert("提示", "请选择待延期的档案！");
                return false;
            }
        }
        var newFormUrl = eform.virtualPath + '/index?formid='+delayDateFormId+'&skin=techblue&tableName=' + archTableName+'&ifDossier=0';
        return newFormUrl;
    }

    else if (operateBtn.formName == "组卷") {
        if (!flag) {
            window.top.$.messager.alert("提示", "请选择需要组卷的档案！")
            return;
        }

        var flag2 = false;
        for (var i = 0; i < rowInfos.length; i++) {
            if (rowInfos[i].entrystate != '0' && rowInfos[i].entrystate != '1') {
                flag2 = true;
            }
        }
        if (flag2) {
            window.top.$.messager.alert("提示", "请选择"+entrystateStr+"的档案！");
            return false;
        }

        var zjformid = '';
        var resData2 = selectArchTypeForm(archTypeId, '0', '2' );//获取 案卷属性表单id
        if(resData2){
            zjformid = resData2.form_id;
        }
        var newFormUrl = eform.virtualPath+'/index?formid='+zjformid+'&skin=techblue&viewtype=0&entrystate='+entrystate+
            '&ifZujuan=1';
        return newFormUrl;
    }

    else if (operateBtn.formName == "发起归档") {
        if (!flag) {
            window.top.$.messager.alert("提示", "请选择需要发起归档的档案！");
            return false;
        }
        for (var i = 0; i < rowInfos.length; i++) {
            if (rowInfos[i].entrystate != "0") {
                window.top.$.messager.alert("提示", "请选择待归档的档案！");
                return false;
            }
        }

        var newFormUrl = eform.virtualPath + '/Default/default?formId='+guiDangFormId+
            '&skin=techblue&processId='+guidangProcessId+'&taskType=begintask&flowtype=0&archTypeId='+archTypeId+'&PropertiesFormId='+archPropertiesFormId;
        return newFormUrl;
    }

    else if (operateBtn.formName == "打印") {
        if (!flag) {
            window.top.$.messager.alert("提示", "请选择需要打印的档案！");
            return;
        }
        var newFormUrl = eform.virtualPath + '/index?formid='+printFormId+'&skin=techblue';
        return newFormUrl;
    }

    else if(operateBtn.formName== "发起鉴定"){
        if(!flag){
            window.top.$.messager.alert("提示", "请选择需要发起鉴定的档案！");
            return false;
        }
        for(var i=0;i<rowInfos.length;i++){
            if(rowInfos[i].entrystate!="1"){
                window.top.$.messager.alert("提示", "请选择待鉴定档案！");
                return false;
            }
        }
        var newFormUrl = eform.virtualPath + '/Default/default?formId='+jianDingFormId+
            '&skin=techblue&processId='+jianDingProcessId+'&taskType=begintask&flowtype=0&archTypeId='+archTypeId+'&propertiesFormId='+archPropertiesFormId;
        return  newFormUrl;
    }
    else if(operateBtn.formName== "发起销毁"){
        if(!flag){
            window.top.$.messager.alert("提示", "请选择相应档案信息！");
            return false;
        }
        for(var i=0;i<rowInfos.length;i++){
            if(rowInfos[i].entrystate!="2"){
                window.top.$.messager.alert("提示", "请选择待销毁档案！");
                return false;
            }
        }
        var newFormUrl = eform.virtualPath + '/Default/default?formId='+xiaoHuiFormId+
            '&skin=techblue&processId='+xiaoHuiProcessId+'&taskType=begintask&flowtype=0&archTypeId='+archTypeId;
        return  newFormUrl;
    }
});


eform("eformListGrid1").method("customButtonEvent", function (formId, ids, name, callback) {

    if (name == "直接归档") {
        var info = eform("eformListGrid1").method("getSelectedRows")

        if (info.length == 0) {
            window.top.$.messager.alert("提示", "请选择需要直接归档的档案！");
            return false;
        }

        var flag = false;
        var archIds = '';
        for (var i = 0; i < info.length; i++) {
            if (info[i].entrystate != '0') {
                flag = true;
            }
            archIds = archIds + ",'" + info[i].ID + "'"
        }
        if (flag) {
            window.top.$.messager.alert("提示", "请选择待归档的档案！");
            return false;
        }

        window.top.$.messager.confirm("提示", "确认此操作吗？", function (bool) {
            if (bool === true) {
                archIds = archIds.substring(1);

                eform.dataset("updateArchDirArchStatus", {ids: archIds,archStatus: 1}, function (result) {
                    //修改档案中间表状态
                }, false);

                var account = eform.userInfo.Account;
                var deptCode = eform.userInfo.MainDepartmentIdentityId
                var tableName = archTableName;
                var type = 1;//1档案，2案卷

                for (var i = 0; i < info.length; i++) {

                    var fn = (function (i) {
                        var entityId = info[i].ID;
                        var arch = {};
                        eform.dataset("selectArchById", {tableName: archTableName,archId: entityId}, function (result) {
                            arch = result.Data[0][0];
                        }, false);

                        //生成档号
                        var archNumber = arch.number;
                        if(!archNumber){
                             archNumber = createNumber(account, deptCode, archTypeId, entityId, tableName, type, arch);
                        }
                        var param = {Id: entityId, tablename: archTableName, number: archNumber};
                        eform.dataset("UpdateEntryStateAndNumber", param, function (result) {
                            if(result.EffectOfRow>0){

                            }
                            //更新档号、状态、归档人、归档时间
                        }, false);

                        arch.entrystate='1';
                        arch.objectid=arch.Id;
                        insertES(arch,archPropertiesFormId,sectname,archtypename,archTableName);
                    });
                    fn(i);
                }
                window.top.$.messager.alert("提示", "直接归档成功！")
                eform("eformListGrid1").method("load"); //表格刷新

            }
        });

    }

    else if (name == "删除") {
        var rows = eform("eformListGrid1").method("getSelectedRows");
        if (rows.length == 0) {
            window.top.$.messager.alert("提示", "请选择需要删除的档案！");
            return false;
        }

        var flag = false;
        var ids = '';
        for (var i = 0; i < rows.length; i++) {
            if ( rows[i].entrystate != '0' && rows[i].entrystate != '1' ) {
                flag = true;
            }
            ids = ids + ",'" + rows[i].ID + "'"
        }
        if (flag) {
            if(entrystate=='0'){
                window.top.$.messager.alert("提示", "请选择待归档的档案！")
            }else if (entrystate=='1'){
                window.top.$.messager.alert("提示", "请选择已归档的档案！")
            }
            return false;
        }

        window.top.$.messager.confirm("提示", "确认此操作吗？", function (bool) {

            if (bool === true) {

                ids = ids.substring(1);

                //整编库状态
                if(entrystate=='0'){

                    eform.dataset("deleteEntryDirByEntryId", {archIds: ids}, function (result) {
                        //删除中间表
                    }, false);

                    var param = {
                        ids: ids
                        ,tableName: archTableName
                    };
                    eform.dataset("deleteByIds", param, function (result) {
                        //删除档案
                        if (result.EffectOfRow > 0) {
                            for (var j = 0; j < rows.length; j++) {
                                //删除es记录
                                deleteES(rows[j].ID);
                            }
                        }
                    }, false);

                }

                //档案库状态
                else if(entrystate=='1'){


                    debugger;
                    eform.dataset("updateArchDirArchStatus", {ids: ids,archStatus: 4}, function (result) {
                        //修改档案中间表状态
                    }, false);

                    var param = {
                        ids: ids
                        , tableName: archTableName
                        , entryState: '4'
                    };
                    eform.dataset("updateEntryStateByIds", param, function (result) {
                        if (result.EffectOfRow > 0) {

                            var archList = [];
                            eform.dataset("selectByIds", {ids:ids,tableName:archTableName}, function (result) {
                                archList = result.Data[0];
                            }, false);

                            for (var j = 0; j < archList.length; j++) {
                                var arch = archList[j];
                                arch.entrystate='4';
                                arch.objectid=arch.Id;
                                insertES(arch,archPropertiesFormId,sectname,archtypename,archTableName);
                            }
                        }
                    }, false);
                }

                eform("eformListGrid1").method("load"); //表格刷新
            }
        });

    }

    else  if (name == "还原") {
        var rows = eform("eformListGrid1").method("getSelectedRows");
        if (rows.length == 0) {
            window.top.$.messager.alert("提示", "请选择需要还原的档案！");
            return false;
        }

        window.top.$.messager.confirm("提示", "确认此操作吗？", function (bool) {
            if (bool === true) {
                var ids = "";
                for (var i = 0; i < rows.length; i++) {
                    ids = ids + ",'" + rows[i].ID + "'"
                }
                ids = ids.substring(1);

                eform.dataset("updateArchDirArchStatus", {ids: ids,archStatus: 1}, function (result) {
                    //修改档案中间表状态
                }, false);

                var param = {
                    ids: ids
                    , tableName: archTableName
                    , entryState: '1'
                };
                eform.dataset("updateEntryStateByIds", param, function (result) {
                    if (result.EffectOfRow > 0) {

                        var archList = [];
                        eform.dataset("selectByIds", {ids:ids,tableName:archTableName}, function (result) {
                            archList = result.Data[0];
                        }, false);

                        for (var j = 0; j < archList.length; j++) {
                            var arch = archList[j];
                            arch.entrystate='1';
                            arch.objectid=arch.Id;
                            insertES(arch,archPropertiesFormId,sectname,archtypename,archTableName);
                        }

                    }
                }, false);

                eform("eformListGrid1").method("load"); //父页面表格刷新
            }
        });

    }

    else if (name == "彻底删除") {
        var rows = eform("eformListGrid1").method("getSelectedRows");
        if (rows.length == 0) {
            window.top.$.messager.alert("提示", "请选择需要彻底删除的档案！");
            return false;
        }
        window.top.$.messager.confirm("提示", "确认此操作吗？", function (bool) {
            if (bool === true) {

                var ids = "";
                for (var i = 0; i < rows.length; i++) {
                    ids = ids + ",'" + rows[i].ID + "'"
                }
                ids = ids.substring(1);

                eform.dataset("deleteEntryDirByEntryId", {archIds: ids}, function (result) {
                    //删除中间表
                }, false);

                var param = {
                    ids: ids
                    , tableName: archTableName
                };
                eform.dataset("deleteByIds", param, function (result) {
                    if (result.EffectOfRow > 0) {

                        for (var j = 0; j < rows.length; j++) {
                            deleteES(rows[j].ID);
                        }

                        eform("eformListGrid1").method("load"); //表格刷新
                        window.top.$.messager.alert("提示", "操作成功！");
                    } else {
                        window.top.$.messager.alert("提示", "操作失败！");
                    }
                }, false);
            }
        });
    }

    callback && callback();// 最后一行,该行代码必须
});


eform("eformListGrid1").method("childFormButtonEvent", function (formId, ids, name, callback) {
    if (name == "保存") {
        eform("eformListGrid1").method("getControl").ChildFormDialog.iframe[0].contentWindow.window.save(function () {
            eform("eformListGrid1").method("getControl").ChildFormDialog.close();
            eform("eformListGrid1").method("load"); //父页面表格刷新
        });
    }
    else if (name == "保存并新建") {
        eform("eformListGrid1").method("getControl").ChildFormDialog.iframe[0].contentWindow.window.saveandnew(function () {
            eform("eformListGrid1").method("load"); //父页面表格刷新
        });
    }
    else if (name == "归卷") {
        eform("eformListGrid1").method("getControl").ChildFormDialog.iframe[0].contentWindow.window.guijuan(function () {
            eform("eformListGrid1").method("getControl").ChildFormDialog.close();
            eform("eformListGrid1").method("load"); //父页面表格刷新
        });
    }
    else if (name == "组卷") {
        eform("eformListGrid1").method("getControl").ChildFormDialog.iframe[0].contentWindow.window.zujuan(function () {
            eform("eformListGrid1").method("getControl").ChildFormDialog.close();
            eform("eformListGrid1").method("load"); //父页面表格刷新
        });
    }
    else if (name == "打印") {
        eform("eformListGrid1").method("getControl").ChildFormDialog.iframe[0].contentWindow.window.dayin(function () {
            eform("eformListGrid1").method("load"); //父页面表格刷新
        });
    }
    else if (name == "批量挂接") {
        eform("eformListGrid1").method("getControl").ChildFormDialog.iframe[0].contentWindow.window.piliangguajie(function () {
            eform("eformListGrid1").method("getControl").ChildFormDialog.close();
            eform("eformListGrid1").method("load"); //父页面表格刷新
        });
    }
    else if (name == "延期") {
        eform("eformListGrid1").method("getControl").ChildFormDialog.iframe[0].contentWindow.window.delayDate(function () {
            eform("eformListGrid1").method("getControl").ChildFormDialog.close();
            eform("eformListGrid1").method("load"); //父页面表格刷新
        });
    }


    callback && callback(); // 最后一行,该行代码必须
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

    param.account4CreateNumber = account
    param.deptCode4CreateNumber = deptCode
    param.archTypeId4CreateNumber = archTypeId
    param.entityId4CreateNumber = entityId
    param.tableName4CreateNumber = tableName
    param.type4CreateNumber = type

    var host = window.location.hostname;
    var archNo = '';
    $.ajax({
        type: "POST",
        async: false,
        url: window.location.protocol+"//" + host + ":8002/number/api/number/createNumber",
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


/** 获取当前时间
 * @return 返回时间类型 yyyy-MM-dd HH:mm:ss
 */
function dateFormat(myDate){
    var year = myDate.getFullYear();
    var month = myDate.getMonth()+1;
    var date = myDate.getDate();
    var h = myDate.getHours();
    var m = myDate.getMinutes();
    var s = myDate.getSeconds();
    var now = year + '-' + getMakeZero(month) + "-" + getMakeZero(date) + " " + getMakeZero(h) + ':' + getMakeZero(m) + ":" + getMakeZero(s);
    return now;
}


/**时间补0
 * @return 返回时间类型 yyyy-MM-dd HH:mm:ss
 */
function getMakeZero(s) {
    return s < 10 ? '0' + s : s;
}

//通过流程名称获取流程id
function getProcessId(processName){
    var processId = '' ;//流程id
    eform.dataset("selectProcessIdByProcessName",{ProcessName:processName},function(result){
        debugger;
        processId=result.Data[0][0].ID_;
    },false);
    return processId;
}


//插入es
function insertES(info,filePropertyFormId,sectname,archtypename,archTableName){

    var entityId = info.objectid;

    //通过档案ID 获取 电子文件
    var fileIds = [];
    var files = [];
    var filenames = [];
    eform.dataset("selectAttachmentByArch", {archID: entityId}, function (result) {
        if (result.Data) {var fileinfo = result.Data[0];
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
    info["formid"]=filePropertyFormId;
    info["sectname"]=sectname;
    info["archtypename"]=archtypename;
    info["archTableName"]=archTableName;
    info["files"]=files;
    info["filenames"]=filenames;


  /*  for(var o  in info){

        if(isNaN(info[o])&&!isNaN(Date.parse(info[o]))) {
            info[o] =parseDateUtil(info[o]);
        }

    }*/

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

function parseDateUtil(data) {

    var formatDateStr='';

    if(isNaN(data)&&!isNaN(Date.parse(data))){

        var da = new Date(Date.parse(data));
        var year = da.getFullYear()+'年';
        var month = da.getMonth()+1+'月';
        var date = da.getDate()+'日';
        var hour = da.getHours()+'时';
        var minute = da.getMinutes()+'分';
        var second = da.getSeconds()+'秒';
        if (hour==0&& minute==0&&second==0){

            formatDateStr = [year,month,date].join('');

        }else {
            formatDateStr = [year,month,date,hour,minute,second].join('');
        }

        console.log([year,month,date,hour,minute,second].join(''));
        //formatDateStr =Date.parse(data).format("yyyy年MM月dd日 hh时mm:ss");
    }

    return formatDateStr;
}