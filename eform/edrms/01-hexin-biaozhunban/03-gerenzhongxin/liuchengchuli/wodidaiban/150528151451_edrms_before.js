window.myExtCode.parserBefore();
// 调整子窗口大小

if(eform.pageType != "mobile"){
	eform("edoc2ListGrid_myInbox").method("beforeChildFormOpen", function(parentWin, operateButton) {
		// 批量审批窗体打开前判断是否有选中任务
		if(operateButton.formId=="181116135227"){
			var selectedRows = this.control.datagrid("getSelections");
			if(selectedRows.length==0){
				$.messager.alert(Edoc2FormSR.Global_Tip,Edoc2FormSR.Flow_SelectTask);
				return false;
			}
			if(selectedRows.length>5){
				$.messager.alert(Edoc2FormSR.Global_Tip,Edoc2FormSR.batchApproveTaskLimit);
				return false;
			}
		}
		return true;
	});
	eform("edoc2ListGrid_myInbox").method("afterChildFormOpen", function(parentWin, iframeWin, operate) {
		if(operate.formId=="181116135227"){
			var options= operate.dialog.dialog("options");
			iframeWin.dialog = operate.dialog;
			operate.dialog.parent().find(".panel-tool-max").remove();
			operate.dialog.parent().find(".panel-title").html(Edoc2FormSR.wf_batchApprove);
		}
	});
	eform("edoc2ListGrid_myInbox").method("onDataReceived", function(receiveData) {
		if(receiveData && receiveData.rows &&  receiveData.rows.length){
			$.each(receiveData.rows,function(index,item){
				item.Num=1;
			});
		}
		return receiveData;
	});
}else{
	// 删除批量审批按钮配制
	var propertyValue = eform("edoc2ListGrid_myInbox").method("getConfig", "config");
	var objConfig = $.parseJSON(propertyValue);
	var operateObj = objConfig.Operate;
	for(var i=0;i<operateObj.length;i++){
		if(operateObj[i].formId=="181116135227"){
			operateObj.splice(i, 1);
			break;
		}
	}
	var propertyNewValue=$.toJSON(objConfig);
	eform("edoc2ListGrid_myInbox").method("getControl").setProperty("config", propertyNewValue);
}