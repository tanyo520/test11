eform("eformListGrid1").method("onUrlFormatter",function (url, operateBtn) {

	//console.log(operateBtn);

	if(operateBtn.formName== "查看档案详情"){

		var rowData = eform("eformListGrid1").method("getSelectedRow");

		//console.log(rowData);
        var formId=selectArchTypeForm(rowData.archTypeId,'0','0').form_id;
		if(rowData){
			var newFormUrl = eform.virtualPath + '/index?formid='+formId+'&Id='+rowData.archiveId;
			return  newFormUrl;	
		}

	}
	
	else if(operateBtn.formName== "续借"){
		debugger;

		var rowData = eform("eformListGrid1").method("getSelectedRow");

		if(rowData){		
			if(rowData.borrowStatus=='待归还' || rowData.borrowStatus=='已领用' ){ //6待归还，7已领用
				var formId = '200206210516_edrms';//借阅申请 流程表单id


                var processId ;//流程id
                eform.dataset("selectProcessIdByProcessName",{ProcessName:'档案借阅'},function(result){
                    debugger;
                    processId=result.Data[0][0].ID_;
                },false);


                var newFormUrl = eform.virtualPath + '/Default/default?formId='+formId+
					'&processId='+processId+'&taskType=begintask'+
					'&borrowType=renew';

				return  newFormUrl;	

			}else{
				window.top.$.messager.alert("提示", "已领用状态的档案才可以续借！");
				return;
			}			
		}else{
			window.top.$.messager.alert("提示", "请先选择需要续借的档案！")
			return;
		}

	}
	
	else if(operateBtn.formName== "查看"){

		var rowData = eform("eformListGrid1").method("getSelectedRow");

		if(rowData){	

			var newFormUrl = eform.virtualPath + '/index?formid=200206212742_edrms&Id='+rowData.ID+'&type=look';
			return  newFormUrl;	

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