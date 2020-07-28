var height = $(window).height()*0.33;

var tip = '';
var page =  $.getQueryString("page");
if(page=='sect'){
	tip='新建全宗或者选择一个全宗进行编辑';
}else if(page=='rootSect'){
	tip='新建全宗';
}else if(page=='arch'){
	tip='请选择一个档案类型';
}else if(page=='dataPermission'){
	tip='请选择一个全宗或者档案类型';
}else if(page=='dict'){
	tip='新增字典或者选择一个字典进行编辑';
}else if(page=='archType'){
	tip='新增档案类型或者选择一个档案类型进行编辑';
}

$('#eformHidden1').parent().append('<div style="width:100%;height:'+height+'px"></div><div align="center" style="text-align:center">'
								   +'<div id="imgDiv"></div><p style="color:#999;">'+tip+'</p></div>');