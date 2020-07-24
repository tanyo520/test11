var height0 = $(window).height();

require(["jquery","inbizsdk"],function($,inbizsdk){

	//左侧树
	var leftObj =inbiz("IFrame1cb7cf76d8dc434198d8dc23b734969f");			
	leftObj.afterEvent=function(){
		
		$(top.document).find("iframe").eq(0).height(height0- 95);//设置iframe高度
		$(top.document).find("iframe").eq(1).height(height0- 100);//设置iframe高度
		
		
		var formId = "200109014947_edrms";//字典左侧树表单id
		var leftSrc = "http://"+window.location.host+"/eform/index?formid="+formId+"&skin=techblue";
		$(top.document).find("iframe").eq(0).attr('src',leftSrc);					
		
	}

})