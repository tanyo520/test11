require(["jquery","inbizsdk"],function($,inbizsdk){
	/*********档案地图**************/
	var archMap =inbiz("IFrame1587708766953");
	archMap.afterEvent=function(){
		var formId = "200409230054_edrms";//表单id
		var leftSrc = "/eform/index?formid="+formId+"&skin=techblue";
		$(top.document).find("iframe").eq(0).attr('src',leftSrc);

	}

})


/***********数字动态显示****************/
//  time  起始
//  seep  每次增加
//  index 时间
function numAc(obj,result,text) {
	var start=parseInt(result/2);//起始数字
	var seep=parseInt(start/2);
	var index=50;
	var time = setInterval(function () {
		start = start +  parseInt(seep);
		obj.innerHTML=start+text;
		if (start >= result) {
			clearInterval(time);
			obj.innerHTML=result+text;
			return false;
		}
		seep=(result-parseInt(start))/2;
		if(seep<1) {
			clearInterval(time)
			obj.innerHTML = result+text;
			return false;
		}
	}, index);
}