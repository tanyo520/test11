var archList = eform.parentForm("eformListGrid1").method("getSelectedRows"); //获取父页面查询列表被选中的值

var tableName= $.getQueryString("tableName");
var ifDossier= $.getQueryString("ifDossier");

window.delayDate = function(callback){


    debugger;
    //获取选中的案卷id
    var delayDate= eform("delayDate").method("getValue");

    if(!delayDate){
        window.top.$.messager.alert("提示", "请选择延期日期！");
        return;
    }

    if(delayDate){
        var sectname='';
        var archtypename='';
        var formId='';
        var archTypeId = '';
        var da = new Date(Date.parse(delayDate));
        var delayDateFormat=da.getTime(); //延期时间的时间戳
        var nowDate = new Date().getTime();//当前日的时间戳

        if( delayDateFormat < nowDate ){
            window.top.$.messager.alert("提示", "请选择未来的时间！");
            return;
        }

        var archIds = "";
        for(var i=0;i<archList.length;i++){
            archIds = archIds+",'"+ (archList[i].ID==null?archList[i].Id:archList[i].ID) +"'"
        }
        archIds = archIds.substring(1);
        var param = {
            entrystate: 1
            ,deadTime:delayDate
            ,archIds:archIds
            ,tableName:tableName
        };
        eform.dataset("updateDeadTimeById", param, function (result) {

            if (result.EffectOfRow>0){
                var formType = '';
                if (ifDossier=='0'){
                    formType = '0';
                    var archLists = [];
                    eform.dataset("selectByIds", {ids:archIds,tableName:tableName}, function (result) {
                        archLists = result.Data[0];
                    }, false);
                    eform.dataset("selectSectNameByTableName", {formType:formType,tableName:tableName}, function (result) {
                        sectname=result.Data[0][0].sectName;
                        archtypename=result.Data[0][0].archTypeName;
                        formId=result.Data[0][0].form_id;
                    }, false);

                    eform.dataset("updateArchDirArchStatus", {ids:archIds,archStatus:'1'}, function (result) {
                        //批量修改档案中间表状态
                    }, false);

                    for (var j = 0; j < archLists.length; j++) {
                        var arch = archLists[j];
                        arch.entrystate='1';
                        arch.objectid=arch.Id;
                        insertES(arch,formId,sectname,archtypename,tableName);
                    }


                }
                else {  //案卷
                    formType = '2';
                    var archTableName_g='';

                    //查询档案类型id 和 全宗名称 和档案类型名称
                    eform.dataset("selectSectNameByTableName", {formType:formType,tableName:tableName}, function (result) {
                        sectname=result.Data[0][0].sectName;
                        archtypename=result.Data[0][0].archTypeName;
                        archTableName_g=result.Data[0][0].arch_table_name;

                    }, false);
                    //查询此案卷下所有的档案
                    var archData = [];
                    eform.dataset("SelectArchByDossierIds",{dossierIds:archIds,tableName:archTableName_g}, function (result) {
                        if (result.Data.length > 0) {
                            archData = result.Data[0]
                        }
                    }, false);
                    eform.dataset("updateDossierDirArchStatus", {ids:archIds,archStatus:'1'}, function (result) {
                        //批量修改案卷中间表状态
                    }, false);
                    eform.dataset("updateArchDirArchStatusByDossierIds", {dossierIds:archIds,archStatus:'1',archTableName:archTableName_g}, function (result) {
                        //批量修改卷内档案中间表状态
                    }, false);

                    for (var j = 0; j < archData.length; j++) {

                        var arch = archData[j];
                        arch.entrystate='1';
                        arch.objectid=arch.Id;

                        var archFormId = selectArchTypeForm(archTypeId, '0', '0');
                        insertES(arch,archFormId,sectname,archtypename,archTableName_g);
                    }


                }


                window.top.$.messager.alert("提示", "延期成功！");

            }
            else {
                window.top.$.messager.alert("提示", "延期失败！");
            }

        }, false);
    }
    callback &&callback();
};



//插入es
function insertES(info,filePropertyFormId,sectname,archtypename,archTableName){

    var entityId = info.objectid;

    //通过档案ID 获取 电子文件
    var fileIds = [];
    var files = [];
    var filenames = [];
    eform.dataset("selectAttachmentByArch", {archID: entityId}, function (result) {
        if (result.Data){
            var fileinfo = result.Data[0];
            for (var j = 0; j < fileinfo.length; j++) {
                var fileid = {"fileid": fileinfo[j].FileId};
                var filename = {"filename": fileinfo[j].Name};
                files.push(fileid);
                filenames.push(filename);
                fileIds.push(fileinfo[j].FileId);
            }
        }
    }, false);

    info["objectpath"]="0\\2\\";
    info["objectfactpath"]=["0\\2\\"];
    info["objecttype"]=2;
    info["formid"]=filePropertyFormId;
    info["sectname"]=sectname;
    info["archtypename"]=archtypename;
    info["archTableName"]=archTableName;
    info["files"]=files;
    info["filenames"]=filenames;
    info["archtypenamekeyword"]=archtypename;

    /*  for(var o  in info){

          if(isNaN(info[o])&&!isNaN(Date.parse(info[o]))) {
              info[o] =parseDateUtil(info[o]);
          }

      }*/

    $.ajax({
        type: "post",
        async: false,
        url: "/insight/search/indexDocument",
        data: {
            Id: entityId,
            Index: "uis_items",
            FileIds: fileIds,
            Data: JSON.stringify(info)
        },
        success: function (e) {
            console.log("插入ES成功");
        },
        error: function () {
            console.log("插入ES失败");
        }
    })
}



/**
 * 查询表单
 *@param archTypeId   档案类型id
 *@param archState      默认0
 *@param formType     表单类型  0文件属性，1文件列表，2案卷属性，3案卷列表
 **/
function selectArchTypeForm(archTypeId ,archState, formType ){
    var res = {}
    var param = {
        arch_type_id:archTypeId
        ,formstate: archState
        ,form_type: formType
    }
    eform.dataset("selectForm", param,function(result){
        res = result.Data[0][0];
    },false);
    return res;
}