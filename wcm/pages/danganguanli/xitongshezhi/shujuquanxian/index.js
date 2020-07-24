var height0 = $(window).height();

require(["jquery","inbizsdk"],function($,inbizsdk){

	var leftObj =inbiz("IFrame04423895b2f9418c98252457ce662e50");	//左侧树
	leftObj.afterEvent=function(){

		$(top.document).find("iframe").eq(0).height(height0-190);//设置iframe高度
		$(top.document).find("iframe").eq(1).height(height0-190);//设置iframe高度


		var formId = "200310103449_edrms";//数据权限配置左侧树表单id
		var leftSrc = "http://"+window.location.host+"/eform/index?formid="+formId+"&skin=techblue";
		$(top.document).find("iframe").eq(0).attr('src',leftSrc);


		var defaultFormId = "200305232631_edrms";//默认页表单id
		var rightSrc = "http://"+window.location.host+"/eform/index?formid="+defaultFormId+"&skin=techblue&page=dataPermission";
		$(top.document).find("iframe").eq(1).attr('src',rightSrc);//右侧默认页

		this.getJqDom().find('.leftTree').prevObject[0].parentElement.parentElement.style.backgroundColor="white";

	}


	//顶部
	var topObj =inbiz("HtmlViewb805869c960e4e459aa14db204313b9d");
	topObj.afterEvent=function(){
		this.getJqDom().find('.htmlTitle').prevObject.find('i')[0].style.display="none";//隐藏标题的图标
		this.getJqDom().find('.htmlTitle').prevObject.find('.b-plugin-title')[0].style.paddingTop="10px";
		this.getJqDom().find('.htmlTitle').prevObject.find('.b-plugin-title')[0].style.paddingBottom="0px"
	}

		//右边内容区
	var rightObjt =inbiz("IFramedcee6d37909e4ccda0d855b9925067b2");
	rightObjt.afterEvent=function(){
		this.getJqDom().find('.showDetails').prevObject[0].parentElement.parentElement.parentElement.style.backgroundColor="white";
	}

})
