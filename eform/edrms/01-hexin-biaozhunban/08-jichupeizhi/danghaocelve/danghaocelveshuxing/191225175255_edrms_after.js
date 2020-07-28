var strategyId =  $.getQueryString('id');

$('#addToStrategyBtn').css('margin-left','80px');

$('#ifFill span').attr('title','按最大值的位数自动补齐');

var viewtype = $.getQueryString("viewtype");
if(viewtype!='0' &&  viewtype!='1'){

}else {
    eform("sectionType").method("show");// 策略元素选择列表
}

//策略元素类型 静态列表change事件
eform("sectionType").method("onChange",function (newValue, oldValue){

	eform("addToStrategyBtn").method("hide");
	if(newValue){
		eform("addToStrategyBtn").method("show"); //显示 添加到策略详情 按钮
	}

	eform("fixedStr").method("hide");  //隐藏固定值输入框
	eform("dateFormat").method("hide");//隐藏 时间下拉列表

	eform("startValue").method("hide");//隐藏 开始值输入框
	eform("maxValue").method("hide");//隐藏 最大值输入框
	eform("ifFill").method("hide");//隐藏 按补齐位数 开关
	eform("ifFill").method("setValue","补齐位数");// 按补齐位数 开关
	eform("limitHandle").method("hide");//隐藏 超限处理方式 单选框
	eform("limitHandle").method("setValue","超限继增");// 超限处理方式 单选框
	eform("scopeField").method("hide");//隐藏 自增域下拉列表

	eform("dynamicField").method("hide");//隐藏 动态属性 下拉列表
	eform("sectOrArchType").method("hide");//隐藏 类型 下拉列表
	eform("sectOrArchType").method("setValue","本级编号");
	eform("level").method("hide");//隐藏 层级 输入框


	if(newValue=="fixedStr"){
		eform("fixedStr").method("show");
		
	}else if(newValue=="dateFormat"){
		eform("dateFormat").method("show");//显示 时间下拉列表
		
	}else if(newValue=="autoAdd"){
		eform("startValue").method("show");//显示 开始值输入框
		eform("maxValue").method("show");// 最大值输入框
		eform("ifFill").method("show");//显示 按补齐位数 开关
		eform("limitHandle").method("show");//显示 超限处理方式 单选框
		eform("scopeField").method("show");//显示 变量 下拉列表
		
	}else if(newValue=="dynamicField"){
		eform("dynamicField").method("show");//显示 动态属性 下拉列表
		
	}
	else if(newValue=="sect"){//全宗编号
		eform("sectOrArchType").method("show");
		
	}
	else if(newValue=="archType"){//档案类型编号
		eform("sectOrArchType").method("show");
		
	}

});


//类型 静态列表change事件
eform("sectOrArchType").method("onChange",function (newValue, oldValue){
	eform("level").method("hide");//隐藏 层级 输入框
	if(newValue=="指定层级编号"){
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

		if(sectionType=="fixedStr"){ //固定字符
			var fixedStr =	eform("fixedStr").method("getValue");
			value = '{固定值,'+ fixedStr+ '}';
			
		}else if(sectionType=="dateFormat"){ //时间
			var dateStr=eform("dateFormat").method("getValue");
			if(!dateStr){
				window.top.$.messager.alert("提示","请选择一种时间格式！");
				return false;
			}
			value = '{时间,'+ dateStr+ '}';
			
		}else if(sectionType=="autoAdd"){ // 自增长
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
			var limitHandle = eform("limitHandle").method("getValue");
			var scopeField = 	eform("scopeField").method("getValue");

			value = '{自增长,'+startValue+'~'+maxValue+','+ifFill+','+limitHandle+','+scopeField+'}';
		}else if(sectionType=="curUserAccount"){
			value = '{当前用户账号}'
			
		}else if(sectionType=="curUserDeptCode"){
			value = '{当前用户部门编号}'
			
		}else if(sectionType=="dynamicField"){ //变量
			var dynamicField = eform("dynamicField").method("getValue");
			if(!dynamicField){
				window.top.$.messager.alert("提示","请选择一个变量！");
				return false;
			}
			value ='{变量,'+	dynamicField +'}';
			
		}
		else if(sectionType=="sect"){ //全宗编号
			var sectOrArchType = eform("sectOrArchType").method("getValue");
			if(sectOrArchType=="指定层级编号"){
				if(!isPositiveInteger( eform("level").method("getValue") )){
					window.top.$.messager.alert("提示","层级只能是正整数！");
					return false;
				}
				value ='{全宗,'+sectOrArchType+','+eform("level").method("getValue")+'}';
			}else{
				value ='{全宗,'+sectOrArchType+'}';
			}
		}
		else if(sectionType=="archType"){ //档案类型编号
			var sectOrArchType = eform("sectOrArchType").method("getValue");
			if(sectOrArchType=="指定层级编号"){

				if(!isPositiveInteger( eform("level").method("getValue") )){
					window.top.$.messager.alert("提示","层级只能是正整数！");
					return false;
				}

				value ='{档类,'+sectOrArchType+','+eform("level").method("getValue")+'}';
			}else{
				value ='{档类,'+sectOrArchType+'}';
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
	
	var strategyList = extractMessage(details);
	var strategyJsonStr = getStrategyJsonStr(strategyList);
	eform("detailsJsonStr").method("setValue",strategyJsonStr);
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

/**
 * 获取字符串中{}中间的内容
 * @param msg
 * @return
 */
function extractMessage(msg) {
	var list = [];
	var start = 0;
	var startFlag = 0;
	var endFlag = 0;
	for (var i = 0; i < msg.length; i++) {
		if (msg.charAt(i) == '{') {
			startFlag++;
			if (startFlag == endFlag + 1) {
				start = i;
			}
		} else if (msg.charAt(i) == '}') {
			endFlag++;
			if (endFlag == startFlag) {
				list.push(msg.substring(start + 1, i));
			}
		}
	}
	return list;
}

function getStrategyJsonStr(arr){
	var newArr = [];
	for(var i=0;i<arr.length;i++){
		var type = arr[i].split(",")[0];
		var value = "";
		var json = {};
		switch(type){
			case "固定值":
				value = arr[i].split(",")[1];
				json = {"type":"fixedStr","value":value}
				break;
			case "时间":
				value = arr[i].split(",")[1];
				json = {"type":"dateFormat","value":value}
				break;
			case "当前用户账号":
				json = {"type":"curUserAccount"}
				break;
			case "当前用户部门编号":
				json = {"type":"curUserDeptCode"}
				break;
			case "变量":
				value = arr[i].split(",")[1];
				json = {"type":"dynamicField","value":value}
				break;
			case "全宗":
				value = arr[i].split(",")[1];
				json = {"type":"sect","value":value}
				if(value=="指定层级编号"){
					var level = arr[i].split(",")[2];
					json.level = level;
				}
				break;
			case "档类":
				value = arr[i].split(",")[1];
				json = {"type":"archType","value":value}
				if(value=="指定层级编号"){
					var level = arr[i].split(",")[2];
					json.level = level;
				}
				break;
			case "自增长":
				var startValue =  arr[i].split(",")[1].split("~")[0];
				var maxValue =  arr[i].split(",")[1].split("~")[1];
				var ifFill = arr[i].split(",")[2]=="不补齐位数"?false:true;
				var limitHandle = (arr[i].split(",")[3]=="超限还原"?false:true);
				var scopeField = arr[i].split(",")[4];
				var value = "";
				if(scopeField){
					value = {}
				}else{
					value = startValue-1;
				}
				json = {
					"type":"autoAdd",
					"startValue":startValue-0,
					"maxValue":maxValue-0,
					"ifFill":ifFill,
					"limitHandle":limitHandle,
					"scopeField":scopeField,
					"value":value
				}
				break;
			default:
		}
		newArr.push(json);
	}
	return JSON.stringify(newArr);
}