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
var treeNodeId = "";
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
        , "iconCls": "archtypecss"
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

    var storageStartIndex = 0;
    var roomStartIndex = 0;
    var cabinetStartIndex = 0;
    var fileStartIndex = 0;
    var boxStartIndex = 0;

    var cardBlock = '<div class="clear"></div><div id="cardBlock" class="cardBlock" style="display:block;">';
    $('.custom-column1').append(cardBlock);
    for (var i = 0; i < storageLoad.length; i++) {
        if (storageLoad[i].cardName === "库房" && storageLoad[i].list.length > 0) {
            var storageBlock = '<div class="cardName">' + storageLoad[i].cardName + '</div><div class="storageBlock"></div>';
            $('.cardBlock').append(storageBlock);

        }
        if (storageLoad[i].cardName === "档案室" && storageLoad[i].list.length > 0) {
            var roomBlock = '<div class="cardName">' + storageLoad[i].cardName + '</div><div class="roomBlock"></div>';
            $('.cardBlock').append(roomBlock);

        }
        if (storageLoad[i].cardName === "密集架" && storageLoad[i].list.length > 0) {
            var cabinetBlock = '<div class="cardName">' + storageLoad[i].cardName + '</div><div class="cabinetBlock"></div>';
            $('.cardBlock').append(cabinetBlock);

        }
        if (storageLoad[i].cardName === "文件柜" && storageLoad[i].list.length > 0) {
            var flieBlock = '<div class="cardName">' + storageLoad[i].cardName + '</div><div class="flieBlock"></div>';
            $('.cardBlock').append(flieBlock);

        }
        if (storageLoad[i].cardName === "档案盒" && storageLoad[i].list.length > 0) {
            var boxBlock = '<div class="cardName">' + storageLoad[i].cardName + '</div><div class="boxBlock"></div>';
            $('.cardBlock').append(boxBlock);

        }

    }

    var cardBlockEnd = '</div><div class="clear"></div>';
    $('.custom-column1').append(cardBlockEnd);

    for (var i = 0; i < storageLoad.length; i++) {
        debugger
        //类型为库房
        if (storageLoad[i].cardName === "库房" && storageLoad[i].list.length > 0) {
            for (var j = 0; j < storageLoad[i].list.length; j++) {
                loadStorageCell(storageStartIndex, storageLoad[i].list[j].id);
                loadStorageSingle(storageStartIndex, storageLoad[i].list[j]);
                loadStorageDetails(storageStartIndex, storageLoad[i].list[j]);
                $('.storageImg')[storageStartIndex].style.display = "inline";
                $('.storageDetails')[storageStartIndex].style.display = "none";
                storageStartIndex++;
            }
            curPage = 1;
            // loadPageData(storageStartIndex, curPage);
        }
        //类型为档案室
        if (storageLoad[i].cardName == "档案室" && storageLoad[i].list.length > 0) {
            for (var j = 0; j < storageLoad[i].list.length; j++) {
                loadRoomCell(roomStartIndex, storageLoad[i].list[j].id);
                loadRoomSingle(roomStartIndex, storageLoad[i].list[j]);
                loadRoomDetails(roomStartIndex, storageLoad[i].list[j]);
                $('.roomImg')[roomStartIndex].style.display = "inline";
                $('.roomDetails')[roomStartIndex].style.display = "none";
                roomStartIndex++;
            }
        }
        //类型为档案架，当level=3时，type=1表示密集架，type=2表示文件柜
        if (storageLoad[i].cardName == "密集架" && storageLoad[i].list.length > 0) {
            for (var j = 0; j < storageLoad[i].list.length; j++) {
                loadCabinetCell(cabinetStartIndex, storageLoad[i].list[j].id);
                loadCabinetSingle(cabinetStartIndex, storageLoad[i].list[j]);
                loadCabinetDetails(cabinetStartIndex, storageLoad[i].list[j]);
                $('.cabinetImg')[cabinetStartIndex].style.display = "inline";
                $('.cabinetDetails')[cabinetStartIndex].style.display = "none";
                cabinetStartIndex++;
            }
        }
        //类型为档案架，当level=3时，type=1表示密集架，type=2表示文件柜
        if (storageLoad[i].cardName == "文件柜" && storageLoad[i].list.length > 0) {
            for (var j = 0; j < storageLoad[i].list.length; j++) {
                loadFileCell(fileStartIndex, storageLoad[i].list[j].id);
                loadFileSingle(fileStartIndex, storageLoad[i].list[j]);
                loadFileDetails(fileStartIndex, storageLoad[i].list[j]);
                $('.fileImg')[fileStartIndex].style.display = "inline";
                $('.fileDetails')[fileStartIndex].style.display = "none";
                fileStartIndex++;
            }
        }
        //类型为档案盒
        if (storageLoad[i].cardName == "档案盒" && storageLoad[i].list.length > 0) {
            for (var j = 0; j < storageLoad[i].list.length; j++) {
                loadBoxCell(boxStartIndex, storageLoad[i].list[j].id);
                loadBoxSingle(boxStartIndex, storageLoad[i].list[j]);
                loadBoxDetails(boxStartIndex, storageLoad[i].list[j]);
                $('.boxImg')[boxStartIndex].style.display = "inline";
                $('.boxDetails')[boxStartIndex].style.display = "none";
                boxStartIndex++;
            }
        }
    }

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
        treeNodeId = node.id;
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
        if (!treeNodeId) {
            window.top.$.messager.alert("提示", "请先选择对应节点！")
            return false;
        }

        var newFormUrl = eform.virtualPath + '/index?formid=' + storageConfigureFormId + '&skin=techblue&viewtype=0&nodeId=' + treeNodeId;

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

/***列表与卡片切换***/
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

//卡片与列表相互切换获取对应接口数据
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
        var storageStartIndex = 0;
        var roomStartIndex = 0;
        var cabinetStartIndex = 0;
        var fileStartIndex = 0;
        var boxStartIndex = 0;

        for (var i = 0; i < selectStorageCardList.length; i++) {
            debugger
            if (selectStorageCardList[i].cardName === "库房" && selectStorageCardList[i].list.length > 0) {
                var storageBlock = '<div class="cardName">' + selectStorageCardList[i].cardName + '</div><div class="storageBlock"></div>';
                $('.cardBlock').append(storageBlock);
            }
            if (selectStorageCardList[i].cardName === "档案室" && selectStorageCardList[i].list.length > 0) {
                var roomBlock = '<div class="cardName">' + selectStorageCardList[i].cardName + '</div><div class="roomBlock"></div>';
                $('.cardBlock').append(roomBlock);
            }
            if (selectStorageCardList[i].cardName === "密集架" && selectStorageCardList[i].list.length > 0) {
                var cabinetBlock = '<div class="cardName">' + selectStorageCardList[i].cardName + '</div><div class="cabinetBlock"></div>';
                $('.cardBlock').append(cabinetBlock);
            }
            if (selectStorageCardList[i].cardName === "文件柜" && selectStorageCardList[i].list.length > 0) {
                var flieBlock = '<div class="cardName">' + selectStorageCardList[i].cardName + '</div><div class="flieBlock"></div>';
                $('.cardBlock').append(flieBlock);
            }
            if (selectStorageCardList[i].cardName === "档案盒" && selectStorageCardList[i].list.length > 0) {
                var boxBlock = '<div class="cardName">' + selectStorageCardList[i].cardName + '</div><div class="boxBlock"></div>';
                $('.cardBlock').append(boxBlock);
            }

        }

        for (var i = 0; i < selectStorageCardList.length; i++) {
            //类型为库房
            if (selectStorageCardList[i].cardName === "库房" && selectStorageCardList[i].list.length > 0) {
                for (var j = 0; j < selectStorageCardList[i].list.length; j++) {
                    loadStorageCell(storageStartIndex, selectStorageCardList[i].list[j].id);
                    loadStorageSingle(storageStartIndex, selectStorageCardList[i].list[j]);
                    loadStorageDetails(storageStartIndex, selectStorageCardList[i].list[j]);
                    $('.storageImg')[storageStartIndex].style.display = "inline";
                    $('.storageDetails')[storageStartIndex].style.display = "none";
                    storageStartIndex++;
                }//perPage：总条数   curPage：当前第几页
                // curPage: 1;
                // loadPageData(storageStartIndex, curPage);
            }
            //类型为档案室
            if (selectStorageCardList[i].cardName == "档案室" && selectStorageCardList[i].list.length > 0) {
                for (var j = 0; j < selectStorageCardList[i].list.length; j++) {
                    loadRoomCell(roomStartIndex, selectStorageCardList[i].list[j].id);
                    loadRoomSingle(roomStartIndex, selectStorageCardList[i].list[j]);
                    loadRoomDetails(roomStartIndex, selectStorageCardList[i].list[j]);
                    $('.roomImg')[roomStartIndex].style.display = "inline";
                    $('.roomDetails')[roomStartIndex].style.display = "none";
                    roomStartIndex++;
                }
            }
            //类型为档案架，当level=3时，type=1表示密集架，type=2表示文件柜
            if (selectStorageCardList[i].cardName == "密集架" && selectStorageCardList[i].list.length > 0) {
                for (var j = 0; j < selectStorageCardList[i].list.length; j++) {
                    loadCabinetCell(cabinetStartIndex, selectStorageCardList[i].list[j].id);
                    loadCabinetSingle(cabinetStartIndex, selectStorageCardList[i].list[j]);
                    loadCabinetDetails(cabinetStartIndex, selectStorageCardList[i].list[j]);
                    $('.cabinetImg')[cabinetStartIndex].style.display = "inline";
                    $('.cabinetDetails')[cabinetStartIndex].style.display = "none";
                    cabinetStartIndex++;
                }
            }
            //类型为档案架，当level=3时，type=1表示密集架，type=2表示文件柜
            if (selectStorageCardList[i].cardName == "文件柜" && selectStorageCardList[i].list.length > 0) {
                for (var j = 0; j < selectStorageCardList[i].list.length; j++) {
                    loadFileCell(fileStartIndex, selectStorageCardList[i].list[j].id);
                    loadFileSingle(fileStartIndex, selectStorageCardList[i].list[j]);
                    loadFileDetails(fileStartIndex, selectStorageCardList[i].list[j]);
                    $('.fileImg')[fileStartIndex].style.display = "inline";
                    $('.fileDetails')[fileStartIndex].style.display = "none";
                    fileStartIndex++;
                }
            }
            //类型为档案盒
            if (selectStorageCardList[i].cardName == "档案盒" && selectStorageCardList[i].list.length > 0) {
                for (var j = 0; j < selectStorageCardList[i].list.length; j++) {
                    loadBoxCell(boxStartIndex, selectStorageCardList[i].list[j].id);
                    loadBoxSingle(boxStartIndex, selectStorageCardList[i].list[j]);
                    loadBoxDetails(boxStartIndex, selectStorageCardList[i].list[j]);
                    $('.boxImg')[boxStartIndex].style.display = "inline";
                    $('.boxDetails')[boxStartIndex].style.display = "none";
                    boxStartIndex++;
                }
            }
        }
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

//分页方法
function loadPageData(storageStartIndex, curPage) {
    debugger
    $('.custom-column1').html('');
    pageTotal = storageStartIndex % 5 == 0 ? parseInt(storageStartIndex / 5) : parseInt(storageStartIndex / 5) + 1; //总页数

    var whileLength = pageTotal == 1 ? storageStartIndex : curPage * 5;
    whileLength = whileLength > storageStartIndex ? storageStartIndex : whileLength;
    var startIndex = pageTotal == 1 ? 0 : (curPage - 1) * 5;

    var dataRowDiv = '<div class="dataRowDiv">';
    $('.custom-column1').append(dataRowDiv);
    for (var i = startIndex; i < whileLength; i++) {


    }
    var dataRowDivEnd = '</div>';
    $('.custom-column1').append(dataRowDivEnd);


    /***画个 分页切换****/
    // var pageHTML = '<div class="pageDiv"><div class="pageDivChild"><a class="pre">\<\</a><span id="curPage">' + curPage + '</span>\/\<span id=pageTotal>' + pageTotal + '</span> <a   class="next"  onclick="loadPageData(' + '' + ',' + (curPage + 1) + ')" >\>\</a></div></div>';
    // if (storageStartIndex > 0) {
    //     // 		$('#eformRight').parent().append(pageHTML);
    //     $('.custom-column1').append(pageHTML);
    // }


}


//卡片分页
//perPage 每一页显示条数     current：当前第几页
function pagination(perPage, current) {
    var tableData = document.getElementById("searchList");
    var totalCount = tableData.rows.length;  //总条数

    //设置表格总页数
    var totalPage = 0;//列表的总页数
    var pageSize = perPage;
    if (totalCount / pageSize > parseInt(totalCount / pageSize)) {
        totalPage = parseInt(totalCount / pageSize) + 1;
    } else {
        totalPage = parseInt(totalCount / pageSize);
    }
    //对数据进行分页
    var currentPage = current;
    var startRow = (currentPage - 1) * pageSize + 1;
    var endRow = (currentPage * pageSize > totalCount ? totalCount : currentPage * pageSize);

    for (var i = 1; i < (totalCount + 1); i++) {
        var irow = tableData.rows[i - 1];
        if (i >= startRow && i <= endRow) {
            irow.style.display = "block";
        } else {
            irow.style.display = "none";
        }
    }
    //位置2 生成当前的点击按钮
    createBtns(totalPage, current);
    //位置3  绑定点击事件
    bindClick(totalPage);

}
//生成点击按钮
//totalPages 分页的总页数
//current当前页
function createBtns(totalPages, current) {
    var tempStr = "";
    /*上一页按钮*/
    if (current > 1) {
        /* tempStr += "<span class='btn first' href=\"#\"  data-page = '1'>首页</span>";*/
        tempStr += "<span class='btn prev' href=\"#\" data-page = " + (current - 1) + ">上一页</span>"
    }
    /*中间页码的显示*/
    /*如果总页数超出5个处理办法*/
    if (totalPages <= 5) {
        for (var pageIndex = 1; pageIndex < totalPages + 1; pageIndex++) {
            tempStr += "<a  class='btn page" + pageIndex + "'  data-page = " + (pageIndex) + "><span>" + pageIndex + "</span></a>";
        }
    } else {
        if (current < 5) {
            for (var pageIndex = 1; pageIndex < 5; pageIndex++) {
                tempStr += "<a  class='btn page" + pageIndex + "'  data-page = " + (pageIndex) + "><span>" + pageIndex + "</span></a>";
            }
            tempStr += '<span>......</span>';
            tempStr += "<a  class='btn page" + totalPages + "'  data-page = " + (totalPages) + "><span>" + totalPages + "</span></a>";
        } else if (current >= totalPages - 4) {
            tempStr += "<a  class='btn page" + 1 + "'  data-page = " + (1) + "><span>" + 1 + "</span></a>";
            tempStr += '<span>......</span>';
            for (var pageIndex = totalPages - 4; pageIndex <= totalPages; pageIndex++) {
                tempStr += "<a  class='btn page" + pageIndex + "'  data-page = " + (pageIndex) + "><span>" + pageIndex + "</span></a>";
            }
        } else if (current >= 5 && current < totalPages - 4) {
            tempStr += "<a  class='btn page" + 1 + "'  data-page = " + (1) + "><span>" + 1 + "</span></a>";
            tempStr += '<span>......</span>';
            for (var pageIndex = current; pageIndex <= current + 4; pageIndex++) {
                tempStr += "<a  class='btn page" + pageIndex + "'  data-page = " + (pageIndex) + "><span>" + pageIndex + "</span></a>";
            }
            tempStr += '<span>......</span>';
            tempStr += "<a  class='btn page" + totalPages + "'  data-page = " + (totalPages) + "><span>" + totalPages + "</span></a>";
        }
    }
    /*下一页按钮*/
    if (current < totalPages) {
        tempStr += "<span class='btn next' href=\"#\"  data-page = " + (current + 1) + ">下一页</span>";
        /*            tempStr += "<span class='btn last' href=\"#\" data-page = "+ (totalPages) +">尾页</span>";*/
    }
    document.getElementById("pageination").innerHTML = tempStr;
}
function bindClick(totalPage) {
    // 设置首页、末页、上一页、下一页的点击事件
    var buttonArr = ['first', 'last', 'prev', 'next'];
    for (var k in buttonArr) {
        var $dom = '.' + buttonArr[k];
        $('body').delegate($dom, 'click', function () {
            var data = $(this).data('page');//获取当前按钮跳转的页数
            pagination('3', data);//对页面进行分页
            //对当前页码的样式做处理
            $('.page' + data).css({ background: '#0449d4', color: '#fff' }).siblings().css({ background: '#fff', color: '#999' });
        })
    }

    // 设置数码的点击事件 totalImgPage是总页数，为全局变量，在分页时被赋值
    for (var k = 1; k <= totalPage; k++) {
        var $singleDom = '.page' + k;
        $('body').delegate($singleDom, 'click', function () {
            var data = $(this).data('page');
            pagination('3', data);//对页面进行分页
            //对当前页码的样式做处理
            $('.page' + data).css({ background: '#0449d4', color: '#fff' }).siblings().css({ background: '#fff', color: '#999' });
        })
    }
}


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