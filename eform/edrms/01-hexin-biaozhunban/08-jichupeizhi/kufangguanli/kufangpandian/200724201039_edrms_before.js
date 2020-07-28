var token = $.cookie("token");

var id = "0";
/***表格的options已配置完成，表格创建前事件，允许修改参数easyuiOptions的值
 只能在解析前(控件绘制前)重写**/
eform("eformDataTable1").method("onBeforeEasyuiControlCreate", function (options) {

    options.loader = function (params, success, error) {

        var total = 0;
        var selectStorageListVos = [];
        var param = {
            nodeId: id,
            start: (params.page - 1) * params.rows,
            pageSize: params.rows,
            dynField: params.sort == null ? 'createTime' : params.sort,
            dynOrder: params.order == null ? 'asc' : params.order
        };
        $.ajax({
            type: "POST",
            async: false,
            url: "http://192.168.254.32:8002/edrmscore/api/storage/selectStorageList?token=" + token,
            data: JSON.stringify(param),
            contentType: 'application/json',
            success: function (res) {

                if (res.result) {
                    selectStorageListVos = res.obj.storageListDtos;
                    total = res.obj.total;
                }
            }
        });
        //var total = res.length;

        var receiveData = {};
        receiveData.total = total;
        receiveData.rows = selectStorageListVos;
        success(receiveData);
    }
});

/*非操作列格式化事件(不包括操作列)，只能在解析前重写
* value 列值
* row 行对象
* index 行索引
* field 列绑定的字段名称
* fieldName 列名称
*/
eform("eformDataTable1").method("customColumnsFormatter", function (value, row, index, field, fieldName) {

    if (field === "level") {

        if (row.level == "1") {
            return "库房";
        } else if (row.level == "2") {
            return "档案室";
        } else if (row.level == "3" && row.type == "1") {
            return "密集架";
        } else if (row.level == "3" && row.type == "2") {
            return "文件柜";
        } else if (row.level == "4") {
            return "档案盒";
        }
    }

    return value; // if之外的需返回原值
});