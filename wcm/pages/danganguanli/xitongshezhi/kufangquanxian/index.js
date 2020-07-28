require(["jquery","inbizsdk"],function($,inbizsdk){
    var height0 = $(window).height();


    var leftObj =inbiz("IFrame1594957373561");
    leftObj.afterEvent=function(){


        $(top.document).find("iframe").eq(0).height(height0-190);//设置iframe高度


        var formId = "200717112551_edrms";//
        var leftSrc = "/eform/index?formid="+formId+"&skin=techblue";

        $(top.document).find("iframe").eq(0).attr('src',leftSrc);
    }

    //顶部
    var topObj =inbiz("HtmlView1594955132666");
    topObj.afterEvent=function(){
        this.getJqDom().find('.htmlTitle').prevObject.find('i')[0].style.display="none";//隐藏标题的图标
        this.getJqDom().find('.htmlTitle').prevObject.find('.b-plugin-title')[0].style.paddingTop="10px";
        this.getJqDom().find('.htmlTitle').prevObject.find('.b-plugin-title')[0].style.paddingBottom="0px"
    }
});