var height = $(document).height();//浏览器当前窗口文档的高度
// height = height-160;

var propertyFormId = '200311161120_edrms';//档案类型属性表单
var defaultFormId = "200305232631_edrms";//档案类型默认页表单id

var token = $.cookie("token");

//自定义一个全宗档案类型树
$('#eformHidden1').parent().append('<div style="margin:0px;height:auto;"><ul id="sectArchTypeTree"></ul></div>');
$('#7d8f3673-fdb3-cc72-45c8-d2e7fdfe4cfc').css('margin-left','7px')//调整新增档案类型按钮距左距离
$('#eformButton1').css('padding-bottom','0px');//调整新增档案类型按钮距下距离
$('.btn-default').css('margin-bottom','10px');

initSectArchTypeTree(1,0);//树初始化

var u_data_id;

//所有的父级节点名称
var allParentName = '';


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

        allParentName = node.text;
        var parent = $('#sectArchTypeTree').tree('getParent',node.target);
        while(parent){
            if(parent.id==0){
                break;
            }
            allParentName=parent.text+"-"+allParentName;
            parent = $('#sectArchTypeTree').tree('getParent',parent.target);
        }

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
            var src = "/eform/index?formid="+propertyFormId+"&skin=techblue&Id="+node.id+"&viewtype=1";
            $(top.document).find("iframe").eq(1).attr("src",src);

        }else{
            var rightSrc = "/eform/index?formid="+defaultFormId+"&skin=techblue&page=archType";
            $(top.document).find("iframe").eq(1).attr('src',rightSrc);//右侧默认页
        }

    }
    ,onDblClick:function(node){
        $('#sectArchTypeTree').tree('collapse',node.target);
    }
});


//首次加载全宗档案类型树
function initSectArchTypeTree(isSect,id){

    var data=[];

    var param = {
        id: '0'
    };

    eform.dataset("selectSectToBorrowCenter", param, function (result) {
        data = result.Data[0];
    }, false);

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

        var src = "/eform/index?formid="+propertyFormId+"&skin=techblue&treeId="+nodeid
            +"&level="+level+"&isSect="+isSect+"&sectId="+sectId+"&parentFolderId="+folderId+"&viewtype=0&allParentName="+allParentName;

        $(top.document).find("iframe").eq(1).attr("src",src);

    }

    if(buttonName=='导出'){
        var formId = "200311161120_edrms";//档案类型新增表单id
        var nodeid=eform("sectTreeId").method("getValue");
        var isSect=eform("isSect").method("getValue");
        var conditions = "";
        var archTypeId = "";
        if(isSect=='1'){
            if(nodeid!='0'){
                conditions = "`sect_id`='"+nodeid+"'";
            }
        }else{
            archTypeId = nodeid;
        }
        conditions = encodeURIComponent(conditions);
        top.window.open("http://192.168.254.32:8002/edrmscore/api/excel/download?module=archType&formId="+formId+"&type=1&conditions="+conditions+"&id="+archTypeId+"&token="+token);
    }

    if(buttonName=='下载导入模板'){
        var formId = "200311161120_edrms";//全宗新增表单id
        top.window.open("http://192.168.254.32:8002/edrmscore/api/excel/download?module=archType&formId="+formId+"&token="+token);
    }

    if(buttonName=='导入'){
        var formId = "200715155024_edrms";//导入表单id
        var typeId = "200311161120_edrms";//档案类型属性表单id

        // 基本配置
        var config = {
            width: 900,
            height: 600,
            minimizable: false,  // 是否显示最小化按钮   默认false
            resizable: true,     // 是否能够改变窗口大小 默认true
            maximizable: false,  // 是否显示最大化按钮   默认false
            modal: true,         // 模式化窗口           默认true
            title: "excel导入",           // 弹框标题
            closed: true,        // 是否可以关闭窗口     默认true
            // 			buttons:[{           // 右下角显示的按钮组
            // 				text: "按钮",
            // 				handler: function(){}
            // 			}]

        }

        // 事件及其他
        var param2 = {
            dialogType: "iframe",    // 以iframe方式打开
            target: eform.virtualPath + "/Default/default?formid="+formId+"&module=archType&typeId="+typeId,  // 地址
            showCloseBtn: false,     // 是否在右下角显示关闭按钮
            window:window.top,
            onBeforOpen:function(){  // 窗口打开前事件,return false不打开窗体
                return true;
            },
            onAfterOpen: function(){ // 窗口打开后事件

            },
            onBeforeClose: function(){ // 窗口关闭前事件

            }

        }
        var dialog = new eform.Dialog(config, param2);
        var iframe = dialog.iframe;             // 取iframe元素(jquery)
        var ifWindow = iframe[0].contentWindow; // 取iframe中的window

    }

});