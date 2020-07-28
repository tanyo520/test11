var htmlStr = '<div style="margin:50px;">' +
	'<span>请选择excel</span>&emsp;' +
	'<input type="file" id="uploadInput" >' +
	'</div>';

$('#eformHidden1').parent().append(htmlStr);

var formId  = $.getQueryString("typeId");

var module  = $.getQueryString("module");

var archFolderId = top.window.globalvalue_hiddenFolderId;//隐藏文件夹ID



// 按钮点击时触发，自定义“动作”的按钮有效
// * buttonText 按钮Id值文本
// * buttonId 按钮Id值(v1.5.0+)
eform("eformButton1").method("onClick",function(buttonText,buttonId){

	if(buttonText=='提交'){
		
		var formData = new FormData();
		var name = $("#uploadInput").val();
		
		if(!name){
			window.top.$.messager.alert("提示", "请选择一个excel文件");
			return false;
		}else if( name.split('.')[1]!='xls' && name.split('.')[1]!='xlsx'  ){
			window.top.$.messager.alert("提示", "请选择一个excel文件");
			return false;
		}
		var panelG = eform.loading("正在导入...请稍等");
		formData.append("file",$("#uploadInput")[0].files[0]);
		formData.append("token",$.cookie("token"));
		formData.append("name",name);
		formData.append("formId",formId);
		formData.append("module",module);
		formData.append("rootHiddenFolderId",archFolderId);
	
		
		$.ajax({ 
			url : "http://192.168.254.32:8002/edrmscore/api/excel/import", 
			type : 'POST', 
			data : formData, 
			processData : false, 
			contentType : false,
			beforeSend:function(){
				
			},
			success : function(rs) { 
				window.top.$.messager.alert("提示", rs.message);
				eform.loaded(panelG); // 关闭遮罩层
				if(module=='arch'){
					eform.parentForm("eformListGrid1").method("load"); //父页面表格刷新
				}
			}, 
			error : function(rs) { 
				window.top.$.messager.alert("提示", "导入失败！");
				eform.loaded(panelG); // 关闭遮罩层
			} 
		});
	}

});