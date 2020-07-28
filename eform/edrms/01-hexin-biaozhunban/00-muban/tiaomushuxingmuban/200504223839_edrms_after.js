var baseInfoJson = window.baseInfoJson;
var adminToken = baseInfoJson.token;

var viewtype = $.getQueryString('viewtype'); // 默认查看，0新增,1编辑
var entrystate = $.getQueryString('entrystate');//默认是档案库状态1，整编库状态为0
var formid = $.getQueryString('formid'); //
if( entrystate=='3' ){
    $('.datagrid-view').css('pointer-events','none');
}

var ifMoveFile = $.getQueryString('ifMoveFile'); // 1:移交归档页面过来的

var folderId = eform("folderId").method("getValue");
if(!folderId){
    var id = eform.recordId;
    folderId = baseInfoJson[id+"folderId"];
    eform("folderId").method("setValue",folderId);
}

var sectname = baseInfoJson.sectName;
var archTableName = baseInfoJson.arch_table_name;
var sectId = baseInfoJson.sect_id;
var archTypeId = baseInfoJson.Id;
var archtypename = baseInfoJson.name;
var fields_def = baseInfoJson.fields_def.split(",");


if(viewtype=='0'){//新增的时候
    eform("sectid").method("setValue", sectId);
    eform("archtypeid").method("setValue", archTypeId);
    eform("entrystate").method("setValue", entrystate);
}else{//编辑的时候
    var carrier = eform("carrier").method("getValue");
    if (carrier=='实体'||carrier=='混合' ){
        eform("entitynum").method("show");
        eform("objtype").method("show");
    }
}

//移交归档
if (ifMoveFile == "1") {

    var info = eform.parentForm("fileInfos").method("getValue"); //获取父页面的值
    info = JSON.parse(info);
    var fileIds = "";
    for (var i = 0; i < info.length; i++) {
        fileIds+=","+info[i].FileId;
        //时间格式化
        info[i].CreateTime=eform.dateFormat(new Date( info[i].CreateTime),"yyyy-MM-dd hh:mm:ss");
    }
    if(fileIds){
        fileIds = fileIds.substring(1);
    }

    var metainfoArr = [];
    var rs = getMetaDatas(fileIds);//批量获取元数据信息
	var metaDataList = rs.data.entityMetaDataList;
    for (var i = 0; i < metaDataList.length; i++) {
        var result = metaDataList[i];
        var metainfo = [];
        if (result.metaTypeModel.length > 0) {
            metainfo = result.metaTypeModel[0].MetaAttrList;
        }
        metainfoArr.push(metainfo);
    }

    var controls = eform.getControlsByBlockId("1e5d17c0-3f39-a5bd-a1f9-31e0e515f78f");
    var ctrolInfo = [];
    for (var ii = 0; ii < controls.length; ii++) {
        ctrolInfo.push(controls[ii].controlId);
    }

    //只有一个电子文件时，字段匹配上就赋值
    if(metainfoArr.length == 1){
        var MetaAttrList = metainfoArr[0];
        for (var j = 0; j < MetaAttrList.length; j++) {
            if (eform(MetaAttrList[j].AttrId)) {
                eform(MetaAttrList[j].AttrId).method("setValue", MetaAttrList[j].AttrValue);
            }
        }
    }

    //有多个电子文件时，同一个字段的值都相同时才赋值
    else if (metainfoArr.length > 1) {
        var metainfoFirst = metainfoArr[0];
        var metainfoResult = [];//收集 值都相同的 字段
        for (var k = 0; k < metainfoFirst.length; k++) {
            var flag = true;
            for (var i = 1; i < metainfoArr.length; i++) {
                if (metainfoArr[i][k].AttrValue != metainfoFirst[k].AttrValue) {
                    flag = false;
                }
            }
            if (flag) {
                metainfoResult.push(metainfoFirst[k]);
            }
        }

        for (var j = 0; j < metainfoResult.length; j++) {
            if (eform(metainfoResult[j].AttrId)) {
                eform(metainfoResult[j].AttrId).method("setValue", metainfoResult[j].AttrValue);
            }
        }

    }

    eform("eformAttachmentList1").method("load", info, true);
}


//附件列表
eform("eformAttachmentList1").method("getEasyControl").datagrid("resize");
//删除文件后触发 rows 删除的行数据，数组
eform("eformAttachmentList1").method("deleteFileAfter",function(rows){
    var fileIdList = [];
    for(var i=0;i<rows.length;i++){
        fileIdList.push(rows[i].FileId);
    }
    deleteFiles(fileIdList,adminToken);
});

//监听载体形式下拉列表
eform("carrier").method("onChange", function (newValue, oldValue) {
    if (newValue == "电子") {
        eform("entitynum").method("hide");
        eform("objtype").method("hide");
    }
    else {
        eform("entitynum").method("show");
        eform("objtype").method("show");
    }
});


//监听实体数量
$("#_easyui_textbox_input5").bind("input propertychange",function(event){
    var value = $("#_easyui_textbox_input5").val();
    var num= value.replace(/[^0-9]/ig,"");
    if(num){
        num = parseInt(num)
    }
    eform("entitynum").method("setValue", num);
});

//监听档案名称
$("#_easyui_textbox_input1").blur(function(){
    $.removeTips($("#_easyui_textbox_input1"));
});


//是否是保存并新建
var ifSaveAndNew = 0;
$("#8f0263bc-c92c-344b-a50d-00c28fc5e3c9",window.parent.document).click(function(){
    ifSaveAndNew = 1;
});


/*
* 表单提交前事件,返回false将不会提交表单
* @param formId：当前表单编号
*/
eform.engEvent("saveBefore", function (formId) {

    var flag = true;

    // 打开遮罩层
    var panelG = eform.loading("正在创建...请稍等");

    window.setTimeout(function(){
    },1);

    var name = eform("name").method("getValue");
    /***************penglin add start *******************************/
    var regEn = /[`~!@#$%^&*()_+<>?:"{},.\/;'[\]]/im,
        regCn = /[·！#￥（——）：；“”‘、，|《。》？、【】[\]]/im;
    if(regEn.test(name) || regCn.test(name)) {
        $.addTips($("#_easyui_textbox_input1"), "该项不能包含特殊字符");
        flag = false;
    }
    /***************penglin add end *******************************/

    //判断名称重复
    eform.dataset("selectByName", {tableName:archTableName, name:name}, function (result) {
        if(result.Data[0].length>0){
            if(viewtype=='0'){
                flag = false;
                $.addTips($("#_easyui_textbox_input1"), "该项重复，请换一个");
            }else{
                if(result.Data[0][0].Id!=eform.recordId){
                    flag = false;
                    $.addTips($("#_easyui_textbox_input1"), "该项重复，请换一个");
                }
            }
        }
    }, false);

    //成文日期
    var writtendate = eform("writtendate").method("getValue");
    var writtenDateFormat = new Date(writtendate.replace(/-/g,"/"));
    if( writtenDateFormat > new Date("9999-12-31".replace(/-/g,"/"))||writtenDateFormat < new Date("1753-11-11".replace(/-/g,"/"))){
        flag = false;
        $.addTips($("#_easyui_textbox_input3"), "该项日期格式不合法");
    }

    //载体形式
    var carrier = eform("carrier").method("getValue");
    if(carrier!='电子'&&carrier!='实体'&&carrier!='混合'){
        flag = false;
        $.addTips($("#_easyui_textbox_input4"), "该项不存在,请重新选择");
    }
    if (carrier=='实体'||carrier=='混合') {
        var reg = /^[0-9]*$/;
        if (!reg.test(eform("entitynum").method("getValue"))) {
            flag = false;
            $.addTips($("#_easyui_textbox_input5"), "该项只能输入非负整数");
        }
    }

    if(eform("page") && eform("page").method("getValue")){
        if(!isInteger(eform("page").method("getValue"))){
            flag = false;
            $.addTips($("#_easyui_textbox_input9"), "该项只能输入非负整数");
        }
    }

    if(!flag){
        eform.loaded(panelG); // 关闭遮罩层
        ifSaveAndNew = 0;
        return false;
    }

    //年度
    eform("year").method("setValue",writtenDateFormat.getFullYear())

    //获取保管期限的值
    var duration = eform("duration").method("getValue");
    var writtendate = eform("writtendate").method("getValue");
    var deadTime = '';
    var durationtext = "";
    if (duration == '0'||duration=='永久' ) {
        deadTime = '9999-12-31';
        durationtext = "永久";
    } else {
        var deadTimeVal = eform("delayTime").method("getValue");
        if(!deadTimeVal){
            var date = new Date(writtendate);
            date.setFullYear(date.getFullYear()-(0-getNumberic(duration)));
            deadTime = date.format("yyyy-MM-dd");
            durationtext = getNumberic(duration)+"年";
        }else {
            deadTime = deadTimeVal;
        }

    }
    eform("deadTime").method("setValue", deadTime);


    if (entrystate=='0'){
        eform("reorganizer").method("setValue", eform.userInfo.ID);
        eform("reorganizername").method("setValue", eform.userInfo.Name);
        eform("reorganizedate").method("setValue", parseNowDate());
    }
    //中间表
    eform.dataset("SelectEntryByRecordId", {entryId: eform.recordId}, function (result) {
        if (result.Data[0].length > 0) {
            var param = {
                id: result.Data[0][0].Id,
                name: eform("name").method("getValue"),
                archTypeStatus: 0,
                archStatus: entrystate
            };
            eform.dataset("updateEntryDir", param, function (result) {
            }, false);

        } else {
            var newid = $.genId();
            var param = {
                id: newid,
                createId: eform.userInfo.ID,
                updateId: eform.userInfo.ID,
                name: eform("name").method("getValue"),
                sectId: sectId,
                archTypeId: archTypeId,
                archTypeStatus: 0,
                archStatus: entrystate,
                tableName: archTableName,
                entryId: eform.recordId
            };
            eform.dataset("InsertEntryDir", param, function (result) {
            }, false);
        }
    }, false);

    //电子文件
    var fileinfo = eform("eformAttachmentList1").method("getRows");
    var fileIds = [];
    var files = [];
    var filenames = [];


    for (var j = 0; j < fileinfo.length; j++) {
        var fileid = {"fileid": fileinfo[j].FileId};
        var filename = {"filename": fileinfo[j].Name};
        files.push(fileid);
        filenames.push(filename);
        fileIds.push(fileinfo[j].FileId);
        var newid = $.genId();
        var param = {
            id: newid,
            createId: eform.userInfo.ID,
            updateId: eform.userInfo.ID,
            sect_id: sectId,
            name: fileinfo[j].Name,
            arch_id: archTypeId,
            file_id: fileinfo[j].FileId
        };
        eform.dataset("InsertFile", param, function (result) {
        }, false);
    };

    //es方面
    var param = {
        "objectpath": "0\\2\\",
        "objectfactpath": ["0\\2\\"],
        "objecttype": 2,
        "objectid": eform.recordId,
        "formid": formid,
        "sectname": sectname,
        "archtypename": archtypename,
        "archTableName": archTableName,
        "files": files,
        "filenames": filenames,
        "archtypenamekeyword":archtypename
    };

    for (var i = 0; i < fields_def.length; i++) {
        if (fields_def[i] == "duration") {
            param[fields_def[i]] = durationtext;
        } else {
            if(eform(fields_def[i])){
                param[fields_def[i]]=eform(fields_def[i]).method("getValue");
            }
        }
    }

    var number = eform("number").method("getValue").trim();
    if (number == '' && entrystate=='1' ) {
        var account = eform.userInfo.Account;
        var deptCode = eform.userInfo.MainDepartmentIdentityId;
        var entityId = eform.recordId;
        var type = 1;
        number = createNumber(account, deptCode, archTypeId, entityId, archTableName, type, param);
        eform("number").method("setValue", number);
        param["number"]=number;
    }

    var sectIdPath = selectSectIdPath(sectId);
    var archTypeIdPath = selectArchTypeIdPath(archTypeId);
    param["sectIdPath"] = sectIdPath;
    param["archTypeIdPath"] = archTypeIdPath;
    param["sectAndArchTypePath"] = sectIdPath+"/"+archTypeIdPath;
    param["storageIdPath"]=sectStorageIdPath(entityId,"0");
    delete param.delayTime;

    $.ajax({
        type: "post",
        async: false,
        url: "/insight/search/indexDocument",
        data: {
            Id: eform.recordId,
            Index: "uis_items",
            FileIds: fileIds,
            Data: JSON.stringify(param)
        },
        success: function (e) {
            console.log("es成功");
        },
        error: function () {
            console.log("es失败");
        }
    })


    if (ifMoveFile == "1") {

        //从待生效列表中删除
        var fileTransferIds = eform.parentForm("fileTransferIds").method("getValue");
        var fileTransferIdArr = fileTransferIds.split(',');
        for (var i = 0; i < fileTransferIdArr.length; i++) {
            var param = {
                Id: fileTransferIdArr[i],
                delStatus:1
            };
            eform.dataset("updateTransferInfoById", param, function (result) {
                //从待生效列表中更改状态
            }, false);


        }
        //删除整编人的预览权限,移动电子文件到指定文件夹
        var permissionList = [];
        var json = {
            "MemberId": eform.userInfo.IdentityId,
            "MemberType":1 ,//1用户，2部门，4职位，8用户组
            "PermType": 10 //分配权限
        };
        permissionList.push(json);
        var info = eform.parentForm("fileInfos").method("getValue");

        info = JSON.parse(info);
        for(var k=0;k<info.length;k++){
            //删除整编人的预览权限
            deleteFilePermission(info[k].FileId,permissionList,adminToken);

            //移动电子文件到指定文件夹
            MoveFilesToDesignatedFolder(info[k].FileId,folderId,adminToken);
        }

    }

    eform.loaded(panelG); // 关闭遮罩层
    return true;

});


/*
* 表单提交后事件
* @param success：是否提交成功
* @param formId：当前表单编号
*/
eform.engEvent("saveAfter", function (success, formId) {


    if(success == true){ // 判断是否提交成功

        if(ifSaveAndNew==1){

            var src = $(top.document).find("iframe").eq(2).attr("src");
            $(top.document).find("iframe").eq(2).attr("src",src);

        }
    }
});


//提取数字
function getNumberic(str) {
    var num= str.replace(/[^0-9]/ig,"");
    if(num){
        num = parseInt(num)
    }
    else {
        num=0;
    }
    return num;
}


//获取元数据
function getMetaDatas(fields) {
    var result = [];
    var token = $.cookie("token");
    $.ajax({
        type: "Get",
        async: false,
        url: "/api/services/MetaData/GetEntityMetaMapForBatch",
        data: {
            token: token,
            fileIds: fields,
            docType: "2"
        },
        success: function (data) {
            result = data;
        },
        error: function (data) {
            result = data.entityMetaDataList;
        }
    })
    return result;
}


/*生成编号
	@account 当前用户账号
	@deptCode 当前用户所在部门编号
	@archTypeId 档案类型id
	@entityId 实体id
	@tableName 表名
	@type  1档案，2案卷
	@param 当前档案所有字段的json键值对
	*/
function createNumber(account, deptCode, archTypeId, entityId, tableName, type, param) {

    param.token = $.cookie("token");
    param.archTypeId4CreateNumber = archTypeId
    param.entityId4CreateNumber = entityId
    param.type4CreateNumber = type;

    var archNo = '';
    $.ajax({
        type: "POST",
        async: false,
        url: "http://192.168.254.32:8002/edrmscore/api/number/createNumber",
        data: param,
        dataType: "json",
        success: function (res) {
            if (res.RESULT) {
                archNo = res.RESPONSE
            }
        }
    });
    return archNo;
}


function parseDateUtil(data) {

    var formatDateStr='';

    if(isNaN(data)&&!isNaN(Date.parse(data))){
        var da = new Date(Date.parse(data));
        var year = da.getFullYear()+'年';
        var month = da.getMonth()+1+'月';
        var date = da.getDate()+'日';
        var hour = da.getHours()+'时';
        var minute = da.getMinutes()+'分';
        var second = da.getSeconds()+'秒';
        if (hour==0&& minute==0&&second==0){
            formatDateStr = [year,month,date].join('');
        }else {
            formatDateStr = [year,month,date,hour,minute,second].join('');
        }
        //formatDateStr =Date.parse(data).format("yyyy年MM月dd日 hh时mm:ss");
    }
    return formatDateStr;
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


/*移动文件至目标文件夹
*@param [filedid] 文件ID
*@param [entryid] 目标文件夹ID
*/
function MoveFilesToDesignatedFolder(filedid,targetFolderId,token) {
    var array = [];
    array.push(filedid);
    var resultinfoMes = "";
    $.ajax({
        type: "POST",
        async: false,
        url: "/api/services/Doc/MoveFolderListAndFileList",
        dataType: 'json',
        contentType: "application/json; charset=utf-8",
        //调用的参数列表请查找文档具体方法调用的参数列表，大小写要相同
        data: JSON.stringify(
            {
                "FileIdList": array,
                "TargetFolderId": targetFolderId,
                "FolderIdList": [],
                "Token": token
            }
        ),
        success: function (data) {
            var resultInfo = data.result;
            //成功了做相关处理
            resultinfoMes = resultInfo;
        },
        error: function (data) {
            resultinfoMes = "error";
        }
    });

}


//删除文件的预览权限
function deleteFilePermission(fileId,Permissions,token) {
    var rs = {};
    $.ajax({
        type: "POST",
        url: "/api/services/FilePermission/DeleteFilePermission",
        async:false,
        contentType:'application/json',
        data: JSON.stringify({
            "FileId": fileId,
            "Mermbers": Permissions,
            "Token": token
        }),
        dataType: "json",
        success: function(res){
            rs = res
        }
    });
    return rs;
}


function  parseNowDate() {

    var d = new Date();
    //d.setHours(d.getHours());
    var year = d.getFullYear();
    var month = d.getMonth();
    month++;
    var day = d.getDate();
    var hours = d.getHours();
    var minutes = d.getMinutes();
    var seconds = d.getSeconds();
    month = month < 10 ? "0" + month : month;
    day = day < 10 ? "0" + day : day;
    hours = hours < 10 ? "0" + hours : hours;
    minutes = minutes < 10 ? "0" + minutes : minutes;
    seconds = seconds < 10 ? "0" + seconds : seconds;

    var time = year + "-" + month + "-" + day + " " + hours + ":" + minutes + ":" + seconds;
    return time;
};


//批量删除电子文件
function deleteFiles(fileIdArr,token) {
    $.ajax({
        type: "POST",
        url: "/api/services/Doc/RemoveFolderListAndFileList",
        async:false,
        contentType:'application/json',
        data: JSON.stringify({
            "FileIdList": fileIdArr,
            "Token": token
        }),
        dataType: "json",
        success: function(res){
        }
    });

}




//查询 sectId 全路径
function selectSectIdPath(sectId){

    //sectId全路径
    var sectIdPath = "";
    var parentSectId = sectId;
    while (parentSectId && parentSectId!='0'){
        sectIdPath = parentSectId + "/" + sectIdPath;
        var curSect = [];
        eform.dataset("SelectSect", {Id: parentSectId}, function (result) {
            curSect = result.Data[0][0];
        }, false);
        if (curSect){

            parentSectId = curSect.parent_erms_sect_id;
        }
    }
    sectIdPath = sectIdPath.substring(0,sectIdPath.length-1);

    return sectIdPath;

}

//查询 archTypeId 全路径
function selectArchTypeIdPath(archTypeId){
    //archTypeId全路径
    var archTypeIdPath = "";
    var parentArchTypeId = archTypeId;
    while (parentArchTypeId && parentArchTypeId != '0') {
        archTypeIdPath = parentArchTypeId + "/" + archTypeIdPath;
        var curArchType = [];
        eform.dataset("Selectarchtype", {Id: parentArchTypeId}, function (result) {
            curArchType = result.Data[0][0];
        }, false);
        if (curArchType){

            parentArchTypeId = curArchType.parent_arch_type_id;
        }
    }
    archTypeIdPath = archTypeIdPath.substring(0,archTypeIdPath.length-1);

    return archTypeIdPath;
}
//查询库房id全路径
function sectStorageIdPath(entryId,ifDossier){
    var tableName = "";
    //ifDossier ：1案卷 0 档案
    if(ifDossier=="0"){
        tableName = "storage_arch_relation";
    }else if (ifDossier=="1"){
        tableName = "storage_dossier_relation";
    }
    var idPath = "";
    eform.dataset("selectIdPathByEntryId",{tableName:tableName,entryId:entryId},function(result){

        if(result.Data[0][0]){
            idPath=result.Data[0][0].idPath;
        }
    },false);
    return idPath;
}
