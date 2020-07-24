debugger;
var reBorrowIds='';

var exBorrowId = '';
var borrowType = $.getQueryString("borrowType"); // first：第一次，renew：续借
var archInfoId = $.getQueryString("archInfoId");
// taskType=inboxtask
var taskType = $.getQueryString("taskType");

if(borrowType!='first'){
	//隐藏  编辑 操作按钮
}

var borrowCarIdArray = [];

if(borrowType){

    eform("borrowType").method("setValue",borrowType);

    //从搜索结果、首页档案详情页、利用中心发起的借阅
    if(archInfoId){
        var archTypeId = $.getQueryString("archTypeId");
        var archTableName = "";
        var archtypename = "";
        var sectId = "";
        var archInfo = {};
        eform.dataset("Selectarchtype", {Id: archTypeId}, function (result) {
            archTableName = result.Data[0][0].arch_table_name;
            archtypename = result.Data[0][0].name;
            sectId = result.Data[0][0].sect_id;
        }, false,false);
        var sectname = "";
        eform.dataset("SelectSect", {Id: sectId}, function (result) {
            var data = result.Data[0][0];
            sectname = data.name;
        }, false,false);
        eform.dataset("selectArchById", {tableName: archTableName, archId: archInfoId}, function (result1) {
            archInfo = result1.Data[0][0];
        }, false,false);
        borrowCarIdArray.push(archInfo.ID);
        var param = {
            Id: $.genId()
            , createId: eform.userInfo.id
            , updateId: eform.userInfo.id
            , sectName: sectname
            , archTypeName: archtypename
            , name: archInfo.name
            , number: archInfo.number
            , brrowid: eform.recordId
            , borrowStatus: '借阅审核中'
            , sectId: archInfo.sectid
            , archTypeId: archInfo.archtypeid
            , formId: ' '
            , archiveId: archInfo.Id
            , flag: '0'
            , ifRenew: '否'
			, startUseTime:'9999-12-31 23:59:59'
        }
        eform.dataset("insertBorrowArchNew", param, function (result1) {
            //插入借阅流程详情表
        }, false);
	}

	//从借阅车发起的借阅 或者 续借
	else{

        //获取父页面 被选中的档案
        var archList = eform.parentForm("eformListGrid1").method("getSelectedRows"); //获取父页面查询列表被选中的值

        for(var i=0;i<archList.length;i++){

            var archInfo = archList[i];

            if(borrowType=='renew'){ //续借
                exBorrowId=archInfo.brrowid;

                var param = {
                    Id:archInfo.ID
                };

                eform.dataset("selectBorrowArchInfo", param, function (result) {

                    if(result.Data){
                        var data=result.Data[0][0];
                        data.borrowStatus = '借阅审核中';
                        data.flag = '0';
                        data.brrowid = eform.recordId;
                        data.exId = data.Id;
                        data.ifRenew = '是';
                        data.Id = $.genId();
                        eform.dataset("insertBorrowArch", data, function (result1) {
                        }, false);

                    };
                }, false);
                reBorrowIds = reBorrowIds + ",'" + archList[i].ID + "'";
            }

            //第一次借阅
            else{
                borrowCarIdArray.push(archInfo.ID);

                var param = {
                    Id:$.genId()
                    , createId:eform.userInfo.id
                    , updateId:eform.userInfo.id
                    , sectName:archInfo.sectName
                    , archTypeName:archInfo.archTypeName
                    , name:archInfo.name
                    , number:archInfo.number
                    , brrowid:eform.recordId
                    , borrowStatus:'借阅审核中'
                    , sectId:archInfo.sectId
                    , archTypeId:archInfo.archTypeId
                    , formId:archInfo.formId
                    , archiveId:archInfo.archiveId
                    , flag:'0'
                    , ifRenew:'否'
                    , startUseTime:'9999-12-31 23:59:59'
                }

                eform.dataset("insertBorrowArchNew", param, function (result1) {
                }, false);

            }



        }

	}

	//重新加载数据表格
	eform("eformDataTable1").method("load");
}

//重定义数据表格按钮跳转路径
eform("eformDataTable1").method("onUrlFormatter",function (url, operateBtn) {

    var row = eform("eformDataTable1").method("getSelectedRow");

    if(operateBtn.formName== "查看" ){
        var Id = row.Id==null?row.ID:row.Id;
        var newFormUrl = eform.virtualPath+'/index?formid=200206212742_edrms&Id='+Id;
        return  newFormUrl;
    }

    if(operateBtn.formName== "编辑" ){
        var Id = row.Id==null?row.ID:row.Id;
        var newFormUrl = eform.virtualPath+'/index?formid=200206212742_edrms&Id='+Id+'&viewType=1';
        return  newFormUrl;
    }
});

//子窗体按钮
eform("eformDataTable1").method("childFormButtonEvent", function (formId, ids, name, callback) {
    if (name == "保存") {
        eform("eformDataTable1").method("getControl").ChildFormDialog.iframe[0].contentWindow.window.save(function () {
            eform("eformDataTable1").method("getControl").ChildFormDialog.close();
            eform("eformDataTable1").method("load"); //父页面表格刷新
        });
    }
    callback && callback(); // 最后一行,该行代码必须
});


//流程提交前事件
eform("eformWorkFlowButton1").method("beforeSubmit", function (action){

	if (action === eform.wf.actionType.initiate){ // 判断是发起流程

		var param = {
			brrowid: eform.recordId
		}
		var msgTotal = '';
		eform.dataset("selectByBrrowId", param, function (result) {

            var checker = eform("archuser").method("getValue");
            if(!checker){
                msgTotal+='请选择审核人员！<br>';
            }

			var arr = result.Data[0];

			for(var i=0;i<arr.length;i++){
				var msg = '';
				if(!arr[i].brrowday){
					msg+='请完善借阅方式等信息'
				}else if(!isPositiveInteger(arr[i].brrowday)){
                    msg+='请完善借阅方式等信息'
				}

                var borrowInfo = arr[i];
                //实物数量判断
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
                    if(parseFloat(borrowNum)>parseFloat(entitynum)){
                        msg='借阅数量超过库存数量'
                    }
                }

				if(msg){
					msg = '第'+(i-(-1))+'行 '+msg+'<br>'
				}

				msgTotal+=msg;
			}


		}, false);
		if(msgTotal){
			window.top.$.messager.alert("提示", msgTotal);
			return false;
		}

	}

});


// 流程提交后事件
eform("eformWorkFlowButton1").method("afterSubmit", function (param){

    debugger;
	// 判断流程提交成功
	if (param.result === true){

		//首次发起
		if (param.action === eform.wf.actionType.initiate){

            var checker = eform("archuser").method("getValue");
            checker = JSON.parse(checker);

            //续借
			if(borrowType=='renew'){
				//1. 将续借的档案改成 已续借
				//获取父页面 被选中的档案
                if (reBorrowIds){
                    reBorrowIds=  reBorrowIds.substring(1);
                    var param1 = {
                        ids: reBorrowIds
                        ,borrowStatus:'已续借'
                    };
                    eform.dataset("updateBorrowStatusById", param1, function (result1) {
                    }, false);
				}
			}

            //从借阅车中删除 已发起借阅的档案
			else{
				var ids = "";
				for(var i=0;i<borrowCarIdArray.length;i++){
					ids += ",'"+borrowCarIdArray[i]+"'";
				}
				ids = ids.substring(1);
				var param4deleteBorrowCar ={
					ids:ids
				}
				eform.dataset("deleteBorrowInfo",param4deleteBorrowCar, function (result) {
				}, false);

                var list = [];
                eform.dataset("selectByBrrowId",{brrowid:eform.recordId}, function (result) {
                    list = result.Data[0];
                }, false);
                for(var i=0;i<list.length;i++){
                    var borrowInfo = list[i];
                    //实物数量减少
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
                        entitynum = parseFloat(entitynum) - parseFloat(borrowNum);
                        eform.dataset("updateEntityNumById",{tableName:archTableName,Id:archiveId,entitynum:entitynum}, function(result) {
                        }, false);
                    }
                }

			}

			//2. 将新流程的档案flag改为1 updateFlagByBorrowId
			var param2 = {
				brrowid: eform.recordId
				,flag:'1'
			};
			eform.dataset("updateFlagByBorrowId", param2, function (result1) {
			}, false);

			//3.赋予审批人预览权限
            if(true){
                var memberPermissionList = [];
                var json = {
                    "MemberId": checker[0].identityId,
                    "MemberType":1 ,//1用户，2部门，4职位，8用户组
                    "PermCateId": 2 //文件预览权限
                }
                memberPermissionList.push(json);

                var archIds = "";
                var list = [];
                eform.dataset("selectByBrrowId",{brrowid:eform.recordId}, function (result) {
                    list = result.Data[0];
                }, false);
                for(var i=0;i<list.length;i++){
                    archIds+=",'"+list[i].archiveId+"'";
                }
                archIds = archIds.substring(1);
                var fileList = [];
                eform.dataset("selectFileByEntityIds", {ids:archIds}, function (result) {
                    fileList = result.Data[0];
                }, false);
                var token = getAdmitToken();
                for(var i=0;i<fileList.length;i++){
                    setFilePermission(fileList[i].FileId,memberPermissionList,token);
                }
            }

            try{
                if(archInfoId){
                    window.setTimeout(function(){
                    parent.$('.panel-tool-close').click();
                },1000);
                }else{
                    eform.parentForm("eformListGrid1").method("load"); //父页面表格刷新
                    eform.parentForm("eformListGrid1").method("getControl").ChildFormDialog.close();
                }

            }catch(e){
                window.top.$.messager.alert("提示", e);
            }

		}

		//同意
		else if (param.action === eform.wf.actionType.approve){

            borrowType = eform("borrowType").method("getValue");

			//同意 审批后，将状态改成“待领用”；
			var param1 = {
				brrowid: eform.recordId
				,borrowStatus:'待领用'
				,ifRenew:'否'
			};

			//第一次借阅
			if(borrowType!='renew'){
				eform.dataset("updateBorrowStatusByBorrowId", param1, function (result1) {
				}, false);
			}

			//续借
			else{
				//如果是续借，4.2.1直接将状态改成“已领用”
				param1.ifRenew='是';
				param1.borrowStatus='借阅中';
				eform.dataset("updateBorrowStatusByBorrowId", param1, function (result1) {
				}, false);

                var starter = {}
				//4.2.2 然后修改领用时间和归还时间
				var param = {
					brrowid: eform.recordId
				}
				eform.dataset("selectByBrrowId", param, function (result) {
					debugger;
                    var arr = result.Data[0];

                    eform.dataset("selectByGuId",{guid:arr[0].createId}, function(result) {
                        starter = result.Data[0][0];
                    }, false);

                    var token = getAdmitToken();
					for(var i=0;i<arr.length;i++){
						if(arr[i].ifRenew=='是'){

							var borrowDays = arr[i].brrowday;
							var startUseTime = arr[i].startUseTime;

							var returnTime = arr[i].returnTime;
							returnTime = new Date(new Date(returnTime).getTime()+parseFloat(borrowDays)*3600000*24);
							returnTime = eform.dateFormat(returnTime,"yyyy-MM-dd hh:mm:ss");

							var param2 ={ Id:arr[i].Id
										 , borrowStatus:'已领用'
										 ,startUseTime:startUseTime
										 ,returnTime:returnTime};
							eform.dataset("draw", param2, function (result1) {
							}, false);

                            //电子文件赋予借阅人权限
							var  PermCateId = '2';//预览权限
                            if(arr[i].brrowe){
                                if(arr[i].brrowe.indexOf('打印')!=-1){
                                    PermCateId = '6';//管理权限
                                }
                                else if(arr[i].brrowe.indexOf('下载')!=-1){
                                    PermCateId = '3';//下载权限
                                }

                                var permissionList = [];
                                var json = {
                                    "MemberId": starter.user_identityID,
                                    "MemberType":1 ,//1用户，2部门，4职位，8用户组
                                    "PermCateId": PermCateId,
                                    "StartTime":startUseTime,
                                    "ExpiredTime":new Date(returnTime)
                                }
                                permissionList.push(json);

                                var fileList = [];
                                eform.dataset("selectFileByEntityIds", {ids:("'"+arr[i].archiveId+"'")}, function (result) {
                                    fileList = result.Data[0];
                                }, false);
                                for(var j=0;j<fileList.length;j++){
                                    setFilePermission(fileList[j].FileId,permissionList,token);
                                }
                            }
						}
					}
				}, false);
			}


			//删除审核人预览权限
            var auditor = {};
            eform.dataset("selectById",{tableName:'borrow',Id:eform.recordId}, function(result) {
                auditor = JSON.parse(result.Data[0][0].archuser)[0];
            }, false);
            if(true){
                var memberPermissionList = [];
                var json = {
                    "MemberId": auditor.identityId,
                    "MemberType":1 ,//1用户，2部门，4职位，8用户组
                    "PermType": 10 //分配权限
                }
                memberPermissionList.push(json);

                var archIds = "";
                var list = [];
                eform.dataset("selectByBrrowId",{brrowid:eform.recordId}, function (result) {
                    list = result.Data[0];
                }, false);
                for(var i=0;i<list.length;i++){
                    archIds+=",'"+list[i].archiveId+"'"
                }
                archIds = archIds.substring(1);
                var fileList = [];
                eform.dataset("selectFileByEntityIds", {ids:archIds}, function (result) {
                    fileList = result.Data[0];
                }, false);
                var token = getAdmitToken();
                for(var i=0;i<fileList.length;i++){
                    deleteFilePermission(fileList[i].FileId,memberPermissionList,token);
                }
            }

		}

		//终止
		else if(param.action === eform.wf.actionType.cancel){

            var param = {
                brrowid: eform.recordId
                ,borrowStatus:'借阅失败'
                ,ifRenew:'否'
            };
            eform.dataset("updateBorrowStatusByBorrowId", param, function (result1) {
            }, false);

            //删除审核人预览权限
            var auditor = {};
            eform.dataset("selectById",{tableName:'borrow',Id:eform.recordId}, function(result) {
                auditor = JSON.parse(result.Data[0][0].archuser)[0];
            }, false);
            if(true){
                var memberPermissionList = [];
                var json = {
                    "MemberId": auditor.identityId,
                    "MemberType":1 ,//1用户，2部门，4职位，8用户组
                    "PermType": 10 //分配权限
                }
                memberPermissionList.push(json);

                var archIds = "";
                var list = [];
                eform.dataset("selectByBrrowId",{brrowid:eform.recordId}, function (result) {
                    list = result.Data[0];
                }, false);
                for(var i=0;i<list.length;i++){
                    archIds+=",'"+list[i].archiveId+"'"
                    var borrowInfo = list[i];
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
                archIds = archIds.substring(1);
                var fileList = [];
                eform.dataset("selectFileByEntityIds", {ids:archIds}, function (result) {
                    fileList = result.Data[0];
                }, false);
                var token = getAdmitToken();
                for(var i=0;i<fileList.length;i++){
                    deleteFilePermission(fileList[i].FileId,memberPermissionList,token);
                }

            }
		}
	}
});


if(taskType != "begintask" && eform.wf.currentActivity.activityNo != "firstTask"){
	debugger;
    var blockinfo=window.eform.getBlocks();
    for(var i=0;i<blockinfo.length;i++){
        eform.setReadonly(blockinfo[i].id,true, eform.objType.block);
    }
}

//是否为正整数
function isPositiveInteger(s){
    if(s==0){
        return false;
    }
    var re = /^[0-9]+$/ ;
    return re.test(s)
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