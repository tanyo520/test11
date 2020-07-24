//底部导航高度
//$('.divPortalBottom').parent().parent().css('height','60px');

require(["jquery","inbizsdk"],function($,inbizsdk){  

	/**********portal 底部 copyright************/
// 	var portalCopyRight=inbiz("0193b6f2d2f14f45acfff2173c09ddac637249981969682536");
// 	portalCopyRight.afterEvent=function(){
// 		this.getJqDom().find('.divPortalBottom')[0].style.width=getClientWidth()+"px";
// 	}
	
	var height0 = $(window).height();
	var archDetailDivs=inbiz("ea8a2a4bd4d340758a5e44510a8836a0637262710629529662");

	archDetailDivs.afterEvent=function(){
	this.getJqDom().find('.formDiv0')[0].style.height=(height0-173)+"px";
		this.getJqDom().find('.formDiv1')[0].style.height=(height0-173)+"px";
	}

// 	 var archtypeid = getLocationValue("archtypeid");
	  /**
     * 查询表单
     *@param archTypeId   档案类型id
     *@param archState      档案状态 0整编库，1档案库，2鉴定库，3销毁库，4回收站
     *@param formType     表单类型  0文件属性，1文件列表，2案卷属性，3案卷列表，4未组卷-文件列表，5归卷，6组卷
     **/
//     function selectArchTypeForm(archTypeId, archState, formType) {
//         debugger;
//         var res = {};
//         var param = {
//             arch_type_id: archTypeId
//             , formstate: archState
//             , form_type: formType
//         };
//         inbizsdk.$dataset("selectForm", param, function (result) {
//             res = result.Data[0][0];
//         }, false);
//         return res;
//     }
//     var resData = selectArchTypeForm(archtypeid, '1', '0');//获取dangantiaomu表单id
//     if (resData) {
//         archFormId = resData.form_id;
//     }

//     var token=$.cookie("token");
//     $.ajax({
//         type:"get",
//         url:"/api/services/MetaData/GetMetaDataTypeById",//获取元数据表单  控件信息接口
//         async:false,
//         data:{
//             token:token,
//             typeId:archFormId
//         },
//         success: function(e) {

//             if(e.result=="0" && e.data.MetaAttrList){
//                 $.each(e.data.MetaAttrList,function(index,item){
//                     if(item.ControlModel.ControlType!="edoc2Hidden"){
//                         tdtr += ' <tr><td>'+item.ControlModel.Name+':</td><td> </td></tr>'
//                     }
//                 });
// debugger;
//                 $("#archDetailItemsTab").html(tdtr);
//             }
//         },
//         error: function() {
//         }
//     });
})



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