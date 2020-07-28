var height0 = $(window).height();

require(["jquery", "inbizsdk"], function ($, inbizsdk) {
	

    //左侧树
    var leftObj =inbiz("IFrame4a2b68ec37c24ba4b48541b9247fceec");
    leftObj.afterEvent  =function(){
		
		
    	$(top.document).find("iframe").eq(0).height(height0-95);//设置iframe高度
    	// $(top.document).find("iframe").eq(1).height(height0-100);//设置iframe高度
    	var formId = "200109014947_edrms";//字典左侧树表单id
    	var leftSrc = "/eform/index?formid="+formId+"&skin=techblue";
    	$(top.document).find("iframe").eq(0).attr('src',leftSrc);

    }

})