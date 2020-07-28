alert("aaa")
window.dayin = function(callback){
	var print= eform("printDossier").method("getValue");
	console.log(print);
	if(!print){
		window.top.$.messager.alert("提示", "请选择打印模板！");
		return;

	}
	var jsonval="";
    var fileId = '';
    var archTypeId = $.getQueryString("archTypeId");
	//获取档案类型 code start 
	var currentArchType="";
    if(print=="327"){ //卷内文件目录
        fileId = 'a3f77931-5f8b-4fc1-9c95-5e8edc76b97a';
        debugger;
        var archinfo=[];
        var archinfos=eform.parentForm("eformListGrid1").method("getSelectedRows"); //获取父页面的值
        var dossierId=[];
        if(archinfos.length>0){
            dossierId=archinfos[0].ID;
        }
        /***start 通过档案类型ID获取档案数据表名****/
        var archTableName="";

        eform.dataset("Selectarchtype",  {Id: archTypeId}, function (result) {
            var data=result.Data[0][0];	
            archTableName=data.arch_table_name;		
        }, false);
        /***end 通过档案类型ID获取档案数据表名****/

        /***start 通过表名和案卷ID获取卷内信息****/
        var archResult=[];	
        eform.dataset("selectArchByDossier",  {tableName:archTableName,Id: dossierId}, function (result) {
            archResult=result.Data[0];		
        }, false);
        /***end 通过表名和案卷ID获取卷内信息****/
        debugger
        for(var i=0;i<archResult.length;i++){
            var obj=archResult[i];
            // 序号、档号、编码、文号、文件名称、页数、格式、密级、保管期限、备注
            var info={
                "jianhao":(i+1)+"",
                "zerenzhe":obj.charger==null?"":obj.charger,
                "wenhao":obj.number==null?"":obj.number,
                "timing":obj.name==null?"":obj.name,
                "riqi":obj.writtendate==null?"":eform.dateFormat(new Date(obj.writtendate),"yyyy/MM/dd"),
                "yeshu":obj.pagenumber==null?"":obj.pagenumber,
                "beizhu":obj.note==null?"":obj.note
            };			
            archinfo.push(info);
        }

        jsonval={
            "snArchName":archinfo,
            "dossierNo":archinfos[0].number

        };
    }
    else if(print=="328"){ //备考表
        fileId = '0bec19c7-d999-4602-a519-7dbf0ebbe798';
        debugger;
		var archinfos=eform.parentForm("eformListGrid1").method("getSelectedRows"); //获取父页面的值
		var dossierId=[];
		if(archinfos.length>0){
			dossierId=archinfos[0].ID;
		}
		/***start 通过档案类型ID获取档案数据表名****/
		var archTableName="";	
		//var archTypeId = localStorage.getItem("archTypeId");
		eform.dataset("Selectarchtype",  {Id: archTypeId}, function (result) {
			var data=result.Data[0][0];	
			archTableName=data.arch_table_name;		
		}, false);
		/***end 通过档案类型ID获取档案数据表名****/

		/***start 通过表名和案卷ID获取卷内信息****/
		var archResult=[];	
		eform.dataset("selectArchByDossier",  {tableName:archTableName,Id: dossierId}, function (result) {
			archResult=result.Data[0];		
		}, false);
		/***end 通过表名和案卷ID获取卷内信息****/
		var archNumber=archResult.length;
		var pageNum=0;
		for(var i=0;i<archResult.length;i++){
			var obj=archResult[i];
			if(archResult[i].page!=null || archResult[i].page!=undefined){
				
				pageNum+=parseInt(archResult[i].page+'blue');
			}else{
				pageNum+=0;
			}
		}
		jsonval={
			"archNo":archinfos[0].number,                    //案卷号
			"number":archNumber+" " ,                        //总件数
			"pageNum":pageNum+" "                         //总页数
		
		};
    }
    else if(print=="326"){ // 案卷封面
		debugger;
        fileId = 'e847c32b-8cbb-4b1c-bac6-29fd3b7a36d6';
        var archinfos=eform.parentForm("eformListGrid1").method("getSelectedRows"); //获取父页面的值
        console.log(archinfos);
        if(archinfos.length>0) {
           if(archinfos.length>1){
               window.top.$.messager.alert("提示", "请选择单个案卷打印！");
		   }else {
               var sectName = ''; var sectCode = ''; var archTypeCode = ''; var archTypeName = '';
               eform.dataset("selectSectAndArchTypeByArchTypeId",  {archTypeId: archTypeId}, function (result) {
                   if (result.Data.length>0){
                       var data=result.Data[0][0];
                       sectName=data.sectName;
                       sectCode=data.sectCode;
                       archTypeCode=data.archTypeCode;
                       archTypeName=data.archTypeName;
                   }

               }, false);
               var obj=archinfos[0];
               var startDate=obj.writtendate==null?"":obj.writtendate;
               var endDate=obj.deadTime==null?"":obj.deadTime;
               if (endDate.indexOf('9999')>-1){
                   endDate = '永久';
			   }
               var rangDate=startDate+" 至 "+endDate;
               jsonval={
                   "sectCode":sectCode,
                   "dossierNo":obj.number==null?"":obj.number,
                   "typeCode":archTypeCode,
                   "dossierName":obj.name==null?"":obj.name,
                   "rangDate":rangDate,
                   "savePeriod":obj.duration==null?"":obj.duration,
                   "archiver":obj.archiver==null?"":obj.archiver
               };
		   }
        }
    }
	jsonval= JSON.stringify(jsonval);
	var token = $.cookie("token");
	var data = {
		fileId: fileId ,
		token: token,
		jsonData: jsonval,
		fileFormat: "pdf"
	};
	printfile(data);
}


var host=window.location.host;
function printfile(data){
	$.ajax({

		url: "/wordtemplate/WordTemplate/SaveWordFile",
		type: "post",                      
		data: data,      
		success: function (msg) {   
			if (msg) {
				msg = JSON.parse(msg);
				if (msg.Status == true) {
					var url = msg.filePath;
					console.log(url);
					url=window.location.protocol+"//"+host+"/"+url;
					printurl(url);
				}

			}   
		},
		error:function(msg){
			console.log(msg);
		}
	});
}



function printurl(url){
	try {
		var elemIF = document.createElement("iframe");
		elemIF.src = url;
		window.open(url);
	} catch (e) {
		window.top.$.messager.alert("下载异常！");
	}
}

// 获取保管期限
function formatDuration(value){
	if(value=="0")
	{
		return "永久";
	}
	else if(value=="10")
	{
		return "10年";
	}
	else if(value=="20")
	{
		return "20年";
	}
	else if(value=="30")
	{
		return "30年";
	}
}


function PrefixInteger(num, n) {
	return (Array(n).join(0) + num).slice(-n);
}