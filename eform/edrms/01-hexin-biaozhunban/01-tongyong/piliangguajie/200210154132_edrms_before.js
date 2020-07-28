debugger;

var eformformid= $.getQueryString("eformformid");
var archTypeId = $.getQueryString("archTypeId");
var folderId = '';
var archType = {};
eform.dataset("Selectarchtype", {Id:archTypeId}, function(result) {
	archType = result.Data[0][0];
}, false);	

folderId = archType.folder_id;
eform('file').method("setUploadFolderId", folderId);    

var datas = [];

var tkn=$.getToken(); //获取当前登录用户token；
$.ajax({
	type:"get",
	url:"/api/services/MetaData/GetMetaDataTypeById",//获取元数据表单  控件信息接口
	async:false,
	data:{
		token:tkn,
		typeId:eformformid//改成动态
	},
	success: function(e) {			
		if(e.result=="0" && e.data.MetaAttrList){					
			$.each(e.data.MetaAttrList,function(index,item){
                if (item.ControlModel.ControlType != "edoc2Hidden") {
                    if (item.ControlModel.FiledName != "entitynum" && item.ControlModel.FiledName != "objtype" && item.ControlModel.FiledName != "year")
                        datas.push({value: item.ControlModel.FiledName, text: item.ControlModel.Name});
                }
			});
		}
	},
	error: function() {		
	}
});

var dataStr = $.toJSON(datas);

eform("eformSelectbox1").method("getControl").setProperty("datasource", dataStr); // 修改datasource属性的值