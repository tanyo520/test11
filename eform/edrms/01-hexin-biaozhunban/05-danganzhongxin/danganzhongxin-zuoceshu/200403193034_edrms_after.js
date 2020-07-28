// $('body>div:first-child').css('display',$('body>div:first-child')[0].className=='image'?"none":'block');

var EveryoneId = top.window.globalvalue_everyoneId; //everyone用户组id
var defaultFormId = "200305232631_edrms&page=arch";//档案默认页表单id
var archState = $.getQueryString("archState");//档案状态 0整编库，1档案库，2鉴定库，3销毁库，4回收站
//console.log(archState)
//自定义一个全宗树
var height = $(document).height();//浏览器当前窗口文档的高度
$('#eformPlaceholder1').parent().append('<div style="margin:0px;height:'+(height-5)+'px;overflow:auto;"><ul id="sectArchTypeTree"></ul></div>');
$('.formBlock ').css('margin-top','0px');//去除全宗树上方空白


//全宗档案类型树
$('#sectArchTypeTree').tree({

	//展开节点
	onBeforeExpand:function(node){
		if(!node.hasChildren){
			var data = getSectArchTypeData(node.isSect,node.id);

			if(node.is_dossier==1){
                data.unshift({
                    archTypeId:node.id
                    ,text:'文件集'
                    ,pId:node.id
                    ,sectId:node.sectId
                    ,isSect:3
                    ,is_dossier:'arch'
                    ,iconCls:'wenjianjicss'
                },{
                    archTypeId:node.id
                    ,text:'案卷集'
                    ,pId:node.id
                    ,sectId:node.sectId
                    ,isSect:3
                    ,is_dossier:'dossier'
                    ,iconCls:'anjuanjicss'
                });
			}

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

                if(node.is_dossier==1){
                    data.unshift({
                        archTypeId:node.id
                        ,text:'文件集'
                        ,pId:node.id
                        ,sectId:node.sectId
                        ,isSect:3
                        ,is_dossier:'arch'
                        ,iconCls:'wenjianjicss'
                    },{
                        archTypeId:node.id
                        ,text:'案卷集'
                        ,pId:node.id
                        ,sectId:node.sectId
                        ,isSect:3
                        ,is_dossier:'dossier'
                        ,iconCls:'anjuanjicss'
                    });
                }

                $('#sectArchTypeTree').tree('append', {
                    parent: node.target,
                    data:data
                });
            }
            $('#sectArchTypeTree').tree('expand', node.target);
		}

		var formid= defaultFormId;
		var archTypeId="";
		var sectId = node.sectId;

		var isSect = node.isSect;

		//档案类型
		if(isSect=="2"){

			if(node.is_dossier=="0"){

				archTypeId=node.id;

				var resData = selectArchTypeForm(node.id, 0, '1');//获取文件列表表单
				formid = resData.form_id;

			}
		}

		//已立卷档案类型的下级节点
		else if(isSect=="3"){

			archTypeId=node.archTypeId;

			if(node.is_dossier=="arch"){
				var resData = selectArchTypeForm(archTypeId, 0, '1' );//获取 文件列表表单id
				formid = resData.form_id;
			}
			else if(node.is_dossier=="dossier"){
				var resData = selectArchTypeForm(archTypeId, 0, '3' );//获取 案卷列表表单id
				formid = resData.form_id;
			}

		}

        var ifLastLevel = top.window.globalvalue_ifLastLevel; //是否只允许操作末级类型 1是
        var defaultFormId = "200305232631_edrms";//默认页表单id
        var src = "/eform/index?formid="+defaultFormId+"&skin=techblue&page=arch";
		if((ifLastLevel!='1' || (ifLastLevel=='1'&& !node.hasChildren)) && sectId && archTypeId ){
            src = "/eform/index?formid="+formid+"&skin=techblue&sectId="+sectId+"&archTypeId="+archTypeId+
                "&isSect="+isSect+"&entrystate="+archState;
		}
        $(top.document).find("iframe").eq(1).attr("src",src);
		
	}
	,onDblClick:function(node){
        $('#sectArchTypeTree').tree('collapse',node.target);
	}

});


//获取当前用户的信息
//console.log(eform.userInfo);
var userId = eform.userInfo.id;
var MainDepartmentId = eform.userInfo.MainDepartmentId; //当前用户部门id
var MainPositionId = eform.userInfo.MainPositionId; //当前用户职位id
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
		console.log(result);
		if(result.Data){
			console.log(result.Data[0]);

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
		eform.dataset("selectSubLevelSect", param, function (result) {
			data = result.Data[0];
		}, false);
	}else 	if(isSect==2){
		eform.dataset("selectSubLevelArchType", param, function (result) {
			data = result.Data[0];
		}, false);
	}
	return data;
}



//获取当前用户的用户组列表
function getUserGroupList(){
	var token = $.cookie("token");
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