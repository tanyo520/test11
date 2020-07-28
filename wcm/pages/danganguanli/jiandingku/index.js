var height0 = $(window).height();

require(["jquery","inbizsdk"],function($,inbizsdk){

	//左侧树
	var leftObj =inbiz("IFrame42add7c90c024ced82db191ef59a35d5");
	leftObj.afterEvent=function(){

		$(top.document).find("iframe").eq(0).height(height0-190);//设置iframe高度
		$(top.document).find("iframe").eq(1).height(height0-190);//设置iframe高度


		var formId = "200403193034_edrms";//档案中心-左侧树 表单id
		var leftSrc = "/eform/index?formid="+formId+"&skin=techblue&archState=2";
		$(top.document).find("iframe").eq(0).attr('src',leftSrc);

		var defaultFormId = "200305232631_edrms";//默认页表单id
		var rightSrc = "/eform/index?formid="+defaultFormId+"&skin=techblue&page=arch";
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
	var topObj =inbiz("HtmlView1587997208192");
	topObj.afterEvent=function(){
		this.getJqDom().find('.htmlTitle').prevObject.find('i')[0].style.display="none";//隐藏标题的图标
		this.getJqDom().find('.htmlTitle').prevObject.find('.b-plugin-title')[0].style.paddingTop="10px";
		this.getJqDom().find('.htmlTitle').prevObject.find('.b-plugin-title')[0].style.paddingBottom="0px"
	}

		//右边内容区
	var rightObjt =inbiz("IFrame2f949966dccf47f0bf88247acf2ab607");
	rightObjt.afterEvent=function(){
		this.getJqDom().find('.showDetails').prevObject[0].parentElement.parentElement.parentElement.style.backgroundColor="white";
	}

})