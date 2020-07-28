require(["jquery","inbizsdk"],function($,inbizsdk){
	var height0 = $(window).height();

	var curWidth=getClientWidth();
	var divCols=curWidth/12;
	var divContent=divCols*10;
	var divLeft=divContent- 320;
	/*************************个人信息 ***********************************penglin 不要轻易去掉 为了摆脱col的布局 适应大小屏******/
	$('#divMyCenter').parent().parent().parent().width(280);
	$('#divMyCenter').parent().parent().parent().removeClass('col-md-2');
	$('#divMyCenter').parent().parent().parent().css('float','left');
	$('#divMyCenter').parent().parent().parent().css('margin-left','15px');

	/************************2、特色专题  - 标题***************************penglin 不要轻易去掉 为了摆脱col的布局 适应大小屏**********/
	var specialTitle=inbiz("HtmlView8d3c84009d0b4e3a8776420472b6723b");
	specialTitle.afterEvent=function(){
		$('.specialTitle').parent().height(374);
		$('.specialTitle').parent().parent().width(divLeft);
		$('.specialTitle').parent().width(divLeft-20);
		$('.specialTitle').parent().parent().parent().removeClass('col-md-8');
		$('.specialTitle').parent().parent().parent().css('float','left');
		$('.specialTitle').parent().parent().parent().css('margin-left','15px');
		$('.specialTitle').parent()[0].style.backgroundColor="white";
		$('.specialTitle').parent()[0].style.borderRadius="4px";
		$('.specialTitle').parent()[0].style.padding="10px 2px 20px 20px";
		// $('.specialTitle').find('.b-plugin-body')[0].style.minHeight="0px";
	};

	/***********特色专题****/
	var divLeftAvg=(divLeft-70)/4;
	var focusImageWidth=divLeftAvg+"px";
	$('.specialAlbum').width(focusImageWidth);

	/*************档案面板 和标题*************************/

	var leftObj =inbiz("IFrame2c59e92a9f3b4e52824691cdc98bed4b");
	leftObj.afterEvent=function(){
		var formId = "200427180300_edrms";//全宗左侧树表单id
		var leftSrc = "/eform/index?formid="+formId+"&skin=techblue";
		$(top.document).find("iframe").eq(0).attr('src',leftSrc);
	}
});

/********获取宽度***********/
function getClientWidth() {
	var clientWidth = 0;
	if (document.body.clientWidth && document.documentElement.clientWidth) {
		var clientWidth = (document.body.clientWidth < document.documentElement.clientWidth) ? document.body.clientWidth : document.documentElement.clientWidth;
	}
	else {
		var clientWidth = (document.body.clientWidth > document.documentElement.clientWidth) ? document.body.clientWidth : document.documentElement.clientWidth;
	}
	return clientWidth;
}
