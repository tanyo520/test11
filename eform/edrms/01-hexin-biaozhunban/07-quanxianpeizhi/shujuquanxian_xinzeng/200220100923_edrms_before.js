//调整人员选择控件长和高
eform("eformSelectMember1").method("onBeforeEasyuiControlCreate",function(_memberConfig){
								    _memberConfig.modal = false;
                    _memberConfig.width = 700;
                    _memberConfig.height = 450;
});

var viewtype = $.getQueryString("viewtype");
if(viewtype=='0'){

}
else if(viewtype=='1'){
    eform("eformSelectMember1").method("hide");
}