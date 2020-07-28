var archList = eform.parentForm("eformListGrid1").method("getSelectedRows"); //获取父页面查询列表被选中的值

var tableName= $.getQueryString("tableName");
var ifDossier= $.getQueryString("ifDossier");
var curToken = $.cookie("token");
window.delayDate = function(callback){



    //获取选中的案卷id
    var delayDate= eform("delayDate").method("getValue");

    if(!delayDate){
        window.top.$.messager.alert("提示", "请选择延期日期！");
        return;
    }else
    {
       if(new Date(eform("delayDate").method("getValue")) > new Date("9999-12-31")
            || new Date(eform("delayDate").method("getValue")) < new Date("1753-11-11") )
        {
            window.top.$.messager.alert("提示", "请输入合法的延期日期！");
            return;
        }
    }

    if(delayDate){
        var sectname='';
        var archtypename='';
        var archPropFormId='';
        var dossierPropFormId='';
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
            ,delayTime:delayDate
            ,deadTime:delayDate
            ,archIds:archIds
            ,tableName:tableName
        };
        eform.dataset("updateDeadTimeById", param, function (result) {

            debugger;
            if (result.EffectOfRow>0){
                var archTableName_g='';
                var dossierTableName_g='';
                //查询档案类型id 和 全宗名称 和档案类型名称
                eform.dataset("selectSectNameByTableName", {tableName:tableName}, function (result) {
                    sectname=result.Data[0][0].sectName;
                    archtypename=result.Data[0][0].archTypeName;
                    archTableName_g=result.Data[0][0].arch_table_name;
                    dossierTableName_g=result.Data[0][0].dossier_table_name;
                    archPropFormId=result.Data[0][0].archPropFormId;
                    dossierPropFormId=result.Data[0][0].dossierPropFormId;
                }, false);

                if (ifDossier=='0'){
                    var archLists = [];
                    eform.dataset("selectByIds", {ids:archIds,tableName:tableName}, function (result) {
                        archLists = result.Data[0];
                    }, false);

                    eform.dataset("updateArchDirArchStatus", {ids:archIds,archStatus:'1'}, function (result) {
                        //批量修改档案中间表状态
                    }, false);

                    for (var j = 0; j < archLists.length; j++) {
                        var arch = archLists[j];
                        arch.entrystate='1';
                        arch.objectid=arch.Id;
                        insertES(arch,archPropFormId,sectname,archtypename,archTableName_g);
                    }


                }
                else {  //案卷
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
                    for(var i=0;i<archList.length;i++){

                        var entityId = archList[i].ID;
                        var dossier = {};
                        eform.dataset("selectArchById", {tableName: dossierTableName_g,archId: entityId}, function (result) {
                            dossier = result.Data[0][0];
                        }, false);
                        dossier.entrystate='1';
                        dossier.objectid=entityId;
                        insertDossierES(dossier,dossierPropFormId,sectname,archtypename,dossierTableName_g,archTableName_g);

                    }
                    for (var j = 0; j < archData.length; j++) {

                        var arch = archData[j];
                        arch.entrystate='1';
                        arch.objectid=arch.Id;

                        insertES(arch,archPropFormId,sectname,archtypename,archTableName_g);
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
    var sectIdPath = selectSectIdPath(info.sectid);
    var archTypeIdPath = selectArchTypeIdPath(info.archtypeid);
    info["sectIdPath"] = sectIdPath;
    info["archTypeIdPath"] = archTypeIdPath;
    info["sectAndArchTypePath"] = sectIdPath+"/"+archTypeIdPath;
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
    info["storageIdPath"]=sectStorageIdPath(entityId,"0");
    /*  for(var o  in info){

          if(isNaN(info[o])&&!isNaN(Date.parse(info[o]))) {
              info[o] =parseDateUtil(info[o]);
          }

      }*/
    delete info.delayTime;
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


//案卷插入es
function insertDossierES(info,filePropertyFormId,sectName,archTypeName,dossierTableName,archTableName){
    var entityId = info.objectid;
    //通过档案ID 获取 电子文件
    /*var fileIds = [];
    var files = [];
    var filenames = [];
    eform.dataset("selectAttachmentByArch", {archID: entityId}, function (result) {if (result.Data) {
        var fileinfo = result.Data[0];
        for (var j = 0; j < fileinfo.length; j++) {
            var fileid = {"fileid": fileinfo[j].FileId};
            var filename = {"filename": fileinfo[j].Name};
            files.push(fileid);
            filenames.push(filename);
            fileIds.push(fileinfo[j].FileId);
        }}
    }, false);*/
    var sectIdPath = selectSectIdPath(info.sectid);
    var archTypeIdPath = selectArchTypeIdPath(info.archtypeid);
    info["objectpath"]="0\\2\\";
    info["objectfactpath"]=["0\\2\\"];
    info["objecttype"]=2;
    info["formid"]=filePropertyFormId;
    info["sectname"]=sectName;
    info["archtypename"]=archTypeName;
    info["archTableName"]=archTableName;
    info["dossierTableName"]=dossierTableName;
    //info["files"]=files;
   // info["filenames"]=filenames;
    info["archtypenamekeyword"]=archTypeName;
    info["sectIdPath"] = sectIdPath;
    info["archTypeIdPath"] = archTypeIdPath;
    info["sectAndArchTypePath"] = sectIdPath+"/"+archTypeIdPath;
    info["storageIdPath"]=sectStorageIdPath(entityId,"1");
    delete info.delayTime;
    $.ajax({
        type: "post",
        async: false,
        url: "http://localhost:8012/edrmscore/api/search/insertDossierES?token="+curToken,
        data:JSON.stringify({
            id: entityId,
            forms: info
        }),
        contentType:'application/json',
        success: function (e) {
            console.log("插入ES成功");
        },
        error: function () {
            console.log("插入ES失败");
        }
    })
}



//查询 sectId路径
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
