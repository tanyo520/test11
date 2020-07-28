var gjformid = '200505204948_edrms';//归卷表单id

var piLiangGuaJieFormId = '200210154132_edrms';//批量挂接表单id

var printFormId = '200216140908_edrms';//打印模板formId

var guiDangFormId = '200212224652_edrms';//归档流程表单id

var jianDingFormId = '200211151029_edrms';//发起鉴定 流程表单id

var xiaoHuiFormId = '200211224839_edrms';//发起销毁 流程表单id

var delayDateFormId ='200515093940_edrms' ;//延期表单id

var token = $.cookie("token");

var entrystateStr = "";
var filterStr = "";

var entrystate = $.getQueryString("entrystate");// 档案状态 0整编库，1档案库，2鉴定库，3销毁库，4回收站
if(entrystate=='0'){
    entrystateStr='待归档';
    filterStr = "( ( entrystate='0'  or  entrystate='9' ) and  ifDossiered ='0' )";
}
else if(entrystate=='1'){
    entrystateStr='已归档';
    filterStr = "(entrystate='1' and  ifDossiered ='0' )";
}
else if(entrystate=='2'){
    //获取 档案到期提前提醒天数
    eform.dataset("selectDictByCode",{code:'archAlertDays'},function(result){
        //var archAlertDays = JSON.parse(result.Data[0][0].DataSourceItems)[0].value;
        var archAlertDays = result.Data[0][0].value;
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
    filterStr = "(entrystate='4' and  ifDossiered ='0' )";
}

var param = {filter:filterStr };
eform("eformListGrid1").method("load", param);//重新加载查询列表数据


//通过表单id获取档案类型
var formid = $.getQueryString('formid');
var archType = {};
eform.dataset("selectByFormId", {formid:formid}, function(result) {
    archType = result.Data[0][0];
}, false);
var archTypeId = archType.Id;
var folderId = archType.folder_id;
var archTableName = archType.arch_table_name;
var dossierTableName = archType.dossier_table_name;
var sectId = archType.sect_id;
var archtypename = archType.name;
var archPropFormId = archType.archPropFormId;
var zjformid = archType.dossierPropFormId;

var sectname = "";
eform.dataset("SelectSect", {Id: sectId}, function (result) {
    var data = result.Data[0][0];
    sectname = data.name;
}, false);


/**
 * url格式化事件，子窗体将连接到新的url地址
 * @param url 原打开的表单地址
 * @param operateBtn 点击的操作按钮配置信息
 */
eform("eformListGrid1").method("onUrlFormatter", function (url, operateBtn) {

    var rowInfos = eform("eformListGrid1").method("getSelectedRows");//获取查询列表被选中的值
    var flag = false;
    if(rowInfos.length>0){
        flag = true;
    }


    if (operateBtn.formName == "新增") {
        var newFormUrl = eform.virtualPath + '/index?formid=' + archPropFormId + '&skin=techblue&viewtype=0&entrystate='+entrystate;
        return newFormUrl;
    }
    else if (operateBtn.formName == "查看") {
        var newFormUrl = eform.virtualPath + '/index?formid=' + archPropFormId +
            '&skin=techblue&id=' + rowInfos[0].ID+'&entrystate='+entrystate;
        return newFormUrl;
    }
    else if (operateBtn.formName == "编辑") {
        var newFormUrl = eform.virtualPath + '/index?formid='+archPropFormId+'&skin=techblue&id='+rowInfos[0].ID+
            '&viewtype=1&entrystate='+entrystate;
        return newFormUrl;
    }
    else if (operateBtn.formName == "批量挂接") {
        var newFormUrl = eform.virtualPath + '/index?formid='+piLiangGuaJieFormId+
            '&skin=techblue&archTypeId='+archTypeId+"&eformformid="+archPropFormId+'&ifDossier=0&entrystate='+entrystate;
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

        var guidangProcessId = getProcessId('档案归档');//归档流程id

        var newFormUrl = eform.virtualPath + '/Default/default?formId='+guiDangFormId+
            '&skin=techblue&processId='+guidangProcessId+'&taskType=begintask&flowtype=0&archTypeId='+archTypeId+'&PropertiesFormId='+archPropFormId;
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
        var jianDingProcessId = getProcessId('档案鉴定');//发起鉴定 流程id
        var newFormUrl = eform.virtualPath + '/Default/default?formId='+jianDingFormId+
            '&skin=techblue&processId='+jianDingProcessId+'&taskType=begintask&flowtype=0&archTypeId='+archTypeId+'&propertiesFormId='+archPropFormId;
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
        var xiaoHuiProcessId = getProcessId('档案销毁');//发起销毁 流程id
        var newFormUrl = eform.virtualPath + '/Default/default?formId='+xiaoHuiFormId+
            '&skin=techblue&processId='+xiaoHuiProcessId+'&taskType=begintask&flowtype=0&archTypeId='+archTypeId;
        return  newFormUrl;
    }
});


/**
 * 自定义按钮点击事件
 * @param formId 表单ID
 * @param ids 选中记录ID集合
 * @param name 按钮名称
 * @param callback 点击后事件
 */
eform("eformListGrid1").method("customButtonEvent", function (formId, ids, name, callback) {

    if (name == "直接归档") {
        var info = eform("eformListGrid1").method("getSelectedRows");

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
                var deptCode = eform.userInfo.MainDepartmentIdentityId;
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
                        arch.number=archNumber;
                        insertES(arch,archPropFormId,sectname,archtypename,archTableName);
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
                                insertES(arch,archPropFormId,sectname,archtypename,archTableName);
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
                            insertES(arch,archPropFormId,sectname,archtypename,archTableName);
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

    else if(name == "下载导入模板"){
        top.window.open("http://192.168.254.32:8002/edrmscore/api/excel/download?module=arch&formId="+archPropFormId+"&token="+token);
    }

    else if(name == "导入"){
        var formId = "200715155024_edrms";//导入表单id
        // 基本配置
        var config = {
            width: 900,
            height: 600,
            minimizable: false,  // 是否显示最小化按钮   默认false
            resizable: true,     // 是否能够改变窗口大小 默认true
            maximizable: false,  // 是否显示最大化按钮   默认false
            modal: true,         // 模式化窗口           默认true
            title: "excel导入",           // 弹框标题
            closed: true,        // 是否可以关闭窗口     默认true
            // 			buttons:[{           // 右下角显示的按钮组
            // 				text: "按钮",
            // 				handler: function(){}
            // 			}]

        }

        // 事件及其他
        var param2 = {
            dialogType: "iframe",    // 以iframe方式打开
            target: eform.virtualPath + "/Default/default?formid="+formId+"&module=arch&typeId="+archPropFormId+"&archTypeId="+archTypeId,  // 地址
            showCloseBtn: false,     // 是否在右下角显示关闭按钮
            window:window.top,
            onBeforOpen:function(){  // 窗口打开前事件,return false不打开窗体
                return true;
            },
            onAfterOpen: function(){ // 窗口打开后事件

            },
            onBeforeClose: function(){ // 窗口关闭前事件
                eform("eformListGrid1").method("load");
            }

        }
        var dialog = new eform.Dialog(config, param2);
        var iframe = dialog.iframe;             // 取iframe元素(jquery)
        var ifWindow = iframe[0].contentWindow; // 取iframe中的window
    }

    else if(name == "导出"){

        var data = eform("eformListGrid1").method("getRows");
        if(data.length==0){
            window.top.$.messager.alert("提示", "系统没有可以导出的数据！");
            return false;
        }

        var conditions = "";
        var info = eform("eformListGrid1").method("getSelectedRows");
        var archIds = '';
        for (var i = 0; i < info.length; i++) {
            archIds += ",'" + info[i].ID + "'"
        }
        if(archIds){
            archIds = archIds.substring(1);
            conditions = "`Id` in ("+archIds+")";
        }else{
            conditions = filterStr;
            $('.rect-item').each(function () {
                var name = $(this).attr("data-controlid");
                var text = $(this).find(".rect-item-value").text();
                if(text){
                    if(name=='writtendate'){
                        var start = text.split('$')[0];
                        var end = text.split('$')[1];
                        if(start){
                            conditions += " and `writtendate`>='"+start+"' ";
                        }
                        if(end){
                            conditions += " and `writtendate`<'"+end+"' ";
                        }
                    }else{
                        conditions += " and `"+name+"`='"+text+"' ";
                    }
                }
            });
        }
        conditions = encodeURIComponent(conditions);
        top.window.open("http://192.168.254.32:8002/edrmscore/api/excel/download?module=arch&formId="+archPropFormId+"&type=1&conditions="+conditions+"&token="+token);
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
            eform("eformListGrid1").method("getControl").ChildFormDialog.close();
            eform("eformListGrid1").method("load"); //父页面表格刷新
            $("#13e0a61b-0043-391d-e6c2-df202b17caae").click();
            window.top.$.messager.alert("提示", "保存成功！");
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

    param.token = $.cookie("token");
    param.archTypeId4CreateNumber = archTypeId
    param.entityId4CreateNumber = entityId
    param.type4CreateNumber = type;

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
