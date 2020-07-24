var archList = "";
if($.getQueryString("edittype")=="0"){
	archList = eform.parentForm("eformDataTable1").method("getSelectedRows"); //获取父页面查询列表被选中的值
}else{
	archList = eform.parentForm("eformListGrid1").method("getSelectedRows"); //获取父页面查询列表被选中的值
}

var archTableName= $.getQueryString("archTableName");

window.save = function(callback){

	debugger;

	//获取选中的案卷id
	var row = eform("eformDataTable1").method("getSelectedRow");
	if(!row){
		window.top.$.messager.alert("提示", "请先选中一个案卷！")
		return;
	}

	if(row){
		var dossierId = row.Id;
		var archIds = "";
		for(var i=0;i<archList.length;i++){
			archIds = archIds+",'"+ (archList[i].ID==null?archList[i].Id:archList[i].ID) +"'"
		}		
		archIds = archIds.substring(1);
		var param = {
			dossierId:dossierId
			,archIds:archIds
			,tableName:archTableName
		};
		eform.dataset("guiJuanByArchIds", param, function (result) {		
			if(result.EffectOfRow>0){

				eform.dataset("updateArchTypeStatusByEntryId", {dossierId:dossierId,archTypeStatus:1,archIds:archIds}, function (result) {		
					if(result.EffectOfRow>0){

						var blockinfo=window.eform.getBlocks();	
						for(var i=0;i<blockinfo.length;i++){
							eform.setReadonly(blockinfo[i].id,true, eform.objType.block);
						}
						window.top.$.messager.alert("提示", "归卷成功！");
					};								
				}, false);

			};							
		}, false);
	}
	callback &&callback();
}