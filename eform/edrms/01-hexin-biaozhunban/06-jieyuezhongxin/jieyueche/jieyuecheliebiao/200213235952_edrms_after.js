eform("eformListGrid1").method("onUrlFormatter",function (url, operateBtn) {

	//console.log(operateBtn);
	if(operateBtn.formName== "查看档案详情"){

		var rowData = eform("eformListGrid1").method("getSelectedRows");

		//console.log(rowData);
        var formId=selectArchTypeForm(rowData[0].archTypeId,'0','0').form_id;
		var newFormUrl = eform.virtualPath + '/index?formid='+formId+'&formver=0&Id='+rowData[0].archiveId+'&viewtype=2'
		return  newFormUrl;	

	}else if(operateBtn.formName== "发起借阅"){

		var rowData = eform("eformListGrid1").method("getSelectedRows");

		//console.log(rowData);

		if(rowData.length>0){		
			var formId = '200206210516_edrms';//借阅申请 表单id

            var processId ;//流程id
            eform.dataset("selectProcessIdByProcessName",{ProcessName:'档案借阅'},function(result){
                debugger;
                processId=result.Data[0][0].ID_;
            },false);

			var newFormUrl = eform.virtualPath + '/Default/default?formId='+formId+'&skin=&processId='+processId+'&taskType=begintask&borrowType=first';
			return  newFormUrl;				
		}else{
			window.top.$.messager.alert("提示", "请先选择需要借阅的档案！")
			return;
		}

	}
});



/**
 * 查询表单
 *@param archTypeId   档案类型id
 *@param archState      档案状态 0整编库，1档案库，2鉴定库，3销毁库，4回收站
 *@param formType     表单类型  0文件属性，1文件列表，2案卷属性，3案卷列表，4未组卷-文件列表，5归卷，6组卷
 **/
function selectArchTypeForm(archTypeId ,archState, formType ){
    var res = {}
    var param = {
        arch_type_id:archTypeId
        ,formstate: archState
        ,form_type: formType
    }
    eform.dataset("selectForm", param,function(result){
        res = result.Data[0][0];
    },false);
    return res;
}