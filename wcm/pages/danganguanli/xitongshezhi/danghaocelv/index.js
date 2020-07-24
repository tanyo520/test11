var height0 = $(window).height();

require(["jquery","inbizsdk"],function($,inbizsdk){

	
	var leftObj =inbiz("IFramea09effc4927a49c7a63230aa31922f29");			
	leftObj.afterEvent=function(){
		
		$(top.document).find("iframe").eq(0).height(height0-100);//设置iframe高度
		
		var formId = "200106092603_edrms";//表单id
		var leftSrc = "http://"+window.location.host+"/eform/index?formid="+formId+"&skin=techblue";
		$(top.document).find("iframe").eq(0).attr('src',leftSrc);					
		
	}

})