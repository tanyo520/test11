/*****************************************************表格自定义获取数据源***************************************************/
eform("eformDataTable1").method("onDataReceived",function (receiveData) {	
	var receiveData = [];
	var tkn=$.getToken(); //获取当前登录用户token；
	$.ajax({
		type:"get",
		url:"/api/services/MetaData/GetMetaDataTypeById",//获取元数据表单  控件信息接口
		async:false,
		data:{
			token:tkn,
			typeId:"200504223839_edrms"
		},
		success: function(e) {			
			if(e.result=="0" && e.data.MetaAttrList){					
				$.each(e.data.MetaAttrList,function(index,item){		
					if(item.ControlModel.FiledName!="entrystate" && item.ControlModel.FiledName!="ifDossiered" && item.ControlModel.FiledName!="dossierId" && item.ControlModel.FiledName!="secertexp" && item.ControlModel.FiledName!="deadTime" && item.ControlModel.FiledName!="reorganizer" && item.ControlModel.FiledName!="reorganizedate" && item.ControlModel.FiledName!="sectid" && item.ControlModel.FiledName!="archtypeid" && item.ControlModel.FiledName!="archiver" && item.ControlModel.FiledName!="archivername" && item.ControlModel.FiledName!="archivedate")
						receiveData.push({field:item.ControlModel.FiledName,name:item.ControlModel.Name,IsPrint:""});
				});
			}
		},
		error: function() {		
		}
	});
	return receiveData;
});