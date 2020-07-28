var propertiesFormId = '191225175255_edrms';//策略属性表单
var prefixUrl = eform.virtualPath + '/index?formid=';

/*重写跳转的表单
*/
eform("eformListGrid1").method("onUrlFormatter", function (url, operateBtn) {

    var rowInfos = eform("eformListGrid1").method("getSelectedRows");//获取查询列表被选中的值

    if (operateBtn.formName == "新增") {
        var newFormUrl = prefixUrl+propertiesFormId+'&skin=techblue&viewtype=0';
        return newFormUrl;
    }
    else if (operateBtn.formName == "查看") {
        var newFormUrl = prefixUrl+propertiesFormId+'&skin=techblue&id='+rowInfos[0].ID;
        return newFormUrl;
    }
    else if (operateBtn.formName == "编辑") {
        var newFormUrl = prefixUrl+propertiesFormId+'&skin=techblue&id='+rowInfos[0].ID+'&viewtype=1';
        return newFormUrl;
    }
});

/*
*自定义按钮
*/
eform("eformListGrid1").method("customButtonEvent", function (formId, ids, name, callback) {

    if (name == "删除") {
        var rows = eform("eformListGrid1").method("getSelectedRows");
        if (rows.length == 0) {
            window.top.$.messager.alert("提示", "请先选择需要删除的数据！");
            return false;
        }else{
            var ids = "";
            for (var i = 0; i < rows.length; i++) {
                ids = ids + ",'" + rows[i].ID + "'"
            }
            ids = ids.substring(1);
            var count = 0;
            eform.dataset("selectByStrategyIds", {strategyIds: ids}, function (result) {
                count = result.Data[0].length;
            }, false);
            if(count>0){
                window.top.$.messager.alert("提示", "不能删除已被引用的策略！");
                return false;
            }

            window.top.$.messager.confirm("提示", "确认此操作吗？", function (bool) {
                if (bool === true) {
    
                    var ids = "";
                    for (var i = 0; i < rows.length; i++) {
                        ids = ids + ",'" + rows[i].ID + "'"
                    }
                    ids = ids.substring(1);
                    var param = {
                        ids: ids,
                        tableName: 'strategy'
                    };
                    eform.dataset("deleteByIds", param, function (result) {
                        if (result.EffectOfRow > 0) {
                            eform("eformListGrid1").method("load"); //表格刷新
                            window.top.$.messager.alert("提示", "操作成功！");
                        } else {
                            window.top.$.messager.alert("提示", "操作失败！");
                        }
                    }, false);
                }
            });
        }
        
    }

    callback && callback();// 最后一行,该行代码必须
});


/*子窗体自定义按钮点击事件
* formId 表单ID
* id 选中记录编号
* name 按钮名称
* callback 点击后事件
*/
eform("eformListGrid1").method("childFormButtonEvent", function (formId, ids, name, callback) {
    if (name == "保存") {
        eform("eformListGrid1").method("getControl").ChildFormDialog.iframe[0].contentWindow.window.save(function () {
            eform("eformListGrid1").method("getControl").ChildFormDialog.close();
            eform("eformListGrid1").method("load"); //父页面表格刷新
        });
    }
    else if (name == "保存并新增") {
        eform("eformListGrid1").method("getControl").ChildFormDialog.iframe[0].contentWindow.window.saveandnew(function () {
            eform("eformListGrid1").method("getControl").ChildFormDialog.close();
            eform("eformListGrid1").method("load"); //父页面表格刷新
            $("#d9549f29-5095-2545-abf7-12681b644265").click();
            window.top.$.messager.alert("提示", "保存成功！");
        });
    }
    callback && callback();// 最后一行,该行代码必须
});