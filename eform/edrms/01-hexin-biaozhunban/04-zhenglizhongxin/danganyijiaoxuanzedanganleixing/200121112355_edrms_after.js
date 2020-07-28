//自定义一个全宗档案类型树
$('#eformHidden1').parent().append('<ul id="sectArchTypeTree"></ul>');

//全宗档案类型树
$('#sectArchTypeTree').tree({

    //展开节点
    onBeforeExpand:function(node){
        if(!node.hasChildren){
            var data = getSectArchTypeData(node.isSect,node.id);
            $('#sectArchTypeTree').tree('append', {
                parent: node.target,
                data:data
            });
        }
    }

    // 点击事件
    ,onClick: function (node) {

        if(node.state=='closed'){
            if(!node.hasChildren){
                var data = getSectArchTypeData(node.isSect,node.id);
                $('#sectArchTypeTree').tree('append', {
                    parent: node.target,
                    data:data
                });

            }
            $('#sectArchTypeTree').tree('expand', node.target);
        }

        var formid="";

        debugger;

        //全宗节点
        if(node.isSect=="1"){
            return false;
        }
        //档案类型节点
        else if(node.isSect=="2"){

            sectId = node.sectId;
            var	archTypeId=node.id;
            var resData = selectArchTypeForm(archTypeId , '0' , '0');//获取  文件属性
            formid = resData.form_id;
            eform("form_id").method("setValue",formid);

            $("#582b6234-ab1b-ef24-9160-8af8a3b84ef5").click();//触发新增按钮

        }

    }

});


//获取当前用户的信息
//console.log(eform.userInfo);
var userId = eform.userInfo.id;
var MainDepartmentId = eform.userInfo.MainDepartmentId; //当前用户部门id
var MainPositionId = eform.userInfo.MainPositionId; //当前用户职位id
var EveryoneId = top.window.globalvalue_everyoneId; //everyone用户组id
var userGroupIds = "'"+EveryoneId+"'";

var userGroupList = getUserGroupList();
//console.log(userGroupList);
if(userGroupList){
    for(var i=0;i<userGroupList.length;i++){
        userGroupIds = userGroupIds+ ",'"+userGroupList[i].ID+"'"
    }
}
//console.log(memberIds);
var hasPermSectIds = selectHasPermSectIds(userId,MainPositionId,MainDepartmentId,userGroupIds);//获取当前用户有权限的全宗id
var noPermSectIds = selectNoPermSectIds(userId,MainPositionId,MainDepartmentId,userGroupIds);//获取当前用户没有权限的全宗id
var noPermArchTypeIds = selectNoPermArchTypeIds(userId,MainPositionId,MainDepartmentId,userGroupIds);//获取当前用户没有权限的档案类型id

initSectArchTypeTree(hasPermSectIds,noPermSectIds, noPermArchTypeIds);//首次加载全宗档案类型树


/*
	获取当前用户有权限的全宗id
*/
function selectHasPermSectIds(userId,MainPositionId,MainDepartmentId,userGroupIds){
    var hasPermSectIds = "''";
    var param = {
        userId: userId
        ,MainPositionId: MainPositionId
        ,MainDepartmentId: MainDepartmentId
        ,userGroupIds: userGroupIds
        ,dataType: '0'
    }
    eform.dataset("selectHasPermSectIds",param,function(result){
        if(result.Data){
            var data = result.Data[0];
            for(var i=0;i<data.length;i++){
                hasPermSectIds = hasPermSectIds+",'" +data[i].data_id+"'"
            }
        }
    },false);

    return hasPermSectIds;
}

/*
	获取当前用户没有权限的全宗id
*/
function selectNoPermSectIds(userId,MainPositionId,MainDepartmentId,userGroupIds){
    var noPermSectIds = "''";
    var param = {
        userId: userId
        ,MainPositionId: MainPositionId
        ,MainDepartmentId: MainDepartmentId
        ,userGroupIds: userGroupIds
        ,dataType: '0'
    }
    eform.dataset("selectNoPermSectIdsOrArchTypeIds",param,function(result){
        if(result.Data){
            var data = result.Data[0];
            for(var i=0;i<data.length;i++){
                noPermSectIds = noPermSectIds+",'" +data[i].data_id+"'"
            }
        }
    },false);
    return noPermSectIds;
}


/*
	获取当前用户没有权限的档案类型id
*/
function selectNoPermArchTypeIds(userId,MainPositionId,MainDepartmentId,userGroupIds){
    var noPermArchTypeIds = "''";
    var param = {
        userId: userId
        ,MainPositionId: MainPositionId
        ,MainDepartmentId: MainDepartmentId
        ,userGroupIds: userGroupIds
        ,dataType: '1'
    }
    eform.dataset("selectNoPermSectIdsOrArchTypeIds",param,function(result){
        if(result.Data){
            var data = result.Data[0];
            for(var i=0;i<data.length;i++){
                noPermArchTypeIds = noPermArchTypeIds+",'" +data[i].data_id+"'"
            }
        }
    },false);

    return noPermArchTypeIds;
}



/*
	首次加载全宗档案类型树
*/
function initSectArchTypeTree(hasPermSectIds,noPermSectIds, noPermArchTypeIds){
    var param1 = {
        id:'0'
        ,hasPermSectIds:hasPermSectIds
        ,noPermSectIds:noPermSectIds
        ,noPermArchTypeIds:noPermArchTypeIds
    };

    eform.dataset("selectFirstLevelSect", param1, function (result) {
        //console.log(result);
        if(result.Data){

            var data = result.Data[0];

            var rootObj = {"id": "0", "iconCls": "sectcss", "isSect": 1, "is_dossier": 0, "pId": "", "state": "open", "text": "全宗", "children": data }; //定义树形root数据

            var newTree = [];  //申明新的全宗/档案类型数组

            newTree.push(rootObj); //加入顶级元素

            $('#sectArchTypeTree').tree({
                data: newTree
            });
        }

    }, false);

}

//根据父id获取全宗 或 档案类型
function getSectArchTypeData(isSect,id){
    var data = [];
    var param = {
        noPermSectIds:noPermSectIds
        ,noPermArchTypeIds:noPermArchTypeIds
        ,id:id
    };
    if(isSect==1){
        eform.dataset("selectSubLevelSect4MoveArch", param, function (result) {
            data = result.Data[0];
        }, false);
    }else 	if(isSect==2){
        eform.dataset("selectSubLevelArchType4MoveArch", param, function (result) {
            data = result.Data[0];
        }, false);
    }
    return data;
}



//获取当前用户的用户组列表
function getUserGroupList(){
    var token = $.cookie("token");
    var host =  window.location.host;
    var data = [];
    $.ajax({
        type: "GET",
        url: "/api/services/OrgUserGroup/GetGroupListOfUserByUserId",
        async:false,
        data: {
            token:token
            ,userId:eform.userInfo.id
        },
        dataType: "json",
        success: function(res){
            data = res.data
        }
    });
    return data;
}

var info = eform.parentForm("eformListGrid1").method("getSelectedRows"); //获取父页面的值




var fileArr=[];
var fileTransferIds = '';

for(var i=0;i<info.length;i++){

    fileTransferIds += ','+info[i].ID;
	var myDate = new Date();
    var fileJson = {
        "Name":info[i].name,
        "FileId":info[i].file_id,
        "RefID": "", // 没有不传
        "Creator": eform.userInfo.IdentityId,  // 自增id
        "CreateTime":myDate,
        "ModifiedTime": myDate,
        "ModifyOperator": eform.userInfo.IdentityId,  // 自增id
        "FileSize": "10MB",
        "VersionId": "555",
        "NewestVersion": "最新版本号",
        "Version": "1.0",
        "FullPat": "全路径"
    }

    fileArr.push(fileJson);

}

if(fileTransferIds){
    fileTransferIds = fileTransferIds.substring(1);
}
eform("fileInfos").method("setValue",$.toJSON(fileArr));
eform("fileTransferIds").method("setValue",fileTransferIds);



eform("eformListGrid2").method("onUrlFormatter",function (url, operateBtn) {
    var form_id=eform("form_id").method("getValue");
    if(operateBtn.formName== "新增"){
        var newFormUrl = eform.virtualPath + '/index?formid='+form_id+'&formver=0&ifMoveFile=1&entrystate=0&viewtype=0';
        return  newFormUrl;
    }
});


eform("eformListGrid2").method("childFormButtonEvent",function (formId, ids, name, callback){
    if(name == "保存"){
        eform("eformListGrid2").method("getControl").ChildFormDialog.iframe[0].contentWindow.window.save(function(){
            eform("eformListGrid2").method("getControl").ChildFormDialog.close();
            eform("eformListGrid2").method("load"); //父页面表格刷新
            eform.parentForm("eformListGrid1").method("getControl").ChildFormDialog.close();
            eform.parentForm("eformListGrid1").method("load");
        });
    }


    callback && callback(); // 最后一行,该行代码必须
});


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