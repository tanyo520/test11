/***获取当前token***/
var token = $.cookie("token");
/****一共12格 计算每个格的宽度**/
var curWidth = getClientWidth();
var divContent = curWidth - 44;
var divLeft = divContent * 0.3;
var divRight = divContent - divLeft - 5;
$(".custom-column0").removeClass('formCol');
$(".custom-column1").removeClass('formCol');

var storageConfigureFormId = "200707140149_edrms";

//自定义一个库房树
var height = $(document).height();//浏览器当前窗口文档的高度
$('#storageTree').parent().append('<div style="margin-top:0px;height:' + (height) + 'px;overflow:auto;"><ul id="sectTree"></ul></div>');
$('#sectTree').parent().css('margin-right', '0px');
$('#sectTree').parent().css('height', '100%');

$('#topButton').addClass("topButtonAdd");
$('.custom-column1 li:first-child').append('<div class="clear"></div>');

$('#eformListButton1').append('<a id="toggle" ><img src="/resourcefiles/5246215c-e70e-4415-9c50-723bb7f57d78.png?system_var_rootId=$system_var_rootId$" width="9"/>收起</a>');
$('#df01abe4-80d8-2357-5a29-7c7c53a184ea').addClass('searchButton');

$('#ec1221e4-fd83-67be-2d59-f50594d8b03e').addClass('switchButton');
$('#ec1221e4-fd83-67be-2d59-f50594d8b03e').append('<img src="/resourcefiles/64f20eec-86fb-423d-b0af-d62eb462e7b2.png?system_var_rootId=$system_var_rootId$" width="20"/>');
$('#eformDataTable1')[0].style.display = "none";

//默认隐藏搜索块
$('#storageType')[0].style.display = "none";
$('#column')[0].style.display = "none";
$('#side')[0].style.display = "none";
$('#line')[0].style.display = "none";
$('#unique_code')[0].style.display = "none";
$('#name')[0].style.display = "none";
$('#code')[0].style.display = "none";
$('#path')[0].style.display = "none";
$('#createName')[0].style.display = "none";
$('#createDate')[0].style.display = "none";
$('#eformListButton1')[0].style.display = "none";
$('.searchButton')[0].style.display = "block";

$('#side').addClass('');

initSectTree();

/*首次加载库房树*/
function initSectTree() {

    var storageTree;
    var storageLoad;

    var paramTree = {
        "parentId": 0
    };

    //获取左侧树
    $.ajax({
        type: "POST",
        async: false,
        url: "http://192.168.254.32:8002/edrmscore/api/storage/selectStorageTree?token=" + token,
        data: paramTree,
        dataType: "json",
        success: function (res) {
            if (res.result) {
                storageTree = res.obj
            }
        }
    });
    var rootObj = {//定义树形root数据
        "id": "0"
        , "iconCls": "iconcss"
        , "pId": ""
        , "state": "open"
        , "text": "根目录"
        , "level": "-1"
        , "children": storageTree//storageTree
    };

    var newTree = [];  //申明新的全宗数组

    newTree.push(rootObj); //加入顶级元素

    $('#sectTree').tree({
        data: newTree
    });


    var paramCard = {
        id: 0,
        curPage: 1,
        pageSize: 5
    };

    //获取根目录下卡片数据
    $.ajax({
        type: "POST",
        async: false,
        url: "http://192.168.254.32:8002/edrmscore/api/storage/selectStorageCard?token=" + token,
        data: JSON.stringify(paramCard),
        contentType: 'application/json',
        success: function (res) {
            if (res.result) {
                storageLoad = res.obj;
            }
        }
    });


    var cardBlock = '<div class="clear"></div><div id="cardBlock" class="cardBlock" style="display:block;">';
    $('.custom-column1').append(cardBlock);


    var cardBlockEnd = '</div><div class="clear"></div>';
    $('.custom-column1').append(cardBlockEnd);


}

//全宗树监听事件
$('#sectTree').tree({
    //展开节点
    onBeforeExpand: function (node) {

        if (!node.hasChildren) {
            var data = [];
            var param1 = {
                parentId: node.id
            };
            $.ajax({
                type: "POST",
                async: false,
                url: "http://192.168.254.32:8002/edrmscore/api/storage/selectStorageTree?token=" + token,
                data: param1,
                dataType: "json",
                success: function (res) {

                    if (res.result) {
                        storage = res.obj
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
    , onClick: function (node) {
        debugger;
        var nodeIdParam = {
            nodeId: node.id,
            curPage: 1,
            pageSize: 5
        };
        switchFn(nodeIdParam);

        // getEasyControl
        // var easyuiControl = eform("eformDataTable1").method("getEasyControl");
        // if(easyuiControl) {
        //     easyuiControl.datagrid("load", {id: node.id });
        // }


    }
    , onDblClick: function (node) {
        $('#sectTree').tree('collapse', node.target);
    }
});

//详情事件
eform("eformDataTable1").method("onUrlFormatter", function (url, operateBtn) {
    if (operateBtn.formName == "详情") {
        var info = eform("eformDataTable1").method("getSelectedRows");//获取查询列表被选中的值
        var newFormUrl = eform.virtualPath + '/index?formid=' + storageConfigureFormId + '&skin=techblue&id=' + info[0].ID +
            '&viewtype=1';
        return newFormUrl;
    }
});

// 新增点击事件
eform("topButton").method("onClick", function (buttonName, buttonId) {
    if (buttonName === "新增") {
        var newFormUrl = eform.virtualPath + '/index?formid=' + storageConfigureFormId + '&skin=techblue&viewtype=0';

        var content = '<iframe src="' + newFormUrl + '" width="100%" height="99%" frameborder="0"  scrolling="no"></iframe>';
        var boarddiv = '<div id="msgwindow"   title="新增"></div>'//style="overflow:hidden;"可以去掉滚动条
        $(document.body).append(boarddiv);
        var win = $('#msgwindow').dialog({
            content: content,
            width: 600,
            height: 700,
            modal: true,
            title: '新增',
            onClose: function () {
                $(this).dialog('destroy');//后面可以关闭后的事件
            }
        });
        win.dialog('open');

    }
});

/***点击收起隐藏搜索面板***/
$(document).on("click", "#toggle", function () {
    $('#storageType')[0].style.display = "none";
    $('#column')[0].style.display = "none";
    $('#side')[0].style.display = "none";
    $('#line')[0].style.display = "none";
    $('#unique_code')[0].style.display = "none";
    $('#name')[0].style.display = "none";
    $('#code')[0].style.display = "none";
    $('#path')[0].style.display = "none";
    $('#createName')[0].style.display = "none";
    $('#createDate')[0].style.display = "none";
    $('#eformListButton1')[0].style.display = "none";
    $('.searchButton')[0].style.display = "block";
});

/***点击搜索按钮显示搜索面板***/
$(document).on("click", ".searchButton", function () {
    $('#storageType')[0].style.display = "block";
    $('#column')[0].style.display = "block";
    $('#side')[0].style.display = "block";
    $('#line')[0].style.display = "block";
    $('#unique_code')[0].style.display = "block";
    $('#name')[0].style.display = "block";
    $('#code')[0].style.display = "block";
    $('#path')[0].style.display = "block";
    $('#createName')[0].style.display = "block";
    $('#createDate')[0].style.display = "block";
    $('#eformListButton1')[0].style.display = "block";
});

/***档案与案卷切换***/
$(document).on("click", '.switchButton', function () {
    var cardList = document.getElementById("cardBlock");
    var tableList = document.getElementById("eformDataTable1");
    show_hidden(cardList);
    show_hidden(tableList);
    function show_hidden(obj) {
        if (obj.style.display == 'block') {
            obj.style.display = 'none';
        } else {
            obj.style.display = 'block';
        }
    }
});

/***搜索事件***/
$(document).on("click", ".btn-search", function () {
    debugger;
    var storageType = eform("storageType").method("getValue");
    var side = eform("side").method("getValue");
    var column = eform("column").method("getValue");
    var line = eform("line").method("getValue");
    var unique_code = eform("unique_code").method("getValue");
    var name = eform("name").method("getValue");
    var code = eform("code").method("getValue");
    var path = eform("path").method("getValue");
    var createName = eform("createName").method("getValue");
    var createDate = eform("createDate").method("getValue");
    var startTime = createDate.split('$')[0];
    var endTime = createDate.split('$')[1];

    var arrSearch = {
        storageType: storageType,
        side: side,
        column: column,
        line: line,
        name: name,
        code: code,
        path: path,
        createName: createName,
        startTime: startTime,
        endTime: endTime,
        curPage: 1,
        pageSize: 5
    };

    $('#cardBlock').html('');
    switchFn(arrSearch);

    function IsWhitespace(s) {
        var i;
        if (IsEmpty(s)) return true;
        for (i = 0; i < s.length; i++) {
            var c = s.charAt(i);
            if (whitespace.indexOf(c) == -1) return false;
        }
        return true;
    }
    function IsEmpty(s) {
        return ((s == null) || (s.length == 0))
    }
    var whitespace = " \t\n\r";
    // var allNotEmpty = (!IsWhitespace(storageType)) ||
    //     (!IsWhitespace(side)) ||
    //     (!IsWhitespace(column)) ||
    //     (!IsWhitespace(line)) ||
    //     (!IsWhitespace(unique_code)) ||
    //     (!IsWhitespace(name)) ||
    //     (!IsWhitespace(code)) ||
    //     (!IsWhitespace(path)) ||
    //     (!IsWhitespace(createName)) ||
    //     (!IsWhitespace(startTime)) ||
    //     (!IsWhitespace(endTime));
    // if (!allNotEmpty) {
    //     alert("必需输入一个搜索条件");
    //     return false;
    // }

});

//档案与案卷相互切换获取对应接口数据
function switchFn(ele) {
    $('#cardBlock').html('');
    var param = ele;

    if ($('.cardBlock')[0].style.display === 'block') {
        var selectStorageCardList;
        $.ajax({
            type: "POST",
            async: false,
            url: "http://192.168.254.32:8002/edrmscore/api/storage/selectStorageCard?token=" + token,
            data: JSON.stringify(param),
            contentType: 'application/json',
            success: function (res) {
                if (res.result) {
                    selectStorageCardList = res.obj;
                }
            }
        });

    }
    else if ($('#eformDataTable1')[0].style.display === 'block') {
        var selectStorageTableList;
        $.ajax({
            type: "POST",
            async: false,
            url: "http://192.168.254.32:8002/edrmscore/api/storage/selectStorageList?token=" + token,
            data: JSON.stringify(param),
            contentType: 'application/json',
            success: function (res) {

                if (res.result) {
                    selectStorageTableList = res.obj;
                }
            }
        });
    }
}

/************************************************拼接内容 ************************************************************/

/*********1、拼接条件*********************/

/*********2、拼接库房图片*********************/


//卡片的图片与详情切换
$(document).on("click", ".storageCol", function () {
    var src = $(this).attr("src");
    if (src == 1) {
        $(this).find('.img4show').show();
        $(this).find('.details4show').hide();
        $(this).attr("src", 0);
    } else {
        $(this).find('.img4show').hide();
        $(this).find('.details4show').show();
        $(this).attr("src", 1);
    }

});

function loadStorageCell(index, storageId) {
    var cell = '<div class="storageCol storageCell' + index + '" value="' + storageId + '"></div>';
    $('.storageBlock').append(cell);
}

function loadStorageSingle(index, obj) {
    var backgroundImg = '<div class="img4show storageImg" id="' + index + '"><img src="/resourcefiles/f4a20823-251d-4ae7-bc90-0d7c0a43e5a6.png?system_var_rootId=$system_var_rootId$"><div class="storageTitle"><p>唯一识别号：' + obj.unique_code + '<img src="/resourcefiles/6f28f175-b404-475a-8eb9-c178476c47fe.png?system_var_rootId=$system_var_rootId$" width="16" height="16"></p></div></div>';
    $('.storageCell' + index).append(backgroundImg);
}

/********2.1 库房图片切换成详情******/
function loadStorageDetails(index, obj) {
    var storageDetails = '<div class="details4show storageDetails" id="' + index + '"><label>' + (obj.name == null ? "" : obj.name) + '</label><p>ID：' + (obj.unique_code == null ? "" : obj.unique_code)
        + '</p><p>管理员：' + (obj.responsible == null ? "" : obj.responsible) + '</p>'
        + '<p>位置：' + (obj.location == null ? "" : obj.location) + '</p>'
        + '<p>创建时间：' + (obj.createTime == null ? "" : eform.dateFormat(new Date(obj.createTime), "yyyy/MM/dd")) + '</p><p>创建人：' + (obj.createName == null ? "" : obj.createName) + '</p></div>';
    $('.storageCell' + index).append(storageDetails);
}

/*********3、拼接档案室图片*********************/

function loadRoomCell(index) {
    var cell = '<div class="storageCol roomCell' + index + '"></div>';
    $('.roomBlock').append(cell);
}

function loadRoomSingle(index, obj) {
    var backgroundImg = '<div class="img4show roomImg" id="' + index + '"><img src="/resourcefiles/f4a20823-251d-4ae7-bc90-0d7c0a43e5a6.png?system_var_rootId=$system_var_rootId$"><div class="storageTitle"><p>唯一识别号：' + obj.id + '<img src="/resourcefiles/6f28f175-b404-475a-8eb9-c178476c47fe.png?system_var_rootId=$system_var_rootId$" width="16" height="16"></p></div></div>';
    $('.roomCell' + index).append(backgroundImg);
}

/********3.1 档案室图片切换成详情******/
function loadRoomDetails(index, obj) {
    var roomDetails = '<div class="details4show roomDetails" id="' + index + '"><label>' + (obj.name == null ? "" : obj.name) + '</label><p>ID：' + (obj.unique_code == null ? "" : obj.unique_code)
        + '</p><p>管理员：' + (obj.responsible == null ? "" : obj.responsible) + '</p>'
        + '<p>位置：' + (obj.location == null ? "" : obj.location) + '</p>'
        + '<p>创建时间：' + (obj.createTime == null ? "" : eform.dateFormat(new Date(obj.createTime), "yyyy/MM/dd")) + '</p><p>创建人：' + (obj.createName == null ? "" : obj.createName) + '</p></div>';
    $('.roomCell' + index).append(roomDetails);
}

/*********4.1.1、拼接密集架图片*********************/

function loadCabinetCell(index) {
    var cell = '<div class="storageCol cabinetCell' + index + '"></div>';
    $('.cabinetBlock').append(cell);
}

function loadCabinetSingle(index, obj) {
    var backgroundImg = '<div class="img4show cabinetImg" id="' + index + '"><img src="/resourcefiles/ab238774-dccf-45a1-bfb6-74f4d5b20f37.png?system_var_rootId=$system_var_rootId$"><div class="storageTitle"><p>唯一识别号：' + obj.id + '<img src="/resourcefiles/6f28f175-b404-475a-8eb9-c178476c47fe.png?system_var_rootId=$system_var_rootId$" width="16" height="16"></p></div></div>';
    $('.cabinetCell' + index).append(backgroundImg);
}

/********4.1.2 密集架图片切换成详情******/
function loadCabinetDetails(index, obj) {
    var cabinetDetails = '<div class="details4show cabinetDetails" id="' + index + '"><label>' + (obj.name == null ? "" : obj.name) + '</label><p>ID：' + (obj.unique_code == null ? "" : obj.unique_code)
        + '</p><p>管理员：' + (obj.responsible == null ? "" : obj.responsible) + '</p>'
        + '<p>位置：' + (obj.location == null ? "" : obj.location) + '</p>'
        + '<p>创建时间：' + (obj.createTime == null ? "" : eform.dateFormat(new Date(obj.createTime), "yyyy/MM/dd")) + '</p><p>创建人：' + (obj.createName == null ? "" : obj.createName) + '</p></div>';
    $('.cabinetCell' + index).append(cabinetDetails);
}

/*********4.2.1、拼接文件柜图片*********************/
function loadFileCell(index) {
    var cell = '<div class="storageCol fileCell' + index + '" ></div>';
    $('.flieBlock').append(cell);
}

function loadFileSingle(index, obj) {
    var backgroundImg = '<div class="img4show fileImg" id="' + index + '"><img src="/resourcefiles/f4a20823-251d-4ae7-bc90-0d7c0a43e5a6.png?system_var_rootId=$system_var_rootId$"><div class="storageTitle"><p>唯一识别号：' + obj.unique_code + '<img src="/resourcefiles/6f28f175-b404-475a-8eb9-c178476c47fe.png?system_var_rootId=$system_var_rootId$" width="16" height="16"></p></div></div>';
    $('.fileCell' + index).append(backgroundImg);
}

/********4.2.2 库房图片切换成详情******/
function loadFileDetails(index, obj) {
    var fileDetails = '<div class="details4show fileDetails" id="' + index + '"><label>' + (obj.name == null ? "" : obj.name) + '</label><p>ID：' + (obj.unique_code == null ? "" : obj.unique_code)
        + '</p><p>管理员：' + (obj.responsible == null ? "" : obj.responsible) + '</p>'
        + '<p>位置：' + (obj.location == null ? "" : obj.location) + '</p>'
        + '<p>创建时间：' + (obj.createTime == null ? "" : eform.dateFormat(new Date(obj.createTime), "yyyy/MM/dd")) + '</p><p>创建人：' + (obj.createName == null ? "" : obj.createName) + '</p></div>';
    $('.fileCell' + index).append(fileDetails);
}

/*********5、拼接档案盒图片*********************/

function loadBoxCell(index) {
    var cell = '<div class="storageCol boxCell' + index + '"></div>';
    $('.boxBlock').append(cell);
}

function loadBoxSingle(index, obj) {
    var backgroundImg = '<div class="img4show boxImg" id="' + index + '"><img src="/resourcefiles/ab238774-dccf-45a1-bfb6-74f4d5b20f37.png?system_var_rootId=$system_var_rootId$"><div class="storageTitle"><p>唯一识别号：' + obj.id + '<img src="/resourcefiles/6f28f175-b404-475a-8eb9-c178476c47fe.png?system_var_rootId=$system_var_rootId$" width="16" height="16"></p></div></div>';
    $('.boxCell' + index).append(backgroundImg);
}

/********5.1 档案盒图片切换成详情******/
function loadBoxDetails(index, obj) {
    var boxDetails = '<div class="details4show boxDetails" id="' + index + '"><label>' + (obj.name == null ? "" : obj.name) + '</label><p>ID：' + (obj.unique_code == null ? "" : obj.unique_code)
        + '</p><p>管理员：' + (obj.responsible == null ? "" : obj.responsible) + '</p>'
        + '<p>位置：' + (obj.location == null ? "" : obj.location) + '</p>'
        + '<p>创建时间：' + (obj.createTime == null ? "" : eform.dateFormat(new Date(obj.createTime), "yyyy/MM/dd")) + '</p><p>创建人：' + (obj.createName == null ? "" : obj.createName) + '</p></div>';
    $('.boxCell' + index).append(boxDetails);
}

/***********6、拼接条目 ：eform*********/

function guid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

/********点击档案类型 拼接HTML end*****************/

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


/****点击档案类型  拼接内容 end***************/