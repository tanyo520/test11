//自定义一个字典树
var height = $(document).height();//浏览器当前窗口文档的高度
$('#eformHidden1').parent().append('<div style="margin:0px;height:'+(height-150)+'px;overflow:auto;"><ul id="dictTree"></ul></div>');
$('#7d8f3673-fdb3-cc72-45c8-d2e7fdfe4cfc').css('margin-left','7px')//调整新增字典按钮距左距离
$('#eformButton1').css('padding-bottom','0px');//调整新增字典按钮距下距离

initDictTree();//首次加载树

/*
	首次加载树
*/
function initDictTree(){
	var data = [];
	var param1 = {
		level:'1'
	};
	eform.dataset("selectDictByLevel", param1, function (result) {
		if(result.Data){
			data = result.Data[0];
		}
	}, false);

	var rootObj = {//定义树形root数据
		"id": "0"
		, "pId": ""
		, "state": "open"
		, "text": "字典管理"
		,"level":"0"
		, "children": data
	};

	var newTree = [];  //申明新的数组

	newTree.push(rootObj); //加入顶级元素

	$('#dictTree').tree({
		data: newTree
	});
}

//树监听事件
$('#dictTree').tree({

	//展开节点
	onBeforeExpand:function(node){

		if(!node.hasChildren){
			var data = [];
			eform.dataset("selectDictByParentId", {id:node.id}, function (result) {
				if(result.Data){
					data = result.Data[0];
				}
			}, false);
			$('#dictTree').tree('append', {
				parent: node.target,
				data: data
			});
		}
	}

	// 点击事件
	,onClick: function(node){

        if(node.state=='closed'){
            if(!node.hasChildren){
                var data = [];
                eform.dataset("selectDictByParentId", {id:node.id}, function (result) {
                    if(result.Data){
                        data = result.Data[0];
                    }
                }, false);
                $('#dictTree').tree('append', {
                    parent: node.target,
                    data: data
                });
            }
            $('#dictTree').tree('expand', node.target);
		}

		eform("Id").method('setValue',node.id);
		eform("level").method('setValue',node.level);

		var formId = "200227212923_edrms"; //字典编辑表单id
		if(node.id==0){
			formId = "200305232631_edrms&page=dict";//默认页面表单id
		}
		var src = "/eform/index?formid="+formId+"&skin=techblue&Id="+node.id;
		$(top.document).find("iframe").eq(1).attr("src",src);

	}
    ,onDblClick:function(node){
        $('#dictTree').tree('collapse',node.target);
    }

});

// 按钮点击事件
eform("eformButton1").method("onClick", function (buttonName, buttonId) {

	var nodeid=eform("Id").method("getValue");
	var level=eform("level").method("getValue");

	if(nodeid==""){
		window.top.$.messager.alert("提示", "请选择一个字典节点来添加字典！");
		return false;
	}

	if(buttonName == "新增字典"){//新增字典

		if(level=="2"){
			window.top.$.messager.alert("提示", "请选择根节点或一级字典添加！");
			return false;
		}

		var formId = "191224114507_edrms";//字典新增表单id
		var src = "/eform/index?formid="+formId+"&skin=techblue&pId="+nodeid+"&level="+level;
		console.log(src)
		$(top.document).find("iframe").eq(1).attr("src",src);

	}

});