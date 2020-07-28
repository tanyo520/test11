var archList = "";
if($.getQueryString("edittype")=="0"){
	archList = eform.parentForm("eformDataTable1").method("getSelectedRows"); //获取父页面数据表格被选中的值
}else{
	archList = eform.parentForm("eformListGrid1").method("getSelectedRows"); //获取父页面查询列表被选中的值
}

var archTableName= $.getQueryString("archTableName");

var isMove= $.getQueryString("isMove"); // 是否是移卷  isMove=1 是移卷
var str = "归卷";
if(isMove==1){
	str = "移卷";
}

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
        var innerCount = 0;
        eform.dataset("selectArchByDossierId",{tableName:archTableName,dossierId:dossierId}, function (result){
            innerCount = result.Data[0].length;
        }, false);

		var dossierNo = row.number;
		var archIds = "";
		for(var i=0;i<archList.length;i++){
			archIds = archIds+",'"+ (archList[i].ID==null?archList[i].Id:archList[i].ID) +"'"

            if(top.window.ifInnerArchNoByDossierNo=='1'){
                var archNumber = dossierNumber+numFormat(i+1+parseFloat(innerCount));
                var param = {  Id:archList[i].ID, tableName:archTableName, number:archNumber};
                eform.dataset("updateNumber",param, function (result){
                    //更新档案号
                }, false);
            }
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
						window.top.$.messager.alert("提示", str+"成功！");
					};								
				}, false);

			};							
		}, false);
	}
	callback &&callback();
}


function numFormat(num) {
    if(num<10){
        return "00"+num;
    }
    else if(num<100){
        return "0"+num;
    }else {
        return ""+num;
    }
}