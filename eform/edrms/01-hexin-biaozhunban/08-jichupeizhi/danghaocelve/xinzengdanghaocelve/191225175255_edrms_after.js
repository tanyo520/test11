var strategyId =  $.getQueryString('id');

$('#addToStrategyBtn').css('margin-left','80px');

$('#ifFill span').attr('title','按最大值的位数自动补齐');

var viewtype = $.getQueryString("viewtype");
if(viewtype!='0' &&  viewtype!='1'){
}else{
 eform("sectionType").method("show");// 策略元素选择列表	
}

//策略元素类型 静态列表change事件
eform("sectionType").method("onChange",function (newValue, oldValue){

	//eform("addToStrategyBtn").method("hide");
	if(newValue){
		eform("addToStrategyBtn").method("show"); //显示 添加到策略详情 按钮
	}

	eform("fixedStr").method("hide");  //隐藏固定值输入框
	eform("dateStr").method("hide");//隐藏 时间下拉列表

	eform("startValue").method("hide");//隐藏 开始值输入框
	eform("maxValue").method("hide");//隐藏 最大值输入框
	eform("ifFill").method("hide");//隐藏 按补齐位数 开关
	eform("ifFill").method("setValue","1");//隐藏 按补齐位数 开关
	eform("limitHandleType").method("hide");//隐藏 超限处理方式 单选框
	eform("limitHandleType").method("setValue","1");//隐藏 超限处理方式 单选框
	eform("autoCreaseScope").method("hide");//隐藏 自增域下拉列表

	eform("dynamicField").method("hide");//隐藏 动态属性 下拉列表
	eform("sectOrArchType").method("hide");//隐藏 类型 下拉列表
	eform("sectOrArchType").method("setValue","1");
	eform("level").method("hide");//隐藏 层级 输入框


	if(newValue==1){
		eform("fixedStr").method("show");
	}else if(newValue==2){
		eform("dateStr").method("show");//显示 时间下拉列表
	}else if(newValue==3){
		eform("startValue").method("show");//显示 开始值输入框
		eform("maxValue").method("show");//隐藏 最大值输入框
		eform("ifFill").method("show");//显示 按补齐位数 开关
		eform("limitHandleType").method("show");//显示 超限处理方式 单选框
		//eform("autoCreaseScope").method("show");//显示 变量 下拉列表
	}else if(newValue==6){
		eform("dynamicField").method("show");//显示 动态属性 下拉列表
	}
	else if(newValue==7){//全宗编号
		eform("sectOrArchType").method("show");//隐藏 类型 下拉列表
	}
	else if(newValue==8){//档案类型编号
		eform("sectOrArchType").method("show");//隐藏 类型 下拉列表
	}

});


//类型 静态列表change事件
eform("sectOrArchType").method("onChange",function (newValue, oldValue){
	eform("level").method("hide");//隐藏 层级 输入框
	if(newValue==3){
		eform("level").method("setValue","");
		eform("level").method("show");//显示 层级 输入框
	}
});


//提交到策略 按钮点击事件
eform("addToStrategyBtn").method("onClick", function (buttonName, buttonId) {

	if(buttonName === "添加至策略详情"){

		var  details=	eform("details").method("getValue"); //获取策略详情当前值
		var sectionType = eform("sectionType").method("getValue");

		var value = '';

		if(sectionType==1){ //固定字符
			value =	eform("fixedStr").method("getValue");
		}else if(sectionType==2){ //时间
			var dateStr=getComboText("dateStr");
			if(!dateStr){
				return false;
			}
			value = '{时间,'+ dateStr+ '}';
		}else if(sectionType==3){ // 自增长
			var startValue = eform("startValue").method("getValue");
			if(!isInteger( startValue )){
				window.top.$.messager.alert("提示","开始值只能是非负整数！");
				return false;
			}
			var maxValue = eform("maxValue").method("getValue");
			if(!isInteger( maxValue )){
				window.top.$.messager.alert("提示","最大值只能是非负整数！");
				return false;
			}
			var ifFill = eform("ifFill").method("getValue");
			var limitHandleType = eform("limitHandleType").method("getValue");
			var autoCreaseScope = 	eform("autoCreaseScope").method("getValue");

			value = '{自增长,'+startValue+'-'+maxValue+','+ifFill+','+limitHandleType+',<'+(startValue-1)+'>,'+autoCreaseScope+'}';
		}else if(sectionType==4){
			value = '{当前用户账号}'
		}else if(sectionType==5){
			value = '{当前用户部门编号}'
		}else if(sectionType==6){ //变量
			if(!eform("dynamicField").method("getValue")){
				return false;
			}
			value ='{变量,'+	eform("dynamicField").method("getValue") +'}';
		}
		else if(sectionType==7){ //全宗编号
			var sectOrArchType = eform("sectOrArchType").method("getValue");
			if(sectOrArchType==3){
				if(!isPositiveInteger( eform("level").method("getValue") )){
					window.top.$.messager.alert("提示","层级只能是正整数！");
					return false;
				}
				value ='{全宗编号,'+sectOrArchType+','+eform("level").method("getValue")+'}';
			}else{
				value ='{全宗编号,'+sectOrArchType+'}';
			}
		}
		else if(sectionType==8){ //档案类型编号
			var sectOrArchType = eform("sectOrArchType").method("getValue");
			if(sectOrArchType==3){

				if(!isPositiveInteger( eform("level").method("getValue") )){
					window.top.$.messager.alert("提示","层级只能是正整数！");
					return false;
				}

				value ='{档案类型编号,'+sectOrArchType+','+eform("level").method("getValue")+'}';
			}else{
				value ='{档案类型编号,'+sectOrArchType+'}';
			}
		}

		if(details){
			details =details +"-"+ value;
		}else{
			details = value;
		}

		eform("details").method("setValue",details);//给策略详情赋值
	}
});


//保存
window.save = function (callback) {
    var panel = eform.loading("正在创建，请稍等"); // 打开遮罩层
    var rs = mySave();
    if(rs==false){
        eform.loaded(panel); // 关闭遮罩层
        return false;
    }

    edoc2Form.formParser.save(function (rid) {
        edoc2Form.formParser.changeFormToEdit(eform.recordId);
        edoc2Form.isNewRecord = false;

        eform.loaded(panel); // 关闭遮罩层
        window.top.$.messager.alert("提示", "保存成功！");

        callback && callback();
    }, null, eform.recordId, "", true, false);

};

//保存并新建
window.saveandnew = function (callback) {

    var panel = eform.loading("正在创建，请稍等"); // 打开遮罩层
    var rs = mySave();
    if(rs==false){
        eform.loaded(panel); // 关闭遮罩层
        return false;
    }

    edoc2Form.formParser.save(function (rid) {
        edoc2Form.formParser.changeFormToEdit(eform.recordId);
        edoc2Form.isNewRecord = false;

        eform.loaded(panel); // 关闭遮罩层
        window.top.$.messager.alert("提示", "保存成功！");

        //重置form表单的主键
        var iframeFormid = $.getQueryString("formid", window.location.href);
        var iframeFormParser = window.instancesFormParser[iframeFormid];
        iframeFormParser.instanceFormConfig.recordId = iframeFormParser.eform.recordId = $.genId();
        //修复保存并新建后,隐藏域数据无法提交bug
        iframeFormParser.eform.isNewRecord = iframeFormParser.formData.isNewRecord = iframeFormParser.instanceFormConfig.isNewRecord = true;

        callback && callback();
    }, null, eform.recordId, "", true, false);
};

//通用保存方法
function mySave() {
    var name = eform("name").method("getValue");
    var code = eform("code").method("getValue");
    var details = eform("details").method("getValue");

    var msg = '';
    if(name.trim()==''){
        msg += '策略名称不可为空！<br>';
    }
    if(code.trim()==''){
        msg += '策略编号不可为空！<br>';
    }
    if(details.trim()==''){
        msg += '策略详情不可为空！<br>';
    }
    var data = getByName(name);
    if(strategyId){
        if(data.length>0 && data[0].Id!=strategyId){
            msg += '策略名称重复！<br>';

        }
    }else{
        if(data.length>0){
            msg += '策略名称重复！<br>';

        }
    }

    data = getByCode(code);
    if(strategyId){
        if(data.length>0 && data[0].Id!=strategyId){
            msg += '策略编号重复！<br>';
        }
    }else{
        if(data.length>0){
            msg += '策略编号重复！<br>';
        }
    }
    if (msg) {
        window.top.$.messager.alert("提示", msg);
        return false;
    }

    //表单提交前 版本自动加1
    var val = eform("version").method("getValue");
    val=val-(-1);
    eform("version").method("setValue",val);
    return true;
}

//获取静态列表 选中的字符
function getComboText(controlId){
	var itemArr = [];
	var optionList=  $($("li[controlid='"+controlId+"'] select")).find("option");
	for(var i=0;i<optionList.length;i++ )
	{
		//itemArr[i]={"aa":"dd","vv":"cc" };
		itemArr.push({ name:$(optionList[i]).text(), value:$(optionList[i]).attr("value") });
	}

	//$($("li[controlid='fileproperty'] select")).find("option").each(function () {
	//	itemArr.push({ name=$(this).text(), value=$(this).attr("value") });
	//});
	var itemSelectValue = eform(""+controlId+"").method("getValue");
	var itemSelectText = "";
	(itemArr).some(function (item, l, arr) {
		if (item.value == itemSelectValue) {
			itemSelectText = item.name; 
			return true;
		}
	});
	return itemSelectText;
}

//通过策略名称查询策略
function getByName(name){
	var data = [];
	var param = {name:name}
	eform.dataset("getNumberStrategyByName", param, function(result) {
		data = result.Data[0]
	}, false);
	return data;
}

//通过策略编码查询策略
function getByCode(code){
	var data = [];
	var param = {code:code}
	eform.dataset("getNumberStrategyByCode", param, function(result) {
		data = result.Data[0]
	}, false);
	return data;
}

//是否为非负整数
function isInteger(s){
	var re = /^[0-9]+$/ ;
	return re.test(s)
}

//是否为正整数
function isPositiveInteger(s){
	if(s==0){
		return false;
	}
	var re = /^[0-9]+$/ ;
	return re.test(s)
}