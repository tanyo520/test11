var nowLong = new Date().getTime();

/*非操作列格式化事件(不包括操作列)，只能在解析前重写
* value 列值
* row 行对象
* index 行索引
* field 列绑定的字段名称
* fieldName 列名称
*/
eform("eformListGrid1").method("customColumnsFormatter",function (value, row, index, field, fieldName) {

	if(field === "startUseTime"){
		if(value && value.indexOf('9999-12-31') !=-1 ){
			return "";
		}
	}
	else if(field === "borrowStatus"){
		var returnTime = row.returnTime;
		if(value=='借阅中' && returnTime &&  new Date(returnTime).getTime()<nowLong ){
			return "已超期";
		}

	}

	return value; // if之外的需返回原值
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