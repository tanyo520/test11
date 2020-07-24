var height = $(document).height();//浏览器当前窗口文档的高度
height = height - 600;
$('#eformDataTable1 .edoc2datatable').height(height);
$('#eformDataTable1 .edoc2datatable').css('overflow', 'auto');


var archPropertyMasterFormId = "200504223839_edrms";       //文件属性-母表单id
var archListMasterFormId = "200504231436_edrms";           //文件列表-母表单id
var dossierPropertyMasterFormId = "200507135744_edrms";    //案卷属性-母表单id
var dossierListMasterFormId = "200507163518_edrms";        //案卷列表-母表单id

//隐藏 案卷档号策略 下拉列表
var isDossier = eform("is_dossier").method("getValue");
if (isDossier == 0) {
	eform("dossier_strategy_id").method("hide");
}


var Id = $.getQueryString('Id');
eform("ID").method("setValue", Id);


var jsonStr = eform("fields_def").method("getValue");
//console.log('jsonStr')
//console.log(jsonStr)
var fieldArr = JSON.parse(jsonStr);
//console.log(fieldArr)
debugger;


$('.datagrid-view2 .datagrid-body .datagrid-btable  tr').each(function (i) {                   // 遍历 tr

	var trId = $(this).attr('id');
	var trId1 = trId.replace('datagrid-row-r3-2', 'datagrid-row-r3-1');
	var curField = $(this).children('td').eq(0).find('div').text();

	var flag = false;
	for (var i = 0; i < fieldArr.length; i++) {
		if (fieldArr[i].field == curField) {
			flag = true;
		}
	}

	if (flag) {
		var inputId = $('#' + trId1 + ' td').eq(1).find('div span input').attr('id');
		if (inputId) {
			$('#' + inputId).click();
		}
	}
});


/*****************************************************按钮点击事件***************************************************/
/*
		* 动态生成条目表单
		*
		*/

//点击事件
eform("eformButton1").method("onClick", function (buttonName, buttonId) {

	// eform("eformButton1").method("hide");
	var count = 0;

	if (buttonId == "950a80ec-531a-c73f-6870-b888851507bc") {//保存

		var panel = eform.loading("请稍等"); // 打开遮罩层

		var fields = "name,entrystate,ifDossiered,dossierId,deadTime,number,secertexp,reorganizer,reorganizedate,sectid,archtypeid,archiver,archivername,archivedate,duration,writtendate,carrier,entitynum,";
		var listFields = "";
		var fields_def = [];
		var fieldsresult = fields.split(",");
		for (var i = 0; i < fieldsresult.length; i++) {
			if (fieldsresult[i] != "") {
				fields_def.push({ field: fieldsresult[i] });
			}
		}


		var fields_defstr;
		var msg = "";
		if(eform("name").method("getValue")==""){
			msg += "请填写档案类型名称！<br>"
		}
		if(eform("code").method("getValue")==""){
			msg += "请填写档案类型编号！<br>"
		}
		if(eform("sort").method("getValue")==""){
			msg += "请填写排序！<br>"
		}
		if(eform("is_dossier").method("getValue")==""){
			msg += "请选择是否立卷！<br>"
		}

		if(eform("arch_strategy_id").method("getValue")==""){
			msg += "请选择档案档号策略！<br>"
		}	else if(eform("arch_strategy_id").method("getControl").isExistValue==false){
            msg += "档案策略不存在，请重新选择！<br>"
        }

		if(eform("is_dossier").method("getValue")==1 && eform("dossier_strategy_id").method("getValue")==""){
			msg += "请选择案卷档号策略！<br>"
		}else if (eform("is_dossier").method("getValue") == 1 &&  eform("dossier_strategy_id").method("getControl").isExistValue == false) {
            msg += "案卷策略不存在，请重新选择！<br>"
        }

		if(msg){
			window.top.$.messager.alert("提示", msg);
			eform.loaded(panel);
			return false;
		}

		var newFormName = eform("name").method("getValue");//
		eform("eformDataTable1").method("getSelectedRows");//
		var length = eform("eformDataTable1").method("getSelectedRows").length;
		if (length != "0") {
			var defaultFieldArr= ['name','number','writtendate','carrier','entitynum','duration','objtype'];//默认勾选字段
			$.each(eform("eformDataTable1").method("getSelectedRows"), function (index, item) {
				fields = fields + item.field + ",";
				fields_def.push({ field: item.field });
				for(var i=0;i<defaultFieldArr.length;i++){
					if(defaultFieldArr[i]==item.field){
						defaultFieldArr = defaultFieldArr.del(i);
					}
				}
			});

			if(defaultFieldArr.length>0){
				var msg = "";
				for(var i=0;i<defaultFieldArr.length;i++){
					msg += defaultFieldArr[i]+","
				}
				msg +="<br>为必选字段！"
				window.top.$.messager.alert("提示", msg);
				eform.loaded(panel);
				return false;
			}

			fields = (fields.substring(fields.length - 1) == ',') ? fields.substring(0, fields.length - 1) :fields;
			//console.log(fields_def);

			var	fields_str = JSON.stringify(fields_def);
			//console.log(fields_def);
			listFields = fields;

			eform("fields_def").method("setValue", fields_str);

			eform.dataset("selectarchtypeforms", { arch_type_id: arch_type_id }, function (result) {
				var length = result.Data[0].length;
				for (var i = 0; i < length; i++) {

					//formstate 档案状态 0整编库，1档案库，2鉴定库，3销毁库，4回收站
					//form_type 表单类型 0文件属性，1文件列表，2案卷属性，3案卷列表

					if (result.Data[0][i].formstate == "0") {
						if (result.Data[0][i].form_type == "0") {//文件属性
							updateForm(result.Data[0][i].form_id, fields, archPropertyMasterFormId, listFields);
						}
						else if (result.Data[0][i].form_type == "1") {//文件列表
							updateForm(result.Data[0][i].form_id, fields, archListMasterFormId, listFields);
						}
						if (result.Data[0][i].form_type == "2") {//案卷属性
							updateForm(result.Data[0][i].form_id, fields, archPropertyMasterFormId, listFields);
						}
						else if (result.Data[0][i].form_type == "3") {//案卷列表
							updateForm(result.Data[0][i].form_id, fields, archListMasterFormId, listFields);
						}
					}

				}
			}, false);

			edoc2Form.formParser.save(function (rid) {
				edoc2Form.formParser.changeFormToEdit(eform.recordId);
				edoc2Form.isNewRecord = false;
				eform.loaded(panel); // 关闭遮罩层
				window.top.$.messager.alert("提示", "修改成功!")

				var treeSrc = $(top.document).find("iframe").eq(1).attr("src");
				$(top.document).find("iframe").eq(1).attr("src", treeSrc);

			}, null, eform.recordId);

		} else {
			window.top.$.messager.alert("提示", "请选择该档案对应条目字段");
		}

		//关闭遮罩
		$.messager.progress('close');
	}

	else if (buttonId == "21b2f39d-06e7-8e3b-adfb-e6ce10a11276") {//删除

		window.top.$.messager.confirm("提示", "确认此操作吗", function (bool) {
			if (bool === true) {

				var panel = eform.loading("请稍等"); // 打开遮罩层
				var data = [];
				eform.dataset("SelectChildArchType", { Id: Id }, function (result) {
					data = result.Data[0].length;
				}, false);
				if(data > 0 ){
					window.top.$.messager.alert("提示", "不能删除！该档案类型下已有子档案类型！");
					eform.loaded(panel); // 关闭遮罩层
					return false;
				}
				else{//验证该档案类型下档案的数量
					var count = 0;
					var archTableName = eform("arch_table_name").method("getValue");
					var dossierTableName = eform("dossier_table_name").method("getValue");
					eform.dataset("count", { tableName: archTableName }, function (result) {
						count = result.Data[0][0].cot;
					}, false);
					if(count>0){
						window.top.$.messager.alert("提示", "不能删除！该档案类型下已有档案！");
						eform.loaded(panel); // 关闭遮罩层
						return false;
					}else{
						if(dossierTableName){
							eform.dataset("count", { tableName: dossierTableName }, function (result) {
								count = result.Data[0][0].cot;
							}, false);
							if(count>0){
								window.top.$.messager.alert("提示", "不能删除！该档案类型下已有案卷！");
								eform.loaded(panel); // 关闭遮罩层
								return false;
							}
						}
					}
				}

				if (data == "0") {
					var param = { Id: Id };
					eform.dataset("DeleteArchType", param, function (result) {
						if (result.EffectOfRow == "1") {
							var arch_type_id = eform("ID").method("getValue");
							eform.dataset("selectarchtypeforms", { arch_type_id: arch_type_id }, function (result) {

								//console.log(result)
								var length = result.Data[0].length;
								var formIds = "";
								for (var i = 0; i < length; i++) {
									formIds += "," + result.Data[0][i].form_id;
								}
								debugger
								formIds = formIds.substring(1);
								//console.log(formIds);
								deleteForm(formIds);

							}, false);

							window.top.$.messager.alert("提示", "删除成功！");
							eform.loaded(panel); // 关闭遮罩层

							//刷新左侧树
							var treeSrc = $(top.document).find("iframe").eq(0).attr("src");
							$(top.document).find("iframe").eq(0).attr("src", treeSrc);

							var defaultFormId = "200305232631_edrms";//档案类型默认页表单id
							var rightSrc = window.location.protocol+"//" + window.location.host + "/eform/index?formid=" + defaultFormId + "&skin=techblue&page=archType";
							$(top.document).find("iframe").eq(1).attr('src', rightSrc);//右侧默认页

						} else {
							window.top.$.messager.alert("提示", "删除失败！");
						}
					}, false);
				}

			}
		});
	}

});







/*****************************************************通用接口方法**********************************************************/

/**
 * 修改表单
 * @param	[string]	formId  表单id
 * @param	[string]	fields	 过滤控件字段名称，多个以逗号隔开
 * @param	[string]	masterFormId  母表单id
 * @param	[string]	listFields	 过滤查询列表字段名称，多个以逗号隔开
 * @return	 [string]	formId	 复制出新表单的formId
 **/
function updateForm(formId, fields, masterFormId, listFields) {
	var result = "";
	$.ajax({
		type: "post",
		async: false,
		url: "/eform/default/UpdateForm",
		data: {
			formId: formId,
			masterFormId: masterFormId,
			fields: fields,
			listFields: listFields
		},
		success: function (e) {
			result = e.data;
		},
		error: function () {
			result = e.data;
		}
	})
	return result;
}


/**
* 插入数据至对应表单表
* @param	[string]	arch_type_id  档案类型id
* @param	[string]	name	 新表单名称，为空则复制母表单名称
* @param	[string]	form_id	 表单id
* @param	[string]	parent_form_id	 母版表单id
* @param	[string]	form_type	 表单类型
* @param	[string]	formstate	 档案状态
* @param	[string]	formTableName	 表单对应的表
*
**/
function InsertFormV2(arch_type_id, name, form_id, parent_form_id, form_type, formstate, formTableName) {
	var Guid = $.genId();
	var param = {
		Id: Guid,
		createId: eform.userInfo.id,
		updateId: eform.userInfo.id,
		arch_type_id: arch_type_id,
		name: name,
		form_id: form_id,
		parent_form_id: parent_form_id,
		form_type: form_type,
		formstate: formstate,
		formdbname: formTableName
	};
	eform.dataset("InserForms", param, function (result) {
	}, false);
}




/**
	 * 插入数据至对应表单表
	 *
	 * @param	[string]	arch_type_id  母表单id  200106141605为母版表单ID 切勿切换
	 * @param	[string]	name	 新表单名称，为空则复制母表单名称
	 * @param	[string]	form_id	 过滤控件字段名称，多个以逗号隔开
	 * @param	[string]	form_type	 过滤查询列表字段名称，多个以逗号隔开
	 **/

function InsertForm(parent_arch_type_id, name, arch_table_name, form_type, db_name, archlist_table_name, formstate) {
	var Guid = $.genId();
	var param = {
		Id: Guid,
		createId: eform.userInfo.id,
		updateId: eform.userInfo.id,
		parent_arch_type_id: parent_arch_type_id,
		NAME: name,
		arch_table_name: arch_table_name,
		form_type: form_type,
		db_name: db_name,
		archlist_table_name: archlist_table_name,
		formstate: formstate
	};
	eform.dataset("InsertArchiveList", param, function (result) {
	}, false);
}


/**
*删除表单
*@param formIds 多个表单id
**/
function deleteForm(formIds) {
	$.ajax({
		type: "Post",
		async: false,
		dataType: "json",
		url: "/eform/default/DeleteForms",
		dataType: "json",
		data: {
			formIds: formIds,
			isDeleteTable: "true"
		},
		success: function (result) {
			debugger;
		},
		error: function (xhr) {
			window.console.error(xhr);
		}
	});
	return result;
}

/**
*查询表单
*@param archTypeId   档案类型id
*@param archState      档案状态 0整编库，1档案库，2鉴定库，3销毁库，4回收站
*@param formType     表单类型  0文件属性，1文件列表，2案卷属性，3案卷列表，4未组卷-文件列表，5归卷，6组卷
**/
function selectArchTypeForm(archTypeId, archState, formType) {
	var res = {}
	var param = {
		arch_type_id: archTypeId
		, formstate: archState
		, form_type: formType
	}
	eform.dataset("selectForm", param, function (result) {
		res = result.Data[0][0];
	}, false);
	return res;
}


Array.prototype.del=function(n) {　//n表示第几项，从0开始算起。
	//prototype为对象原型，注意这里为对象增加自定义方法的方法。
	if(n<0)　//如果n<0，则不进行任何操作。
		return this;
	else
		return this.slice(0,n).concat(this.slice(n+1,this.length));
	/*
	　　　concat方法：返回一个新数组，这个新数组是由两个或更多数组组合而成的。
	　　　　　　　　　这里就是返回this.slice(0,n)/this.slice(n+1,this.length)
	　　 　　　　　　组成的新数组，这中间，刚好少了第n项。
	　　　slice方法： 返回一个数组的一段，两个参数，分别指定开始和结束的位置。
	　　*/
}