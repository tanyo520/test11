var gjformid =  '200505204948_edrms';

var entrystate = $.getQueryString('entrystate');//默认是档案库状态1，整编库状态为0
var ifZujuan = $.getQueryString('ifZujuan');//1组卷转入
var viewtype = $.getQueryString('viewtype'); // 默认查看，0新增，1编辑
if(viewtype!="0" && viewtype!="1" ){
    $('#07a1e51f-d127-5439-b180-1355c1258949').hide();//隐藏移卷 按钮
    eform.setReadonly('5a500867-4a1a-3e25-537e-c2f9c0093ca9',false, eform.objType.block);
}

var formid = $.getQueryString('formid'); //
var archTypeId = '';
var folderId = '';
var archTableName= '';
var dossierTableName = '';
var fields_def=[];
var sectId = '';
eform.dataset("selectByFormId", {formid:formid}, function(result) {
    archTypeId = result.Data[0][0].arch_type_id;
}, false);

eform.dataset("Selectarchtype", {Id:archTypeId}, function(result) {
    folderId = result.Data[0][0].folder_id;
    archTableName = result.Data[0][0].arch_table_name;
    dossierTableName = result.Data[0][0].dossier_table_name;
    fields_def=eval( result.Data[0][0].fields_def);
    sectId = result.Data[0][0].sect_id;
}, false);

if(viewtype=='0'){//新增的时候
    eform("sectid").method("setValue", sectId);
    eform("archtypeid").method("setValue", archTypeId);
    eform("entrystate").method("setValue", entrystate);
}


eform("eformDataTable1").method("onUrlFormatter",function (url, operateBtn) {

    if(operateBtn.formName== "移卷"){
        var info = eform("eformDataTable1").method("getSelectedRows");//获取查询列表被选中的值
        if(info.length=='0'){
            window.top.$.messager.alert("提示", "请先选择需要移卷的文件！")
            return;
        }
        var newFormUrl = eform.virtualPath + '/index?formid=' + gjformid + '&skin=techblue&edittype=0&archTableName='+archTableName+'&dossierTableName='
            + dossierTableName + '&entrystate=' + entrystate+'&isMove=1&dossierId='+$.getQueryString('id');
        return newFormUrl;
    }

    else if(operateBtn.formName== "查看" || operateBtn.formName== "编辑" ){
        var innerViewType = 2;
        if(operateBtn.formName== "编辑"){
            innerViewType=1;
        }

        var Id = eform("eformDataTable1").method("getSelectedRows")[0].Id;//获取列表被选中的Id

        var propertiesFormId = '';
        var resData = selectArchTypeForm(archTypeId, '0', '0');//获取 条目属性 表单信息
        propertiesFormId = resData.form_id;
        var newFormUrl = eform.virtualPath+'/index?formid='+propertiesFormId+'&skin=techblue&id='+Id+
            '&viewtype='+innerViewType+'&entrystate='+entrystate;
        return  newFormUrl;
    }
});


window.save = function(callback){

    var panel = eform.loading("正在创建案卷信息，请稍等"); // 打开遮罩层

    var rs = mySave();
    if(rs==false){
        eform.loaded(panel); // 关闭遮罩层
        return false;
    }

    if(ifZujuan==1){//如果是组卷
        var archList = eform.parentForm("eformListGrid1").method("getSelectedRows"); //获取父页面查询列表被选中的值
        var archIds = "";
        for(var i=0;i<archList.length;i++){
            archIds = archIds+",'"+ (archList[i].ID==null?archList[i].Id:archList[i].ID) +"'"
        }
        archIds = archIds.substring(1);
        var dossierId = eform.recordId;
        var param = {
            dossierId:dossierId
            ,archIds:archIds
            ,tableName:archTableName
        };
        eform.dataset("guiJuanByArchIds", param, function (result) {
            if(result.EffectOfRow>0){
                var midParam={
                    dossierId:dossierId,
                    archTypeStatus:1, //档案类型的状态(0:一文一件，1:卷内文件，2:案卷)
                    archIds:archIds
                }
                eform.dataset("updateArchTypeStatusByEntryId", midParam, function (result) {
                    if(result.EffectOfRow>0){
                        console.log("组卷成功")
                    };
                }, false);
            };
        }, false);
    }

    edoc2Form.formParser.save(function(rid){
        edoc2Form.formParser.changeFormToEdit(eform.recordId);
        edoc2Form.isNewRecord = false;
        eform.loaded(panel); // 关闭遮罩层
        window.top.$.messager.alert("提示", "保存成功！");
        callback &&callback();
    },null,eform.recordId,"",true,false);

};


window.saveandnew = function(callback){


    var panel = eform.loading("正在创建案卷信息，请稍等"); // 打开遮罩层

    var rs = mySave();
    if(rs==false){
        eform.loaded(panel); // 关闭遮罩层
        return false;
    }

    edoc2Form.formParser.save(function(rid){
        edoc2Form.formParser.changeFormToEdit(eform.recordId);
        edoc2Form.isNewRecord = false;
        eform.loaded(panel); // 关闭遮罩层
        window.top.$.messager.alert("提示", "保存成功！");
        var iframeFormid = $.getQueryString("formid", window.location.href);
        var iframeFormParser = window.instancesFormParser[iframeFormid];
        iframeFormParser.instanceFormConfig.recordId = iframeFormParser.eform.recordId = $.genId();
        //修复保存并新建后,隐藏域数据无法提交bug
        iframeFormParser.eform.isNewRecord = iframeFormParser.formData.isNewRecord = iframeFormParser.instanceFormConfig.isNewRecord = true;

        callback &&callback();
    },null,eform.recordId,"",true,false);

};

//卷内档案列表的子表单的操作按钮
eform("eformDataTable1").method("childFormButtonEvent",function (formId, ids, name, callback){

    if(name == "移卷"){
        eform("eformDataTable1").method("getControl").ChildFormDialog.iframe[0].contentWindow.window.save(function(){
            eform("eformDataTable1").method("getControl").ChildFormDialog.close();
            eform("eformDataTable1").method("load"); //父页面表格刷新
        });
    }
    else if(name == "保存"){
        eform("eformDataTable1").method("getControl").ChildFormDialog.iframe[0].contentWindow.window.save(function(){
            eform("eformDataTable1").method("getControl").ChildFormDialog.close();
            eform("eformDataTable1").method("load"); //父页面表格刷新
        });
    }

    callback && callback(); // 最后一行,该行代码必须
});

//通用的保存方法
function mySave(){

    var alertMsg = "";
    var nameisNull = eform.isNull(eform("name").method("getValue"));
    /***************penglin add start *******************************/
    var regEn = /[`~!@#$%^&*()_+<>?:"{},.\/;'[\]]/im,

        regCn = /[·！#￥（——）：；“”‘、，|《。》？、【】[\]]/im;
    /***************penglin add end *******************************/
    if (nameisNull) {
        alertMsg+="请输入案卷名称！<br>"
    }
    else{
        /***************penglin add start *******************************/
        if(regEn.test(eform("name").method("getValue")) || regCn.test(eform("name").method("getValue"))) {
            window.top.$.messager.alert("提示", "档案名称不能包含特殊字符");
            return false;
        }
        /***************penglin add end *******************************/
        //判断名称重复
        var param = {
            tableName:dossierTableName,
            name:eform("name").method("getValue")
        }
        eform.dataset("selectByName", param, function (result) {
            if(result.Data[0].length>0){
                if(viewtype=='0'){
                    alertMsg+="案卷名称重复！<br>"
                }else{
                    if(result.Data[0][0].Id!=eform.recordId){
                        alertMsg+="案卷名称重复！<br>"
                    }
                }
            }
        }, false);
    }

    var writtendateisNull = eform.isNull(eform("writtendate").method("getValue"));
    if (writtendateisNull) {
        alertMsg+="请选择立卷日期！<br>"
    }
    var durationisNull = eform.isNull(eform("duration").method("getValue"));
    if (durationisNull) {
        alertMsg+="请选择保管期限！<br>"
    }

    if(eform("year") && eform("year").method("getValue")){
        if(!isInteger(eform("year").method("getValue"))){
            alertMsg+="年度请填写整数！<br>"
        }
    }

    if(eform("page") && eform("page").method("getValue")){
        if(!isInteger(eform("page").method("getValue"))){
            alertMsg+="页数请填写整数！<br>"
        }
    }

    if(alertMsg){
        window.top.$.messager.alert("提示", alertMsg);
        return false;
    }

    //获取保管期限的值
    var duration = eform("duration").method("getValue");
    var writtendate =  eform("writtendate").method("getValue");
    var deadTime = '';
    if(duration=='0'||duration=='永久' ){
        deadTime='9999-12-31';
    }else if(duration=='10'||duration=='10年'){
        deadTime= writtendate.substring(0,4)-(-10) +  writtendate.substring(4) ;
    }else if(duration=='20'||duration=='20年'){
        deadTime= writtendate.substring(0,4)-(-20) +  writtendate.substring(4) ;
    }else if(duration=='30'||duration=='30年'){
        deadTime= writtendate.substring(0,4)-(-30) +  writtendate.substring(4) ;
    }
    eform("deadTime").method("setValue",deadTime);

    // 保存案卷总表
    eform.dataset("SelectDossierByEntryId",{entryId:eform.recordId} , function(result) {
        if(result.Data[0].length>0){
            var param = {
                id:result.Data[0][0].Id,
                name: eform("name").method("getValue"),
                archTypeStatus:2,  //档案类型的状态(0:一文一件|1:卷内文件|2:案卷)
                archStatus:entrystate       //档案状态标示位(0整编，1:已归档|2:已鉴定|3:已销毁4：回收站)
            };
            eform.dataset("updateDossierDir", param, function(result) {
            }, false);

        }else{
            var  newid=$.genId();

            var param = {
                id:newid,
                createId: eform.userInfo.ID,
                updateId: eform.userInfo.ID,
                name: eform("name").method("getValue"),
                sectId:sectId,
                archTypeId:archTypeId,
                archTypeStatus:2,     //档案类型的状态(0:一文一件|1:卷内文件|2:案卷)
                archStatus:entrystate,   //档案状态标示位(0整编，1:已归档|2:已鉴定|3:已销毁4：回收站)
                tableName:dossierTableName,
                entryId:eform.recordId

            };
            eform.dataset("InsertDossierDir", param, function(result) {
            }, false);
        }


    }, false);


    if(entrystate=='1'){

        var dossierEntity = {};
        dossierEntity["name"]=eform("name").method("getValue");
        dossierEntity["writtendate"]=eform("writtendate").method("getValue");
        dossierEntity["note"]=eform("note").method("getValue");
        dossierEntity["duration"]=eform("duration").method("getValue");
        dossierEntity["entrystate"]=eform("entrystate").method("getValue");
        dossierEntity["sectid"]=eform("sectid").method("getValue");
        dossierEntity["archtypeid"]=eform("archtypeid").method("getValue");
        dossierEntity["deadTime"]=eform("deadTime").method("getValue");
        dossierEntity["reorganizer"]=eform("reorganizer").method("getValue");
        dossierEntity["reorganizedate"]=eform("reorganizedate").method("getValue");
        dossierEntity["archiver"]=eform("archiver").method("getValue");
        dossierEntity["archivedate"]=eform("archivedate").method("getValue");

        var number = eform("number").method("getValue").trim();
        if(number==''){
            var account = eform.userInfo.Account;
            var deptCode = eform.userInfo.MainDepartmentIdentityId
            var entityId = eform.recordId;
            var type =2;
            number = createNumber(account ,deptCode ,archTypeId ,entityId ,dossierTableName,type,dossierEntity);
            eform("number").method("setValue",number);
        }
    }

}


/*生成编号
@account 当前用户账号
@deptCode 当前用户所在部门编号
@archTypeId 档案类型id
@entityId 实体id
@tableName 表名
@type  1档案，2案卷
@param 当前档案所有字段的json键值对
*/
function createNumber(account,deptCode,archTypeId,entityId,tableName,type,param){

    param.account4CreateNumber = account
    param.deptCode4CreateNumber = deptCode
    param.archTypeId4CreateNumber = archTypeId
    param.entityId4CreateNumber = entityId
    param. tableName4CreateNumber =tableName
    param.type4CreateNumber = type

    var host =  window.location.hostname;
    var archNo = '';
    $.ajax({
        type: "POST",
        async:false,
        url: window.location.protocol+"//"+host+":8002/number/api/number/createNumber",
        data: param,
        dataType: "json",
        success: function(res){
            if(res.RESULT){
                archNo = res.RESPONSE
            }
        }
    });
    return archNo;
}


/*查询表单
*@archTypeId   档案类型id
*@archState      档案状态 0整编库，1档案库，2鉴定库，3销毁库，4回收站
*@formType     表单类型  0文件属性，1文件列表，2案卷属性，3案卷列表，4未组卷-文件列表，5归卷，6组卷
*/
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

//是否为非负整数
function isInteger(s){
    var re = /^[0-9]+$/ ;
    return re.test(s)
}