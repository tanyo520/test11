//eform("sectionType").method("hide");//隐藏 策略元素选择列表
eform("fixedStr").method("hide");  //隐藏固定值输入框
eform("addToStrategyBtn").method("hide"); //隐藏 添加到策略详情 按钮
eform("dateStr").method("hide");//隐藏 时间下拉列表
eform("startValue").method("hide");//隐藏 开始值输入框
eform("maxValue").method("hide");//隐藏 开始值输入框
eform("ifFill").method("hide");//隐藏 按补齐位数 开关
eform("limitHandleType").method("hide");//隐藏 超限处理方式 单选
eform("autoCreaseScope").method("hide");//隐藏 自增域下拉列表
eform("dynamicField").method("hide");//隐藏 变量名 下拉列表
eform("sectOrArchType").method("hide");//隐藏 类型 下拉列表
eform("level").method("hide");//隐藏 层级 输入框

var viewtype = $.getQueryString("viewtype");
if(viewtype!='0' &&  viewtype!='1'){
    if(viewtype!='0' &&  viewtype!='1') { //不是编辑或者新增的时候，所有控件只读
        var blockinfo = window.eform.getBlocks();
        for (var i = 0; i < blockinfo.length; i++) {
            eform.setReadonly(blockinfo[i].id, true, eform.objType.block);
        }
    }
}else{

    var datas = [];
    var token = $.getToken(); //获取admin用户token；

    $.ajax({
        type:"get",
        url:"/api/services/MetaData/GetMetaDataTypeById",//获取元数据表单  控件信息接口
        async:false,
        data:{
            token:token,
            typeId:'200504223839_edrms' //条目属性母版表单id
        },
        success: function(e) {
            if(e.result=="0" && e.data){
                $.each(e.data.MetaAttrList,function(index,item){
                    if(item.ControlModel.FiledName!='number'){
                        datas.push({value:item.ControlModel.FiledName,text:item.ControlModel.Name});
                    }
                });
            }
        },
        error: function() {
        }
    });

    var dataStr = $.toJSON(datas);
    eform("dynamicField").method("getControl").setProperty("datasource", dataStr); // 修改datasource属性的值
}

//获取admin的token
function getAdminToken(){
    var host =  window.location.host;
    var token = '';
    $.ajax({
        type: "POST",
        url: "/api/services/Org/UserLoginIntegrationByUserLoginName",
        async:false,
        contentType:'application/json',
        data: JSON.stringify({
            "LoginName": 'admin',
            "IPAddress": host,
            "IntegrationKey": '46aa92ec-66af-4818-b7c1-8495a9bd7f17'
        }),
        dataType: "json",
        success: function(res){
            token = res.data
        }
    });
    return token;
}