//laoyan1();

function laoyan() {
	// 	var FileIds=[];
	// 	FileIds.push("25");	
	// 	var Data="";
	// 	//var Data='{"测试","Moses",Files:[{"fileid":"25"}]}';//json字符串

	// 	// 	Data= JSON.stringify(Data)
	// 	//	console.log(Data);
	var token = $.cookie("token");

	// 	var Index="uis_items";
	var id =16209;//parseInt((1 + Math.random()) * 10000);
	var insightHost = '192.168.252.156:8001';
	$.ajax({
		type: "post",
		url: "http://" + insightHost + "/Search/IndexDocument?token=" + token,
		data: {
			Id: id,
			Index: "uis_items",
			FileIds: [321,322],
			Data:  JSON.stringify( {
				"objectpath":"0\\2\\",
				"objectfactpath": ["0\\2\\"],
				"objecttype":2,
				"name": "1212123121",
				"user": "档案用户121212",
				"files": [{ "fileid": 321 }, { "fileid": 322 }]
			})
		},
		success: function (e) {
			console.log(e)
			console.log("成功");
		},
		error: function () {
			console.log("失败");

		}
	})
}






var fileIds=[];

function laoyan1() {
	debugger;


	// 	var param = {
	// 		"objectpath":"0\\2\\",
	// 		"objectfactpath": ["0\\2\\"],
	// 		"objecttype":2,	
	// 		"objectid":"c534d3f6-7b9a-43c2-a85b-84613610dbcf",
	// 		"objtype": "纸质11111",
	// 		"entrystate":"1"
	// 	};

	var param = {
		"formid": "200325053304_edrms",
		"note": "",
		"archiver": "",
		"writtendate": "2020-03-16",
		"sectId": "cabb8f3a-e607-4aa6-a148-489e75cf5d90",
		"year": "2020",
		"objectpath": "0\\2\\",
		"sectname": "上海鸿翼-华东交付中心",
		"ifDossiered": "0",
		"archtypename": "文书档案",
		"secert": "普通商密",
		"objectfactpath": ["0\\2\\"],
		"duration": "永久",
		"archtypeid": "511f9d46-6e4b-40c1-9b0e-a56419bc9b3b",
		"archivername": "",
		"secertexp": "",
		"id": "511f9d46-6e4b-40c1-9b0e-a56419bc9b3b",
		"objecttype": 2,
		"entitynum": "1",
		"sectid": "cabb8f3a-e607-4aa6-a148-489e75cf5d90",
		"archivedate": "",
		"deadTime": "9999-12-31",
		"entrystate": "0",
		"objtype": "纸质",
		"storageroom": "1",
		"reorganizedate": "",
		"secertduration": "0",
		"carrier": "实体",
		"archTableName": false,
		"charger": "文书测试04",
		"chargedept": "文书测试04",
		"reorganizer": "test1",
		"name": "文书测试04",
		"files": [],
		"dossierId": "",
		"page": "1",
		"objectid": "772ed686-9a4a-41aa-887b-91b90ecbdbde"
	};








	$.ajax({
		type: "post",
		url: "/insight/search/indexDocument",
		data: {
			Id: "772ed686-9a4a-41aa-887b-91b90ecbdbde",
			Index: "uis_items",
			FileIds: fileIds,
			Data:  JSON.stringify(param)
		},
		success: function (e) {		
			console.log(e)
			console.log("成功");
		},
		error: function () {
			console.log("失败");
		}
	})
}



function laoyan2() {
	debugger;


	var param = {
		"objectpath":"0\\2\\",
		"objectfactpath": ["0\\2\\"],
		"objecttype":2,	
		"objectid":"208bb2b6-1924-4893-a42f-41947dda1d5c",
		"objtype": "纸质11111",
		"entrystate":"1"
	};
	$.ajax({
		type: "get",
		url: "/insight/search/DeleteAsync?id=74774018-56a6-48ae-a108-cf37b58be49a&index=uis_items",
		// 		data: {
		// 			Id: "208bb2b6-1924-4893-a42f-41947dda1d5c",
		// 			Index: "uis_items",
		// 			FileIds: fileIds,
		// 			Data:  JSON.stringify(param)
		// 		},
		success: function (e) {		
			console.log(e)
			console.log("成功");
		},
		error: function () {
			console.log("失败");
		}
	})
}