var borrowType = $.getQueryString("borrowType"); // first：第一次，renew：续借
var taskType = $.getQueryString("taskType");

/*操作列格式化事件，只能在解析前重写
* value 列值
* row 行对象
* index 行索引
* operateContent 操作按钮列容器对象
*/
eform("eformDataTable1").method("customOperateColumnsFormatter", function (value, row, index, operateHtml) {

    //查看的时候 隐藏“编辑”按钮
    if(borrowType=='renew' ){
        operateHtml.find('[operateType="custom"]').hide();
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