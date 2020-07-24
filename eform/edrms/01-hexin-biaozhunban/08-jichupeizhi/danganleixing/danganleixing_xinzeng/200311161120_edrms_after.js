var height = $(document).height();//浏览器当前窗口文档的高度
height = height-650;
$('#eformDataTable1 .edoc2datatable').height(height);
$('#eformDataTable1 .edoc2datatable').css('overflow','auto');
$('#eformDataTable1 .edoc2datatable').css("margin-right","5px");

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
level = level-(-1);

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

    fieldArr4show = JSON.parse(jsonStr);

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
        if(viewtype=='1'){
            if(fieldArr4show[i].field==curField){
                flag=true;
            }
        }else{
            if(fieldArr4show[i]==curField){
                flag=true;
            }
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

	//档案固定字段
	var staticFields="entrystate,ifDossiered,dossierId,deadTime,secertexp,reorganizer,reorganizername,reorganizedate,yearAutoIncrement,sectid,archtypeid,archiver,archivername,archivedate,";

	var listFields="";
	var fields_def = [];
	var fieldsresult=staticFields.split(",");
	for(var i=0;i<fieldsresult.length;i++){
		if(fieldsresult[i] !=""){
			fields_def.push({field:fieldsresult[i]});
		}
	}

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
                staticFields = staticFields + selectedTableFields[a].field + ",";
                fields_def.push({field: selectedTableFields[a].field});
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

            eform.dataset("selectById", {Id:eform("arch_strategy_id").method("getValue"),tableName:'strategy'}, function(result) {
                var details = result.Data[0][0].details;
                eform("arch_number_strategy").method("setValue",details);
            }, false);

            eform.dataset("selectById", {Id:eform("dossier_strategy_id").method("getValue"),tableName:'strategy'}, function(result) {
                if(result.Data[0][0]){
                    var details = result.Data[0][0].details;
                    eform("dossier_number_strategy").method("setValue",details);
                }
            }, false);

			var selectedTableFields = eform("eformDataTable1").method("getSelectedRows");//
			var length=selectedTableFields.length;

			if(length!="0"){

				var defaultFieldArr=[];//默认勾选字段
				for(var i=0;i<fieldArr.length;i++){
					defaultFieldArr.push(fieldArr[i]);
				}

				for(var a=0;a<selectedTableFields.length;a++){
                    staticFields=staticFields+selectedTableFields[a].field+",";
                    fields_def.push({field:selectedTableFields[a].field});
				}

				if(staticFields.substring(staticFields.length-1)==','){
					staticFields=staticFields.substring(0,staticFields.length-1);
				}

				var fields_str = JSON.stringify(fields_def);

				listFields=staticFields;

				eform("fields_def").method("setValue", fields_str);

				if(viewtype=='0'){

                    //公共部分
                    if(true){

                        var tableName = $.genId();
                        tableName = tableName.replace(/-/g,"");
                        eform("arch_table_name").method("setValue",  tableName);

                        //复制 文件集属性
                        var	tiaomuresult="";
                        while(!tiaomuresult){
                            tiaomuresult=copyForm(archPropertyMasterFormId,staticFields,archTypeName+"-条目属性",listFields,tableName);
                        }
                        InsertFormV2(eform.recordId,archTypeName+"-条目属性",tiaomuresult, archPropertyMasterFormId,"0","0",tableName);

                        //复制 文件集列表
                        var tiaomuresultcode="";
                        while(!tiaomuresultcode){
                            tiaomuresultcode=copyForm(archListMasterFormId,staticFields,archTypeName+"-条目列表",listFields,tableName);
                        }
                        InsertFormV2(eform.recordId,archTypeName+"-条目列表",tiaomuresultcode, archListMasterFormId,"1","0",tableName);

                    }

                    //立卷
                    if(eform("is_dossier").method("getValue")=="1"){

                        var anjuantableName = $.genId();
                        anjuantableName = anjuantableName.replace(/-/g,"");
                        eform("dossier_table_name").method("setValue",anjuantableName);
                        var listFieldsaj="name,user,duration,secert,entrystate,note,writtendate,deadTime,number,sectid,archtypeid,reorganizer,reorganizedate,archiver,archivedate"
                        var fieldsaj="name,user,duration,secert,entrystate,note,writtendate,deadTime,number,sectid,archtypeid,reorganizer,reorganizedate,archiver,archivedate";

                        // 案卷属性
                        var	anjuanresultzbk="";
                        while(!anjuanresultzbk){
                            anjuanresultzbk=copyForm(dossierPropertyMasterFormId,fieldsaj,archTypeName+"-案卷属性",listFieldsaj,anjuantableName);
                        }
                        InsertFormV2(eform.recordId,archTypeName+"-案卷属性",anjuanresultzbk, dossierPropertyMasterFormId,"2","0",anjuantableName);

                        // 案卷列表
                        var anjuanresultcodezbk="";
                        while(!anjuanresultcodezbk){
                            anjuanresultcodezbk=copyForm(dossierListMasterFormId,fieldsaj,archTypeName+"-案卷列表",listFieldsaj,anjuantableName);
                        }
                        InsertFormV2(eform.recordId,archTypeName+"-案卷列表",anjuanresultcodezbk, dossierListMasterFormId,"3","0",anjuantableName);
                    }

                    var folderCode = eform("code").method("getValue");;
                    var remark = '';
                    var token = UserLoginIntegrationByUserLoginName();
                    var folder = createFolder(archTypeName,folderCode,remark,parentFolderId,token)
                    eform("folder_id").method("setValue",folder.FolderId);
				}

				else if(viewtype=="1"){

                    eform.dataset("selectarchtypeforms", { arch_type_id: eform.recordId }, function (result) {
                        var formes = result.Data[0];
                        for (var i = 0; i < formes.length; i++) {

                        	//目前只更新文件属性、文件列表，不更新案卷属性、案卷列表
                            if (formes[i].formstate == "0") {
                                if (formes[i].form_type == "0") {//文件属性
                                    updateForm(formes[i].form_id, staticFields, archPropertyMasterFormId, listFields);
                                }
                                else if (formes[i].form_type == "1") {//文件列表
                                    updateForm(formes[i].form_id, staticFields, archListMasterFormId, listFields);
                                }
                            }
                        }
                    }, false);
				}


				edoc2Form.formParser.save(function(rid){
					edoc2Form.formParser.changeFormToEdit(eform.recordId);
					edoc2Form.isNewRecord = false;
					eform.loaded(panel); // 关闭遮罩层
					window.top.$.messager.alert("提示", "保存成功!")

					//刷新左侧树
					var treeSrc =$(top.document).find("iframe").eq(0).attr("src");
					$(top.document).find("iframe").eq(0).attr("src",treeSrc);

					var rightSrc = window.location.protocol+"//"+window.location.host+"/eform/index?formid="+defaultFormId+"&skin=techblue&page=archType";
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

                            var rightSrc = window.location.protocol+"//" + window.location.host + "/eform/index?formid=" + defaultFormId + "&skin=techblue&page=archType";
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
	var host =  window.location.host;
	var token = '';
	$.ajax({
		type: "POST",
		url: window.location.protocol+"//"+host+"/api/services/Org/UserLoginIntegrationByUserLoginName",
		async:false,
		contentType:'application/json',
		data: JSON.stringify({
			"LoginName": 'admin',
			"IPAddress": host,
			"IntegrationKey": '46aa92ec-66af-4818-b7c1-8495a9bd7f17'
		}),
		dataType: "json",
		success: function(res){
			token = res.data
		}
	});
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


/**
 * 插入数据至对应表单表
 * @param	[string]	arch_type_id  母表单id  200106141605为母版表单ID 切勿切换
 * @param	[string]	name	 新表单名称，为空则复制母表单名称
 * @param	[string]	form_id	 过滤控件字段名称，多个以逗号隔开
 * @param	[string]	form_type	 表单类型 0文件属性，1文件列表，2案卷属性，3案卷列表
 * @param	[string]	formstate	表单状态 0
 * @param	[string]	formdbname	 表单数据库名
 **/
function InsertFormV2(arch_type_id,name,form_id,parent_form_id,form_type,formstate,formdbname){
	var Guid= $.genId();
	var param = {
		Id :Guid,
		createId:eform.userInfo.id,
		updateId:eform.userInfo.id,
		arch_type_id:arch_type_id,
		name:name,
		form_id:form_id,
		parent_form_id:parent_form_id,
		form_type:form_type,
		formstate:formstate,
		formdbname:formdbname
	};
	eform.dataset("InserForms",param, function (result){
	}, false);
}


//创建隐藏文件夹
function createFolder(name,folderCode,remark,parentFolderId,token){
	var host =  window.location.host;
	var rs = {};
	$.ajax({
		type: "POST",
		url: window.location.protocol+"//"+host+"/api/services/Folder/CreateFolder",
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