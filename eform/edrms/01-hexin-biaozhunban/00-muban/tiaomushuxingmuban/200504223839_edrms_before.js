var entrystate = $.getQueryString('entrystate');//默认是档案库状态1，整编库状态为0

var viewtype = $.getQueryString('viewtype'); // 默认查看，0新增,1编辑
if(viewtype!='0' &&  viewtype!='1') { //不是编辑或者新增的时候，所有控件只读
    var blockinfo = window.eform.getBlocks();
    for (var i = 0; i < blockinfo.length; i++) {
        eform.setReadonly(blockinfo[i].id, true, eform.objType.block);
    }
}
var token = getAdminToken();
var formid = $.getQueryString('formid'); //

var archType = {};
eform.dataset("selectSectAndArchTypeByFormId", {formId:formid}, function(result) {
    archType = result.Data[0][0];
}, false);

archType['token']=token;

var folderId = archType.folder_id;
var archTableName = archType.arch_table_name;
var archTypeName = archType.name;

var id = eform.recordId;
var arch_folderId;

//查询当前条目
eform.dataset("selectById", {tableName:archTableName,Id:id}, function(result) {
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

var ifMoveFile = $.getQueryString('ifMoveFile'); // 1:移交归档页面过来的
//移交归档


eform("entitynum").method("hide");
eform("objtype").method("hide");



if(!eform("note")){
    $('#d6834ab8-ca7e-cfd7-59be-092e1fe7c96a').hide();
}


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