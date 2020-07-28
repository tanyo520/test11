var archTypeId = $.getQueryString("archTypeId");
var ifDossier = $.getQueryString("ifDossier"); //是否是案卷  0：档案；1：案卷
var entrystate = $.getQueryString("entrystate"); //档案、案卷的状态
var archType = {};
/*eform.dataset("Selectarchtype", {Id:archTypeId}, function(result) {
	archType = result.Data[0][0];
}, false);
var arch_table_name = archType.arch_table_name;*/

var archinfo= eform.parentForm("eformListGrid1").method("getSelectedRows"); //获取父页面的值
var res = '';
var formTableName = '';
var shujujiName='';
var ControlId = '';
if(ifDossier=='0'){
    res= selectArchTypeForm(archTypeId, '0', '1');
    formTableName = res.formdbname;
    ControlId = '3aa080c4-1e98-2290-f270-982513b4d9d4';
    shujujiName = 'selectarchfileinfoByifDossierAndFiledName';
}else  if(ifDossier=='1'){
	res = selectArchTypeForm(archTypeId, '0', '3');
    formTableName = res.formdbname;
    ControlId ='ead3948b-5a5b-6b4d-d42f-b49182d94ec9';
    shujujiName = 'selectarchfileinfoByEntrystateAndFiledName';
}

if (entrystate=='0'){
    entrystate = "0,9";
}else if (entrystate=='1'){
    entrystate = "1";
}
window.piliangguajie = function(callback){
	debugger;
	var user = eval(eform.userInfo);
	var filedinfo= eform("eformSelectbox1").method("getValue"); //获取父页面的值
	if(!filedinfo){
		window.top.$.messager.alert("提示", "请先选择对比字段！");
		return;
	}
	var field=filedinfo;
	eform("file").method("getValue"); //获取父页面的值
	var fileInfo = eval(eform("file").method("getValue"));
	if(fileInfo.length=="0"){
		window.top.$.messager.alert("提示", "请上传电子文件！");
		return;
	}


	debugger;
    var count = 0;
	if(archinfo.length=="0"){
		for(var i=0;i<fileInfo.length;i++){
			var	fileName ="";
			var	FileIds ="";
			fileName = fileInfo[i].fileName;
			FileIds = fileInfo[i].fileId;
			fileName=fileName.split(".")[0];
            if(ifDossier=='0'){
                var paramValue = {tablename: formTableName, filedname: field, value: fileName, entrystate: entrystate,ifDossiered:0};
            }else  if(ifDossier=='1'){
                var paramValue = {tablename: formTableName, filedname: field, value: fileName, entrystate: entrystate};
            }
			eform.dataset(shujujiName,paramValue,function(result){
				var data=result.Data[0];
				var length=result.Data[0].length;
				if(length>0){
                    for(var j=0;j<length;j++){
                        var newid = $.genId();
                        var param = {
                            Id:newid,
                            RefID:data[j].Id,
                            ControlId: ControlId,
                            FileId: FileIds,
                            Name:fileInfo[i].fileName,
                            FileSize:"10MB",
                            VersionId:"555",
                            ParentFolderId:"全路径",
                            Version:"1.0",
                            NewestVersion:"最新版本号",
                            FullPath:"全路径",
                            CreateTime:parseNowDate(),
                            ModifiedTime:parseNowDate(),
                            Creator: user.ID,
                            ModifyOperator:user.ID
                        };
                        eform.dataset("Insertattachment", param, function(result) {
                        	if (result.ResultCode=="0"){
                                count++;
							}
                            debugger
                        }, false);
                    }
				}
			},false);

		}
        window.top.$.messager.alert("提示", "挂接成功 "+count+" 条！");
	}else{
        var archIds = '';
		for(var k=0;k<archinfo.length;k++) {
            archIds = archIds + ",'" + archinfo[k].ID + "'"
        }
        if (archIds){
            archIds = archIds.substring(1);

            var infos = '';
            eform.dataset("selectByIds", {tableName: formTableName,ids: archIds}, function (result) {
                infos = result.Data[0];
            }, false);
            
		}

        

        for(var i=0;i<fileInfo.length;i++){
			for(var j=0;j<infos.length;j++)
			{
				var info="infos["+j+"]."+field;
				var value="";

				if(field=='writtendate'){
                    //value = eform.dateFormat(new Date(infos[j].writtendate),"yyyy-MM-dd");

                    //value = formatDate(infos[j].writtendate,"yyyy-MM-dd");
                   var date=infos[j].writtendate.replace(/-/g,"/");
                    value= new Date(date).format('yyyy-MM-dd');
                }else {
				    if(eval(info)){
                        value=eval(info);
                    }
                }
				var	fileName ="";
				var	FileIds ="";
				fileName = fileInfo[i].fileName;
				FileIds = fileInfo[i].fileId;
				fileName=fileName.split(".")[0];
				if(value.trim()==fileName.trim()){
					var newid = $.genId();
					var param = {
						Id:newid,
						RefID:infos[j].Id,
						ControlId: ControlId,
						FileId: FileIds,
						Name:fileInfo[i].fileName,
						FileSize:"10MB",
						VersionId:"555",
						ParentFolderId:"全路径",
						Version:"1.0",
						NewestVersion:"最新版本号",
						FullPath:"全路径",
						CreateTime:parseNowDate(),
						ModifiedTime:parseNowDate(),
						Creator: user.ID,
						ModifyOperator:user.ID
					};
					eform.dataset("Insertattachment", param, function(result) {
                        if (result.ResultCode=="0"){
                            count++;
                        }
					}, false);
				}
			}
		}
        window.top.$.messager.alert("提示", "挂接成功 "+count+" 条！");
	}
	callback &&callback();
};


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
}
/**
 * 查询表单
 *@param archTypeId   档案类型id
 *@param archState      档案状态 0整编库，1档案库，2鉴定库，3销毁库，4回收站
 *@param formType     表单类型  0文件属性，1文件列表，2案卷属性，3案卷列表，4未组卷-文件列表，5归卷，6组卷
 **/
function selectArchTypeForm(archTypeId ,archState, formType ){
    var res = {}
    eform.dataset("Selectarchtype", {Id:archTypeId},function(result){
        res = result.Data[0][0];
    },false);
    if(formType=='0'){
        res.form_id = res.archPropFormId;
    }
    else if(formType=='1'){
        res.form_id = res.archListFormId;
    }
    else if(formType=='2'){
        res.form_id = res.dossierPropFormId;
    }
    else if(formType=='3'){
        res.form_id = res.dossierListFormId;
    }
    return res;
}