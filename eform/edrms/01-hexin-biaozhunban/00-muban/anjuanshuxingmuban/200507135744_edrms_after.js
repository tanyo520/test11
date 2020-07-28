var baseInfoJson = window.baseInfoJson;
var adminToken = baseInfoJson.token;
var curToken = $.cookie("token");
var gjformid =  '200505204948_edrms';

var entrystate = $.getQueryString('entrystate');//默认是档案库状态1，整编库状态为0
if( entrystate=='3' ){
    $('.datagrid-view').css('pointer-events','none');
}

var ifZujuan = $.getQueryString('ifZujuan');//1组卷转入
var viewtype = $.getQueryString('viewtype'); // 默认查看，0新增，1编辑
if(viewtype!="0" && viewtype!="1" ){
    $('#07a1e51f-d127-5439-b180-1355c1258949').hide();//隐藏移卷 按钮
    eform.setReadonly('5a500867-4a1a-3e25-537e-c2f9c0093ca9',false, eform.objType.block);
}

var folderId = eform("folderId").method("getValue");
if(!folderId){
    var id = eform.recordId;
    folderId = baseInfoJson[id+"folderId"];
    eform("folderId").method("setValue",folderId);
}

var formid = $.getQueryString('formid'); //

var sectname = baseInfoJson.sectName;
var archTableName = baseInfoJson.arch_table_name;
var dossierTableName = baseInfoJson.dossier_table_name;
var sectId = baseInfoJson.sect_id;
var archTypeId = baseInfoJson.Id;
var archtypename = baseInfoJson.name;
//var fields_def = eval(baseInfoJson.fields_def);
var dossierFields = baseInfoJson.dossier_fields;

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



//删除文件后触发 rows 删除的行数据，数组
eform("eformAttachmentList1").method("deleteFileAfter",function(rows){

    var fileIdList = [];
    for(var i=0;i<rows.length;i++){
        fileIdList.push(rows[i].FileId);
    }

    deleteFiles(fileIdList,adminToken);

});


window.save = function(callback){

    var panel = eform.loading("正在创建案卷信息，请稍等"); // 打开遮罩层
    window.setTimeout(function(){
        var rs = mySave();
        if(rs==false){
            eform.loaded(panel); // 关闭遮罩层
            return false;
        }

        if(ifZujuan==1){//如果是组卷
            var archList = eform.parentForm("eformListGrid1").method("getSelectedRows"); //获取父页面查询列表被选中的值
            var archIds = "";

            var dossierNumber = eform("number").method("getValue");
            for(var i=0;i<archList.length;i++){
                archIds = archIds+",'"+ (archList[i].ID==null?archList[i].Id:archList[i].ID) +"'";
                if(top.window.ifInnerArchNoByDossierNo=='1'){
                    var archNumber = dossierNumber+numFormat(i+1);
                    var param = {  Id:archList[i].ID, tableName:archTableName, number:archNumber};
                    eform.dataset("updateNumber",param, function (result){
                        //更新档案号
                    }, false);
                }
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
    },1);
};

window.saveandnew = function(callback){


    var panel = eform.loading("正在创建案卷信息，请稍等"); // 打开遮罩层
    window.setTimeout(function(){
        var rs = mySave();
        if(rs==false){
            eform.loaded(panel); // 关闭遮罩层
            return false;
        }

        edoc2Form.formParser.save(function(rid){
            edoc2Form.formParser.changeFormToEdit(eform.recordId);
            edoc2Form.isNewRecord = false;
            eform.loaded(panel); // 关闭遮罩层

            var iframeFormid = $.getQueryString("formid", window.location.href);
            var iframeFormParser = window.instancesFormParser[iframeFormid];
            iframeFormParser.instanceFormConfig.recordId = iframeFormParser.eform.recordId = $.genId();
            //修复保存并新建后,隐藏域数据无法提交bug
            iframeFormParser.eform.isNewRecord = iframeFormParser.formData.isNewRecord = iframeFormParser.instanceFormConfig.isNewRecord = true;

            callback &&callback();
        },null,eform.recordId,"",true,false);
    },1);
};

//提取数字
function getNumberic(str) {
    var num= str.replace(/[^0-9]/ig,"");
    if(num){
        num = parseInt(num)
    }
    else {
        num=0;
    }
    return num;
}

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
    }else{
        var writtenDateFormat=new Date(eform("writtendate").method("getValue").replace(/-/g,"/"));
        if( writtenDateFormat> new Date("9999-12-31".replace(/-/g,"/"))
            ||  writtenDateFormat < new Date("1753-11-11".replace(/-/g,"/")))
        {
            alertMsg+="请输入合法的立卷日期！<br>"
        }else
        {
            eform("year").method("setValue",new Date(eform("writtendate").method("getValue")).getFullYear())
        }
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
    if (duration == '0'||duration=='永久' ) {
        deadTime = '9999-12-31';
    } else {
        var deadTimeVal = eform("delayTime").method("getValue");
        if(!deadTimeVal){
            var date = new Date(writtendate);
            date.setFullYear(date.getFullYear()-(0-getNumberic(duration)));
            deadTime = date.format("yyyy-MM-dd");
        }else {
            deadTime = deadTimeVal;
        }
    }
    eform("deadTime").method("setValue",deadTime);

    if (entrystate=='0'){
        eform("reorganizer").method("setValue", eform.userInfo.ID);
        eform("reorganizedate").method("setValue", eform.dateFormat(new Date(),"yyyy-MM-dd"));
    }

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
        //获取案卷字段
        var dossierFieldsData = getMetaDataTypeById(adminToken, eform.formId);
        for(var i=0;i<dossierFieldsData.MetaAttrList.length;i++){
            var fieldName = dossierFieldsData.MetaAttrList[i].AttrId;
            if(eform(fieldName)){
                dossierEntity[fieldName]=eform(fieldName).method("getValue");
            }
        }

        var number = eform("number").method("getValue").trim();
        if(number==''){
            var account = eform.userInfo.Account;
            var deptCode = eform.userInfo.MainDepartmentIdentityId
            var entityId = eform.recordId;
            var type =2;
            number = createNumber(account ,deptCode ,archTypeId ,entityId ,dossierTableName,type,dossierEntity);
            eform("number").method("setValue",number);

            dossierEntity["number"] = number;
        }
        dossierEntity["objectid"] = eform.recordId;
        insertDossierES(dossierEntity,eform.formId,sectname,archtypename,dossierTableName,archTableName);
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

    param.token = $.cookie("token");
    param.archTypeId4CreateNumber = archTypeId
    param.entityId4CreateNumber = entityId
    param.type4CreateNumber = type;

    var archNo = '';
    $.ajax({
        type: "POST",
        async:false,
        url: "http://192.168.254.32:8002/edrmscore/api/number/createNumber",
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

//是否为非负整数
function isInteger(s){
    var re = /^[0-9]+$/ ;
    return re.test(s)
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


//批量删除电子文件
function deleteFiles(fileIdArr,token) {
    $.ajax({
        type: "POST",
        url: "/api/services/Doc/RemoveFolderListAndFileList",
        async:false,
        contentType:'application/json',
        data: JSON.stringify({
            "FileIdList": fileIdArr,
            "Token": token
        }),
        dataType: "json",
        success: function(res){
        }
    });

}

//获取表单  控件信息接口
function getMetaDataTypeById(token,typeId){
    var data = {};
    $.ajax({
        type:"get",
        url:"/api/services/MetaData/GetMetaDataTypeById",
        async:false,
        data:{
            token:token,
            typeId:typeId
        },
        success: function(e) {
            data = e.data;
        },
        error: function(e) {
            console.log(e);
        }
    });
    return data;
}
//案卷插入es
function insertDossierES(info,filePropertyFormId,sectName,archTypeName,dossierTableName,archTableName){
    var entityId = info.objectid;

    //通过档案ID 获取 电子文件
    /*var fileIds = [];
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
    var sectIdPath = selectSectIdPath(sectId);
    var archTypeIdPath = selectArchTypeIdPath(archTypeId);
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
