var height = $(document).height();//浏览器当前窗口文档的高度
height = height-1550;
$('#eformDataTable1 .edoc2datatable').height(height);
$('#eformDataTable1 .edoc2datatable').css('overflow','auto');
$('#eformDataTable1 .edoc2datatable').css("margin-right","5px");

var archFieldsStr = window.archFieldsStr;

var subFormPath = '档案类型子表单';
var archPropertyMasterFormId = "200504223839_edrms";       //文件属性-母表单id
var archListMasterFormId = "200504231436_edrms";           //文件列表-母表单id
var dossierPropertyMasterFormId = "200507135744_edrms";    //案卷属性-母表单id
var dossierListMasterFormId = "200507163518_edrms";        //案卷列表-母表单id
var defaultFormId = "200305232631_edrms";//档案类型默认页表单id

var treeId= $.getQueryString('treeId');
var sectId=  $.getQueryString('sectId');
var isSect= $.getQueryString('isSect');
var level=  $.getQueryString('level');
var parentFolderId = $.getQueryString('parentFolderId');
var allParentName = $.getQueryString('allParentName');
level = level-(-1);

var oldArchStrategyId = eform("arch_strategy_id").method("getValue");
var oldDossierStrategyId = eform("dossier_strategy_id").method("getValue");

var fieldArr = ['name','number','writtendate','carrier','entitynum','duration','objtype'];//默认勾选字段
var fieldArr4show = [];
var viewtype= $.getQueryString('viewtype');//0新增 1编辑
var parentId = '';
if(viewtype=='0'){
    eform("sect_id").method("setValue",sectId);
    if(isSect=="2"){// 1全宗，2档案类型
        eform("parent_arch_type_id").method("setValue",treeId);
        parentId = treeId;
    }else{
        level=0;
    }
    eform("level").method("setValue",level);

    fieldArr4show = fieldArr;

    $('#dcc24760-497d-1c2a-44b3-7937bb0cde5a').hide();//隐藏“删除”按钮
}
else if(viewtype=='1'){
    var isDossier = eform("is_dossier").method("getValue");
    if (isDossier == '1') {
        eform("dossier_strategy_id").method("show");
    }

    sectId = eform("sect_id").method("getValue");
    parentId = eform("parent_arch_type_id").method("getValue");
    level = eform("level").method("getValue");

    var jsonStr = eform("fields_def").method("getValue");
    fieldArr4show = jsonStr.split(",");

    $('#21b2f39d-06e7-8e3b-adfb-e6ce10a11276').hide();//隐藏“清空”按钮
}

//显示按钮
eform("eformButton1").method("show");

// 遍历 tr 勾选默认的字段
$('.datagrid-view2 .datagrid-body .datagrid-btable  tr').each(function(i){

    var trId =  $(this).attr('id');
    var trId1 = trId.replace('datagrid-row-r3-2','datagrid-row-r3-1');
    var curField = $(this).children('td').eq(0).find('div').text();

    var flag = false;
    for(var i=0;i<fieldArr4show.length;i++){
        if(fieldArr4show[i]==curField){
            flag=true;
        }
    }
    if(flag){
        var inputId =  $('#'+trId1+' td').eq(1).find('div span input').attr('id');
        if(inputId){
            $('#'+inputId).click();
        }
    }
});


//是否立卷 监听事件
eform("is_dossier").method("onClick",function (jqClick, allJqCheck){
	if( jqClick.context.value==1){
		eform("dossier_strategy_id").method("show");//立卷的时候 显示 案卷档号策略 下拉列表
	}else{
		eform("dossier_strategy_id").method("hide");//不立卷的时候 隐藏 案卷档号策略 下拉列表
	}
});


/*****************************************************按钮点击事件***************************************************/
eform("eformButton1").method("onClick", function (buttonName, buttonId) {

    if(buttonName === "保存"){

        var panel = eform.loading("正在创建档案类型，请稍等"); // 打开遮罩层

		var msg = "";
        var archTypeName = eform("name").method("getValue").trim();//
		if(archTypeName==""){
			msg += "请填写档案类型名称！<br>"
		}else if(checkNameRepeat(eform.recordId,viewtype,archTypeName,level,sectId,parentId)){
            msg += "档案类型名称重复！<br>"
        }
		if(eform("code").method("getValue")==""){
			msg += "请填写档案类型编号！<br>"
		}
		else if(checkCodeRepeat(eform.recordId,viewtype,eform("code").method("getValue"),level,sectId,parentId)){
            msg += "档案类型编号重复！<br>"
        }

		if(eform("sort").method("getValue")==""){
			msg += "请填写排序！<br>"
		}
		if(eform("is_dossier").method("getValue")==""){
			msg += "请选择是否立卷！<br>"
		}
		if(eform("arch_strategy_id").method("getValue")==""){
			msg += "请选择档案档号策略！<br>"
		}
		else if(eform("arch_strategy_id").method("getControl").isExistValue==false){
			msg += "档案策略不存在，请重新选择！<br>"
		}

		if (eform("is_dossier").method("getValue") == 1 && eform("dossier_strategy_id").method("getValue") == "") {
			msg += "请选择案卷档号策略！<br>"
		} else if (eform("is_dossier").method("getValue") == 1 &&  eform("dossier_strategy_id").method("getControl").isExistValue == false) {
			msg += "案卷策略不存在，请重新选择！<br>"
		}

        var selectedTableFields = eform("eformDataTable1").method("getSelectedRows");//
        var length=selectedTableFields.length;

        if(length=="0"){
            msg += "请选择该档案对应条目字段<br>"
        }

        if(length!="0") {

            var defaultFieldArr = [];//默认勾选字段
            for (var i = 0; i < fieldArr.length; i++) {
                defaultFieldArr.push(fieldArr[i]);
            }

            for (var a = 0; a < selectedTableFields.length; a++) {
                for (var i = 0; i < defaultFieldArr.length; i++) {
                    if (defaultFieldArr[i] == selectedTableFields[a].field) {
                        defaultFieldArr = defaultFieldArr.del(i);
                    }
                }
            }

            if (defaultFieldArr.length > 0) {
                for (var i = 0; i < defaultFieldArr.length; i++) {
                    msg += defaultFieldArr[i] + "<br>"
                }
                msg += "为必选字段！"
            }
        }


		if(msg){
			window.top.$.messager.alert("提示", msg);
			eform.loaded(panel);
			return false;
		}

		window.setTimeout(function(){

            if(oldArchStrategyId!=eform("arch_strategy_id").method("getValue")){
                eform.dataset("selectById", {Id:eform("arch_strategy_id").method("getValue"),tableName:'strategy'}, function(result) {
                    var detailsJsonStr = result.Data[0][0].detailsJsonStr;
                    eform("arch_number_strategy").method("setValue",detailsJsonStr);
                }, false);
            }

            if(oldDossierStrategyId!=eform("dossier_strategy_id").method("getValue")){
                eform.dataset("selectById", {Id:eform("dossier_strategy_id").method("getValue"),tableName:'strategy'}, function(result) {
                    if(result.Data[0][0]){
                        var detailsJsonStr = result.Data[0][0].detailsJsonStr;
                        eform("dossier_number_strategy").method("setValue",detailsJsonStr);
                    }
                }, false);
            }
            
            //档案固定字段
            var staticFields = window.archStaticFields;

            var listFields= staticFields + "";

            var selectedTableFields = eform("eformDataTable1").method("getSelectedRows");//
            var length=selectedTableFields.length;

            if(length!="0"){

                var defaultFieldArr=[];//默认勾选字段
                for(var i=0;i<fieldArr.length;i++){
                    defaultFieldArr.push(fieldArr[i]);
                }

                for(var a=0;a<selectedTableFields.length;a++){
                    listFields += ","+ selectedTableFields[a].field;
                }

                eform("fields_def").method("setValue", listFields);
                var prefixName = allParentName+"-"+archTypeName;
                eform("fullName").method("setValue",prefixName);
                if(viewtype=='0'){

                    //公共部分
                    if(true){

                        var tableName = $.genId();
                        tableName = tableName.replace(/-/g,"");
                        eform("arch_table_name").method("setValue",  tableName);

                        //复制 文件集属性
                        var	archPropFormId="";
                        while(!archPropFormId){
                            archPropFormId=copyForm(archPropertyMasterFormId,archFieldsStr,prefixName+"-条目属性",archFieldsStr,tableName);
                        }
                        eform("archPropFormId").method("setValue",  archPropFormId);

                        //复制 文件集列表
                        var archListFormId="";
                        while(!archListFormId){
                            archListFormId=copyForm(archListMasterFormId,archFieldsStr,prefixName+"-条目列表",archFieldsStr,tableName);
                        }
                        eform("archListFormId").method("setValue",  archListFormId);

                    }

                    //立卷
                    if(eform("is_dossier").method("getValue")=="1"){

                        var anjuantableName = $.genId();
                        anjuantableName = anjuantableName.replace(/-/g,"");
                        eform("dossier_table_name").method("setValue",anjuantableName);
                        var dossierFieldsData = window.dossierFieldsData;
                        var dossierFields = "";
                        for(var i=0;i<dossierFieldsData.MetaAttrList.length;i++){
                            var fieldName = dossierFieldsData.MetaAttrList[i].AttrId;
                            dossierFields+=","+fieldName;
                        }
                        if(dossierFields){
                            dossierFields = dossierFields.substring(1);
                        }
                        eform("dossier_fields").method("setValue",dossierFields);
                        var listFieldsaj = dossierFields;
                        var fieldsaj = dossierFields;

                        // 案卷属性
                        var	dossierPropFormId="";
                        while(!dossierPropFormId){
                            dossierPropFormId=copyForm(dossierPropertyMasterFormId,fieldsaj,prefixName+"-案卷属性",listFieldsaj,anjuantableName);
                        }
                        eform("dossierPropFormId").method("setValue",  dossierPropFormId);

                        // 案卷列表
                        var dossierListFormId="";
                        while(!dossierListFormId){
                            dossierListFormId=copyForm(dossierListMasterFormId,fieldsaj,prefixName+"-案卷列表",listFieldsaj,anjuantableName);
                        }
                        eform("dossierListFormId").method("setValue",  dossierListFormId);
                    }

                    var folderCode = eform("code").method("getValue");;
                    var remark = '';
                    var token = UserLoginIntegrationByUserLoginName();
                    var folder = createFolder(archTypeName,folderCode,remark,parentFolderId,token)
                    eform("folder_id").method("setValue",folder.FolderId);
				}

				else if(viewtype=="1"){

                    //条目属性
                    //updateForm(eform("archPropFormId").method("getValue"), listFields, archPropertyMasterFormId, listFields);

                    //条目列表
                    //updateForm(eform("archListFormId").method("getValue"), listFields, archListMasterFormId, listFields);

                }


				edoc2Form.formParser.save(function(rid){
					edoc2Form.formParser.changeFormToEdit(eform.recordId);
					edoc2Form.isNewRecord = false;
					eform.loaded(panel); // 关闭遮罩层
					window.top.$.messager.alert("提示", "保存成功!")

					//刷新左侧树
					var treeSrc =$(top.document).find("iframe").eq(0).attr("src");
					$(top.document).find("iframe").eq(0).attr("src",treeSrc);

					var rightSrc = "/eform/index?formid="+defaultFormId+"&skin=techblue&page=archType";
					$(top.document).find("iframe").eq(1).attr('src',rightSrc);//右侧默认页
					callback &&callback();
				},null,eform.recordId);
			}
		},100);

	}

	else if(buttonName=='清空'){
		var src =$(top.document).find("iframe").eq(1).attr("src");
		$(top.document).find("iframe").eq(1).attr("src",src);
	}

    else if (buttonName == "删除") {

        window.top.$.messager.confirm("提示", "确认此操作吗", function (bool) {
            if (bool === true) {

                var panel = eform.loading("请稍等"); // 打开遮罩层
                var data = 0;
                eform.dataset("SelectChildArchType", { Id: eform.recordId }, function (result) {
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
                    var param = { Id: eform.recordId };
                    eform.dataset("DeleteArchType", param, function (result) {
                        if (result.EffectOfRow == "1") {

                            eform.dataset("selectarchtypeforms", { arch_type_id: eform.recordId }, function (result) {
                                var length = result.Data[0].length;
                                var formIds = "";
                                for (var i = 0; i < length; i++) {
                                    formIds += "," + result.Data[0][i].form_id;
                                }
                                formIds = formIds.substring(1);
                                deleteForm(formIds);

                            }, false);

                            window.top.$.messager.alert("提示", "删除成功！");
                            eform.loaded(panel); // 关闭遮罩层

                            //刷新左侧树
                            var treeSrc = $(top.document).find("iframe").eq(0).attr("src");
                            $(top.document).find("iframe").eq(0).attr("src", treeSrc);

                            var rightSrc = "/eform/index?formid=" + defaultFormId + "&skin=techblue&page=archType";
                            $(top.document).find("iframe").eq(1).attr('src', rightSrc);//右侧默认页

                        } else {
                            window.top.$.messager.alert("提示", "删除失败！");
                            eform.loaded(panel); // 关闭遮罩层
                        }
                    }, false);
                }

            }
        });
    }

});

/*****************************************************通用接口方法**********************************************************/
//检验名称是否重复
function checkNameRepeat(id,viewType,name,level,sectId,parentId) {

    //新增
    if(viewType=='0'){

        //一级档案类型
        if(level=='0'){
            var param={tableName:'arch_type',name:name,sectId:sectId,level:level}
            var rs = [];
            eform.dataset("selectByNameAndSectId",param, function (result){
                rs = result.Data[0]
            }, false);
            if(rs.length>0){
                return true;
            }
        }
        //次级档案类型
        else{
            var param={tableName:'arch_type',name:name,parentId:parentId,level:level}
            var rs = [];
            eform.dataset("selectByNameAndParentId",param, function (result){
                rs = result.Data[0]
            }, false);
            if(rs.length>0){
                return true;
            }
        }
    }

    //编辑
    if(viewType=='1'){
        //一级档案类型
        if(level=='0'){
            var param={tableName:'arch_type',name:name,sectId:sectId,level:level}
            var rs = [];
            eform.dataset("selectByNameAndSectId",param, function (result){
                rs = result.Data[0]
            }, false);
            if(rs.length>0 && rs[0].Id!=id){
                return true;
            }
        }
        //次级档案类型
        else{
            var param={tableName:'arch_type',name:name,parentId:parentId,level:level}
            var rs = [];
            eform.dataset("selectByNameAndParentId",param, function (result){
                rs = result.Data[0]
            }, false);
            if(rs.length>0 && rs[0].Id!=id){
                return true;
            }
        }
    }
}


//检验编号是否重复
function checkCodeRepeat(id,viewType,code,level,sectId,parentId) {

    //新增
    if(viewType=='0'){

        //一级档案类型
        if(level=='0'){
            var param={tableName:'arch_type',code:code,sectId:sectId,level:level}
            var rs = [];
            eform.dataset("selectByCodeAndSectId",param, function (result){
                rs = result.Data[0]
            }, false);
            if(rs.length>0){
                return true;
            }
        }
        //次级档案类型
        else{
            var param={tableName:'arch_type',code:code,parentId:parentId,level:level}
            var rs = [];
            eform.dataset("selectByCodeAndParentId",param, function (result){
                rs = result.Data[0]
            }, false);
            if(rs.length>0){
                return true;
            }
        }
    }

    //编辑
    if(viewType=='1'){
        //一级档案类型
        if(level=='0'){
            var param={tableName:'arch_type',code:code,sectId:sectId,level:level}
            var rs = [];
            eform.dataset("selectByCodeAndSectId",param, function (result){
                rs = result.Data[0]
            }, false);
            if(rs.length>0 && rs[0].Id!=id){
                return true;
            }
        }
        //次级档案类型
        else{
            var param={tableName:'arch_type',code:code,parentId:parentId,level:level}
            var rs = [];
            eform.dataset("selectByCodeAndParentId",param, function (result){
                rs = result.Data[0]
            }, false);
            if(rs.length>0 && rs[0].Id!=id){
                return true;
            }
        }
    }
}


//获取admin的token
function UserLoginIntegrationByUserLoginName(){
	var token = '';
    eform.dataset("selectByKey", {tableName:'config',key:'adminToken'}, function(result) {
        if(result.Data[0] && result.Data[0][0]){
            token = result.Data[0][0].value;
        }
    }, false);
	return token;
}



/**
 * 复制表单
 * @param	[string]	formId  母表单id  200106141605为母版表单ID 切勿切换
 * @param	[string]	newFormName	 新表单名称，为空则复制母表单名称
 * @param	[string]	fields	 过滤控件字段名称，多个以逗号隔开
 * @param	[string]	listFields	 过滤查询列表字段名称，多个以逗号隔开
 * @param	[string]	tableName	 新表名称
 * @return	 [string]	formId	 复制出新表单的formId
 **/
function copyForm(formId,fields,newFormName,listFields,tableName){
	var result="";
	$.ajax({
		type:"post",
		async:false,
		url:"/eform/default/CopyForm",
		data:{
			formId:formId,
			newFormName:newFormName,
			fields:fields,
			listFields:listFields,
			tableName:tableName,
			groupid:subFormPath
		},
		success: function(e) {
			result=e.data;
		},
		error: function() {
			result=e.data;
		}
	})
	return result;


}


//创建隐藏文件夹
function createFolder(name,folderCode,remark,parentFolderId,token){
	var rs = {};
	$.ajax({
		type: "POST",
		url: "/api/services/Folder/CreateFolder",
		async:false,
		contentType:'application/json',
		data: JSON.stringify({
			"Name": name,
			"FolderCode": folderCode,
			"Remark": remark,
			"ParentFolderId": parentFolderId,
			"Token": token
		}),
		dataType: "json",
		success: function(res){
			rs = res.data
		}
	});
	return rs;
}


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

//数组通过下标删除
Array.prototype.del=function(n) {
	if(n<0)　//如果n<0，则不进行任何操作。
		return this;
	else
		return this.slice(0,n).concat(this.slice(n+1,this.length));
}