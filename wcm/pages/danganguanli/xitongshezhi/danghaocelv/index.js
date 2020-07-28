var height0 = $(window).height();

require(["jquery","inbizsdk"],function($,inbizsdk){

	
	var leftObj =inbiz("IFrame5ae083d6e3334947a6a06c9d370bbcd6");			
	leftObj.afterEvent=function(){
		
		$(top.document).find("iframe").eq(0).height(height0-100);//设置iframe高度
		
		var formId = "200106092603_edrms";//表单id
		var leftSrc = "/eform/index?formid="+formId+"&skin=techblue";
		$(top.document).find("iframe").eq(0).attr('src',leftSrc);					
		
	}

})