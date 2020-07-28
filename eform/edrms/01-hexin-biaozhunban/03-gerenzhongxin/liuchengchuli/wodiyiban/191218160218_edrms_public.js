var _style = "<style type='text/css'>"
+ ".formBlock .formBlockTitle >span{font-family: 'Microsoft YaHei UI', sans-serif; font-weight: 400;font-style: normal;font-size: 28px;color: rgb(31, 47, 61);}"
+ "</style>";
$("head").append(_style);

//%u6211%u7684%u5DF2%u529E
// 弹窗宽高 tangbangguo 2018/6/29
var dialogWidth = 800;
var dialogHeight = 440;
//public
window.myExtCode = {};

//%u6D41%u7A0B%u540D%u79F0%u70B9%u51FB%u8DF3%u8F6Curl
window.myExtCode.jumpUrl = function(type, proccessId, taskId, incidentId, businessKey, state) {

	if (!taskId || taskId == "undefined") {
		taskId = "";
	}
	if (!incidentId || incidentId == "undefined") {
		incidentId = "";
	}
	var data = {taskType: type, processId: proccessId, taskId: taskId, incidentId: incidentId, businessKey: businessKey, state: state };
	//mobile%u7AEF%u6D41%u7A0B%u9700%u8981%u989D%u5916%u52A0%u53C2%u6570
	if(eform.pageType == "mobile"){
		data.isMobile=true;
	}
	$.ajax({
		type: "get",
		url:"/edoc2Flow-web/edoc2-form/jumpIndex?orgToken="+$.cookie("token")+"&t=" + new Date().getTime(),
		async: true,
		data: data,
		success: function (result) {
			if(eform.pageType == "pc"){
				eval(result);
			}
			else{

		       //ios%u7279%u6B8A%u5904%u7406,window.open ios%u5931%u6548
			   var urlArr = /\('(\S+)'/.exec(result);
				if($.isArray(urlArr)){
					var url = urlArr[1];
					url += "&readonly=true";
					window.location.href= $.addRandomToUrl(url);
				}

			}
		}, 
		error: function () {}
	});

};

//pc%u7AEF%u5F39%u51FA%u6846%u663E%u793A%u6D41%u7A0B%u65E5%u5FD7
window.myExtCode.showWFFlag = function (processId, instanceNo) {
	var url = "";
	if (edoc2Form.edoc2WfLogUrl) {
		url=edoc2Form.edoc2WfLogUrl.replace("$(processDefinitionId)", processId).replace("$(processInstanceId)", instanceNo).replace("$(random)", Math.random());
	}

	url+="&lng="+eform.lang;
	var wfLogInfo = $("#wfLogInfo");
	if (wfLogInfo.length==0) {

		$("body").append("<div id='wfLogInfo'></div>");
		wfLogInfo = $("#wfLogInfo");
	}
	wfLogInfo.dialog({
		title: Edoc2FormSR["Control_WFLog"],
		width: dialogWidth,
		height: dialogHeight,
		border: false,
		maximizable:true,
		closed: false,
		cache: false,
		content: "<iframe src='" + url + "' style='width:100%;height:99%;border:none' scrolling='no'></iframe>",
		modal: true
	});
	return false;
};

//%u8BBE%u7F6E%u6D41%u7A0B%u72B6%u6001%u56FE%u7247
window.myExtCode.setStateImage = function (row) {
	if (!row.Incident_ID) {
		return "";
	}
	var stateImg = "";
	var title = "";
	if (row.Task_State == 0) {
		stateImg = "normal.png";
		title = Edoc2FormSR["Flow_taskState_normal"];
	}
	else if (row.Task_State == 10) {
		stateImg = "back.png";
		title =Edoc2FormSR["Flow_taskState_back"];  
	} 
	else if(row.Task_State==5){
		stateImg = "backgo.png";
		title = Edoc2FormSR["Flow_taskState_backGo"];  
	} 
	else if (row.Task_State == 30) {
		stateImg = "timeout.png";
		title =Edoc2FormSR["Flow_taskState_timeout"];  
	} 
	else if (row.Task_State == 50) {
		stateImg = "assign.png";
		title = Edoc2FormSR["Flow_taskState_assign"];  
	} 
	else if (row.Task_State == 100) {
		stateImg = "normal.png";
		title =  Edoc2FormSR["Flow_taskState_autoComlepte"];  
	} 
	else if (row.Task_State == 110) {
		stateImg = "normal.png";
		title = Edoc2FormSR["Flow_taskState_autoJump"];  
	} 
	else if (row.Task_State == 130) {
		stateImg = "plusSign.png";
		title = Edoc2FormSR["Flow_taskState_plusSign"];  
	} 
	else if (row.Task_State == 120) {
		stateImg = "normal.png";
		title =  Edoc2FormSR["Flow_taskState_revoke"];  
	} 
	else if (row.Task_State == 20) {
		stateImg = "complete.png";
		title = Edoc2FormSR["Flow_taskState_Comlepte"];  
	} 
	else {
		stateImg = "complete.png";
		title = "";
	}

	if(eform.pageType == "pc"){
		return '<img title="' + title + '" src="' + edoc2Form.edoc2EformPath + "/content/workflow/images/" + stateImg + '" style="cursor:pointer;vertical-align: bottom;margin-bottom: 1.5px;" />';
	}
	else{
		return '<img title="' + title + '" src="content/images/workflow_st_' + stateImg + '" style="cursor:pointer;width:20px;height:20px;vertical-align:bottom;" />';
	}
};

//%u8868%u683C%u7684drawbefore%u4E8B%u4EF6
window.myExtCode.drawBefore = function(){
	var efListGrid = eform("edoc2ListGrid_MyComplete");
	var groupType = $.getQueryString("groupType");
	var groupId = $.getQueryString("gid");
	if(groupType == "Group"){
		efListGrid.method("setProcParams", "processCategory",groupId);
	}
	else{
		efListGrid.method("setProcParams","processDefinitionKey",groupId);
	}
	efListGrid.method("customColumnsFormatter", function (value, row, index, field, fieldName) {
		if(eform.pageType == "pc"){
			if(field == "Process_Name"){
				return "<a class='blackA' href=\"#\" onclick=\"javascript:window.myExtCode.jumpUrl('CompleteTask','" + row.Process_ID + "','" + row.Task_ID + "','" + row.Incident_ID + "','" + row.Process_FormKey + "')\">"+value+"</a>";
			}

			if(field == "Num"){
				return "<a><img title='"+Edoc2FormSR["Control_WFLog"]+"' src='"+ edoc2Form.edoc2EformPath + "/content/workflow/images/workflow.png' style=\"cursor:pointer;vertical-align: bottom;margin-bottom: 1px;\" onclick=\"window.myExtCode.showWFFlag('" + row.Process_ID + "','" + row.Incident_ID + "')\"/></a>";
			}

			if(field=="Task_Comment"){
				return "<a style='text-decoration:none;cursor: default;color: #333333;' title='"+ row.Task_Comment+"'>"+row.Task_Comment+"</a>";
			}

			if(field=="Task_State")
			{
				return window.myExtCode.setStateImage(row);
			}
			
			if(field == "Incident_Summary") {
				return "<a style='text-decoration:none;cursor: default;color: #333333;' title='"+row.Incident_Summary+"'>"+row.Incident_Summary+"</a>";
			} 

		}
		else{

			if(field == "Process_Name"){
				return "<a  href=\"#\" onclick=\"javascript:window.myExtCode.jumpUrl('CompleteTask','" + row.Process_ID + "','" + row.Task_ID + "','" + row.Incident_ID + "','" + row.Process_FormKey + "')\" style='color:#009cd0'>" + value + "</a>";
			}
			if(field=="Task_State")
			{
				return window.myExtCode.setStateImage(row);
			}
			else if(field == "Task_CreateTime"){
				return eform.getDateInterval(value);
			}
			else if(field == "Task_CompleteTime"){
				return eform.getDateInterval(value);
			}
		}
		return value;
	}); 

	if(eform.pageType == "mobile"){

		//mobile%u7AEFappendRowsAfter%u4E8B%u4EF6,%u4FEE%u6539%u53D1%u8D77%u4EBA%u5934%u50CF%u56FE%u7247src
		efListGrid.method("appendRowsAfter", function (container, rows, allRows) {
			$.each(rows,function(index,row){
				var jqRow = container.find("[data-row-id=" + rows[index]["dataRowId"] + "]");
				var jqImg = jqRow.find(".field.image>img").eq(0);
// 				jqImg.attr("src",$.format("{0}/api/Org/UserRead/GetUserFaceByID?token={1}&userId={2}",eform.edoc2WebApiPath,$.cookie("token"),row.Incident_Starter)).css({"border-radius": "6px"});
					jqImg.attr("src", $.format("/ImageType/GetUserAvatar?token={0}&userId={1}", $.cookie("token"),eform.userInfo.IdentityId)).css({ "border-radius": "6px" });
			});

		});

	}

};


//%u89E3%u6790%u524D
window.myExtCode.parserBefore = function(){
	//grid draw before
	eform("edoc2ListGrid_MyComplete").method("drawBefore",function () {	
		window.myExtCode.drawBefore();
	});
};


//%u89E3%u6790%u540E
window.myExtCode.parserAfter = function(){
	if(eform.pageType == "pc"){
// 		var easyCtrl = eform("edoc2ListGrid_MyComplete").method("getEasyControl");
// 		var options = easyCtrl.datagrid("options");
// 		options.type="small";
// 		easyCtrl.datagrid(options);
// 		eform("edoc2ListGrid_MyComplete").method("hideSearchBlock");
	}
	else{
		//todo
	}

};