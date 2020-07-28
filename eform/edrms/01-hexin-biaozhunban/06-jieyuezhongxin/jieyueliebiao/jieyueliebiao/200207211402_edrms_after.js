eform("eformListGrid1").method("onUrlFormatter",function (url, operateBtn) {
    if(operateBtn.formName== "查看档案详情"){
        var rowData = eform("eformListGrid1").method("getSelectedRows")[0];

        var formId=selectArchTypeForm(rowData.archTypeId,'0','0').form_id;
        var newFormUrl = eform.virtualPath + '/index?formid='+formId+'&id='+rowData.archiveId+'&viewtype=2';
        return  newFormUrl;
    }else if(operateBtn.formName== "查看"){

        var rowData = eform("eformListGrid1").method("getSelectedRows")[0];

        var newFormUrl = eform.virtualPath + '/index?formid=200206212742_edrms&Id='+rowData.ID+'&type=look';
        return  newFormUrl;

    }
});

eform("eformListGrid1").method("customButtonEvent",function (formId, ids, name, callback){	

	if(name == "领用"){
		debugger;
		var rowData =  eform("eformListGrid1").method("getSelectedRows");

		if(rowData.length==0){
            window.top.$.messager.alert("提示", "请先选择需要领用的档案！")
            return;
        }
        var count=0;
        for(var i=0;i<rowData.length;i++){
            if (rowData[i].borrowStatus!='待领用'){
                count++;
            }
        }
        if(count>0){
            window.top.$.messager.alert("提示", "待领用状态的档案才可以领用！");
            return;
        }
        window.top.$.messager.confirm("提示", "确认领用吗？", function (bool){
            if (bool === true) {

                var lingYongCount=0;
                var token = getAdmitToken();
                for(var i=0;i<rowData.length;i++){

                    //领用
                    var borrowDays = rowData[i].brrowday;

                    var startUseTime = new Date();
                    var returnTime = new Date();
                    returnTime = new Date(returnTime.getTime()+parseFloat(borrowDays)*3600000*24);
                    startUseTime = eform.dateFormat(startUseTime,"yyyy-MM-dd hh:mm:ss");
                    returnTime = eform.dateFormat(returnTime,"yyyy-MM-dd hh:mm:ss");
                    var param ={
                        Id:rowData[i].ID
                        ,borrowStatus:'借阅中'
                        ,startUseTime:startUseTime
                        ,returnTime:returnTime};
                    eform.dataset("draw", param, function (result) {
                        if(result.ResultCode==0){
                            lingYongCount++;
                        }
                    }, false);

                    //电子文件赋予借阅人权限
                    var borrowInfo= {};
                    eform.dataset("selectById",{tableName:'borrowarchinfo',Id:rowData[i].ID}, function(result) {
                        borrowInfo = result.Data[0][0];
                    }, false);

                    if(borrowInfo.brrowe){
                        var starter={};
                        eform.dataset("selectByGuId",{guid:borrowInfo.createId}, function(result) {
                            starter = result.Data[0][0];
                        }, false);
                        var  PermCateId = '2';//预览权限
                        if(borrowInfo.brrowe.indexOf('打印')!=-1){
                            PermCateId = '6';//管理权限
                        }
                        else if(borrowInfo.brrowe.indexOf('下载')!=-1){
                            PermCateId = '3';//下载权限
                        }
                        var permissionList = [];
                        var json = {
                            "MemberId": starter.user_identityID,
                            "MemberType":1 ,//1用户，2部门，4职位，8用户组
                            "PermCateId": PermCateId,
                            "StartTime":new Date(startUseTime),
                            "ExpiredTime":new Date(returnTime)
                        }
                        permissionList.push(json);
                        var fileList = [];
                        eform.dataset("selectFileByEntityIds", {ids:("'"+borrowInfo.archiveId+"'")}, function (result) {
                            fileList = result.Data[0];
                        }, false);
                        for(var j=0;j<fileList.length;j++){
                            setFilePermission(fileList[j].FileId,permissionList,token);
                        }
                    }
                }

                if (lingYongCount>0){
                    window.top.$.messager.alert("提示", "操作成功！");
                    eform("eformListGrid1").method("load");//刷新列表
                }
            }});
	}

	else if(name == "归还"){
		var rowData =  eform("eformListGrid1").method("getSelectedRows");

		if(rowData){

            var count=0;

            for(var i=0;i<rowData.length;i++){
                if (rowData[i].borrowStatus!='借阅中'){
                    count++;
                }
            }

			if( count == 0 ){ //6待归还，7已领用
				window.top.$.messager.confirm("提示", "确认归还吗？", function (bool){
					if (bool === true) {

						var guihuanCount = 0;
						var token = getAdmitToken();
                        for(var i=0;i<rowData.length;i++){
                            //归还
                            var param ={ Id:rowData[i].ID , borrowStatus:'已归还'};
                            eform.dataset("return", param, function (result) {
                                if(result.ResultCode==0){
                                    guihuanCount++;
                                }
                            }, false);

                            var borrowInfo= {};
                            eform.dataset("selectById",{tableName:'borrowarchinfo',Id:rowData[i].ID}, function(result) {
                                borrowInfo = result.Data[0][0];
                            }, false);

                            //收回电子文件的权限
                            if(borrowInfo.brrowe){
                                var starter={};
                                eform.dataset("selectByGuId",{guid:borrowInfo.createId}, function(result) {
                                    starter = result.Data[0][0];
                                }, false);

                                var permissionList = [];
                                var json = {
                                    "MemberId": starter.user_identityID,
                                    "MemberType":1 ,//1用户，2部门，4职位，8用户组
                                    "PermType":10
                                }
                                permissionList.push(json);
                                var fileList = [];
                                eform.dataset("selectFileByEntityIds", {ids:("'"+borrowInfo.archiveId+"'")}, function (result) {
                                    fileList = result.Data[0];
                                }, false);
                                for(var j=0;j<fileList.length;j++){
                                    deleteFilePermission(fileList[j].FileId,permissionList,token);
                                }
                            }

                            //实物数量回退
                            if(borrowInfo.brrows){
                                var borrowNum = borrowInfo.brrownum;
                                var archiveId = borrowInfo.archiveId;
                                var archTypeId = borrowInfo.archTypeId;
                                var archTableName = '';
                                eform.dataset("selectById",{tableName:'arch_type',Id:archTypeId}, function(result) {
                                    archTableName = result.Data[0][0].arch_table_name;
                                }, false);
                                var entitynum=0;
                                var archRes = "";//档案条目详情
                                //根据条目id和后缀表名查询档案条目详情
                                eform.dataset("selectDetailByIdAndTableName", {tableName: archTableName, Id: archiveId, formType: '0'}, function (result) {
                                    archRes = result.Data[0][0];
                                    entitynum = archRes.entitynum;
                                }, false);
                                entitynum = parseFloat(entitynum) + parseFloat(borrowNum);
                                eform.dataset("updateEntityNumById",{tableName:archTableName,Id:archiveId,entitynum:entitynum}, function(result) {
                                    if(result.EffectOfRow>0){
                                        archRes.objectid=archRes.Id;
                                        archRes.entitynum = entitynum;
                                        insertES(archRes, archTableName);
                                    }
                                }, false);


                            }
                        }

                        if(guihuanCount>0){
                            window.top.$.messager.alert("提示", "操作成功！");
                            eform("eformListGrid1").method("load");//刷新列表
						}
					}});
			}else{
				window.top.$.messager.alert("提示", "借阅中的档案才可以归还！");
				return;
			}			
		}else{
			window.top.$.messager.alert("提示", "请先选择需要归还的档案！")
			return;
		}

	}

	callback && callback();// 最后一行,该行代码必须
});


function myIsNaN(value) {
    return typeof value === 'number' && !isNaN(value);
}

/**
 * 查询表单
 *@param archTypeId   档案类型id
 *@param archState      档案状态 0整编库，1档案库，2鉴定库，3销毁库，4回收站
 *@param formType     表单类型  0文件属性，1文件列表，2案卷属性，3案卷列表，4未组卷-文件列表，5归卷，6组卷
 **/
function selectArchTypeForm(archTypeId ,archState, formType ){
    var res = {}
    eform.dataset("Selectarchtype", {Id:archTypeId},function(result){
        res = result.Data[0][0];
    },false);
    if(formType=='0'){
        res.form_id = res.archPropFormId;
    }
    else if(formType=='1'){
        res.form_id = res.archListFormId;
    }
    else if(formType=='2'){
        res.form_id = res.dossierPropFormId;
    }
    else if(formType=='3'){
        res.form_id = res.dossierListFormId;
    }
    return res;
}


//获取admin的token
function getAdmitToken(){
    var token = '';
    eform.dataset("selectByKey", {tableName:'config',key:'adminToken'}, function(result) {
        if(result.Data[0] && result.Data[0][0]){
            token = result.Data[0][0].value;
        }
    }, false);
    return token;
}


//给文件分配权限
function setFilePermission(fileId,Permissions,token) {
    var host =  window.location.host;
    var rs = {};
    $.ajax({
        type: "POST",
        url: "/api/services/FilePermission/SetPermission",
        async:false,
        contentType:'application/json',
        data: JSON.stringify({
            "FileId": fileId,
            "Permissions": Permissions,
            "Token": token
        }),
        dataType: "json",
        success: function(res){
            rs = res
        }
    });
    return rs;
}


//删除文件的权限
function deleteFilePermission(fileId,Permissions,token) {
    var host =  window.location.host;
    var rs = {};
    $.ajax({
        type: "POST",
        url: "/api/services/FilePermission/DeleteFilePermission",
        async:false,
        contentType:'application/json',
        data: JSON.stringify({
            "FileId": fileId,
            "Mermbers": Permissions,
            "Token": token
        }),
        dataType: "json",
        success: function(res){
            rs = res
        }
    });
    return rs;
}


//插入es
function insertES(info,archTableName){

    var entityId = info.objectid;

    //通过档案ID 获取 电子文件
    var fileIds = [];
    var files = [];
    var filenames = [];
    eform.dataset("selectAttachmentByArch", {archID: entityId}, function (result) {
        if (result.Data) {
            var fileinfo = result.Data[0];
            for (var j = 0; j < fileinfo.length; j++) {
                var fileid = {"fileid": fileinfo[j].FileId};
                var filename = {"filename": fileinfo[j].Name};
                files.push(fileid);
                filenames.push(filename);
                fileIds.push(fileinfo[j].FileId);
            }
        }
    }, false);
    var sectIdPath = selectSectIdPath(info.sectid);
    var archTypeIdPath = selectArchTypeIdPath(info.archtypeid);
    info["sectIdPath"] = sectIdPath;
    info["archTypeIdPath"] = archTypeIdPath;
    info["sectAndArchTypePath"] = sectIdPath+"/"+archTypeIdPath;
    info["objectpath"]="0\\2\\";
    info["objectfactpath"]=["0\\2\\"];
    info["objecttype"]=2;
    //info["formid"]=archPropertyFormId;
    //info["sectname"]=sectname;
    //info["archtypename"]=archtypename;
    //info["archtypenamekeyword"]=archtypename;
    info["archTableName"]=archTableName;
    info["files"]=files;
    info["filenames"]=filenames;info["storageIdPath"]=sectStorageIdPath(entityId,"0");
    delete info.delayTime;
    $.ajax({
        type: "post",
        async: false,
        url: "/insight/search/indexDocument",
        data: {
            Id: entityId,
            Index: "uis_items",
            FileIds: fileIds,
            Data: JSON.stringify(info)
        },
        success: function (e) {
            console.log("插入ES成功");
        },
        error: function () {
            console.log("插入ES失败");
        }
    })
}



//查询 sectId 全路径
function selectSectIdPath(sectId){

    //sectId全路径
    var sectIdPath = "";
    var parentSectId = sectId;
    while (parentSectId && parentSectId!='0'){
        sectIdPath = parentSectId + "/" + sectIdPath;
        var curSect = [];
        eform.dataset("SelectSect", {Id: parentSectId}, function (result) {
            curSect = result.Data[0][0];
        }, false);
        if (curSect){

            parentSectId = curSect.parent_erms_sect_id;
        }
    }
    sectIdPath = sectIdPath.substring(0,sectIdPath.length-1);

    return sectIdPath;

}

//查询 archTypeId 全路径
function selectArchTypeIdPath(archTypeId){
    //archTypeId全路径
    var archTypeIdPath = "";
    var parentArchTypeId = archTypeId;
    while (parentArchTypeId && parentArchTypeId != '0') {
        archTypeIdPath = parentArchTypeId + "/" + archTypeIdPath;
        var curArchType = [];
        eform.dataset("Selectarchtype", {Id: parentArchTypeId}, function (result) {
            curArchType = result.Data[0][0];
        }, false);
        if (curArchType){

            parentArchTypeId = curArchType.parent_arch_type_id;
        }
    }
    archTypeIdPath = archTypeIdPath.substring(0,archTypeIdPath.length-1);

    return archTypeIdPath;
}
//查询库房id全路径
function sectStorageIdPath(entryId,ifDossier){
    var tableName = "";
    //ifDossier ：1案卷 0 档案
    if(ifDossier=="0"){
        tableName = "storage_arch_relation";
    }else if (ifDossier=="1"){
        tableName = "storage_dossier_relation";
    }
    var idPath = "";
    eform.dataset("selectIdPathByEntryId",{tableName:tableName,entryId:entryId},function(result){

        if(result.Data[0][0]){
            idPath=result.Data[0][0].idPath;
        }
    },false);
    return idPath;
}
