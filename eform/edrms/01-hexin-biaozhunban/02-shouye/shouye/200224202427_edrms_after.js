// 重定向事件
eform("eformLayout1").method("redirect", function (formId,menuConfig) {
	//档案库
	if (formId == "191218151500") {
		var newFormUrl ='/wcm/edrms/dak?version=97f29a70125a4083901cd8999eed1da0';
		return  newFormUrl; // 返回期望的地址
	}
	//鉴定库	
	else if (formId == "191218161408") {
		var newFormUrl ='/wcm/edrms/jdk?version=97f29a70125a4083901cd8999eed1da0';
		return  newFormUrl; // 返回期望的地址
	}
	//回收站
	else if (formId == "200202111400") {
		var newFormUrl ='/wcm/edrms/hsz?version=97f29a70125a4083901cd8999eed1da0';
		return  newFormUrl; // 返回期望的地址
	}
	//销毁库
	else if (formId == "200205151430") {
		var newFormUrl ='/wcm/edrms/xhk?version=97f29a70125a4083901cd8999eed1da0';
		return  newFormUrl; // 返回期望的地址
	}
	//整编库	
	else if (formId == "200201162144") {
		var newFormUrl ='/wcm/edrms/zbk?version=97f29a70125a4083901cd8999eed1da0';
		return  newFormUrl; // 返回期望的地址
	}
	
		//首页	
	else if (formId == "200220150207_edrmsarch") {
		var newFormUrl ='/wcm/edrms/sousuo?version=97f29a70125a4083901cd8999eed1da0';
		return  newFormUrl; // 返回期望的地址
	}
	
	

});