eform("borrowStatus").method("hide");  //
eform("brrowe").method("hide");
eform("brrows").method("hide");

var type = $.getQueryString('type');
var viewtype = $.getQueryString('viewtype');
if(type!='look'){
    eform("startUseTime").method("hide");  //
    eform("returnTime").method("hide");  //
    eform("actualReturnTime").method("hide");  //
}

if(viewtype!='1'){
    var blockinfo=window.eform.getBlocks();
    for(var i=0;i<blockinfo.length;i++){
        eform.setReadonly(blockinfo[i].id,true, eform.objType.block);
    }
}