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
var viewtype = $.getQueryString('viewtype'); // 默认查看，0新增,1编辑
// 根据主键id查询对象
var parentStorage;

var curToken = $.cookie("token");
var parentId = $.getQueryString('nodeId'); //父级节点的主键id
//var parentId = "c5314238-8666-4322-90ca-aa2f1f4b2270";
if (parentId && parentId != '0') {
    parentStorage = selectStorageById(parentId);
    window.baseInfoJsonParentStorage = parentStorage;

    if (viewtype == 1) {
        eform("name").method("readonly", true);//库房类型
        var nowLevel = eform("level").method("getValue");//当前的库房类型
        if (nowLevel == 3) {
            eform("type").method("show");
            eform("column").method("show");
            eform("face").method("show");
            eform("line").method("show");
        } else if (nowLevel == 4) {
            //如果上级节点是档案柜的话  动态获取
            if (parentStorage.level == 3) {

                eform("face_at").method("show");
                eform("column_at").method("show");
                eform("line_at").method("show");

            } else {
                eform("isFaceAt").method("show");
                eform("isColumnAt").method("show");
                eform("isLineAt").method("show");

                eform("isFaceAt").method("setValue", eform("face_at").method("getValue"));
                eform("isColumnAt").method("setValue", eform("column_at").method("getValue"));
                eform("isLineAt").method("setValue", eform("line_at").method("getValue"));
            }
        }

    }
}


if (parentStorage) {
    var storageLevel = parentStorage.level;  //父级节点的 库房类型
    if (storageLevel == 3) {


        var column = parentStorage.column;
        var line = parentStorage.line;

        var faceValue = [];
        var columnValue = [];
        var lineValue = [];

        for (var k = 1; k < column + 1; k++) {
            columnValue.push({
                value: k,
                text: k
            })
        }
        for (var j = 1; j < line + 1; j++) {
            lineValue.push({
                value: j,
                text: j
            })
        }

        columnValue = $.toJSON(columnValue);
        lineValue = $.toJSON(lineValue);

        eform("column_at").method("getControl").setProperty("datasource", columnValue);
        eform("line_at").method("getControl").setProperty("datasource", lineValue);

        if (parentStorage.type == 1) {
            var face = parentStorage.face;
            for (var i = 1; i < face + 1; i++) {
                faceValue.push({
                    value: i,
                    text: i
                })
            }
            faceValue = $.toJSON(faceValue);
            eform("face_at").method("getControl").setProperty("datasource", faceValue);
        }
    }
}


/**
 * 根据主键id查询对象
 * @param parentId
 * @returns {*}
 */
function selectStorageById(parentId) {
    var storage;
    var param = {
        "parentId": parentId
    };
    $.ajax({
        type: "POST",
        async: false,
        url: "http://192.168.254.32:8002/edrmscore/api/storage/selectStorageById?token="+curToken,
        data: param,
        dataType: "json",
        success: function (res) {
            storage = res.obj
        }
    });
    return storage;
}