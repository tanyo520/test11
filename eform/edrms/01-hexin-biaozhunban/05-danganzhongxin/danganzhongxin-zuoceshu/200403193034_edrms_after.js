var EveryoneId = top.window.globalvalue_everyoneId; //everyone用户组id
var defaultFormId = "200305232631_edrms&page=arch";//档案默认页表单id
var archState = $.getQueryString("archState");//档案状态 0整编库，1档案库，2鉴定库，3销毁库，4回收站
//console.log(archState)
//自定义一个全宗树
var height = $(document).height();//浏览器当前窗口文档的高度
$('#eformPlaceholder1').parent().append('<div style="margin:0px;height:'+(height-110)+'px;overflow:auto;"><ul id="sectArchTypeTree"></ul></div>');
$('#8cbf5e27-ea93-5648-6fce-00b4e709d2c9').css('margin-top','0px');//去除全宗树上方空白

//全宗档案类型树
$('#sectArchTypeTree').tree({

	//展开节点
	onBeforeExpand:function(node){
		if(!node.hasChildren){
			var data = getSectArchTypeData(node.isSect,node.id);

			if(node.is_dossier==1){
				data.push({
					archTypeId:node.id
					,text:'文件集'
					,pId:node.id
					,sectId:node.sectId
					,isSect:3
					,is_dossier:'arch'
					,iconCls:'wenjianjicss'
				});
				data.push({
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
                    data.push({
                        archTypeId:node.id
                        ,text:'文件集'
                        ,pId:node.id
                        ,sectId:node.sectId
                        ,isSect:3
                        ,is_dossier:'arch'
                        ,iconCls:'wenjianjicss'
                    });
                    data.push({
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

			debugger;

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

        var src = "/eform/index?formid="+formid+"&skin=techblue&sectId="+sectId+"&archTypeId="+archTypeId+
			"&isSect="+isSect+"&entrystate="+archState;
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
	var host =  window.location.host;
	var data = [];
	$.ajax({
		type: "GET",
		url: window.location.protocol+"//"+host+"/api/services/OrgUserGroup/GetGroupListOfUserByUserId",
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