var height = $(document).height();//浏览器当前窗口文档的高度

height = height-126;

//自定义一个全宗档案类型树
$('#eformHidden1').parent().append('<div style="margin:0px;height:'+height+'px;overflow:auto;"><ul id="sectArchTypeTree"></ul></div>');
$('#bb0b1269-770d-f6aa-64be-860869f1db52').css('margin-top','0px');//去除全宗档案类型树上方空白

initSectArchTypeTree(1,0);//初始化 全宗档案类型树


//全宗档案类型树
$('#sectArchTypeTree').tree({

	//展开节点
	onBeforeExpand:function(node){
		//console.log(node);
		if(!node.hasChildren){
			var data = getSectArchTypeData(node.isSect,node.id);
			$('#sectArchTypeTree').tree('append', {
				parent: node.target,
				data: data
			});
		}
	}

	// 点击事件
	,onClick: function(node){
		//console.log(node);
		if(node.state=='closed'){
            if(!node.hasChildren){
                var data = getSectArchTypeData(node.isSect,node.id);
                $('#sectArchTypeTree').tree('append', {
                    parent: node.target,
                    data: data
                });
            }
            $('#sectArchTypeTree').tree('expand', node.target);
		}

		var parentIds = "'"+node.id+"'";
		var folderId = node.folderId;
		var root = node;
		var parent = $('#sectArchTypeTree').tree('getParent',node.target);
		while(parent){
			if(parent.id==0){
				break;
			}
			root = parent;
				parentIds=parentIds+",'"+parent.id+"'"
				parent = $('#sectArchTypeTree').tree('getParent',parent.target);
		}
		//console.log(root);

		var formId = "200310103605_edrms"; //数据权限配置表单id
		if(node.id==0){
			formId = "200305232631_edrms&page=dataPermission";//默认页面表单id
		}
		var src = window.location.protocol+"//"+window.location.host+"/eform/index?formid="+formId+"&skin=techblue&Id="+node.id+"&pId="+node.pId
		+"&rootId="+root.id+"&isSect="+node.isSect+"&parentIds="+parentIds+"&name="+node.text+"&folderId="+folderId
		$(top.document).find("iframe").eq(1).attr("src",src);

	}
    ,onDblClick:function(node){
        $('#sectArchTypeTree').tree('collapse',node.target);
    }

});


//首次加载全宗档案类型树
function initSectArchTypeTree(isSect,id){
	var data =  getSectArchTypeData(isSect,id);

	var rootObj = {
		"id": "0"
		, "iconCls": "sectcss"
		, "isSect": 1
		, "is_dossier": 0
		, "pId": ""
		, "folderId":17
		, "state": "open"
		, "text": "全宗和档案类型"
		, "children": data
	}; //定义树形root数据

	var newTree = [];  //申明新的全宗/档案类型数组

	newTree.push(rootObj); //加入顶级元素

	$('#sectArchTypeTree').tree({
		data: newTree
	});
}


//根据父id获取全宗 或 档案类型
function getSectArchTypeData(isSect,id){
	var data = [];
	var param = {
		id:id
	};
	if(isSect==1){
		eform.dataset("selectSectArchTypeTree", param, function (result) {
			data = result.Data[0];
		}, false);
	}else 	if(isSect==2){
		eform.dataset("selectSectArchTypeTree2", param, function (result) {
			data = result.Data[0];
		}, false);
	}
	return data;
}