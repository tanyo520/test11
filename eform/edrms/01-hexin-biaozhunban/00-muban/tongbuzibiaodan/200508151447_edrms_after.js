// 点击事件
eform("eformButton1").method("onClick", function (buttonName, buttonId) {
	if(buttonName == "更新子表单"){

		var value = eform("eformSelectbox1").method("getValue").trim();
		if(!value){
			window.top.$.messager.alert("提示", "请选择母表单！");
			return false;
		}

		var panel = eform.loading("正在同步子表单，请稍等"); // 打开遮罩层

		window.setTimeout(function(){

			var masterFormId = value.split(",")[0];
			var archState = value.split(",")[1];
			var formType = value.split(",")[2];
			var data = selectArchType();
			var formIds = "";
			for(var i=0;i<data.length;i++){
				//条目属性
				if(formType=='0'){
                    formIds += ","+data[i].archPropFormId;
				}
                //条目列表
				else if(formType=='1'){
                    formIds += ","+data[i].archListFormId;
				}
                //案卷属性
                else if(formType=='2'){
                    formIds += ","+data[i].dossierPropFormId;
                }
                //案卷列表
                else if(formType=='3'){
                    formIds += ","+data[i].dossierListFormId;
                }
			}
			formIds = formIds.substring(1);

			updateForms(masterFormId,formIds);

			eform.loaded(panel); // 关闭遮罩层

		},100);


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
		async:false,
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
 * 查询档案类型
**/
function selectArchType(){
	var res = []
	var param = {
        tableName: 'arch_type'
	}
	eform.dataset("selectByTableName", param,function(result){
		res = result.Data[0];
	},false);
	return res;
}