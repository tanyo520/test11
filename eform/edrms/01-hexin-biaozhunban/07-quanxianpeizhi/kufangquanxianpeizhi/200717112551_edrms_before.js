var token = $.cookie("token");


//var id="17679466-d554-4fa9-8859-f7cbb5a134ac";
var id = "0";
/***表格的options已配置完成，表格创建前事件，允许修改参数easyuiOptions的值
 只能在解析前(控件绘制前)重写**/
eform("eformDataTable1").method("onBeforeEasyuiControlCreate",function (options) {

    options.loader = function(params,success,error){
        debugger;
        if (params.id){
            id = params.id;
        }
        var total = 0;
        var storagePermissionVos =[];
        var param ={
            nodeId:id,
            start: (params.page-1)*params.rows,
            pageSize: params.rows,
            dynField  : params.sort==null? 'createTime':params.sort ,
            dynOrder:params.order==null? 'asc':params.order
        };
        $.ajax({
            type: "POST",
            async: false,
            url: "http://localhost:8012/edrmscore/api/storagePermission/selectStoragePermissionList?token="+token,
            data: JSON.stringify(param) ,
            contentType:'application/json',
            success: function (res) {
                debugger;
                if (res.result) {
                    storagePermissionVos=res.obj.storagePermissionVos
                    total=res.obj.countStoragePermission
                }
            }
        });
        //var total = res.length;

        var receiveData={}
        receiveData.total=total;
		receiveData.rows=storagePermissionVos;
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
eform("eformDataTable1").method("customColumnsFormatter",function (value, row, index, field, fieldName) {
    if(field === "perm_type"){
        if(value=="3"){
            return "用户组";
        }else if(value=="5"){
            return "部门";
        }else if(value=="4"){
            return "职位";
        }else if(value=="0"){
            return "用户";
        }

    }else if(field === "perm_value"){
        if(value=="0"){
            return "无权限";
        }else if(value=="1"){
            return "有权限";
        }
    }else if(field === "ifFromParent"){
        if(value=="0"){
            return "本级权限";
        }else if(value=="1"){
            return "父级权限";
        }
    }

    return value; // if之外的需返回原值
});



eform("eformDataTable1").method("getControl").onGetParentWindow = function () {
    try {
        if (window.top.location.href.toLowerCase().indexOf("/eform") > -1) {
            return window.top;
        }
        else if (window.top.location.href.toLowerCase().indexOf("/wcm") > -1) {
            return window.top;
        }
        else if (window.top.location.href.toLowerCase().indexOf("/inbiz") > -1) {
            return window.top;
        }
        else if (window.parent.location.href.toLowerCase().indexOf("/eform") > -1) {
            return window.top;
        }
        else if (window.parent.location.href.toLowerCase().indexOf("/wcm") > -1) {
            return window.top;
        }
        else if (window.parent.location.href.toLowerCase().indexOf("/inbiz") > -1) {
            return window.top;
        }
        else {
            return window;
        }
    }
    catch (ex) {
        return window;
    }
};