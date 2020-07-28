var archFolderId = top.window.globalvalue_hiddenFolderId;//隐藏文件夹ID

var token = $.cookie("token");


//自定义一个全宗树
var height = $(document).height();//浏览器当前窗口文档的高度
$('#eformPlaceholder1').parent().append('<div style="margin:0px;height:auto;"><ul id="sectTree"></ul></div>');
$('#7d8f3673-fdb3-cc72-45c8-d2e7fdfe4cfc').css('margin-left','7px');//调整新增全宗按钮距左距离
$('#eformsect').css('padding-bottom','0px');//调整新增全宗按钮距下距离
$('.btn-default').css('margin-bottom','10px');


initSectTree();

/*
	首次加载全宗树
*/
function initSectTree(){
    var data = [];
    var param1 = {
        level:'0'
    };
    eform.dataset("selectSectByLevel", param1, function (result) { //selectSectByParentId
        if(result.Data){
            data = result.Data[0];
        }
    }, false);

    var rootObj = {//定义树形root数据
        "id": "0"
        , "iconCls": "iconcss"
        , "pId": ""
        , "state": "open"
        , "text": "全宗"
        ,"level":"-1"
        ,"folderId":archFolderId
        , "children": data
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
            var param = {
                id:node.id
            };
            eform.dataset("selectSectByParentId", param, function (result) {
                if(result.Data){
                    data = result.Data[0];
                }
            }, false);
            $('#sectTree').tree('append', {
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
                var param = {
                    id:node.id
                };
                eform.dataset("selectSectByParentId", param, function (result) {
                    if(result.Data){
                        data = result.Data[0];
                    }
                }, false);
                $('#sectTree').tree('append', {
                    parent: node.target,
                    data: data
                });
            }

            $('#sectTree').tree('expand', node.target);
        }

        eform("sectTreeId").method('setValue',node.id);
        eform("level").method('setValue',node.level);
        eform("folderId").method('setValue',node.folderId);

        var formId = "191219132613_edrms"; //全宗编辑表单id
        if(node.id==0){
            formId = "200305232631_edrms&page=sect";//默认页面表单id
        }
        var src = "/eform/index?formid="+formId+"&level="+node.level+"&skin=techblue&Id="+node.id;
        $(top.document).find("iframe").eq(1).attr("src",src);


    }
    ,onDblClick:function(node){
        $('#sectTree').tree('collapse',node.target);
    }
});


// 按钮点击时触发，自定义“动作”的按钮有效
// * buttonText 按钮Id值文本
// * buttonId 按钮Id值(v1.5.0+)
eform("eformsect").method("onClick",function(buttonText,buttonId){

    if(buttonId=='7d8f3673-fdb3-cc72-45c8-d2e7fdfe4cfc'){//新增全宗
        var sectId = eform("sectTreeId").method('getValue');
        if(!sectId){
            window.top.$.messager.alert("提示","请先选择对应全宗！");
            return false;
        }


        var level= eform("level").method('getValue');
        var folderId = eform("folderId").method('getValue');

        var formId = "200305225250_edrms";//全宗新增表单id
        var src = "/eform/index?formid="+formId+"&skin=techblue&pId="+sectId
            +"&level="+level+"&parentFolderId="+folderId;
        $(top.document).find("iframe").eq(1).attr("src",src);
    }

    if(buttonText=='导出'){
        var formId = "200305225250_edrms";//全宗新增表单id
        var conditions = "";
        var sectId = eform("sectTreeId").method('getValue');
        top.window.open("http://192.168.254.32:8002/edrmscore/api/excel/download?module=sect&formId="+formId+"&type=1&conditions="+conditions+"&id="+sectId+"&token="+token);
    }

    if(buttonText=='下载导入模板'){
        var formId = "200305225250_edrms";//全宗新增表单id
        top.window.open("http://192.168.254.32:8002/edrmscore/api/excel/download?module=sect&formId="+formId+"&token="+token);
    }

    if(buttonText=='导入'){
        var formId = "200715155024_edrms";//导入表单id
        var sectFormId = "200305225250_edrms";//全宗属性表单id

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
            target: eform.virtualPath + "/Default/default?formid="+formId+"&module=sect&typeId="+sectFormId,  // 地址
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