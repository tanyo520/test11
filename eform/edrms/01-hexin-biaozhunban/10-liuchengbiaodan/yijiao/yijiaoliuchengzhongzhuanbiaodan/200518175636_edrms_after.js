debugger;
var yijiaoProcessId = getProcessId("档案移交");
var yijiaoFormId = "200106230233_edrms";

var newUrl = eform.virtualPath+'/Default/default?formId='+yijiaoFormId
+'&processId='+yijiaoProcessId+'&taskType=begintask&skin=techblue';

$(parent.document).find("iframe").eq(1).attr("src", newUrl);

//通过流程名称获取流程id
function getProcessId(processName){
	var processId = '' ;//流程id
	eform.dataset("selectProcessIdByProcessName",{ProcessName:processName},function(result){
		processId=result.Data[0][0].ID_;
	},false);
	return processId;
}