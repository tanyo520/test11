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


eform("eformListGrid1").method("customColumnsFormatter",function (value, row, index, field, fieldName) {
	if(field === "number"){
		if(value =="undefined")
		{
			return "无"
		}
	}

	return value; // if之外的需返回原值
});