// var hvObj = inbiz("UnifiedSearch38342fe684ba40dcbf2ad8947e025b8e");
//var myHeight = getClientHeight() - 600;
//alert(myHeight);
// hvObj.$model.vf.setListHeight(myHeight);

require(["jquery", "inbizsdk","pluginsPath/UnifiedSearch/Scripts/insight-search/utils/index"], function ($, inbizsdk,utils) {
	var hvObj = inbiz("UnifiedSearch38342fe684ba40dcbf2ad8947e025b8e");


	var keyword = $.getUrlParameter("keyword");
	var searchWhere = $.getUrlParameter("searchWhere");
	var insightType = $.getUrlParameter("insightType");
	var sort = $.getUrlParameter("sort");



	hvObj.afterEvent = function () {
		/*******penglin start *******/
			var arry = [];
			$.each(JSON.parse(unescape(sort)), function (idx, obj) {
				var sortable = obj.sortable === undefined ? true : obj.sortable;
				var sort = obj.sort === undefined ? null : obj.sort;
				arry.push(new utils.getSortItem(obj.key, obj.value, sortable, sort));
			});
			hvObj.$model.methods("showAllSearchResult", unescape(keyword), unescape(searchWhere), unescape(insightType), arry);
			/***********penglin end *********/

		hvObj.$model.vf.addContentRender(function(element,data){

			console.log(data);
			var length="";
			var Url="";
			var filenames=data.RawData._source.filenames;
			$(element).find(".info-item").remove();
			if(typeof(filenames) != "undefined"){
				length=data.RawData._source.filenames.length;
				if(length > 0){
					Url="<br><br><span style=font-size:12px;>电子文件：</span>";
				}
				for(var i=0;i<length;i++){
					Url+="<a target=view_window href='/preview.html?fileid="+data.RawData._source.files[i].fileid+"'>"+data.RawData._source.filenames[i].filename+"</a>&nbsp;&nbsp;"
				}
			}
			// 			$(element).find(".content-render").html("<span style=font-size:12px;>档案类型："+data.RawData._source.objtype+"</span><span style=font-size:12px;>&nbsp;&nbsp;&nbsp;&nbsp;全宗名称："+data.RawData._source.objtype+"</span>&nbsp;&nbsp;&nbsp;&nbsp;<span style=font-size:12px;>载体形式："+data.RawData._source.objtype+"</span>&nbsp;&nbsp;&nbsp;&nbsp;<span style=font-size:12px;>实体数量："+data.RawData._source.objtype+"</span><span style=font-size:12px;>&nbsp;&nbsp;&nbsp;&nbsp;保管期限："+data.RawData._source.objtype+"</span><span style=float:right;margin-top:-35px;>编号:"+data.RawData._source.number+"</span><br><span style=float:right;margin-top:-23px;>成文日期:"+data.RawData._source.writtendate+"</span><br><span style=float:right;margin-top:-11px;>整编人:"+data.RawData._source.charger+"</span><br><a style=float:right;margin-top:1px;>归档人:"+data.RawData._source.charger+"</a>"+Url )


			$(element).find(".content-render").html(Url )
			$(element).find(".thumbnail").attr("src","/resourcefiles/3669a828-7a42-40fa-a5aa-062a7c2a5ac0.png?system_var_rootId=$system_var_rootId$");

			$('p strong').each(function(index){
				if(index % 9 > 1){
					$(this).css('padding-left', '15px');
				}
			});

		})


		setTimeout(function(){
			var myHeight = getClientHeight() - 225;
			hvObj.$model.vf.setListHeight(myHeight)
		},0)

	}


})

function getClientHeight()
{
	var clientHeight=0;
	if(document.body.clientHeight&&document.documentElement.clientHeight)
	{
		var clientHeight = (document.body.clientHeight<document.documentElement.clientHeight)?document.body.clientHeight:document.documentElement.clientHeight;
	}
	else
	{
		var clientHeight = (document.body.clientHeight>document.documentElement.clientHeight)?document.body.clientHeight:document.documentElement.clientHeight;
	}
	return clientHeight;
}