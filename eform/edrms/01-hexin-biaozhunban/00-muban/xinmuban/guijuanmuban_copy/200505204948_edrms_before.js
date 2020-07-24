var dossierTableName= $.getQueryString("dossierTableName");
var entrystate= $.getQueryString("entrystate");
var isMove= $.getQueryString("isMove"); // 是否是移卷  isMove=1 是移卷
var dossierId= $.getQueryString("dossierId"); // 移卷  当前的案卷ID
debugger
/***自定义获取数据源**/
eform("eformDataTable1").method("onDataReceived",function (receiveData) {
	var receiveData = [];
	if(isMove==1) // 来自 移卷
	{
        var param ={tableName:dossierTableName, entrystate:entrystate,Id:dossierId};
        eform.dataset("selectDossierByMove", param, function (result) {
            if(result.EffectOfRow=="0"){
                var archList =  result.Data[0];
                $.each(archList ,function(index,item){
                    receiveData.push( item );
                });
            };
        }, false);
	}else
	{
        var param ={tableName:dossierTableName, entrystate:entrystate};
        eform.dataset("selectByTableNameAndEntrystate", param, function (result) {
            if(result.EffectOfRow=="0"){
                var archList =  result.Data[0];
                $.each(archList ,function(index,item){
                    receiveData.push( item );
                });
            };
        }, false);
	}

	return receiveData;
});

eform("eformDataTable1").method("customColumnsFormatter",function (value, row, index, field, fieldName) {
	if(field === "duration"){
		if(value=="0") {
			return "永久";
		}
		else if(value=="10") {
			return "10年";
		}
		else if(value=="20") {
			return "20年";
		}
		else if(value=="30") {
			return "30年";
		}
	}
	return value; // if之外的需返回原值
});