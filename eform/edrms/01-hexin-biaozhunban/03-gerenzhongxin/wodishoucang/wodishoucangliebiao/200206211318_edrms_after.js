eform("eformListGrid2").method("onUrlFormatter",function (url, operateBtn) {
	
	console.log(operateBtn);
	if(operateBtn.formName== "查看档案详情"){
		debugger;

		var rowData = eform("eformListGrid2").method("getSelectedRow");
		if(rowData){
			var newFormUrl = eform.virtualPath + '/index?formid='+rowData.formId+'&formver=0&id='+rowData.archId+'&viewtype=2';
			return  newFormUrl;	
		}else{
			$.messager.alert("提示", "请先选择一条记录！")
		}
					
	}
	else if(operateBtn.formName== "新增"){
		var newFormUrl = eform.virtualPath + '/index?formid=200206210223&formver=0';
			return  newFormUrl;	
		
		
	
	}
});