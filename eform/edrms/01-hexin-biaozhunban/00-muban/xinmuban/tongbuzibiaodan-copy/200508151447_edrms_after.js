// 点击事件
eform("eformButton1").method("onClick", function (buttonName, buttonId) {
	if(buttonName == "更新子表单"){
		var value = eform("eformSelectbox1").method("getValue").trim();
		if(!value){
			window.top.$.messager.alert("提示", "请选择母表单！");
		}
		var masterFormId = value.split(",")[0];
		var archState = value.split(",")[1];
		var formType = value.split(",")[2];
		var data = selectForms(archState, formType);
		var formIds = "";
		for(var i=0;i<data.length;i++){
			formIds += ","+data[i].form_id;
		}
		formIds = formIds.substring(1);
		
		updateForms(masterFormId,formIds);
	}
});


/**
 * 更新表单
*@param masterFormId   母表单id
*@param formIds  子表单id，多个用","隔开
**/
function updateForms(masterFormId,formIds){
	$.ajax({
		type: "Post",
		async:true,
		dataType: "json",
		url: "/eform/default/UpdateFormsByExtendCode",
		dataType: "json",
		data:{
			masterFormId: masterFormId,
			formIds: formIds,
		},
		success: function (result) {
			window.top.$.messager.alert("提示", result.succeed);
		},
		error: function (xhr) {
			window.console.error(xhr);
		}
	});
}


/**
 * 查询表单
*@param archState      档案状态 0整编库，1档案库，2鉴定库，3销毁库，4回收站
*@param formType     表单类型  0文件属性，1文件列表，2案卷属性，3案卷列表，4未组卷-文件列表，5归卷，6组卷
**/
function selectForms( archState, formType ){
	var res = []
	var param = {
		formstate: archState             
		,form_type: formType           
	}
	eform.dataset("selectFormByArchStateAndFormType", param,function(result){
		res = result.Data[0];
	},false);
	return res;
}