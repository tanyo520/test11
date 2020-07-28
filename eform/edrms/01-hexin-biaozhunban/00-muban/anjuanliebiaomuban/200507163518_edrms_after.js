var piLiangGuaJieFormId = '200210154132_edrms';//批量挂接表单id

var printFormId = '200413232010_edrms';//打印模板formId

var guiDangFormId = '200212224652_edrms';//归档流程表单id

var jianDingFormId = '200211151029_edrms';//发起鉴定 流程表单id

var xiaoHuiFormId = '200211224839_edrms';//发起销毁 流程表单id

var delayDateFormId ='200515093940_edrms' ;//延期表单id

var filterStr = "";
//档案状态
var entrystate = $.getQueryString("entrystate");// 档案状态 0整编库，1档案库，2鉴定库，3销毁库，4回收站
if(entrystate=='0'){
    filterStr = "(entrystate='0' or  entrystate='9' )";
}
else if(entrystate=='1'){
    filterStr = "(entrystate='1' )";
}
else if(entrystate=='2'){
    //获取 档案到期提前提醒天数
    eform.dataset("selectDictByCode",{code:'archAlertDays'},function(result){
        //var archAlertDays = JSON.parse(result.Data[0][0].DataSourceItems)[0].value;
        var archAlertDays = result.Data[0][0].value;
        var alertTime = new Date();
        alertTime = new Date(alertTime.getTime()+parseFloat(archAlertDays)*3600000*24);
        alertTime = dateFormat(alertTime);
        filterStr = "((entrystate='1' and deadTime <'" + alertTime + "') or  entrystate='2' or entrystate='5' or entrystate='7' or entrystate='10')  " ;
    },false);

}
else if(entrystate=='3'){
    filterStr = "(entrystate='3' )";
}
else if(entrystate=='4'){
    filterStr = "(entrystate='4' )";
}
var param = {filter:filterStr };
eform("eformListGrid1").method("load", param);//重新加载查询列表数据


//通过表单id获取档案类型
var curToken = $.cookie("token");
var formid = $.getQueryString('formid');
var archType = {};
eform.dataset("selectByFormId", {formid:formid}, function(result) {
    archType = result.Data[0][0];
}, false);
var archTypeId = archType.Id;
var parentArchTypeId = archType.parent_arch_type_id;
var folderId = archType.folder_id;
var archTableName = archType.arch_table_name;
var dossierTableName = archType.dossier_table_name;
var sectId = archType.sect_id;
var archtypename = archType.name;
var archPropertiesFormId = archType.archPropFormId;
var dossierPropertiesFormId = archType.dossierPropFormId;
var sectname = "";
eform.dataset("SelectSect", {Id: sectId}, function (result) {
    var data = result.Data[0][0];
    sectname = data.name;
}, false);

eform("eformListGrid1").method("onUrlFormatter", function (url, operateBtn) {

    var rowInfos = eform("eformListGrid1").method("getSelectedRows");//获取查询列表被选中的值

    if (operateBtn.formName == "新增") {
        var newFormUrl = eform.virtualPath + '/index?formid=' + dossierPropertiesFormId + '&skin=techblue&viewtype=0&entrystate='+entrystate;
        return newFormUrl;
    }
    else if (operateBtn.formName == "查看") {
        var info = eform("eformListGrid1").method("getSelectedRows");//获取查询列表被选中的值
        var newFormUrl = eform.virtualPath + '/index?formid=' + dossierPropertiesFormId +
            '&skin=techblue&id=' + info[0].ID+'&entrystate='+entrystate;
        return newFormUrl;
    }
    else if (operateBtn.formName == "编辑") {
        var info = eform("eformListGrid1").method("getSelectedRows");//获取查询列表被选中的值
        var newFormUrl = eform.virtualPath + '/index?formid='+dossierPropertiesFormId+'&skin=techblue&id='+info[0].ID+
            '&viewtype=1&entrystate='+entrystate;
        return newFormUrl;
    }
    else if (operateBtn.formName == "批量挂接") {
        var newFormUrl = eform.virtualPath + '/index?formid='+piLiangGuaJieFormId+
            '&skin=techblue&archTypeId='+archTypeId+"&eformformid="+dossierPropertiesFormId+'&ifDossier=1&entrystate='+entrystate;
        return newFormUrl;
    }
    else if (operateBtn.formName == "发起归档") {
        var testinfo = eform("eformListGrid1").method("getSelectedRows");

        if (testinfo.length == 0) {
            window.top.$.messager.alert("提示", "请选择需要发起归档的案卷！");
            return false;
        }
        for (var i = 0; i < testinfo.length; i++) {
            if (testinfo[i].entrystate != "0") {
                window.top.$.messager.alert("提示", "请选择待归档的案卷！");
                return false;
            }
        }
        var guidangProcessId = getProcessId('档案归档');//归档流程id
        var newFormUrl = eform.virtualPath + '/Default/default?formId='+guiDangFormId+
            '&skin=techblue&processId='+guidangProcessId+'&taskType=begintask&flowtype=1&archTypeId='+archTypeId+'&PropertiesFormId='+dossierPropertiesFormId;
        return newFormUrl;
    }

    else if (operateBtn.formName == "打印") {

        var info = eform("eformListGrid1").method("getSelectedRows");//获取查询列表被选中的值
        if (info.length == "0") {
            window.top.$.messager.alert("提示", "请选择需要打印的案卷！");
            return;
        }
        if(info.length > 1){
            window.top.$.messager.alert("提示", "请选择单个案卷打印！");
            return;
        }
        var newFormUrl = eform.virtualPath + '/index?formid='+printFormId+'&skin=techblue&archTypeId='+archTypeId;
        return newFormUrl;
    }


    else if (operateBtn.formName == "延期") {
        var info = eform("eformListGrid1").method("getSelectedRows");//获取查询列表被选中的值
        if (info.length == "0") {
            window.top.$.messager.alert("提示", "请选择需要延期的案卷！");
            return;
        }
        for(var i=0;i<rowInfos.length;i++){
            if(rowInfos[i].entrystate!="10"){
                window.top.$.messager.alert("提示", "请选择待延期的档案！");
                return false;
            }
        }
        var newFormUrl = eform.virtualPath + '/index?formid='+delayDateFormId+'&skin=techblue&tableName=' + dossierTableName+'&ifDossier=1';
        return newFormUrl;
    }
    else if(operateBtn.formName== "发起鉴定"){
        if(rowInfos.length==0){
            window.top.$.messager.alert("提示", "请选择需要发起鉴定的案卷！");
            return false;
        }
        for(var i=0;i<rowInfos.length;i++){
            if(rowInfos[i].entrystate!="1"){
                window.top.$.messager.alert("提示", "请选择待鉴定的案卷！");
                return false;
            }
        }
        var jianDingProcessId = getProcessId('档案鉴定');//发起鉴定 流程id
        var newFormUrl = eform.virtualPath + '/Default/default?formId='+jianDingFormId+
            '&skin=techblue&processId='+jianDingProcessId+'&taskType=begintask&flowtype=1&archTypeId='+archTypeId+'&propertiesFormId='+dossierPropertiesFormId;
        return  newFormUrl;
    }
    else if(operateBtn.formName== "发起销毁"){
        if(rowInfos.length==0){
            window.top.$.messager.alert("提示", "请选择需要发起销毁的案卷！");
            return false;
        }
        for(var i=0;i<rowInfos.length;i++){
            if(rowInfos[i].entrystate!="2"){
                window.top.$.messager.alert("提示", "请选择待销毁的案卷！");
                return false;
            }
        }
        var xiaoHuiProcessId = getProcessId('档案销毁');//发起销毁 流程id
        var newFormUrl = eform.virtualPath + '/Default/default?formId='+xiaoHuiFormId+
            '&skin=techblue&processId='+xiaoHuiProcessId+'&taskType=begintask&flowtype=1&archTypeId='+archTypeId;
        return  newFormUrl;
    }
});


eform("eformListGrid1").method("customButtonEvent", function (formId, ids, name, callback) {

    var info =  eform("eformListGrid1").method("getSelectedRows");

    debugger;

    if(name == "拆卷"){

        if(info.length ==0){
            window.top.$.messager.alert("提示", "请选择需要拆卷的案卷！")
            return false;

        }
        else if(info.length !="0"){
            var dossierIds = "";
            var dossierIdList = [];
            var flag = false;
            for(var i=0;i<info.length;i++){
                if(info[i].entrystate!='0' && info[i].entrystate!='1' ){
                    flag=true;
                }
                dossierIds = dossierIds + ",'" + (info[i].ID == null ? info[i].Id : info[i].ID) + "'";
                dossierIdList.push(info[i].ID==null?info[i].Id:info[i].ID)
            }
            if(flag){
                if(entrystate=='0'){
                    window.top.$.messager.alert("提示", "请选择待归档的案卷！")
                }else if (entrystate=='1'){
                    window.top.$.messager.alert("提示", "请选择已归档的案卷！")
                }
                return false;
            }
            window.top.$.messager.confirm("提示", "确认此操作吗？", function (bool){ if (bool === true) {

                dossierIds = dossierIds.substring(1);
                eform.dataset("deleteEntryDirByDossierId", {dossierIds: dossierIds}, function (result) {
                    //删除案卷中间表
                }, false);


                var archData = [];
                var archIds = "";
                var param1 = {
                    tableName: archTableName
                    , dossierIds: dossierIds
                };
                eform.dataset("SelectArchByDossierIds", param1, function (result) {
                    if (result.Data.length > 0) {
                        archData = result.Data[0]
                    }
                }, false);
                for (var i = 0; i < archData.length; i++) {
                    archIds = archIds + ",'" + archData[i].Id + "'"
                }
                if (archIds) {
                    archIds = archIds.substring(1);
                    eform.dataset("updateArchEntryByDossierIdsAndArchIds", {
                        archTypeStatus: 0,
                        archIds: archIds,
                        dossierIds: dossierIds
                    }, function (result) {
                        //修改档案中间表
                    }, false);
                }
                //加入案卷es
                deleteDossierES(dossierIdList);
                var param = {
                    archTableName: archTableName
                    , dossierTableName: dossierTableName
                    , dossierIds: dossierIds
                };
                eform.dataset("chaiJuanByDossierIds", param, function (result) {
                    //删除案卷同时修改卷内档案
                }, false);

                eform("eformListGrid1").method("load"); //父页面表格刷新
                window.top.$.messager.alert("提示", "操作成功！");

            }});

        }

    }

    else if(name == "直接归档"){
        if(info.length == 0){
            window.top.$.messager.alert("提示", "请选择需要直接归档的案卷！");
            return false;
        }
        var count = 0;

        if(info.length !="0"){

            var flag = false;
            var dossierIds = "";
            for(var i=0;i<info.length;i++){
                if(info[i].entrystate!='0' ){
                    flag=true;
                }
                dossierIds = dossierIds+",'"+ (info[i].ID==null?info[i].Id:info[i].ID) +"'"
            }
            if(flag){
                window.top.$.messager.alert("提示", "请选择待归档的案卷！");
                return false;
            }

            window.top.$.messager.confirm("提示", "确认此操作吗？", function (bool){ if (bool === true) {

                dossierIds = dossierIds.substring(1);
                eform.dataset("updateDossierDirArchStatus", {ids: dossierIds,archStatus: 1}, function (result) {
                    //修改案卷中间表状态
                }, false);

                var account = eform.userInfo.Account;
                var deptCode = eform.userInfo.MainDepartmentIdentityId;
                var nowStr = eform.dateFormat(new Date(),"yyyy-MM-dd");

                //更新案卷
                for(var i=0;i<info.length;i++){

                    var fn=(function(i){

                        var entityId = info[i].ID;
                        var dossier = {};
                        eform.dataset("selectArchById", {tableName: dossierTableName,archId: entityId}, function (result) {
                            dossier = result.Data[0][0];
                        }, false);
                        //生成档号
                        var dossierNumber = dossier.number;
                        if(!dossierNumber){
                            dossierNumber = createNumber(account, deptCode, archTypeId, entityId, dossierTableName, 2, dossier);
                        }
                        var param = {  Id: entityId,tablename:dossierTableName, number:dossierNumber};
                        eform.dataset("UpdateDossierStateAndNumber",param, function (result){
                            //更新案卷号和状态，归档人，归档时间
                            if(result.EffectOfRow>0){
                                count++;
                            }
                        }, false);

                        dossier.entrystate='1';
                        dossier.objectid=entityId;
                        dossier.number=dossierNumber;
                        insertDossierES(dossier,dossierPropertiesFormId,sectname,archtypename,dossierTableName,archTableName);
                    });
                    fn(i);
                }
                if (count==info.length){
                    window.top.$.messager.alert("提示", "直接归档成功！");
                }
                //更新案卷中的档案条目
                var archList = [];
                eform.dataset("SelectArchByDossierIds",{tableName:archTableName,dossierIds:dossierIds}, function (result){
                    archList=result.Data[0];
                }, false);
                for(var i=0;i<archList.length;i++){

                    var fn=(function(i){

                        var archive = archList[i];
                        var entityId = archive.Id;

                        //更新档案中间表
                        var param3 = {
                            id:entityId,
                            name: archive.name,
                            archTypeStatus:1,
                            archStatus:1
                        };
                        eform.dataset("updateEntryDirByEntryId", param3, function(result) {
                            //更新档案中间表
                        }, false);

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
                        insertES(archive,archPropertiesFormId,sectname,archtypename,archTableName);

                    });
                    fn(i);
                }

                eform("eformListGrid1").method("load"); //表格刷新

            }});
        }

    }

    else if (name == "删除") {
        var rows = eform("eformListGrid1").method("getSelectedRows");
        if (rows.length == 0) {
            window.top.$.messager.alert("提示", "请选择需要删除的案卷！");
            return false;
        }

        var ids = "";
        var flag = false;
        for(var i=0;i<rows.length;i++){
            if(rows[i].entrystate!='0' && rows[i].entrystate!='1' ){
                flag=true;
            }
            ids = ids+",'"+ (rows[i].ID==null?rows[i].Id:rows[i].ID) +"'"
        }
        if(flag){
            if(entrystate=='0'){
                window.top.$.messager.alert("提示", "请选择待归档的案卷！")
            }else if (entrystate=='1'){
                window.top.$.messager.alert("提示", "请选择已归档的案卷！")
            }
            return false;
        }


        window.top.$.messager.confirm("提示", "确认此操作吗？", function (bool) {

            if (bool === true) {

                debugger;
                ids = ids.substring(1);

                //整编库状态
                if(entrystate=='0'){

                    eform.dataset("deleteEntryDirByDossierId", {dossierIds: ids}, function (result) {
                        //删除案卷中间表
                    }, false);

                    var archIds = "";
                    var archData = [];
                    var param12 = {
                        tableName: archTableName
                        , dossierIds: ids
                    };
                    eform.dataset("SelectArchByDossierIds", param12, function (result) {
                        //查询卷内档案
                        if (result.Data.length > 0) {
                            archData = result.Data[0]
                        }
                    }, false);
                    for (var i = 0; i < archData.length; i++) {
                        archIds = archIds + ",'" + archData[i].Id + "'"
                    }
                    if(archIds){
                        archIds = archIds.substring(1);
                        eform.dataset("deleteEntryDirByEntryId", {archIds: archIds}, function (result) {
                            //删除档案中间表
                        }, false);
                    }

                    /* start penglin 20200420 搜索索引删除 */
                    for (var j = 0; j < archData.length; j++) {
                        deleteES(archData[j].Id);
                    }
                    /* end penglin 20200420 搜索索引删除 */

                    var param = {
                        dossierIds: ids
                        , archTableName: archTableName
                        , dossierTableName: dossierTableName
                    };
                    eform.dataset("deleteDossierStateByDossierIds", param, function (result) {
                        //同时删除案卷和卷内档案
                        if (result.EffectOfRow > 0) {
                            window.top.$.messager.alert("提示", "删除成功！");
                        }
                    }, false);

                }

                //档案库状态
                else if(entrystate=='1'){

                    eform.dataset("updateDossierDirArchStatus", {ids: ids,archStatus: 4}, function (result) {
                        //修改案卷中间表状态
                    }, false);


                    var archIds = "";
                    var archData = [];
                    var param12 = {
                        tableName: archTableName
                        , dossierIds: ids
                    };
                    eform.dataset("SelectArchByDossierIds", param12, function (result) {
                        if (result.Data.length > 0) {
                            archData = result.Data[0]
                        }
                    }, false);
                    for (var i = 0; i < archData.length; i++) {
                        archIds = archIds + ",'" + archData[i].Id + "'"
                    }
                    if(archIds){
                        archIds = archIds.substring(1);
                        eform.dataset("updateArchDirArchStatus", {ids: archIds,archStatus: 4}, function (result) {
                            //修改档案中间表状态
                        }, false);
                    }

                    /** penglin 20200420 更新 搜索 信息 start***/
                    for (var j = 0; j < archData.length; j++) {
                        var arch = archData[j];
                        arch.entrystate='4';
                        arch.objectid=arch.Id;
                        insertES(arch,archPropertiesFormId,sectname,archtypename,archTableName);
                    }
                    /** penglin 20200420 更新 搜索 信息  start***/

                    //案卷加入es
                    for(var i=0;i<rows.length;i++){
                        var entityId = rows[i].ID;
                        var dossier = {};
                        eform.dataset("selectArchById", {tableName: dossierTableName,archId: entityId}, function (result) {
                            dossier = result.Data[0][0];
                        }, false);
                        dossier.entrystate='1';
                        dossier.objectid=entityId;
                        insertDossierES(dossier,dossierPropertiesFormId,sectname,archtypename,dossierTableName,archTableName);
                    }

                    var param = {
                        dossierIds: ids
                        , archTableName: archTableName
                        , dossierTableName: dossierTableName
                        , entrystate: '4'
                    };
                    eform.dataset("updateDossierStateByDossierIds", param, function (result) {
                        //同时更新案卷和卷内档案的状态
                        if (result.EffectOfRow > 0) {
                            window.top.$.messager.alert("提示", "删除成功！");
                        };
                    }, false);
                }

                eform("eformListGrid1").method("load"); //表格刷新
            }
        });

    }

    else if (name == "还原") {

        var rows = eform("eformListGrid1").method("getSelectedRows");
        if (rows.length == 0) {
            window.top.$.messager.alert("提示", "请选择需要还原的案卷！");
            return false;
        }
        window.top.$.messager.confirm("提示", "确认此操作吗？", function (bool) {
            if (bool === true) {

                var ids = "";
                for (var i = 0; i < rows.length; i++) {
                    ids = ids + ",'" + rows[i].ID + "'"

                    var entityId = rows[i].ID;
                    var dossier = {};
                    eform.dataset("selectArchById", {tableName: dossierTableName,archId: entityId}, function (result) {
                        dossier = result.Data[0][0];
                    }, false);
                    dossier.entrystate='1';
                    dossier.objectid=entityId;
                    insertDossierES(dossier,dossierPropertiesFormId,sectname,archtypename,dossierTableName,archTableName);
                }
                ids = ids.substring(1);

                eform.dataset("updateDossierDirArchStatus", {ids: ids,archStatus: 1}, function (result) {
                    //修改案卷中间表状态
                }, false);

                var archIds = "";
                var archData = [];
                var param12 = {
                    tableName: archTableName
                    , dossierIds: ids
                };
                eform.dataset("SelectArchByDossierIds", param12, function (result) {
                    if (result.Data.length > 0) {
                        archData = result.Data[0]
                    }
                }, false);
                for (var i = 0; i < archData.length; i++) {
                    archIds = archIds + ",'" + archData[i].Id + "'"
                }
                archIds = archIds.substring(1);

                eform.dataset("updateArchDirArchStatus", {ids: archIds,archStatus: 1}, function (result) {
                    //修改档案中间表状态
                }, false);

                //ES
                for (var j = 0; j < archData.length; j++) {
                    var arch = archData[j];
                    arch.entrystate='1';
                    arch.objectid=arch.Id;
                    insertES(arch,archPropertiesFormId,sectname,archtypename,archTableName);
                }

                var param = {
                    dossierIds: ids
                    , archTableName: archTableName
                    , dossierTableName: dossierTableName
                    , entrystate: '1'
                };
                eform.dataset("updateDossierStateByDossierIds", param, function (result) {
                    if (result.EffectOfRow > 0) {
                        eform("eformListGrid1").method("load"); //表格刷新
                        window.top.$.messager.alert("提示", "还原成功！");
                    };
                }, false);
            }
        });

    }

    else if (name == "彻底删除") {

        var rows = eform("eformListGrid1").method("getSelectedRows");
        if (rows.length == 0) {
            window.top.$.messager.alert("提示", "请选择需要彻底删除的案卷！");
            return false;
        }
        window.top.$.messager.confirm("提示", "确认此操作吗？", function (bool) {
            if (bool === true) {

                var ids = "";
                var dossierIdList = [];
                for (var i = 0; i < rows.length; i++) {
                    ids = ids + ",'" + rows[i].ID + "'"
                    dossierIdList.push(rows[i].ID==null?rows[i].Id:rows[i].ID)
                }
                ids = ids.substring(1);
                deleteDossierES(dossierIdList);
                eform.dataset("updateDelStatusByDossierId", {dossierIds: ids, delStatus: 1}, function (result) {
                    //逻辑删除案卷中间表
                }, false);

                var archData=[];
                var archIds = "";
                var param12 = {
                    tableName: archTableName
                    , dossierIds: ids
                };
                eform.dataset("SelectArchByDossierIds", param12, function (result) {
                    //查询卷内档案
                    if (result.Data.length > 0) {
                        var archData = result.Data[0]
                    }
                }, false);

                for (var i = 0; i < archData.length; i++) {
                    archIds = archIds + ",'" + archData[i].Id + "'"
                }
                if(archIds){
                    archIds = archIds.substring(1);
                    eform.dataset("updateDelStatusByEntryId", {archIds: archIds, delStatus: 1}, function (result) {
                        //逻辑删除档案中间表
                    }, false);
                }

                /* start penglin 20200420 回收站彻底删除需删除搜索索引 */
                for (var j = 0; j < archData.length; j++) {
                    deleteES(archData[j].Id);
                }
                /* end penglin 20200420 回收站彻底删除需删除搜索索引 */


                var param = {
                    dossierIds: ids
                    , archTableName: archTableName
                    , dossierTableName: dossierTableName
                };
                //同时删除案卷和卷内档案
                eform.dataset("deleteDossierStateByDossierIds", param, function (result) {
                    if (result.EffectOfRow > 0) {
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
            eform("eformListGrid1").method("getControl").ChildFormDialog.close();
            eform("eformListGrid1").method("load"); //父页面表格刷新
            $("#13e0a61b-0043-391d-e6c2-df202b17caae").click();
            window.top.$.messager.alert("提示", "保存成功！");
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

//档案插入es
function insertES(info,filePropertyFormId,sectname,archtypename,archTableName){

    var entityId = info.objectid;

    //通过档案ID 获取 电子文件
    var fileIds = [];
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
    info["sectIdPath"] = sectIdPath;
    info["archTypeIdPath"] = archTypeIdPath;
    info["storageIdPath"]=sectStorageIdPath(entityId,"0");
 /*   for(var o  in info){
        if(isNaN(info[o])&&!isNaN(info.parse(info[o]))) {
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


//档案删除ES
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
    info["sectIdPath"] = sectIdPath;
    info["archTypeIdPath"] = archTypeIdPath;
    info["sectAndArchTypePath"] = sectIdPath+"/"+archTypeIdPath;
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

//案卷删除ES
function deleteDossierES(entityId){
    $.ajax({
        type: "post",
        async: false,
        url: "http://192.168.254.32:8002/edrmscore/api/search/deleteDossierES?token="+curToken,
        data: JSON.stringify(entityId),
        contentType:'application/json',
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
