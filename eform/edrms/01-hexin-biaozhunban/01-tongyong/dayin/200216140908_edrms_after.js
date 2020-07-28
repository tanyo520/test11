window.dayin = function(callback){
		var print= eform("print").method("getValue");
		console.log(print);
		if(!print){
			window.top.$.messager.alert("提示", "请先选择打印模板！")
			return;

		}
		var jsonval="";
    	var fileId = '';
		if(print=="42"){
			jsonval={
				"page":"",
				"drawing":"",
				"note":"",
				"user":"",
				"year":"",
				"month":"",
				"day":"",
				"checkuser":"",
				"checkyear":"",
				"checkmonth":"",
				"checkday":"",
				"checknote":"",
				"updatenote":""
			};
		}
		else if(print=="31"){
			var archinfo=[];
			var archinfos=eform.parentForm("eformListGrid1").method("getSelectedRows"); //获取父页面的值
			console.log(archinfos);
			for(var i=0;i<archinfos.length;i++){
				var info={
					"number":archinfos[i].number,
					"user":archinfos[i].archiver,					
					"name":archinfos[i].name,
					"date":archinfos[i].writtendate,
					"note":archinfos[i].note
				};			
				archinfo.push(info);
			}
			jsonval={
				"name":
				archinfo				
			};
		}
		else if(print=="32"){
			jsonval={
				"archname":"",
				"name":"",
				"duration":"",
				"secert":"",
				"organization":"",
				"date":""
			};
		}
		else if(print=="328"){ // 备考表
            fileId = '0bec19c7-d999-4602-a519-7dbf0ebbe798';
			debugger;
			var archinfo=[];
			var archinfos=eform.parentForm("eformListGrid1").method("getSelectedRows"); //获取父页面的值
			jsonval={
				"archNo":archinfos[0].number,                    //档案号
				"number":"1",                        //总件数
				"pageNum":archinfos[0].page==null?"":archinfos[0].page+" "                         //总页数
			
			};
		}
        else if(print=="326"){ // 签署表
            fileId = 'e847c32b-8cbb-4b1c-bac6-29fd3b7a36d6';
            debugger;
            var archinfo=[];
            var archinfos=eform.parentForm("eformListGrid1").method("getSelectedRows"); //获取父页面的值
            jsonval={
                "num":" ",
                "dossierName":" ",
                "cenum":" "
            };
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
		erros:function(msg){
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