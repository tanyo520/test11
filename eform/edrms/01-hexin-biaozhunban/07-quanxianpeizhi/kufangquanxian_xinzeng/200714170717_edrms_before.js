//调整人员选择控件长和高
eform("eformSelectMember1").method("onBeforeEasyuiControlCreate",function(_memberConfig){
    _memberConfig.modal = false;
    _memberConfig.width = 700;
    _memberConfig.height = 450;
});

// 默认查看，0新增,1编辑
var viewtype = $.getQueryString("viewtype");
//var viewtype = "1";
if(viewtype=='0'){

}
else if(viewtype=='1'){
    eform("eformSelectMember1").method("hide");
}