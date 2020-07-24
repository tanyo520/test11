var viewtype = $.getQueryString('viewtype'); // 默认查看，0新增,1编辑
var entrystate = $.getQueryString('entrystate');//默认是档案库状态1，整编库状态为0


var ifMoveFile = $.getQueryString('ifMoveFile'); // 1:移交归档页面过来的

var formid = $.getQueryString('formid'); //
var archTypeId = '';
eform.dataset("selectByFormId", {formid:formid}, function(result) {
    archTypeId = result.Data[0][0].arch_type_id;
}, false);

var folderId = '';
var archTableName = '';
var sectId = '';
var archtypename = "";
var fields_def = [];
eform.dataset("Selectarchtype", {Id:archTypeId}, function(result) {
    folderId = result.Data[0][0].folder_id;
    archTableName = result.Data[0][0].arch_table_name;
    sectId = result.Data[0][0].sect_id;
    archtypename = result.Data[0][0].name;
    fields_def = eval(result.Data[0][0].fields_def);
}, false);

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


//移交归档
if (ifMoveFile == "1") {

    var info = eform.parentForm("fileInfos").method("getValue"); //获取父页面的值

    var controls = eform.getControlsByBlockId("1e5d17c0-3f39-a5bd-a1f9-31e0e515f78f");
    var ctrolInfo = [];
    for (var ii = 0; ii < controls.length; ii++) {
        ctrolInfo.push(controls[ii].controlId);
    }
    info = JSON.parse(info);
    var metainfoArr = [];
    for (var i = 0; i < info.length; i++) {
        var result = getMetaData(info[i].FileId);

        var metainfo = "";

        if (result.data.length == "0") {

        }
        else {
            metainfo = result.data[0].MetaAttrList;
        }
        metainfoArr.push(metainfo);

        //时间格式化
        info[i].CreateTime=eform.dateFormat(new Date( info[i].CreateTime),"yyyy-MM-dd hh:mm:ss");
    }

    if (metainfoArr.length > 1) {
        var metainfoFirst = metainfoArr[0];
        var metainfoResult = [];
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
            // if (ctrolInfo.includes(metainfoResult[j].AttrId)) {
            //     eform(metainfoResult[j].AttrId).method("setValue", metainfoResult[j].AttrValue);
            // }
            if (ctrolInfo.indexOf(metainfoResult[j].AttrId) >-1 ) {
                eform(metainfoResult[j].AttrId).method("setValue", metainfoResult[j].AttrValue);
            }
        }

    } else {
        var metainfo = metainfoArr[0];
        for (var j = 0; j < metainfo.length; j++) {
            if (eform(metainfo[j].AttrId)) {
                eform(metainfo[j].AttrId).method("setValue", metainfo[j].AttrValue);
            }
        }

    }

    eform("eformAttachmentList1").method("load", info, true);
}

//获取元数据
function getMetaData(field) {
    var result = "";
    var token = $.cookie("token");
    $.ajax({
        type: "Get",
        async: false,
        url: "/api/services/MetaData/GetMetaDataByFileId",
        data: {
            token: token,
            fileId: field,
            docType: "2"
        },
        success: function (data) {
            result = data;
        },
        error: function (data) {
            result = data;
        }
    })
    return result;
}



function mySave() {
    var alertMsg = "";
    var nameisNull = eform.isNull(eform("name").method("getValue"));
    /***************penglin add start *******************************/
    var regEn = /[`~!@#$%^&*()_+<>?:"{},.\/;'[\]]/im,

        regCn = /[·！#￥（——）：；“”‘、，|《。》？、【】[\]]/im;
    /***************penglin add end *******************************/
    if (nameisNull) {
        alertMsg+="请输入档案名称！<br>"
    }
    else{
        /***************penglin add start *******************************/
        if(regEn.test(eform("name").method("getValue")) || regCn.test(eform("name").method("getValue"))) {
            window.top.$.messager.alert("提示", "档案名称不能包含特殊字符");
            return false;
        }
        /***************penglin add end *******************************/
        //判断名称重复
        var param = {
            tableName:archTableName,
            name:eform("name").method("getValue")
        }
        eform.dataset("selectByName", param, function (result) {
            if(result.Data[0].length>0){
                if(viewtype=='0'){
                    alertMsg+="档案名称重复！<br>"
                }else{
                    if(result.Data[0][0].Id!=eform.recordId){
                        alertMsg+="档案名称重复！<br>"
                    }
                }
            }
        }, false);
    }

    var writtendateisNull = eform.isNull(eform("writtendate").method("getValue"));
    if (writtendateisNull) {
        alertMsg+="请选择成文日期！<br>"
    }
    var carrierisNull = eform.isNull(eform("carrier").method("getValue"));
    var carrier = eform("carrier").method("getValue");
    if (carrierisNull) {
        alertMsg+="请选择载体形式！<br>"
    }else {
        if(carrier!='电子'&&carrier!='实体'&&carrier!='混合'){
            alertMsg+="该载体形式不存在,请重新选择！<br>"
        }
        if (carrier=='实体'||carrier=='混合') {
            var entitynumisNull = eform.isNull(eform("entitynum").method("getValue"));
            if (entitynumisNull) {
                alertMsg+="请输入实体数量！<br>"
            }else {
                var reg = /^[0-9]*$/;
                if (!reg.test(eform("entitynum").method("getValue"))) {
                    alertMsg += '实体数量请输入正确的数字！<br>';
                }
            }
            var objtypeisNull = eform.isNull(eform("objtype").method("getValue"));
            if (objtypeisNull) {
                alertMsg+="请选择实体类型！<br>"
            }else {
                var objtype = eform("objtype").method("getValue");
                if(objtype!='纸质'&&objtype!='录像'&&objtype!='奖牌'&&objtype!='奖杯'){
                    alertMsg+="该实体类型不存在,请重新选择！<br>"
                }
            }
        }
    }
    var durationisNull = eform.isNull(eform("duration").method("getValue"));
    if (durationisNull) {
        alertMsg+="请选择保管期限！<br>"
    }

    if(eform("year") && eform("year").method("getValue")){
        if(!isInteger(eform("year").method("getValue"))){
            alertMsg+="年度请填写整数！<br>"
        }
    }

    if(eform("page") && eform("page").method("getValue")){
        if(!isInteger(eform("page").method("getValue"))){
            alertMsg+="页数请填写整数！<br>"
        }
    }

    if(alertMsg){
        window.top.$.messager.alert("提示", alertMsg);
        return false;
    }

    //获取保管期限的值
    var duration = eform("duration").method("getValue");
    var writtendate = eform("writtendate").method("getValue");
    var deadTime = '';
    var durationtext = "";
    if (duration == '0'||duration=='永久' ) {
        deadTime = '9999-12-31';
        durationtext = "永久";
    } else if (duration == '10'||duration=='10年' ) {
        deadTime = writtendate.substring(0, 4) - (-10) + writtendate.substring(4);
        durationtext = "10年";
    } else if (duration == '20'||duration=='20年' ) {
        deadTime = writtendate.substring(0, 4) - (-20) + writtendate.substring(4);
        durationtext = "20年";
    } else if (duration == '30'||duration=='30年' ) {
        deadTime = writtendate.substring(0, 4) - (-30) + writtendate.substring(4);
        durationtext = "30年";
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
    var sectname = "";
    eform.dataset("SelectSect", {Id: sectId}, function (result) {
        var data = result.Data[0][0];
        sectname = data.name;
    }, false);
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
        if (fields_def[i].field == "duration") {
            param[fields_def[i].field] = durationtext;
        } else {
            if(eform(fields_def[i].field)){
                param[fields_def[i].field]=eform(fields_def[i].field).method("getValue");
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
            console.log("成功");
        },
        error: function () {
            console.log("失败");
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
        var token = getAdminToken();
        var permissionList = [];
        var json = {
            "MemberId": eform.userInfo.IdentityId,
            "MemberType":1 ,//1用户，2部门，4职位，8用户组
            "PermType": 10 //分配权限
        };
        permissionList.push(json);
        var info = eform.parentForm("fileInfos").method("getValue");
        console.log(info);
        info = JSON.parse(info);
        for(var k=0;k<info.length;k++){
            //删除整编人的预览权限
            deleteFilePermission(info[k].FileId,permissionList,token);

            //移动电子文件到指定文件夹
            MoveFilesToDesignatedFolder(info[k].FileId,folderId,token);
        }

    }

}

window.save = function (callback) {

    var panel = eform.loading("正在创建条目信息，请稍等"); // 打开遮罩层

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


window.saveandnew = function (callback) {

    var panel = eform.loading("正在创建条目信息，请稍等"); // 打开遮罩层

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

    param.account4CreateNumber = account
    param.deptCode4CreateNumber = deptCode
    param.archTypeId4CreateNumber = archTypeId
    param.entityId4CreateNumber = entityId
    param.tableName4CreateNumber = tableName
    param.type4CreateNumber = type

    var host = window.location.hostname;
    var archNo = '';
    $.ajax({
        type: "POST",
        async: false,
        url: window.location.protocol+"//" + host + ":8002/number/api/number/createNumber",
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

        console.log([year,month,date,hour,minute,second].join(''));
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

//获取admin的token
function getAdminToken(){
    var host =  window.location.host;
    var token = '';
    $.ajax({
        type: "POST",
        url: window.location.protocol+"//"+host+"/api/services/Org/UserLoginIntegrationByUserLoginName",
        async:false,
        contentType:'application/json',
        data: JSON.stringify({
            "LoginName": 'admin',
            "IPAddress": host,
            "IntegrationKey": '46aa92ec-66af-4818-b7c1-8495a9bd7f17'
        }),
        dataType: "json",
        success: function(res){
            token = res.data
        }
    });
    return token;
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
    var host =  window.location.host;
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