//档案状态
var entrystate = $.getQueryString("entrystate");// 档案状态 0整编库，1档案库，2鉴定库，3销毁库，4回收站

//格式化
//eform("eformListGrid1").method("setIsNoFormatter", true)
eform("eformListGrid1").method("customColumnsFormatter",function (value, row, index, field, fieldName) {
	if(field === "entrystate"){
		if(value=="0"){
			return "待归档";
		}
		else if(value=="9"){
			return "归档中";
		}
		else if(value=="1"){
			if(entrystate=='2'){
				return "待鉴定";
			}else{
				return "已归档";
			}
		}
		else if(value=="2"){
			return "待销毁";
		}
		else if(value=="3"){
			return "销毁";
		}
		else if(value=="4"){
			return "删除";
		}
		else if(value=="5"){
			return "鉴定中";
		}
		else if(value=="7"){
			return "销毁中";
		}
		 else if(value=="10"){
            return "待延期";
        }
	}

	else if(field === "duration"){
		if(value=="0"){
			return "永久";
		}
		else if(value=="10"){
			return "10年";
		}
		else if(value=="20"){
			return "20年";
		}
		else if(value=="30"){
			return "30年";
		}
	}
	return value; // if之外的需返回原值
});


/*操作列格式化事件，只能在解析前重写 控制列表行内按钮
* value 列值
* row 行对象
* index 行索引
* operateContent 操作按钮列容器对象
*/
eform("eformListGrid1").method("customOperateColumnsFormatter", function (value, row, index, operateHtml) {
    if(entrystate !='0' && entrystate !='1'){
        operateHtml.find('[operateType="edit"]').hide();// 隐藏编辑按钮
    }
    return operateHtml.html();
});


eform("eformListGrid1").method("getControl").onGetParentWindow = function () {
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