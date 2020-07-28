var _style = "<style type='text/css'>"
+ ".formBlock .formBlockTitle >span{font-family: 'Microsoft YaHei UI', sans-serif; font-weight: 400;font-style: normal;font-size: 28px;color: rgb(31, 47, 61);}"
+ "</style>";
$("head").append(_style);
//public
window.myExtCode = {};
// 弹窗宽高 tangbangguo 2018/6/29
var dialogWidth = 800;
var dialogHeight = 460;

//流程名称点击跳转url
window.myExtCode.jumpUrl = function(type, proccessId, taskId, incidentId, businessKey, state) {
	if(!taskId || taskId == "undefined") {
		taskId = "";
	}
	if(!incidentId || incidentId == "undefined") {
		incidentId = "";
	}

	var data = { state: state, taskType: type, processId: proccessId, taskId: taskId, incidentId: incidentId, businessKey: businessKey };

	//mobile端流程需要额外加参数
	if(eform.pageType == "mobile") {
		data.isMobile = true;
	}

	$.ajax({
		type: "get",
		url: "/edoc2Flow-web/edoc2-form/jumpIndex?orgToken=" + $.cookie("token") + "&t=" + new Date().getTime(),
		async: true,
		data: data,
		success: function(result) {
			if(eform.pageType == "pc") {
				eval(result);
			} else {
				//ios特殊处理,window.open ios失效
				var urlArr = /\('(\S+)'/.exec(result);
				if($.isArray(urlArr)) {
					window.location.href = $.addRandomToUrl(urlArr[1]);
				}
			}
		},
		error: function() {}
	});
};

//pc端弹出框显示流程日志
window.myExtCode.showWFFlag = function(processId, instanceNo) {
	var url = "";
	if(edoc2Form.edoc2WfLogUrl) {
		url = edoc2Form.edoc2WfLogUrl.replace("$(processDefinitionId)", processId).replace("$(processInstanceId)", instanceNo).replace("$(random)", Math.random());
	}
	url += "&lng=" + eform.lang;

	var wfLogInfo = $("#wfLogInfo");

	if(wfLogInfo.length == 0) {
		$("body").append("<div id='wfLogInfo'></div>");
		wfLogInfo = $("#wfLogInfo");
	}
	wfLogInfo.dialog({
		title: Edoc2FormSR["Control_WFLog"],
		width: dialogWidth,
		height: dialogHeight,
		border: false,
		maximizable: true,
		closed: false,
		cache: false,
		content: "<iframe src='" + url + "' style='width:100%;height:99%;border:none' scrolling='no'></iframe>",
		modal: true
	});
	return false;
};

//设置流程状态图片
window.myExtCode.setStateImage = function(row) {
	if(!row.Incident_ID) {
		return "";
	}
	var stateImg = "";
	var title = "";
	if(row.Task_State == 0) {
		stateImg = "normal.png";
		title = Edoc2FormSR["Flow_taskState_normal"];
	} else if(row.Task_State == 10) {
		stateImg = "back.png";
		title = Edoc2FormSR["Flow_taskState_back"];
	} else if(row.Task_State == 5) {
		stateImg = "backgo.png";
		title = Edoc2FormSR["Flow_taskState_backGo"];
	} else if(row.Task_State == 30) {
		stateImg = "timeout.png";
		title = Edoc2FormSR["Flow_taskState_timeout"];
	} else if(row.Task_State == 50) {
		stateImg = "assign.png";
		title = Edoc2FormSR["Flow_taskState_assign"];
	} else if(row.Task_State == 100) {
		stateImg = "normal.png";
		title = Edoc2FormSR["Flow_taskState_autoComlepte"];
	} else if(row.Task_State == 110) {
		stateImg = "normal.png";
		title = Edoc2FormSR["Flow_taskState_autoJump"];
	} else if(row.Task_State == 130) {
		stateImg = "plusSign.png";
		title = Edoc2FormSR["Flow_taskState_plusSign"];
	} else if(row.Task_State == 120) {
		stateImg = "normal.png";
		title = Edoc2FormSR["Flow_taskState_revoke"];
	} else if(row.Task_State == 20) {
		stateImg = "complete.png";
		title = Edoc2FormSR["Flow_taskState_Comlepte"];
	} else {
		stateImg = "complete.png";
		title = "";
	}
	if(eform.pageType == "pc") {
		return '<img title="' + title + '" src="' + edoc2Form.edoc2EformPath + '/content/workflow/images/' + stateImg + '" style="cursor:pointer;vertical-align: bottom;margin-bottom: 1.5px;" />';
	} else {
		return '<img title="' + title + '" src="content/images/workflow_st_' + stateImg + '" style="cursor:pointer;width:20px;height:20px;vertical-align:bottom;" />';
	}
};

//表格的drawbefore事件
window.myExtCode.drawBefore = function() {
	var efListGrid = eform("edoc2ListGrid_myInbox");
	var groupType = $.getQueryString("groupType");
	var groupId = $.getQueryString("gid");

	if(groupType == "Group") {
		efListGrid.method("setProcParams", "processCategory", groupId);
	} else {
		efListGrid.method("setProcParams", "processDefinitionKey", groupId);
	}

	efListGrid.method("customColumnsFormatter", function(value, row, index, field, fieldName) {
		if(eform.pageType == "pc") {
			if(field == "Process_Name") {
				//我的代办row.Task_Id为何变小写，其他地方都是大写
				return "<a class='blackA' href=\"#\" onclick=\"javascript:window.myExtCode.jumpUrl('InboxTask','" + row.Process_ID + "','" + row.Task_Id + "','" + row.Incident_ID + "','" + row.Process_FormKey + "','" + row.Task_State + "')\">" + value + "</a>";
			} else if(field == "Num") {
				return "<a><img title='" + Edoc2FormSR["Control_WFLog"] + "' src='" + edoc2Form.edoc2EformPath + "/content/workflow/images/workflow.png' style=\"cursor:pointer;vertical-align: bottom;margin-bottom: 1px;\" onclick=\"window.myExtCode.showWFFlag('" + row.Process_ID + "','" + row.Incident_ID + "')\"/></a>";
			} else if(field == "Task_State") {
				return window.myExtCode.setStateImage(row);
			}else if(field == "Incident_Summary") {
				return "<a style='text-decoration:none;cursor: default;color: #333333;' title='"+row.Incident_Summary+"'>"+row.Incident_Summary+"</a>";
			} 
		} else {
			if(field == "Process_Name") {
				return "<a  href=\"#\" onclick=\"javascript:window.myExtCode.jumpUrl('InboxTask','" + row.Process_ID + "','" + row.Task_Id + "','" + row.Incident_ID + "','" + row.Process_FormKey + "','" + row.Task_State + "')\" style='color:#009cd0'>" + value + "</a>";
			} else if(field == "Task_State") {
				return window.myExtCode.setStateImage(row);
			} else if(field == "Task_CreateTime") {
				return eform.getDateInterval(value);
			}
		}

		return value;
	});

	efListGrid.method("extendHeadOperate", function(extendButton) {
		if(eform.pageType == "pc") {
			if(extendButton.opt.operateType == "custom" && extendButton.opt.formId == "160120102849") {
				extendButton.opt.openWindowWidth = "600";
				extendButton.opt.openWindowHeight = "320";
				extendButton.opt.maximizable = false;
			}
		}
	});

	if(eform.pageType == "mobile") {
		//移动端隐藏指派按钮
		efListGrid.method("getControl").toolbarDrawAfter = function(jqToolbar) {
			jqToolbar.find(".ui-icon-custom").eq(0).hide();
			jqToolbar.find(".ui-icon-custom").eq(1).hide();
		};
		//mobile端appendRowsAfter事件,修改发起人头像图片src
		efListGrid.method("appendRowsAfter", function(container, rows, allRows) {
			$.each(rows, function(index, row) {
				var jqRow = container.find("[data-row-id=" + rows[index]["dataRowId"] + "]");
				var jqImg = jqRow.find(".field.image>img").eq(0);
				
				jqImg.attr("src", $.format("/ImageType/GetUserAvatar?token={0}&userId={1}", $.cookie("token"),eform.userInfo.IdentityId)).css({ "border-radius": "6px" });

			});
		});
	}

};

///解析前
window.myExtCode.parserBefore = function() {
	window.reloadListGrid = function() {
		eform("edoc2ListGrid_myInbox").method("load");
	};

	eform("edoc2ListGrid_myInbox").method("drawBefore", function() {
		window.myExtCode.drawBefore();
	});

};

//解析后
window.myExtCode.parserAfter = function() {
	if(eform.pageType == "pc") {
		var easyCtrl = eform("edoc2ListGrid_myInbox").method("getEasyControl");
// 		var options =  easyCtrl.datagrid("options");
// 		options.type="small";
// 		easyCtrl.datagrid(options);
// 		eform("edoc2ListGrid_myInbox").method("hideSearchBlock");
		
		var toolBar = easyCtrl.datagrid("getToolbar");
		var buttons = easyCtrl.datagrid("getToolbarAllBtn");
		var btn1 = buttons[0];

		var zp = buttons[1];

		var claimantBtn = buttons[2];
		var batchApprovalBtn = buttons[3];
		if(zp) {
			var zpParentTd = $(zp).parent("td");
			$(zp).remove();
			var zpMenuBtn = '<a href="javascript:void(0)" id="assignBtn" class="l-btn-primary">' + Edoc2FormSR["Flow_Assign"] + '</a>';
			zpParentTd.append(zpMenuBtn)
			var assignMenu = $("body").find("#assignMenu");
			if(!assignMenu || assignMenu.length == 0) {
				$("body").append("<div id='assignMenu'></div>")
				assignMenu = $("#assignMenu");
			}
			// %u57FA%u672C%u914D%u7F6E
			var config = {
				width: 490,
				height: dialogHeight,
				minimizable: false, // %u662F%u5426%u663E%u793A%u6700%u5C0F%u5316%u6309%u94AE   %u9ED8%u8BA4false
				resizable: true, // %u662F%u5426%u80FD%u591F%u6539%u53D8%u7A97%u53E3%u5927%u5C0F %u9ED8%u8BA4true
				maximizable: false, // %u662F%u5426%u663E%u793A%u6700%u5C0F%u5316%u6309%u94AE   %u9ED8%u8BA4false
				modal: true, // %u6A21%u5F0F%u5316%u7A97%u53E3           %u9ED8%u8BA4true
				title: Edoc2FormSR["Flow_SetFutureAssign"], // %u5F39%u6846%u6807%u9898
				closed: true // %u662F%u5426%u53EF%u4EE5%u5173%u95ED%u7A97%u53E3     %u9ED8%u8BA4true
			};
			// %u4E8B%u4EF6%u53CA%u5176%u4ED6
			var param2 = {
				dialogType: "iframe", // %u4EE5iframe%u65B9%u5F0F%u6253%u5F00
				target: eform.virtualPath + "/Default/Default?formId=150909140122", // %u5730%u5740
				showCloseBtn: false // %u662F%u5426%u5728%u53F3%u4E0B%u89D2%u663E%u793A%u5173%u95ED%u6309%u94AE
			};

			$("#assignMenu").menu({
				onShow: function() {
					var isNone =  $("#wf_seachBlock").css("display");
					var topHeight = 66;
					if(isNone !="none"){
						topHeight = topHeight + $("#wf_seachBlock").height()+8;
					
					}
					$('#assignMenu').menu({
						left: 100,
						top: topHeight
					});

				}

			});

			$("#assignBtn").menubutton({
				iconCls: 'icon-assign',
				menu: '#assignMenu'

			});

			//  		easyCtrl.datagrid({type:"small"});
			// 查询按钮
			if(buttons && buttons[0]){
				buttons[0].id = "findBtnId";	
			}
			// 待领按钮图标
			if(buttons && buttons[2]){
				buttons[2].id = "waitGetId";
				$($("#waitGetId span:last-child").find('span')[1]).addClass('icon-queue');	
			}
			
			
			// 批量审批按钮图标
			if(buttons && buttons[3]){
				buttons[3].id = "approveId";
				$($("#approveId span:last-child").find('span')[1]).addClass('icon-approve');
			}
			/*%u8BBE%u7F6E %u83DC%u5355%u9879*/
			$("#assignMenu").menu('appendItem', {
				text: Edoc2FormSR["Flow_CurrentAssign"],
				// 			iconCls: 'icon-currentAssign'
			});
			var item = $('#assignMenu').menu('findItem', Edoc2FormSR["Flow_CurrentAssign"]);
			$("body").append('<span id="assignSelectMember" style="display: none;"/>');
			$("#assignMenu").menu('appendItem', {
				text: Edoc2FormSR["Flow_CurrentSelectTask"],
				parent: item.target,
				onclick: function() {
					var easyGrid = eform("edoc2ListGrid_myInbox").method("getEasyControl");
					var rows = easyGrid.datagrid("getSelections");
					if(rows && rows.length > 0) {
						var taskIds = "";
						$.each(rows, function(i, d) {
							taskIds += "," + d.Task_Id;
						});
						if(taskIds.length > 0) {
							taskIds = taskIds.substring(1);
						}
						$("#assignSelectMember").Edoc2MemberSelect({
							minimumInputLength: 1,
							multiple: false,
							url: "",
							token: $.cookie("token"),
							topNum: 5,
							closed: false,
							showModal: 'none',
							singleSelect: false, //%u5355%u9009%u540E%u8C03%u7528onSelectCallbackData%u56DE%u8C03%u51FD%u6570%u5E76%u5173%u95ED%u7A97%u4F53
							param: {
								"DeptIds": [],
								"GroupIds": [],
								"PositionIds": [],
								"Account": "",
								"RealName": "",
								"IsChild": true,
								"IsLike": true,
								"AllowDept": false,
								"AllowPosition": false,
								"AllowGroup": false,
								"AllowUser": true
							},
							initdata: true,
							Onchange: function(value) {
								if(value != "") {}
							},
							onSelectCallbackData: function(data) {
								// 						if(data&&data[0]){
								// 							var user=data[0];
								if(data) {
									var userId = data.guid;
									var userName = data.text;
									$.messager.confirm(Edoc2FormSR["Global_Tip"], Edoc2FormSR["Flow_AssignTip1"] + userName + Edoc2FormSR["Flow_AssignTip2"], function(bool) {
										if(bool === true) {
											// %u8C03%u7528%u540E%u53F0%u6269%u5C55%u65B9%u6CD5%uFF0C
											var loding = eform.loading(Edoc2FormSR["Flow_AssignLoding"]);
											var data = {
												 taskIds: taskIds,
												delegateUserId: userId,
												isSingleMandate: true,
												method:'DelegateTasks'
											}
											window.edoc2Form.formParser.controlService("workFlowService", data, function (result) {
// 											eform.ajax("workFlowService", "DelegateTasks", { "taskIds": taskIds, "delegateUserId": userId, isSingleMandate: true }, function(result) {
												// %u8C03%u7528%u6210%u529F
												var resultObj = JSON.parse(result);
												if(resultObj && resultObj.isSuccess) {
													eform("edoc2ListGrid_myInbox").method("load", {}, function() {});
												} else {
													$.messager.alert(Edoc2FormSR["Global_Tip"], Edoc2FormSR["Flow_AssignFail"]);
												}
												eform.loaded(loding);
											}, function(result) {
												// %u8C03%u7528%u5931%u8D25
												$.messager.alert(Edoc2FormSR["Global_Tip"], Edoc2FormSR["Flow_Fail"]);
											});
										}
									});
								}
							}
						});

					} else {
						$.messager.alert(Edoc2FormSR["Global_Tip"], Edoc2FormSR["Flow_choiceRecord"],"info");
					}
				}
			});
			$("#assignMenu").menu('appendItem', {
				text: Edoc2FormSR['Flow_AllTasks'],
				parent: item.target,
				onclick: function() {
					var easyGrid = eform("edoc2ListGrid_myInbox").method("getEasyControl");
					var rows = easyGrid.datagrid("getRows");
					if(rows && rows.length==0){
						$.messager.alert(Edoc2FormSR["Global_Tip"], Edoc2FormSR["Flow_AssignFail"],"error");
						return;
					}
					$("#assignSelectMember").Edoc2MemberSelect({
						minimumInputLength: 1,
						multiple: false,
						url: "",
						token: $.cookie("token"),
						topNum: 5,
						closed: false,
						showModal: 'none',
						singleSelect: false, //%u5355%u9009%u540E%u8C03%u7528onSelectCallbackData%u56DE%u8C03%u51FD%u6570%u5E76%u5173%u95ED%u7A97%u4F53
						param: {
							"DeptIds": [],
							"GroupIds": [],
							"PositionIds": [],
							"Account": "",
							"RealName": "",
							"IsChild": true,
							"IsLike": true,
							"AllowDept": false,
							"AllowPosition": false,
							"AllowGroup": false,
							"AllowUser": true
						},
						initdata: true,
						Onchange: function(value) {
							if(value != "") {}
						},
						onSelectCallbackData: function(data) {
							// 								if(data&&data[0]){
							// 									var user=data[0];
							if(data) {
								var userId = data.guid;
								var userName = data.text;
								$.messager.confirm(Edoc2FormSR["Global_Tip"], Edoc2FormSR["Flow_AssignTip1"] + userName + Edoc2FormSR["Flow_AssignTip2"], function(bool) {
									if(bool === true) {
										// %u8C03%u7528%u540E%u53F0%u6269%u5C55%u65B9%u6CD5%uFF0C
										var loding = eform.loading(Edoc2FormSR["Flow_AssignLoding"]);
										var data = {
										
											delegateUserId:userId,
											method:'DelegateAllTask'
										}
										
										window.edoc2Form.formParser.controlService("workFlowService", data, function (result) {
// 										eform.ajax("workFlowService", "DelegateAllTask", { "delegateUserId": userId }, function(result) {
											// %u8C03%u7528%u6210%u529F
											var resultObj = JSON.parse(result);
											if(resultObj && resultObj.isSuccess) {
												eform("edoc2ListGrid_myInbox").method("load", {}, function() {});
											} else {
												$.messager.alert(Edoc2FormSR["Global_Tip"], Edoc2FormSR["Flow_AssignFail"]);
											}
											eform.loaded(loding);
										}, function(result) {
											// %u8C03%u7528%u5931%u8D25
											eform.loaded(loding);
											$.messager.alert(Edoc2FormSR["Global_Tip"], Edoc2FormSR["Flow_Fail"]);
										});
									}
								});
							}
						}
					});

				}
			});
			$("#assignMenu").menu('appendItem', {
				text: Edoc2FormSR['Flow_FutureAssign'],
			});
			var futureItem = $('#assignMenu').menu('findItem', Edoc2FormSR['Flow_FutureAssign']);

			$("#assignMenu").menu('appendItem', {
				text: Edoc2FormSR['Flow_Set'],
				parent: futureItem.target,
				onclick: function() {
					config.width = 800;
					config.height = 400;
					var dialog = new eform.Dialog(config, param2);
					window.top.setAssignDialog = window.setAssignDialog = dialog;
				}
			});

			$("#assignMenu").menu('appendItem', {
				text: Edoc2FormSR['Flow_MyFutureAssign'],
				parent: futureItem.target,
				onclick: function() {
					var param3 = $.extend(true, {}, param2);
					var config1 = $.extend(true, {}, config);
					param3.target = eform.virtualPath + "/Default/Default?formId=150909171524";
					config1.width = dialogWidth;
					config1.height = dialogHeight;
					config1.title = Edoc2FormSR['Flow_FutureAssign'];
					var dialog = new eform.Dialog(config1, param3);
				}
			});

			$("#assignMenu").menu('appendItem', {
				text: Edoc2FormSR['Flow_AssignTasks'],
				onclick: function() {
					var param3 = $.extend(true, {}, param2);
					var config1 = $.extend(true, {}, config);
					param3.target = eform.virtualPath + "/Default/Default?formId=150910104413";
					config1.width = dialogWidth;
					config1.height = dialogHeight;
					config1.title = Edoc2FormSR["Flow_AssignTasks"];
					var dialog = new eform.Dialog(config1, param3);
				}
			});

			/* end */
		}

		// 点击待领按钮 tangbangguo 2018/6/29
		if(claimantBtn) {

			$(claimantBtn).unbind().bind('click', function() {
				var param3 = $.extend(true, {}, param2);
				var config1 = $.extend(true, {}, config);
				param3.target = eform.virtualPath + "/Default/Default?formId=161205111902";
				config1.width = dialogWidth;
				config1.height = dialogHeight;
				config1.title = Edoc2FormSR["WF_MyReceiveList"];
				var dialog = new eform.Dialog(config1, param3);

			});

		}
	
		
		
// 		if(btn1) {
// 			btn1.className = "easyui-linkbutton";
// 		}
// 		if(claimantBtn) {
// 			claimantBtn.className = "easyui-linkbutton";
// 		}
// 		if(batchApprovalBtn) {
// 			batchApprovalBtn.className = "easyui-linkbutton";
// 		}
// 		if($("#assignBtn .l-btn-text") && $("#assignBtn .l-btn-text").length>0){
// 			$("#assignBtn .l-btn-text").css("marginTop", "0px");
// 		}
// 		if($("#assignBtn .l-btn-left .l-btn-text") && $("#assignBtn .l-btn-left .l-btn-text").length>0){
// 			$("#assignBtn .l-btn-left .l-btn-text").css("marginRight", "10px");
// 		}
// 		if($("#waitGetId") && $("#waitGetId").length>0){
// 			$("#waitGetId").css("marginLeft", "10px");
// 		}
// 		if($("#assignBtn") && $("#assignBtn").length>0){
// 			$("#assignBtn").css("marginLeft", "5px");
// 		}
// 		if($("#approveId") && $("#approveId").length>0){
// 			$("#approveId").css("marginLeft", "15px");
// 		}
// 		if($("#findBtnId") && $("#findBtnId").length>0){
// 			$("#findBtnId").css("marginLeft", "15px");
// 		}
		
		
		
	} else {
	}
};