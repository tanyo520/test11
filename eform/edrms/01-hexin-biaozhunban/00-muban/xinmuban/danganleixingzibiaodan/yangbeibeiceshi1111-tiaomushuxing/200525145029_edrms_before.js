var entrystate = $.getQueryString('entrystate');//默认是档案库状态1，整编库状态为0

var viewtype = $.getQueryString('viewtype'); // 默认查看，0新增,1编辑
if(viewtype!='0' &&  viewtype!='1') { //不是编辑或者新增的时候，所有控件只读
    var blockinfo = window.eform.getBlocks();
    for (var i = 0; i < blockinfo.length; i++) {
        eform.setReadonly(blockinfo[i].id, true, eform.objType.block);
    }
	
	if( entrystate=='3' ){
		$('#96a594ea-dd92-8234-07f2-5b7aebacd0fd').css('pointer-events','none');
	}
	
}

var formid = $.getQueryString('formid'); // 
var archTypeId = '';
eform.dataset("selectByFormId", {formid:formid}, function(result) {
    archTypeId = result.Data[0][0].arch_type_id;
}, false);
var folderId = '';
eform.dataset("Selectarchtype", {Id:archTypeId}, function(result) {
    folderId = result.Data[0][0].folder_id;
}, false);	
eform('eformAttachmentList1').method("setUploadFolderId", folderId);

var ifMoveFile = $.getQueryString('ifMoveFile'); // 1:移交归档页面过来的
//移交归档


eform("entitynum").method("hide");
eform("objtype").method("hide");