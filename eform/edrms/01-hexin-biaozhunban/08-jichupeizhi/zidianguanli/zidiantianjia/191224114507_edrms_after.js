$('#formContainer').css("padding", "30px");
var height = $(window).height() - 450;

var heightstr = height + "px";

var divStr = `<div style="height: ` + heightstr + `"></div>`;

$('#eformHidden1').parent().append(divStr);

eform("parent_dict_id").method("setValue", $.getQueryString('pId'));
eform("level").method("setValue", parseInt($.getQueryString('level')) + 1);


// 按钮点击事件
eform("eformButton1").method("onClick", function (buttonName, buttonId) {

    if (buttonName == "清空") {//清空
        eform("type").method("setValue", '');
        eform("name").method("setValue", '');
        eform("code").method("setValue", '');
        eform("value").method("setValue", '');
        eform("sort").method("setValue", '');

    }
    else if (buttonName == "保存") {//保存
        var msg = "";
        var reg = /^[0-9]*$/;
        if (eform.isNull(eform("type").method("getValue"))) {
            msg += "请选择字典类型！<br>";
        }

        if (eform.isNull(eform("name").method("getValue"))) {
            msg += "请输入字典名称！<br>";
        }

        if (eform.isNull(eform("code").method("getValue"))) {
            msg += "请输入字典码！<br>";
        }


        if (eform.isNull(eform("value").method("getValue"))) {
            msg += "请输入字典值！<br>";
        }
        if (eform.isNull(eform("sort").method("getValue"))) {
            msg += "请输入字典排序！<br>";
        }
        if (!reg.test(eform("sort").method("getValue"))) {
            msg += '排列序号请输入正确的数字！<br>';
        }

        if (msg != "") {
            window.top.$.messager.alert("提示", msg);
            return false
        }

        edoc2Form.formParser.save(function (rid) {
            edoc2Form.formParser.changeFormToEdit(eform.recordId);
            edoc2Form.isNewRecord = false;
            window.top.$.messager.alert("提示", "保存成功！");

            //刷新左侧树
            var treeSrc = $(top.document).find("iframe").eq(0).attr("src");
            $(top.document).find("iframe").eq(0).attr("src", treeSrc);

            //更改右侧区域
            var formId = "200305232631_edrms&page=dict";//默认页面表单id
            var src = window.location.protocol + "//" + window.location.host + "/eform/index?formid=" + formId + "&skin=techblue";
            $(top.document).find("iframe").eq(1).attr("src", src);

        }, null, eform.recordId, "", true, false);

    }
});