var dossierTableName= $.getQueryString("dossierTableName");
var entrystate= $.getQueryString("entrystate");
var isMove= $.getQueryString("isMove"); // 是否是移卷  isMove=1 是移卷
var dossierId= $.getQueryString("dossierId"); // 移卷  当前的案卷ID


/***自定义获取数据源**/
eform("eformDataTable1").method("onBeforeEasyuiControlCreate",function (options) {

    options.loader = function(params,success,error){
		
		if(!params.sort){
            params.sort='createTime'
        }
       if(!params.order){
            params.order="asc"
        }

        var receiveData = {};
        var param ={
            tableName:dossierTableName,
            entrystate:entrystate,
            Id :dossierId,
            start: (params.page-1)*params.rows,
            pageSize: params.rows,
			sort:"`"+params.sort+"`",
            order:params.order
        };
        var total = 0;
        if(isMove==1){// 来自 移卷
            eform.dataset("selectCountByTableNameAndEntrystate4ChangeDossier", param, function (result) {
                total = result.Data[0][0].total;
            }, false);
            eform.dataset("selectByTableNameAndEntrystateAndPage4ChangeDossie", param, function (result) {
                if(result.EffectOfRow=="0"){
                    var archList =  result.Data[0];
                    receiveData.total=total;
                    receiveData.rows=archList;
                };
            }, false);
		}
		else{
            eform.dataset("selectCountByTableNameAndEntrystate", param, function (result) {
                total = result.Data[0][0].total;
            }, false);
            eform.dataset("selectByTableNameAndEntrystateAndPage", param, function (result) {
                if(result.EffectOfRow=="0"){
                    var archList =  result.Data[0];
                    receiveData.total=total;
                    receiveData.rows=archList;
                };
            }, false);
		}

        success(receiveData);
    }
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