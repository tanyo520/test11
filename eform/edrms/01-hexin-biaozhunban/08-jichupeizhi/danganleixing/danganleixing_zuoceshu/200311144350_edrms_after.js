var height = $(document).height();//浏览器当前窗口文档的高度
height = height-160;

var propertyFormId = '200311161120_edrms';//档案类型属性表单
var defaultFormId = "200305232631_edrms";//档案类型默认页表单id

//自定义一个全宗档案类型树
$('#eformHidden1').parent().append('<div style="margin:0px;height:'+height+'px;overflow:auto;"><ul id="sectArchTypeTree"></ul></div>');
$('#7d8f3673-fdb3-cc72-45c8-d2e7fdfe4cfc').css('margin-left','7px')//调整新增档案类型按钮距左距离
$('#eformButton1').css('padding-bottom','0px');//调整新增档案类型按钮距下距离

initSectArchTypeTree(1,0);//树初始化

var u_data_id;

//全宗档案类型树
$('#sectArchTypeTree').tree({

	//展开节点
	onBeforeExpand:function(node){

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

		eform("sectTreeId").method('setValue',node.id);
		eform("level").method('setValue',node.level);
		eform("isSect").method('setValue',node.isSect);
		eform("sectId").method('setValue',node.sectId);
		eform("folderId").method('setValue',node.folderId);

		if(node.isSect==2){
			var src = window.location.protocol+"//"+window.location.host+"/eform/index?formid="+propertyFormId+"&skin=techblue&Id="+node.id+"&viewtype=1";
			$(top.document).find("iframe").eq(1).attr("src",src);

		}else{
			var rightSrc = window.location.protocol+"//"+window.location.host+"/eform/index?formid="+defaultFormId+"&skin=techblue&page=archType";
			$(top.document).find("iframe").eq(1).attr('src',rightSrc);//右侧默认页
		}

	}
    ,onDblClick:function(node){
        $('#sectArchTypeTree').tree('collapse',node.target);
    }
});


//首次加载全宗档案类型树
function initSectArchTypeTree(isSect,id){

	var data =  getSectArchTypeData(isSect,id);

	var rootObj = {//定义树形root数据
		"id": "0"
		, "iconCls": "sectcss"
		, "isSect": 1
		, "is_dossier": 0
		, "pId": ""
		, "folderId":'0'
		, "state": "open"
		, "text": "全宗和档案类型"
		, "children": data
	};

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



// 按钮点击事件
eform("eformButton1").method("onClick",function (buttonName, buttonId) {

	if(buttonId == "7d8f3673-fdb3-cc72-45c8-d2e7fdfe4cfc"){//新增档案类型

		var nodeid=eform("sectTreeId").method("getValue");
		var isSect=eform("isSect").method("getValue");
		var level=eform("level").method("getValue");
		var sectId=eform("sectId").method("getValue");
		var folderId = eform("folderId").method("getValue");

		if(nodeid=="" || nodeid=="0"){
			window.top.$.messager.alert("提示", "请选择一个全宗或档案类型！");
			return false;
		}

		var src = window.location.protocol+"//"+window.location.host+"/eform/index?formid="+propertyFormId+"&skin=techblue&treeId="+nodeid
		+"&level="+level+"&isSect="+isSect+"&sectId="+sectId+"&parentFolderId="+folderId+"&viewtype=0";

		$(top.document).find("iframe").eq(1).attr("src",src);

	}

});