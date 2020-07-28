var entrystate = $.getQueryString('entrystate');//默认是档案库状态1，整编库状态为0

var viewtype = $.getQueryString('viewtype'); // 默认查看，0新增,1编辑
if(viewtype!='0' &&  viewtype!='1') { //不是编辑或者新增的时候，所有控件只读
    var blockinfo = window.eform.getBlocks();
    for (var i = 0; i < blockinfo.length; i++) {
        eform.setReadonly(blockinfo[i].id, true, eform.objType.block);
    }
}
if(viewtype=='0'){//新增的时候隐藏卷内条目列表
    $('#5a500867-4a1a-3e25-537e-c2f9c0093ca9').hide();
}

var ifZujuan = $.getQueryString('ifZujuan'); // 1组卷
if(ifZujuan=='1'){
    $('#5a500867-4a1a-3e25-537e-c2f9c0093ca9').hide();
}

var token = getAdminToken();
var formid = $.getQueryString('formid'); //

var archType = {};
eform.dataset("selectSectAndArchTypeByFormId", {formId:formid}, function(result) {
    archType = result.Data[0][0];
}, false);
archType['token']=token;

var folderId = archType.folder_id;
var archTableName= archType.arch_table_name;
var dossierTableName = archType.dossier_table_name;
var archTypeName = archType.name;

var id = eform.recordId;
var arch_folderId;

//查询案卷记录
eform.dataset("selectById", {tableName:dossierTableName,Id:id}, function(result) {
    if(result.Data[0] && result.Data[0][0]){
        arch_folderId = result.Data[0][0].folderId;
    }
}, false);

if(!arch_folderId){
    var folder = createFolder(archTypeName+"_"+new Date().getTime(),id,'',folderId,token);
    arch_folderId= folder.FolderId;
}

archType[id+"folderId"]=arch_folderId;
window.baseInfoJson= archType;

eform('eformAttachmentList1').method("setUploadFolderId", arch_folderId);


/***卷内档案表格自定义获取数据源**/
eform("eformDataTable1").method("onBeforeEasyuiControlCreate",function (options) {

    options.loader = function(params,success,error){

        var receiveData = {};
        if(!params.sort){
            params.sort='createTime'
        }
        if(!params.order){
            params.order="asc"
        }
        var param ={
            tableName:archTableName,
            dossierId:eform.recordId,
            start: (params.page-1)*params.rows,
            pageSize: params.rows,
            sort:"`"+params.sort+"`",
            order:params.order
        };

        var total = 0;
        eform.dataset("selectArchCountByDossierId", param, function (result) {
            //查询卷内条目的数量
            total = result.Data[0][0].total;
        }, false);

        eform.dataset("selectArchByDossierIdByPage", param, function (result) {
            //查询卷内条目
            if(result.EffectOfRow=="0"){
                var archList =  result.Data[0];
                receiveData.total=total;
                receiveData.rows=archList;
            };
        }, false);
        success(receiveData);
    }
});


eform("eformDataTable1").method("customColumnsFormatter",function (value, row, index, field, fieldName) {
    if(field === "duration"){
        if(value=="0") {
            return "永久";
        }
        else if(value=="10") {
            return "10年";
        }
        else if(value=="20") {
            return "20年";
        }
        else if(value=="30") {
            return "30年";
        }
    }
    return value; // if之外的需返回原值
});

/*操作列格式化事件，只能在解析前重写
* value 列值
* row 行对象
* index 行索引
* operateContent 操作按钮列容器对象
*/
eform("eformDataTable1").method("customOperateColumnsFormatter", function (value, row, index, operateHtml) {

    //查看的时候 隐藏“编辑”按钮 
    if(viewtype!='0' && viewtype!='1' ){
        operateHtml.find('[operateType="edit"]').hide();
    }
    return operateHtml.html();
});


eform("eformDataTable1").method("getControl").onGetParentWindow = function () {
    try {
        if (window.top.location.href.toLowerCase().indexOf("/eform") > -1) {
            return window.top;
        }
        else if (window.top.location.href.toLowerCase().indexOf("/wcm") > -1) {
            return window.top;
        }
        else if (window.top.location.href.toLowerCase().indexOf("/inbiz") > -1) {
            return window.top;
        }
        else if (window.parent.location.href.toLowerCase().indexOf("/eform") > -1) {
            return window.parent;
        }
        else if (window.parent.location.href.toLowerCase().indexOf("/wcm") > -1) {
            return window.parent;
        }
        else if (window.parent.location.href.toLowerCase().indexOf("/inbiz") > -1) {
            return window.parent;
        }
        else {
            return window;
        }
    }
    catch (ex) {
        return window;
    }
};



//获取admin的token
function getAdminToken(){
    var token = '';
    eform.dataset("selectByKey", {tableName:'config',key:'adminToken'}, function(result) {
        if(result.Data[0] && result.Data[0][0]){
            token = result.Data[0][0].value;
        }
    }, false);
    return token;
}



//创建隐藏文件夹
function createFolder(name,folderCode,remark,parentFolderId,token){
    var rs = {};
    $.ajax({
        type: "POST",
        url: "/api/services/Folder/CreateFolder",
        async:false,
        contentType:'application/json',
        data: JSON.stringify({
            "Name": name,
            "FolderCode": folderCode,
            "Remark": remark,
            "ParentFolderId": parentFolderId,
            "Token": token
        }),
        dataType: "json",
        success: function(res){
            rs = res.data
        }
    });
    return rs;
}