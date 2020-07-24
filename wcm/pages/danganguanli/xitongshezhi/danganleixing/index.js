var height0 = $(window).height();

require(["jquery","inbizsdk"],function($,inbizsdk){

	//左侧树
	var leftObj =inbiz("IFrame7a35e54e898e45a88ddfd34c9b2cf6f3");
	leftObj.afterEvent=function(){

		$(top.document).find("iframe").eq(0).height(height0-190);//设置iframe高度
		$(top.document).find("iframe").eq(1).height(height0-190);//设置iframe高度


		var formId = "200311144350_edrms";//档案类型左侧树表单id
		var leftSrc = "http://"+window.location.host+"/eform/index?formid="+formId+"&skin=techblue";
		$(top.document).find("iframe").eq(0).attr('src',leftSrc);


		var defaultFormId = "200305232631_edrms";//字典默认页表单id
		var rightSrc = "http://"+window.location.host+"/eform/index?formid="+defaultFormId+"&skin=techblue&page=archType";
		$(top.document).find("iframe").eq(1).attr('src',rightSrc);//右侧默认页

		this.getJqDom().find('.leftTree').prevObject[0].parentElement.parentElement.style.backgroundColor="white";

	}

		//顶部
	var topObj =inbiz("HtmlView392b923a96774c379dc59ba8c1c5fe7e");
	topObj.afterEvent=function(){
		this.getJqDom().find('.htmlTitle').prevObject.find('i')[0].style.display="none";//隐藏标题的图标
		this.getJqDom().find('.htmlTitle').prevObject.find('.b-plugin-title')[0].style.paddingTop="10px";
		this.getJqDom().find('.htmlTitle').prevObject.find('.b-plugin-title')[0].style.paddingBottom="0px"
	}

		//右边内容区
	var rightObjt =inbiz("IFrame42e092d8671a45b8bb7de617238cc30e");
	rightObjt.afterEvent=function(){
		this.getJqDom().find('.showDetails').prevObject[0].parentElement.parentElement.parentElement.style.backgroundColor="white";
	}

})
