var height0 = $(window).height();

require(["jquery","inbizsdk"],function($,inbizsdk){

	//左侧树
	var leftObj =inbiz("IFrame1bfdf8d5eba34ad5ac87027987c090fc");
	leftObj.afterEvent=function(){

		$(top.document).find("iframe").eq(0).height(height0-190);//设置iframe高度
		$(top.document).find("iframe").eq(1).height(height0-190);//设置iframe高度


		var formId = "200403193034_edrms";//档案中心-左侧树 表单id
		var leftSrc = "http://"+window.location.host+"/eform/index?formid="+formId+"&skin=techblue&archState=4";
		$(top.document).find("iframe").eq(0).attr('src',leftSrc);

		var defaultFormId = "200305232631_edrms";//字典默认页表单id
		var rightSrc = "http://"+window.location.host+"/eform/index?formid="+defaultFormId+"&skin=techblue&page=arch";
		$(top.document).find("iframe").eq(1).attr('src',rightSrc);//右侧默认页

		this.getJqDom().find('.leftTree').prevObject[0].parentElement.parentElement.style.backgroundColor="white";

	}
	//顶部
	var topObj =inbiz("HtmlView1587997411565");
	topObj.afterEvent=function(){
		this.getJqDom().find('.htmlTitle').prevObject.find('i')[0].style.display="none";//隐藏标题的图标
		this.getJqDom().find('.htmlTitle').prevObject.find('.b-plugin-title')[0].style.paddingTop="10px";
		this.getJqDom().find('.htmlTitle').prevObject.find('.b-plugin-title')[0].style.paddingBottom="0px"
	}

		//右边内容区
	var rightObjt =inbiz("IFrame49703897b10b4cec8cc32739a2fb2dec");
	rightObjt.afterEvent=function(){
		this.getJqDom().find('.showDetails').prevObject[0].parentElement.parentElement.parentElement.style.backgroundColor="white";
	}

})
