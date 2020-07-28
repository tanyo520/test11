$('#formContainer').css("padding","30px");
var height = $(window).height()-450;
$('#eformHidden1').parent().append('<div style="height:'+height+'px"></div>');


eform("ID").method("setValue", $.getQueryString('Id')); //给主键赋值

// 按钮点击事件
eform("eformButton1").method("onClick", function (buttonName, buttonId) {
	if(buttonId == "97bffb2b-6da4-1715-001f-a43cc41523fe"){//删除
		window.top.$.messager.confirm("提示", "确认此操作吗", function (bool){ if (bool === true) {

			var nodeid = eform("ID").method("getValue");
			eform.dataset("SelectChildDict", {Id: nodeid}, function (result) {
				var data=result.Data[0].length;
				if(data=="0"){
					var param = {Id:nodeid};
                    eform.dataset("selectDictDetail", param, function (result) {
                        if(result.Data[0].length>0){
                            var dictType = result.Data[0][0].type;
                            if (dictType=='1'){
                                window.top.$.messager.alert("提示", "系统级字典不能删除！");
                            }else {
                                eform.dataset("deleteDict", param, function (result) {
                                    if(result.EffectOfRow=="1"){

                                        window.top.$.messager.alert("提示", "删除信息成功！");

                                        //更改右侧区域
                                        var	formId = "200305232631_edrms&page=dict";//默认页面表单id
                                        var src = "/eform/index?formid="+formId+"&skin=techblue";
                                        $(top.document).find("iframe").eq(1).attr("src",src);

                                        //刷新左侧树
                                        var treeSrc =$(top.document).find("iframe").eq(0).attr("src");
                                        $(top.document).find("iframe").eq(0).attr("src",treeSrc);

                                    }
                                }, false);
                            }
                        }
                    }, false);
				}else{
					window.top.$.messager.alert("提示", "不能删除！");
				}
			}, false);

		}});
	}
	else if(buttonId == "ad5df226-9e8f-f4ae-d57d-05d34410e773"){//保存

		/*****penglin 保存 增加验证 start *********/
        var msg = "";
        var reg = /^[0-9]*$/;
        if (eform.isNull(eform("type").method("getValue"))) {
            msg += "请选择字典类型！<br>";
        }

        if (eform.isNull(eform("name").method("getValue"))) {
            msg += "请输入字典名称！<br>";
        }else {
            var dictName = eform("name").method("getValue");
            var param={
                name:'name',
                value:dictName
            };
            eform.dataset("selectDictByField", param, function (result) {
                if(result.Data[0].length>0){
                    var nodeid = eform("ID").method("getValue");
                    if (nodeid!=result.Data[0][0].Id){
                        msg += "字典名称已存在，请重新输入！<br>";
                    }
                }
            }, false);
        }

        if (eform.isNull(eform("code").method("getValue"))) {
            msg += "请输入字典代码！<br>";
        }else {
            var dictCode = eform("code").method("getValue");
            var param={
                name:'code',
                value:dictCode
            };
            eform.dataset("selectDictByField", param, function (result) {
                if(result.Data[0].length>0){
                    var nodeid = eform("ID").method("getValue");
                    if (nodeid!=result.Data[0][0].Id) {
                        msg += "字典代码已存在，请重新输入！<br>";
                    }
                }
            }, false);
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

        /********penglin 保存 增加验证 end **************************/
		edoc2Form.formParser.save(function(rid){

			edoc2Form.formParser.changeFormToEdit(eform.recordId);
			edoc2Form.isNewRecord = false;
			window.top.$.messager.alert("提示", "保存成功！");

            //刷新左侧树
            var treeSrc = $(top.document).find("iframe").eq(0).attr("src");
            $(top.document).find("iframe").eq(0).attr("src", treeSrc);

            //更改右侧区域
            var formId = "200305232631_edrms&page=dict";//默认页面表单id
            var src = "/eform/index?formid=" + formId + "&skin=techblue";
            $(top.document).find("iframe").eq(1).attr("src", src);

		},null,eform.recordId,"",true,false);

	}
});