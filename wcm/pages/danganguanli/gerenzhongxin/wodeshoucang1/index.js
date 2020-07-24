var height0 = $(window).height();

require(["jquery","inbizsdk"],function($,inbizsdk){

	//左侧树
	var leftObj =inbiz("IFrameafba990bba134392a5dcce09ef2d6f02");			
	leftObj.afterEvent=function(){
		
		$(top.document).find("iframe").eq(0).height(height0-100);//设置iframe高度
		$(top.document).find("iframe").eq(1).height(height0-100);//设置iframe高度
		
		
		var formId = "200206211318_edrms";//字典左侧树表单id
		var leftSrc = "http://"+window.location.host+"/eform/index?formid="+formId+"&skin=techblue";
		$(top.document).find("iframe").eq(0).attr('src',leftSrc);					
		
	}

})