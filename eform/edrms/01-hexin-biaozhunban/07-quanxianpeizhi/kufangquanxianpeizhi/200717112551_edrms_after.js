/****一共12格 计算每个格的宽度**/
var curWidth = getClientWidth();
var divContent =curWidth - 44;
var divLeft = divContent * 0.3;
var divRight = divContent -divLeft-5;
var token = $.cookie("token");
var dossierPropertiesFormId="200707140149_edrms";
var nodeId = "";
var nodePid = "";
//自定义一个库房树
var height = $(document).height();//浏览器当前窗口文档的高度
$('#eformHidden1').parent().append('<div style="margin-top:0px;height:' + (height) + 'px;overflow:auto;"><ul id="sectTree"></ul></div>');
$('#sectTree').parent().css('margin-right', '0px');
$('#sectTree').parent().css('height', '100%');
initSectTree();


/*首次加载库房树*/
function initSectTree(){
    var storage;
    var param = {
        "parentId": 0  
    };
    $.ajax({
        type: "POST",
        async: false,
        url: "http://192.168.254.32:8002/edrmscore/api/storage/selectStorageTree?token="+token,
        data: param,
        dataType: "json",
        success: function (res) {

            if(res.result){
                storage = res.obj

            }
        }
    });
    var rootObj = {//定义树形root数据
        "id": "0"
        , "iconCls": "archtypecss"
        , "pId": ""
        , "state": "open"
        , "text": "根目录"
        ,"level":"-1"
        , "children": storage//storage
    };

    var newTree = [];  //申明新的全宗数组

    newTree.push(rootObj); //加入顶级元素

    $('#sectTree').tree({
        data: newTree
    });
}

//全宗树监听事件
$('#sectTree').tree({
    //展开节点
    onBeforeExpand:function(node){
        //console.log(node);
        if(!node.hasChildren){
            var data = [];
            var param1 = {
                parentId:node.id
            };
            $.ajax({
                type: "POST",
                async: false,
                url: "http://192.168.254.32:8002/edrmscore/api/storage/selectStorageTree?token="+token,
                data: param1,
                dataType: "json",
                success: function (res) {

                    if(res.result){
                        data = res.obj
                    }
                }
            });
            $('#sectTree').tree('append', {
                parent: node.target,
                data: data
            });
        }
    }
    // 点击事件
    ,onClick: function(node){
        debugger
        nodeId = node.id;
        nodePid = node.pId;


        // getEasyControl
        var easyuiControl = eform("eformDataTable1").method("getEasyControl");
        if(easyuiControl) {
            easyuiControl.datagrid("reload", {id: nodeId });
        }
        
    }
    ,onDblClick:function(node){
        $('#sectTree').tree('collapse',node.target);
    }
});


/*url格式化事件，子窗体将连接到新的url地址
* url 原打开的表单地址
* operateBtn 点击的操作按钮配置信息
*/
eform("eformDataTable1").method("onUrlFormatter",function (url,operateBtn) {

    debugger

    if (operateBtn.formName == "新增"){
        if((!nodeId)|| nodeId=='0'){
            window.top.$.messager.alert("提示","请先选择库房类型");
            return false;
        }
        else{
            var newFormUrl = eform.virtualPath + '/index?formid=200714170717_edrms&skin=techblue&viewtype=0&Id='+nodeId +"&pId="+nodePid;
            return newFormUrl;
        }
    }

    else if(operateBtn.formName== "编辑"){
        var info = eform("eformDataTable1").method("getSelectedRows");//获取列表被选中的值
        debugger;
        if(info[0].ifFromParent==1){
            window.top.$.messager.alert("提示","不能编辑父级的权限")
            return false;
        }
        var newFormUrl = eform.virtualPath + '/index?formid=200220100923_edrms&viewtype=1&skin=techblue&Id='+info[0].Id;
        return newFormUrl;
    }

});


/*子窗体自定义按钮点击事件
* formId 表单ID
* id 选中记录编号
* name 按钮名称
* callback 点击后事件
*/
eform("eformDataTable1").method("childFormButtonEvent", function (formId, ids, name, callback) {
    if (name == "保存") {
        eform("eformDataTable1").method("getControl").ChildFormDialog.iframe[0].contentWindow.window.save(function () {
            eform("eformDataTable1").method("getControl").ChildFormDialog.close();
            eform("eformDataTable1").method("load"); //父页面表格刷新
        });
    }
    else if (name == "保存并新增") {
        eform("eformDataTable1").method("getControl").ChildFormDialog.iframe[0].contentWindow.window.saveAndNew(function () {
            debugger
            eform("eformDataTable1").method("load"); //父页面表格刷新
        });
    }
    callback && callback();// 最后一行,该行代码必须
});



//自定义操作按钮
eform("eformDataTable1").method("customButtonEvent", function (formId, ids, name, callback) {
    debugger

    if (name == "删除") {
        debugger
        var rows = eform("eformDataTable1").method("getSelectedRows");
        if (rows.length == 0) {
            window.top.$.messager.alert("提示", "请先选择需要删除的数据！");
            return false;
        }


        var flag = true;
        var ides = "";
        for(var i=0;i<rows.length;i++){
            ides = ides + ",'" + rows[i].id + "'";
            if(rows[i].ifFromParent==1){
                flag=false;
            }
        }
        if(!flag){
            window.top.$.messager.alert("提示","不能删除父级权限");
            return false;
        }

        window.top.$.messager.confirm("提示", "确认此操作吗？", function (bool) {

            if (bool === true) {
                if (ides){
                    ides = ides.substring(1);
                }
                // debugger;
                // eform.dataset("deleteByIds", {tableName:'permission',ides:ides}, function (result1) {
                //     window.top.$.messager.alert("提示","操作成功！");
                // }, false);
                $.ajax({
                    type: "POST",
                    async: false,
                    url: "http://192.168.254.32:8002/edrmscore/api/storagePermission/deleteStoragePermissions?token="+token,
                    data: {ids:ides},
                    dataType: "json",
                    success: function (res) {

                        if(res.result){
                            window.top.$.messager.alert("提示","操作成功！");
                        }
                    }
                });
                eform("eformDataTable1").method("load"); //表格刷新
            }
        });
    }
    callback && callback();// 最后一行,该行代码必须
});



function getClientWidth() {
    var clientWidth = 0;
    if (document.body.clientWidth && document.documentElement.clientWidth) {
        var clientWidth = (document.body.clientWidth < document.documentElement.clientWidth) ? document.body.clientWidth : document.documentElement.clientWidth;
    }
    else {
        var clientWidth = (document.body.clientWidth > document.documentElement.clientWidth) ? document.body.clientWidth : document.documentElement.clientWidth;
    }
    return clientWidth;
}