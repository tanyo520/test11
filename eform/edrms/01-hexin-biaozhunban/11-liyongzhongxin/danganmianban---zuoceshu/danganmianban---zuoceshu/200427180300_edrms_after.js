loadNullPage();
/****一共12格 计算每个格的宽度**/
var curWidth = getClientWidth();
var divContent =curWidth - 44;
var divLeft = divContent * 0.3;
var divRight = divContent -divLeft-5;
// $(".custom-column0")[0].style.width = divLeft + "px";
// $(".custom-column0")[0].style.float = "left";
$(".custom-column0").removeClass('formCol')
// $(".custom-column1")[0].style.width = (divRight) + "px";
$(".custom-column1").removeClass('formCol')
// $(".custom-column1")[0].style.float = "left";

var EveryoneId = top.window.globalvalue_everyoneId; //everyone用户组id
var defaultFormId = "200305232631_edrms&page=arch";//档案默认页表单id
var archState = 0;   // $.getQueryString("archState");//档案状态 0整编库，1档案库，2鉴定库，3销毁库，4回收站
//console.log(archState)
//自定义一个全宗树
var height = $(document).height();//浏览器当前窗口文档的高度
$('#eformPlaceholder1').parent().append('<div style="margin-top:0px;height:' + (height - 110) + 'px;overflow:auto;"><ul id="sectArchTypeTree"></ul></div>');
$('#sectArchTypeTree').parent().css('margin-right', '0px');
$('#sectArchTypeTree').parent().css('height', '100%');


/************/
var archList = [];
var curPage = 1;
var pageTotal = 0;
var archTableName = "";
var archTypeId = "";
var formid = defaultFormId;
var formType = "0";

initSectArchTypeTree();//首次加载全宗档案类型树
//全宗档案类型树
$('#sectArchTypeTree').tree({
    //展开节点
    onBeforeExpand: function (node) {
        if (!node.hasChildren) {
            var data = getSectArchTypeData(node.isSect, node.id);

            if (node.is_dossier == 1) {
                data.push({
                    archTypeId: node.id
                    , text: '文件集'
                    , pId: node.id
                    , sectId: node.sectId
                    , isSect: 3
                    , is_dossier: 'arch'
                    , iconCls: 'wenjianjicss'
                });
                data.push({
                    archTypeId: node.id
                    , text: '卷内文件'
                    , pId: node.id
                    , sectId: node.sectId
                    , isSect: 3
                    , is_dossier: 'dossier'
                    , iconCls: 'anjuanjicss'
                });
            }
            $('#sectArchTypeTree').tree('append', {
                parent: node.target,
                data: data
            });

        }
    }

    // 点击事件
    , onClick: function (node) {

        if(node.state=='closed'){
            if (!node.hasChildren) {
                var data = getSectArchTypeData(node.isSect, node.id);

                if (node.is_dossier == 1) {
                    data.push({
                        archTypeId: node.id
                        , text: '文件集'
                        , pId: node.id
                        , sectId: node.sectId
                        , isSect: 3
                        , is_dossier: 'arch'
                        , iconCls: 'wenjianjicss'
                    });
                    data.push({
                        archTypeId: node.id
                        , text: '卷内文件'
                        , pId: node.id
                        , sectId: node.sectId
                        , isSect: 3
                        , is_dossier: 'dossier'
                        , iconCls: 'anjuanjicss'
                    });
                }

                $('#sectArchTypeTree').tree('append', {
                    parent: node.target,
                    data: data
                });

            }
            $('#sectArchTypeTree').tree('expand', node.target);
        }

        var formdbname = "";
        var parent_arch_type_id = "";
        var dossierTableName = "";
        var gjformid = "";
        var zjformid = "";
        var sectId = node.sectId;
          formType = "0";
        var isSect = node.isSect;

        localStorage.setItem("isSect", isSect);

        //档案类型
        if (isSect == "2") {

            if (node.is_dossier == "0") {
                var resData = selectArchTypeForm(node.id, archState, '0');//获取文件列表表单
                formid = resData.form_id;
                formdbname = resData.formdbname;
                archTypeId = node.id;

                /****通过档案类型ID获取数据表名 通过表名 获取档案数据******/
                eform.dataset("selectTableNameByArchTypeId", {id: archTypeId}, function (result) {
                    archTableName = result.Data[0][0].arch_table_name;
                }, false, false);
                eform.dataset("selectArchByFavorites", {
                    tableName: archTableName,
                    archtypeid: archTypeId,
                    createId: eform.userInfo.id,
                    entryState:1
                }, function (result) {
                    archList = result.Data[0];
                    if (archList.length > 0) {
                        curPage = 1;
                        loadData(result.Data[0], curPage);
                    } else {
                        loadNullData();
                    }

                }, false, false);

            } else {
                loadNullPage();
            }

        }

        //已立卷档案类型的下级节点
        else if (isSect == "3") {


            archTypeId = node.archTypeId;

            //获取表名
            eform.dataset("selectTableNameByArchTypeId", {id: archTypeId}, function (result) {
                archTableName = result.Data[0][0].arch_table_name;
                dossierTableName = result.Data[0][0].dossier_table_name;
            }, false,false);

            if (node.is_dossier == "arch") {
                formType = '1'
                var resData = selectArchTypeForm(archTypeId, archState, '0');//获取 未组卷-文件列表表单id
                formid = resData.form_id;
                formdbname = resData.formdbname;
                eform.dataset("selectArchByFavorites", {
                    tableName: archTableName,
                    archtypeid: archTypeId,
                    createId: eform.userInfo.id,
                    entryState:1
                }, function (result) {
                    archList = result.Data[0];
                    if (archList.length > 0) {
                        curPage = 1;
                        loadData(result.Data[0], curPage);
                    } else {
                        loadNullData();
                    }

                }, false, false);

            }
            else if (node.is_dossier == "dossier") {
                formType = '3'
                var resData = selectArchTypeForm(archTypeId, archState, '0');//获取 案卷列表表单id
                formid = resData.form_id;
                formdbname = resData.formdbname;
                eform.dataset("selectArchOfDossierByFavor", {
                    tableName: archTableName,
                    createId: eform.userInfo.id,
                    entryState:1
                }, function (result) {
                    archList = result.Data[0];
                    if (archList.length > 0) {
                        curPage = 1;
                        loadData(result.Data[0], curPage);
                    } else {
                        loadNullData();
                    }
                }, false, false);

            } else {
                loadNullPage();
            }

        }
        else {
            loadNullPage();
        }

        localStorage.setItem("lastname", formid);
        localStorage.setItem("formid", formid);
        localStorage.setItem("formdbname", formdbname);
        localStorage.setItem("archTableName", archTableName);
        localStorage.setItem("dossierTableName", dossierTableName);
        localStorage.setItem("gjformid", gjformid);
        localStorage.setItem("zjformid", zjformid);
        localStorage.setItem("archTypeId", archTypeId);
        localStorage.setItem("sectId", sectId);
        localStorage.setItem("formType", formType);
        localStorage.setItem("ifMoveFile", 0);

        var src = "/eform/index?formid=" + formid + "&skin=techblue&sectId=" + sectId + "&archTypeId=" + archTypeId + "&isSect=" + isSect
        $(top.document).find("iframe").eq(1).attr("src", src);

    }
    ,onDblClick:function(node){
        $('#sectArchTypeTree').tree('collapse',node.target);
    }

});

/****点击档案类型  拼接内容 start***************/
$(document).on("click", ".pre", function () {
    curPage=curPage==1?1:(curPage - 1);
    loadData(archList, curPage);
})

$(document).on("click", ".next", function () {
    curPage=curPage==pageTotal ? pageTotal :(curPage + 1);
    loadData(archList, curPage);
})

$(document).on("click", ".linkArch", function (value) {
    window.parent.window.open(window.parent.location.origin + "/wcm/edrms/danganxiangqingye" + "?archtypeid=" + localStorage.getItem("archTypeId") + "&id=" + value.target.id);
})

/*************加入收藏or取消收藏****************/
$(document).on("click", ".shoucang", function (value) {
    var archId = value.currentTarget.id;
    var imgId = value.currentTarget.firstElementChild.id;
    if (imgId != "null") {
        removecollection(imgId);
    } else {
        addcollection(archId);
    }
    /*******操作后  刷新当前页面 start ***********/
    if(formType=='3')
    {
        eform.dataset("selectArchOfDossierByFavor", {
            tableName: archTableName,
            createId: eform.userInfo.id,
            entryState:1
        }, function (result) {
            archList = result.Data[0];
            if (archList.length > 0) {
                loadData(result.Data[0], curPage);
            } else {
                loadNullData();
            }
        }, false, false);
    }else
    {
        eform.dataset("selectArchByFavorites", {
            tableName: archTableName,
            archtypeid: archTypeId,
            createId: eform.userInfo.id,
            entryState:1
        }, function (result) {
            archList = result.Data[0];
            if (archList.length > 0) {
                loadData(result.Data[0], curPage);
            } else {
                loadNullData();
            }

        }, false, false);
    }

    /*******操作后  刷新当前页面 end ***********/

})

/*************加入借阅车****************/
$(document).on("click", ".jieyueche", function (value) {
    var archId = value.currentTarget.id;
    var imgId =value.currentTarget.firstElementChild.id
    if (imgId != "null") {
        removeuse(imgId);
    } else {
        adduse(archId);
    }
    /*******操作后  刷新当前页面 start ***********/
    if(formType=='3')
    {
        eform.dataset("selectArchOfDossierByFavor", {
            tableName: archTableName,
            createId: eform.userInfo.id,
            entryState:1
        }, function (result) {
            archList = result.Data[0];
            if (archList.length > 0) {
                loadData(result.Data[0], curPage);
            } else {
                loadNullData();
            }
        }, false, false);
    }else
    {
        eform.dataset("selectArchByFavorites", {
            tableName: archTableName,
            archtypeid: archTypeId,
            createId: eform.userInfo.id,
            entryState:1
        }, function (result) {
            archList = result.Data[0];
            if (archList.length > 0) {
                loadData(result.Data[0], curPage);
            } else {
                loadNullData();
            }

        }, false, false);
    }
    /*******操作后  刷新当前页面 end ***********/

})

/************发起借阅****************/
$(document).on("click", ".jieyue", function (value) {
    var archId = value.currentTarget.id;
    var formId = '200206210516_edrms';//'200504142204_edrms';//借阅申请 表单id

    var processId;//流程id
    eform.dataset("selectProcessIdByProcessName", {ProcessName: '档案借阅'}, function (result) {
        processId = result.Data[0][0].ID_;
    }, false);

    var archTypeId = localStorage.getItem("archTypeId");
    var newFormUrl = eform.virtualPath + '/Default/default?formId=' + formId + '&skin=&processId=' + processId + '&taskType=begintask&formver=0&borrowType=first&archInfoId=' + archId + "&archTypeId=" + archTypeId + "&formver=0";
    debugger
    // 基本配置
    var config = {
        width: 900,
        height: 700,
        minimizable: false,  // 是否显示最小化按钮   默认false
        resizable: true,     // 是否能够改变窗口大小 默认true
        maximizable: false,  // 是否显示最大化按钮   默认false
        modal: true,         // 模式化窗口           默认true
        title: "借阅申请",           // 弹框标题
        closed: true
        // 		,        // 是否可以关闭窗口     默认true
        // 		buttons:[{           // 右下角显示的按钮组
        // 			text: "发起",
        // 			handler: function(){}
        // 		}]

    }

    // 	// 事件及其他
    var param2 = {
        dialogType: "iframe",    // 以iframe方式打开
        target: newFormUrl, // 地址
        showCloseBtn: false,
        window:window.top,     // 是否在右下角显示关闭按钮
        onBeforOpen: function () {  // 窗口打开前事件,return false不打开窗体
            return true;
        },
        onAfterOpen: function () { // 窗口打开后事件

        },
        onBeforeClose: function () { // 窗口关闭前事件

        }

    }
    var dialog = new eform.Dialog(config, param2);
    var iframe = dialog.iframe;             // 取iframe元素(jquery)
    var ifWindow = iframe[0].contentWindow; // 取iframe中的window

    // return  newFormUrl;

})

/************************ ************************拼接内容 ***************/

function loadData(archList, curPage) {
    $('.custom-column1').html('');
    pageTotal =archList.length%10==0? parseInt(archList.length / 10):parseInt(archList.length / 10) + 1; //总页数

    var whileLength = pageTotal == 1 ? archList.length : curPage * 10;
    whileLength = whileLength > archList.length ? archList.length : whileLength;
    var startIndex = pageTotal == 1 ? 0 : (curPage - 1) * 10;


    var dataRowDiv='<div class="dataRowDiv">';
    $('.custom-column1').append(dataRowDiv);
    for (var i = startIndex; i < whileLength; i++) {


        var rowData = archList[i];

        var rowDiv = '<div id="row' + i + '" style="width:100%;float:left;" class="rowDivParent" ><div class="rowDiv" ></div></div>';

        $('.dataRowDiv').append(rowDiv);

        var iconDiv = '<div class="iconDiv"><img src="/resourcefiles/82ccf883-cd69-4917-91ed-046c61aa10ba.png?system_var_rootId=$system_var_rootId$"></div>';
        $('#row' + i + ' .rowDiv').append(iconDiv);

        var divArchTitle = '<div class="archTitle"><a class="linkArch" target="_blank" id="' + rowData.Id + '">' + rowData.name + '</a></div>';
        $('#row' + i + ' .rowDiv').append(divArchTitle);

        // onmouseover="$(\'#row'+i+'\').css(\'background-color\',\'#eee\');"
        var rowButton = '<div class="rowButtonParent"></div>';
        $('#row' + i).append(rowButton);
        var shoucangSrc = "/resourcefiles/9a6e5fd9-7909-46ff-b33a-24f58601a698.png?system_var_rootId=$system_var_rootId$";
        var shoucangTitle="加入收藏";
        if (rowData.favoId != null) {
            shoucangSrc = "/resourcefiles/976041e4-fdfb-40d7-9946-09e47558345b.png?system_var_rootId=$system_var_rootId$";
            shoucangTitle="取消收藏";
        }
        var divShoucang = '<div class="rowButton shoucang" id="' + rowData.Id + '" title="'+shoucangTitle+'"><img id="' + rowData.favoId + '" src="' + shoucangSrc + '"></div>';
        $('#row' + i + ' .rowButtonParent').append(divShoucang);

        var jieyuecheSrc = "/resourcefiles/be23a2c2-e0f1-42be-895c-df603a8101e8.png?system_var_rootId=$system_var_rootId$"; //默认未加入借阅车
        var jieyuecheTitle="加入借阅车";
        if (rowData.borrowcarId != null) {
            jieyuecheSrc = "/resourcefiles/61f6f4bc-d545-4485-9fc5-b3954ed7ec13.png?system_var_rootId=$system_var_rootId$";
            jieyuecheTitle="取消加入借阅车";
        }

        var divJieyue = '<div class="rowButton jieyueche "  id="' + rowData.Id + '"  title="' +jieyuecheTitle+'"><img id="'+rowData.borrowcarId+'" src="'+jieyuecheSrc+'"></div>';
        $('#row' + i + ' .rowButtonParent').append(divJieyue);

        var divJieyueche = '<div class="rowButton jieyue "  id="' + rowData.Id + ' " title="发起借阅"><img src="/resourcefiles/31ec7ad5-f053-453b-8258-91c3f7151afa.png?system_var_rootId=$system_var_rootId$"></div>';
        $('#row' + i + ' .rowButtonParent').append(divJieyueche);



    }
    var dataRowDivEnd='</div>';
    $('.custom-column1').append(dataRowDivEnd);



    /***画个 分页切换****/
    var pageHTML = '<div class="pageDiv"><div class="pageDivChild"><a class="pre">\<\</a><span id="curPage">' + curPage + '</span>\/\<span id=pageTotal>' + pageTotal + '</span> <a   class="next"  onclick="loadData(' + archList + ',' + (curPage + 1) + ')" >\>\</a></div></div>';
    if (archList.length > 0) {
        // 		$('#eformRight').parent().append(pageHTML);
        $('.custom-column1').append(pageHTML);
    }


}

function loadNullPage() {
    $('.custom-column1').html('');
    var pageHTML = "<div class='showNullPage'><div><img src='/resourcefiles/e99b03f1-88be-4cae-a31a-f2cb16404442.png?system_var_rootId=$system_var_rootId$'></div><div class='showNullTitle'><p>请选择文件集或卷内文件进行档案查看</p></div></div>";
    $('.custom-column1').append(pageHTML);
    $('.custom-column1').show();
}

function loadNullData() {
    $('.custom-column1').html('');
    var pageHTML = "<div  class='showNullPage'><div><img src='/resourcefiles/e99b03f1-88be-4cae-a31a-f2cb16404442.png?system_var_rootId=$system_var_rootId$'></div><div class='showNullTitle'><p>无数据</p></div></div>";
    $('.custom-column1').append(pageHTML);
    $('.custom-column1').show();
}

/*************************************************加入收藏夹******************/
function addcollection(archId) {
    var archDetails = {};
    var archTableName = localStorage.getItem("archTableName");
    eform.dataset("selectArchById", {tableName: archTableName, archId: archId}, function (result) {
        archDetails = result.Data[0][0];
    }, false, false);

    var message = "";
    var values = "";
    var userId = eform.userInfo.ID;
    var name = archDetails.name;
    var param = {
        createId: eform.userInfo.ID,
        archId: archId,
    };
    eform.dataset("CountMyfavoritesByCreateIdAndArchId", param, function (result) {
        if ((result.Data[0][0].count - 0) > 0) {
            message = message + "档案：" + name + "<br>"
        }
    }, false);

    var Id = guid(),
        formId = ",'" + formid + "'",
        tableName = ",'" + archTableName + "'",
        archId = ",'" + archId + "'",
        archiveName = ",'" + archDetails.name + "'",
        archiveNo = ",'" + archDetails.number + "'",
        secret = ",'" + archDetails.secret + "'",
        writeDate = ",'" + archDetails.writtendate + "'";
    values = values + ",('" + Id + "',now(),now(),'" + userId + "','" + userId + "'" + formId + tableName + archId + archiveName + archiveNo + secret + writeDate + ")"

    if (message) {
        message = message + "已经加入收藏，不能重复加入！";
        window.top.$.messager.alert("提示", message);
        return false;
    } else {
        values = values.substring(1);
        var batchParam = {
            params: values
        }

        eform.dataset("BatchInsertMyfavorites", batchParam, function (result) {
            if (result.EffectOfRow > 0) {
                window.top.$.messager.alert("提示", "收藏成功");
            } else {
                window.top.$.messager.alert("提示", "收藏失败");
            }
        }, false);

    }

}

/*************************************************移除收藏夹******************/
function removecollection(favId) {
    eform.dataset("removeFavorites", {Id: favId}, function (result) {
        if (result.EffectOfRow > 0) {
            window.top.$.messager.alert("提示", "取消收藏");
        }
        else {
            window.top.$.messager.alert("提示", "取消失败");
        }
    }, false, false);

}

/************************************************加入借阅车******************/
function adduse(archId) {

    var archDetails = {};
    var archTableName = localStorage.getItem("archTableName");
    eform.dataset("selectArchById", {tableName: archTableName, archId: archId}, function (result) {
        archDetails = result.Data[0][0];
    }, false, false);

    var msg = "";
    var values = "";
    var userId = eform.userInfo.ID;
    var sectname = "";

    var archName = archDetails.name;
    var param = {
        createId: eform.userInfo.ID,
        archiveId: archId,
    };
    eform.dataset("CountMyfavoritesByCreateIdAndArchiveId", param, function (result) {
        if (result.Data[0][0].count > 0) {
            msg = msg + "档案：" + archName + "<br>";
        } else {
            eform.dataset("SelectSect", {Id: archDetails.sectid}, function (result) {
                var data = result.Data[0][0];
                sectname = data.name;
            }, false);
        }
    }, false);
    console.log(sectName);
    console.log(sectId);
    var Id = guid(),
        sectName = ",'" + sectname + "'",
        name = ",'" + archDetails.name + "'",
        archiveId = ",'" + archId + "'",
        sectId = ",'" + archDetails.sectid + "'",
        archTypeId = ",'" + archDetails.archtypeid + "'",
        formId = ",'" + localStorage.getItem("formid") + "'",
        archTypeName = ",'" + "'",
        number = ",'" + archDetails.number + "'",
        values = values + ",('" + Id + "',now(),now(),'" + userId + "','" + userId + "'" + sectName + name + archiveId + sectId + archTypeId + formId + archTypeName + number + ")"


    if (msg) {
        msg += "已经加入借阅车，不能重复加入！";
        window.top.$.messager.alert("提示", msg);
        return false;
    } else {
        values = values.substring(1);
        var batchParam = {
            params: values
        }
        eform.dataset("BatchInsertBorrowCar", batchParam, function (result) {
            if (result.EffectOfRow > 0) {
                window.top.$.messager.alert("提示", "加入借阅车成功");
            } else {
                window.top.$.messager.alert("提示", "加入借阅车失败");
            }
        }, false);
    }
}

/************************************************移除借阅车******************/
function removeuse(borrowcarId) {
    eform.dataset("removeUse", {Id: borrowcarId}, function (result) {
        if (result.EffectOfRow > 0) {
            window.top.$.messager.alert("提示", "移除借阅车成功");
        }
        else {
            window.top.$.messager.alert("提示", "移除借阅车失败");
        }
    }, false, false);
}


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


//获取当前用户的信息
//console.log(eform.userInfo);
var userId = eform.userInfo.id;
var MainDepartmentId = eform.userInfo.MainDepartmentId; //当前用户部门id
var MainPositionId = eform.userInfo.MainPositionId; //当前用户职位id
var userGroupIds = "'" + EveryoneId + "'";

var userGroupList = getUserGroupList();
//console.log(userGroupList);
if (userGroupList) {
    for (var i = 0; i < userGroupList.length; i++) {
        userGroupIds = userGroupIds + ",'" + userGroupList[i].ID + "'"
    }
}

/*首次加载全宗档案类型树*/
function initSectArchTypeTree() {
    var param1 = {
        id: '0'
    };

    eform.dataset("selectSectToBorrowCenter", param1, function (result) {
        console.log(result);
        if (result.Data) {
            console.log(result.Data[0]);
            var newTree = result.Data[0];
            $('#sectArchTypeTree').tree({
                data: newTree
            });
        }
    }, false);

}

//根据父id获取全宗 或 档案类型
function getSectArchTypeData(isSect, id) {
    var data = [];
    var param = {
        id: id
    };
    if (isSect == 1) {
        eform.dataset("selectSubLevelSectToBorrowCenter", param, function (result) {
            data = result.Data[0];
        }, false);
    } else if (isSect == 2) {
        eform.dataset("selectSubLevelArchTypeToBorrowCenter", param, function (result) {
            data = result.Data[0];
        }, false);
    }
    return data;
}


//获取当前用户的用户组列表
function getUserGroupList() {
    var token = $.cookie("token");
    var host = window.location.host;
    var data = [];
    $.ajax({
        type: "GET",
        url: "/api/services/OrgUserGroup/GetGroupListOfUserByUserId",
        async: false,
        data: {
            token: token
            , userId: eform.userInfo.id
        },
        dataType: "json",
        success: function (res) {
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