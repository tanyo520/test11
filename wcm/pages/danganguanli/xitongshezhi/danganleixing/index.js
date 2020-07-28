var height0 = $(window).height();

require(["jquery","inbizsdk"],function($,inbizsdk){

	//左侧树
	var leftObj =inbiz("IFrame1f4e3ff54f7742b1b294aa710042593b");
	leftObj.afterEvent=function(){

		$(top.document).find("iframe").eq(0).height(height0-190);//设置iframe高度
		$(top.document).find("iframe").eq(1).height(height0-190);//设置iframe高度


		var formId = "200311144350_edrms";//档案类型左侧树表单id
		var leftSrc = "/eform/index?formid="+formId+"&skin=techblue";
		$(top.document).find("iframe").eq(0).attr('src',leftSrc);


		var defaultFormId = "200305232631_edrms";//字典默认页表单id
		var rightSrc = "/eform/index?formid="+defaultFormId+"&skin=techblue&page=archType";
		$(top.document).find("iframe").eq(1).attr('src',rightSrc);//右侧默认页

		this.getJqDom().find('.leftTree').prevObject[0].parentElement.parentElement.style.backgroundColor="white";
		
		/***控制左侧锁**/
        $(top.document).find("iframe").eq(0).load(function () {
            if ($(top.document).find("iframe").eq(0).length>0) {
                var curBody= $(top.document).find("iframe").eq(0)[0].contentWindow.document.body;
				 if(curBody.firstElementChild!=undefined && curBody.firstElementChild.id!="formContainer")
                {
                    curBody.firstElementChild.style.display='none';
                    curBody.getElementsByTagName('span').length>0?curBody.getElementsByTagName('span')[0].style.display="none":'';
                }
            }

        });

	}

		//顶部
	var topObj =inbiz("HtmlView50d64d1660dc4a9bbaf3ee19224a1fd8");
	topObj.afterEvent=function(){
		this.getJqDom().find('.htmlTitle').prevObject.find('i')[0].style.display="none";//隐藏标题的图标
		this.getJqDom().find('.htmlTitle').prevObject.find('.b-plugin-title')[0].style.paddingTop="10px";
		this.getJqDom().find('.htmlTitle').prevObject.find('.b-plugin-title')[0].style.paddingBottom="0px"
	}

		//右边内容区
	var rightObjt =inbiz("IFrame3361232056ff4824911f87f5263eb8ad");
	rightObjt.afterEvent=function(){
		this.getJqDom().find('.showDetails').prevObject[0].parentElement.parentElement.parentElement.style.backgroundColor="white";
	}

})