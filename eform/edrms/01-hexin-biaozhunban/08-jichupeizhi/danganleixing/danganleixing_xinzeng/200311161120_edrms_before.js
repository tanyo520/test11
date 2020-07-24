//隐藏 案卷档号策略 下拉列表
eform("dossier_strategy_id").method("hide");
eform("eformButton1").method("hide");

var viewtype= $.getQueryString('viewtype');//0新增 1编辑
if(viewtype=='1'){
    eform("is_dossier").method("getControl").setProperty("readonly", 'true');
}

/*****************************************************表格自定义获取数据源***************************************************/
eform("eformDataTable1").method("onDataReceived",function (receiveData) {	
	var receiveData = [];
	var tkn = $.getToken(); //获取当前登录用户token；
	$.ajax({
		type:"get",
		url:"/api/services/MetaData/GetMetaDataTypeById",//获取元数据表单  控件信息接口
		async:false,
		data:{
			token:tkn,
			typeId:"200504223839_edrms" //条目属性母版表单id
		},
		success: function(e) {			
			if(e.result=="0" && e.data.MetaAttrList){
				for(var i=0;i<e.data.MetaAttrList.length;i++){
					var fieldName = e.data.MetaAttrList[i].AttrId;
					var name = e.data.MetaAttrList[i].AttrName;
                    if(fieldName!="entrystate"
                        && fieldName!="ifDossiered"
                        && fieldName!="dossierId"
                        && fieldName!="secertexp"
                        && fieldName!="deadTime"
                        && fieldName!="reorganizer"
                        && fieldName!="reorganizername"
                        && fieldName!="reorganizedate"
                        && fieldName!="yearAutoIncrement"
                        && fieldName!="sectid"
                        && fieldName!="archtypeid"
                        && fieldName!="archiver"
                        && fieldName!="archivername"
                        && fieldName!="archivedate")
                    {
                        receiveData.push({field:fieldName,name:name,IsPrint:""});
                    }
				}
			}
		},
		error: function() {		
		}
	});
	return receiveData;
});