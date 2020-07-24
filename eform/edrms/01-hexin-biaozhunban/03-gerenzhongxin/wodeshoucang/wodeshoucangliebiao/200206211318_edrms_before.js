eform("eformListGrid2").method("customColumnsFormatter",function (value, row, index, field, fieldName) {
	if(field === "archiveNo"){
		if(value =="undefined")
		{
			return "无"
		}
	
	
	}
	if(field === "secret"){
		if(value =="undefined")
		{
			return "无"
		}
	
	
	}

	return value; // if之外的需返回原值
});
eform("eformListGrid2").method("getControl").onGetParentWindow = function () {
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