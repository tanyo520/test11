var viewtype = $.getQueryString('viewtype'); // 默认查看，0新增,1编辑
var parentStorage = window.baseInfoJsonParentStorage; //父级节点对象
var parentId = $.getQueryString('nodeId'); //节点的主键id
//var parentId = "c5314238-8666-4322-90ca-aa2f1f4b2270";
/*
* 表单提交前事件,返回false将不会提交表单
* @param formId：当前表单编号
*/

var curToken = $.cookie("token");
eform.engEvent("saveBefore", function (formId) {

    var flag = true;
    // 打开遮罩层
    var panelG = eform.loading("正在创建...请稍等");

    window.setTimeout(function () {
    }, 1);
    //获取唯一识别码，如果没有则自动给值,如果有就自动判断重复
    var uniqueCode = eform("unique_code").method("getValue");
    if (uniqueCode) {
        //判断唯一识别码是否重复
        var storage = verifyStorageByUniqueCode(uniqueCode);
        if (storage && (storage.id != eform.recordId)) {
            flag = false;
            $.addTips($("#_easyui_textbox_input4"), "唯一识别码重复，请换一个");
        }
    } else {
        eform("unique_code").method("setValue", $.genId());
    }

    //不能新建比自己层级高 的子节点   层级 高低1：库房>2：档案室>3：档案 柜> 4：盒子
    var myLevel = eform("level").method("getValue");
    if (parentId && parentId != 0) {
        if (parentStorage.level > myLevel) {
            flag = false;
            $.addTips($("#_easyui_textbox_input1"), "只能新建层级更低的子库房，请换一个");

        } else {
            if (parentStorage.level != 3) {
                eform("face_at").method("setValue", eform("isFaceAt").method("getValue"));
                eform("column_at").method("setValue", eform("isColumnAt").method("getValue"));
                eform("line_at").method("setValue", eform("isLineAt").method("getValue"));
            }
        }
    }
    if (!flag) {
        eform.loaded(panelG); // 关闭遮罩层
        return false;
    }

    //id_path赋值 ，并且验证 库房层级，不可新增比父节点低//如果是根节点 则自动 赋值id_path
    if (parentId && parentId == '0') {
        eform("id_path").method("setValue", eform.recordId);
        var myPath1 = eform("name").method("getValue");
        eform("path").method("setValue", myPath1);
    } else {
        var parentIdPath = parentStorage.id_path;
        eform("id_path").method("setValue", parentIdPath + "/" + eform.recordId);

        var parentPath = parentStorage.path;
        var myPath = eform("name").method("getValue");
        if (myLevel == 4) {
            myPath += "(";
            var myFaceAt = eform("face_at").method("getValue");
            console.log(myFaceAt)
            if (myFaceAt) {
                myPath += eform("face_at").method("getValue") + "面"
            }

            myPath += eform("column_at").method("getValue") + "列" + eform("line_at").method("getValue") + "行)"

        }
        eform("path").method("setValue", parentPath + "-" + myPath);
    }

    //给父级id赋值,如果是0 就给0
    eform("parent_id").method("setValue", parentId);


    eform.loaded(panelG); // 关闭遮罩层
    return true;

});


//监听库房类型下拉列表
eform("level").method("onChange", function (newValue, oldValue) {
    if (newValue == "3") {

        eform("face_at").method("hide");
        eform("column_at").method("hide");
        eform("line_at").method("hide");

        eform("isFaceAt").method("hide");
        eform("isColumnAt").method("hide");
        eform("isLineAt").method("hide");


        eform("type").method("show");
        eform("face").method("show");
        eform("column").method("show");
        eform("line").method("show");

    } else if (newValue == "4") {

        eform("type").method("hide");
        eform("column").method("hide");
        eform("face").method("hide");
        eform("line").method("hide");
        //如果上级节点是档案柜的话  动态获取
        if (parentStorage && parentStorage.level == 3) {

            eform("isFaceAt").method("hide");
            eform("isColumnAt").method("hide");
            eform("isLineAt").method("hide");


            eform("column_at").method("show");
            eform("line_at").method("show");
            if (parentStorage.type == 1) {
                eform("face_at").method("show");
            } else if (parentStorage.type == 2) {
                eform("face_at").method("hide");
            }
        } else {

            eform("isFaceAt").method("show");
            eform("isColumnAt").method("show");
            eform("isLineAt").method("show");

            eform("face_at").method("hide");
            eform("column_at").method("hide");
            eform("line_at").method("hide");
        }

    }
    else {
        eform("type").method("hide");
        eform("column").method("hide");
        eform("face").method("hide");
        eform("line").method("hide");
        eform("face_at").method("hide");
        eform("column_at").method("hide");
        eform("line_at").method("hide");
        eform("isFaceAt").method("hide");
        eform("isColumnAt").method("hide");
        eform("isLineAt").method("hide");
    }
});
//监听档案柜的radio
eform("type").method("onClick", function (jqClick, allJqCheck) {

    var jqValue = jqClick[0].value;
    if (jqValue == 1) {
        eform("face").method("show");
    } else if (jqValue == 2) {
        eform("face").method("hide");
    }

});

/**
 * 验证唯一标识码是否存在
 * @param uniqueCode
 * @returns {*}
 */
function verifyStorageByUniqueCode(uniqueCode) {
    var storage;
    var param = {
        "uniqueCode": uniqueCode
    };
    $.ajax({
        type: "POST",
        async: false,
        url: "http://192.168.254.32:8002/edrmscore/api/storage/selectStorageByUniqueCode?token="+curToken,
        data: param,
        dataType: "json",
        success: function (res) {
            storage = res.obj
        }
    });
    return storage;
}

