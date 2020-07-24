var height0 = $(window).height();

require(["jquery","inbizsdk"],function($,inbizsdk){

	//左侧树
	var leftObj =inbiz("IFrameb2acd819e3464fd08eee7d0bab95a016");			
	leftObj.afterEvent=function(){
		
		$(top.document).find("iframe").eq(0).height(height0-100);//设置iframe高度
		$(top.document).find("iframe").eq(1).height(height0-100);//设置iframe高度
		
		
		var formId = "200212173623_edrms";//字典左侧树表单id
		var leftSrc = "http://"+window.location.host+"/eform/index?formid="+formId+"&skin=techblue";
		$(top.document).find("iframe").eq(0).attr('src',leftSrc);					
		
	}

})