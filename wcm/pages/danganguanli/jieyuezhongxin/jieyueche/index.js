var height0 = $(window).height();

require(["jquery","inbizsdk"],function($,inbizsdk){

	//左侧树
	var leftObj =inbiz("IFrame57265ae0d1e944c48322669b88c507fe");			
	leftObj.afterEvent=function(){
		
		$(top.document).find("iframe").eq(0).height(height0-100);//设置iframe高度
		$(top.document).find("iframe").eq(1).height(height0-100);//设置iframe高度
		
		
		var formId = "200213235952_edrms";//左侧树表单id
		var leftSrc = "/eform/index?formid="+formId+"&skin=techblue";
		$(top.document).find("iframe").eq(0).attr('src',leftSrc);					
		
	}

})