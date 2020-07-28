var dictId = $.getQueryString('Id');
var param = {Id:dictId};
eform("type").method("readonly", true);//字典类型
eform.dataset("selectDictDetail", param, function (result) {
    if(result.Data[0].length>0){
        var dictType = result.Data[0][0].type;
        if (dictType=='1'){
            
            eform("name").method("readonly", true);//字典名称
            eform("code").method("readonly", true);//字典代码
        }
    }
}, false);