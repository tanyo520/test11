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
                                eform.dataset("selectById",{tableName:archTableName,Id:archiveId}, function(result) {
                                    entitynum = result.Data[0][0].entitynum;
                                }, false);
                                entitynum = parseFloat(entitynum) + parseFloat(borrowNum);
                                eform.dataset("updateEntityNumById",{tableName:archTableName,Id:archiveId,entitynum:entitynum}, function(result) {
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


//获取admin的token
function getAdmitToken(){
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