//隐藏 案卷档号策略 下拉列表
eform("dossier_strategy_id").method("hide");
eform("eformButton1").method("hide");

var viewtype= $.getQueryString('viewtype');//0新增 1编辑
if(viewtype=='1'){
    eform("is_dossier").method("getControl").setProperty("readonly", 'true');
}

//条目固定字段（不需要被勾选）
window.archStaticFields = "entrystate,ifDossiered,dossierId,deadTime,delayTime,secertexp,reorganizer,reorganizername,reorganizedate,year,ifInbound,folderId,sectid,archtypeid,archiver,archivername,archivedate";
var archStaticFieldArr = window.archStaticFields.split(",");

var tkn = $.getToken(); //获取当前登录用户token；
var formId = "200504223839_edrms" //条目属性母版表单id
var archFieldsData = getMetaDataTypeById(tkn,formId);
var archFieldsStr = "";
var receiveData0 = [];
for(var i=0;i<archFieldsData.MetaAttrList.length;i++){
    var fieldName = archFieldsData.MetaAttrList[i].AttrId;
    archFieldsStr+=","+fieldName;
    var name = archFieldsData.MetaAttrList[i].AttrName;
    if(check(fieldName,archStaticFieldArr)) {
        receiveData0.push({field:fieldName,name:name,IsPrint:""});
    }
}
archFieldsStr=archFieldsStr.substring(1);
window.archFieldsStr = archFieldsStr;


/*****************************表格自定义获取数据源  获取母版条目字段*****************************************/
eform("eformDataTable1").method("onDataReceived",function (receiveData) {	
	var receiveData = receiveData0;
	return receiveData;
});

//获取母版案卷字段
var dossierFormId = "200507135744_edrms" //案卷属性母版表单id
var dossierFieldsData = getMetaDataTypeById(tkn,dossierFormId);
window.dossierFieldsData=dossierFieldsData;

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

/**
 * 检查fieldArr数组中有没有fieldName
 * @param fieldName
 * @param fieldArr
 * @returns {boolean}
 */
function check(fieldName,fieldArr) {
    var flag = true;
    for(var i=0;i<fieldArr.length;i++){
        if(fieldName==fieldArr[i]){
            flag = false;
            break;
        }
    }
    return flag;
}