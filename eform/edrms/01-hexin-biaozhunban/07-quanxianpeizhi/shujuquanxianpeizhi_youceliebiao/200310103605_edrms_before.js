debugger;
var curDataId = $.getQueryString("Id");
var parentIds  = $.getQueryString("parentIds");


/***表格的options已配置完成，表格创建前事件，允许修改参数easyuiOptions的值
只能在解析前(控件绘制前)重写**/
eform("eformDataTable1").method("onBeforeEasyuiControlCreate",function (options) {

	options.loader = function(params,success,error){

		var data = getPermissionByDataIds(parentIds);
		var dataIdArr = parentIds.split(",");
		var resData = [];
		var ids = "''";
		for(var j=0;j<dataIdArr.length;j++){
			for(var i=0;i<data.length;i++){
				if(("'"+data[i].data_id+"'")==dataIdArr[j]){
					var perm_id = data[i].perm_id
					var flag = true;
					for(var k=0;k<resData.length;k++){
						if(perm_id==resData[k].perm_id){
							flag = false;
						}
					}
					if(flag){
						resData.push(data[i]);
						ids += ",'"+data[i].Id+"'"
					}	
				}
			}
		}

		var receiveData = {};
		var param ={
			curDataId:curDataId,
			ids:ids,
			start: (params.page-1)*params.rows,
			pageSize: params.rows,
			dynField  : params.sort==null? 'createTime':params.sort ,
			dynOrder:params.order==null? 'asc':params.order
		};

		var total = resData.length;
		eform.dataset("selectPermission", param, function (result) {
			//查询数据权限
			if(result.ResultCode=="0"){
				receiveData.total=total;
				receiveData.rows=result.Data[0];
			}else{
				console.log('selectPermission数据集报错');
			}
		}, false);
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


//通过data_ids查询数据权限表
function getPermissionByDataIds(dataIds){
	var data = [];
	var param = {
		dataIds:dataIds
	};
	eform.dataset("getPermissionByDataIds", param, function (result) {	
		data = result.Data[0];
	}, false);
	return data;
}