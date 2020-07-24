var id = eform.recordId;
var archId = '';
var archTypeId = '';
eform.dataset("selectById", {Id:id,tableName:'borrowarchinfo'}, function (result) {
    archId = result.Data[0][0].archiveId;
    archTypeId = result.Data[0][0].archTypeId;
}, false);

var archTableName = '';
eform.dataset("selectById", {Id:archTypeId,tableName:'arch_type'}, function (result) {
    archTableName = result.Data[0][0].arch_table_name;
}, false);

var archive = {}

eform.dataset("selectById", {Id:archId,tableName:archTableName}, function (result) {
    archive = result.Data[0][0];
}, false);

var startUse = eform("startUseTime").method("getValue");
if(startUse.indexOf('9999')>-1){
    eform("startUseTime").method("setValue", '');
}

if(archive.carrier=='电子'){
    eform("brrowe").method("show");
    eform("brrownum").method("hide");
}
else if(archive.carrier=='实体'){
    eform("brrows").method("show");
}
else{
    eform("brrowe").method("show");
    eform("brrows").method("show");
}

window.save = function (callback) {

    var panel = eform.loading("正在保存，请稍等"); // 打开遮罩层

    var msg = '';
    if(archive.carrier=='电子' && !eform("brrowe").method("getValue")){
        msg+='请选择借阅方式（电子）！<br>'
    }
    if(archive.carrier=='实体' && !eform("brrows").method("getValue")){
        msg+='请选择借阅方式（实物）！<br>'
    }
    if(archive.carrier=='混合' && !eform("brrowe").method("getValue") && !eform("brrows").method("getValue") ){
        msg+='请选择借阅方式（电子）或者借阅方式（实物）！<br>'
    }
    if(!eform("brrowpurpose").method("getValue")){
        msg+='请选择借阅目的！<br>'
    }

    if(!eform("brrowday").method("getValue")){
        msg+='请填写借阅天数！<br>'
    }else if(!isPositiveInteger(eform("brrowday").method("getValue"))){
        msg+='借阅天数只能是正整数！<br>'
    }

    if(eform("brrows").method("getValue")){
        if(!eform("brrownum").method("getValue")){
            msg+='请填写借阅数量！<br>'
        }else if(!isPositiveInteger(eform("brrownum").method("getValue"))){
            msg+='借阅数量只能是正整数！<br>'
        }
    }


    if(!eform("brrowreason").method("getValue")){
        msg+='请填写借阅理由！<br>'
    }

    if(msg){
        window.top.$.messager.alert("提示", msg);
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

//是否为正整数
function isPositiveInteger(s){
    if(s==0){
        return false;
    }
    var re = /^[0-9]+$/ ;
    return re.test(s)
}