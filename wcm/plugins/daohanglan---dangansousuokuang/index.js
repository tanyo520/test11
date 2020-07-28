define(["jquery", "logic/Portal", "cookie", "knockout", "logic/Portal", "inbizsdk"], function ($, cookie, portal, ko, portal, inbizsdk) {
        //根据父id获取全宗 或 档案类型
        function getSectArchTypeData(isSect, id, node) {
            var data = [];
            var param = {
                 id: id
            };
            if (isSect == 1) {
                inbizsdk.$dataset("selectSubLevelSectToSearch", param, function (result) {
                    data = result.Data[0];
                }, false, false);
            } else if (isSect == 2) {
                inbizsdk.$dataset("selectSubLevelArchTypeToSearch", param, function (result) {
                    data = result.Data[0];
                }, false, false);
            }

            return data;
        }


        function resetStyle(id) {
        }

        function model() {
            return {
                vm: {
                    // treeData: ko.observable(null),
                },
                compositionComplete: function () {
                    var userId = inbizsdk.$app.userInfo.ID;
                    var MainDepartmentId = inbizsdk.$app.userInfo.MainDepartmentId; //当前用户部门id
                    var MainPositionId = inbizsdk.$app.userInfo.MainPositionId; //当前用户职位id
                    var EveryoneId = top.window.globalvalue_everyoneId; //everyone用户组id
                    var userGroupIds = "'" + EveryoneId + "'";
                    var userGroupList = getUserGroupList();
                    if (userGroupList) {
                        for (var i = 0; i < userGroupList.length; i++) {
                            userGroupIds = userGroupIds + ",'" + userGroupList[i].ID + "'"
                        }
                    }
                    var param1 = {
                        id: '0'
                    };
                    $('#formContainer').html('');
                    $('#sectDefaultProp').html('');
                    loadDefatulForm(); //默认下拉框
                    inbizsdk.$dataset("selectSectToBorrowCenter", param1, function (result) {
                        // console.log(result);
                        if (result.Data) {
                            console.log("selectSectToBorrowCenter");
                            console.log(result.Data[0]);

                            var data = result.Data[0];

                            var newTree = data;

                            setTimeout(function () {
                                $("#sectArchTypeTree").combotree('loadData', newTree);
                            }, 800);

                        }

                    }, false, false);

                    $("#sectArchTypeTree").combotree({
                        animate: true,
                        onSelect: function (node) {
                            var n = node;
                            //返回树对象
                            var tree = $(this).tree;
                            //选中的节点是否为叶子节点,如果不是叶子节点,清除选中
                            var isLeaf = tree('isLeaf', node.target);

                            if (node.isSect == 2) {
                                $('.treeChooseType').val("archtypename");
                                //如果选中的是档案类型
                                $('#formContainer').html('');
                                $('#sectDefaultProp').html('');
                                $('#sectDefaultProp').css('display', 'none');
                                $('#formContainer').css('display', 'inline');
                                var resData = selectArchTypeForm(node.id);//获取 未组卷-文件列表表单id
                                var formid = resData.form_id;
                                $.ajax({
                                    type: "get",
                                    url: "/api/services/MetaData/GetMetaDataTypeById",//获取元数据表单  控件信���接口
                                    async: false,
                                    data: {
                                        token: inbizsdk.$app.token,
                                        typeId: formid
                                    },
                                    success: function (e) {
                                        if (e.result == "0" && e.data.MetaAttrList) {
                                            $('#archTypeProp').css('display', 'inline');
                                            $('#sectDefaultProp').css('display', 'none');
                                            $(".custom-column0").html('');
                                            for (var i = 0; i < e.data.MetaAttrList.length; i++) {
                                                var formEntity = e.data.MetaAttrList[i];
                                                var controlModel = formEntity.ControlModel;
                                                var checkBoxs = "";
                                                // 是否必填
                                                // 是否隐藏
                                                var isHidden = false;
                                                var readOnly = false;
                                                var mode = "";
                                                // 静态数据源
                                                var staticDataSource = "";
                                                // 数据源
                                                var datasource = "";
                                                var defaultValue = "";
                                                var dataOnText = "";
                                                var dataOffText = "";
                                                var sets = formEntity.ControlModel.Setting;
                                                var controlType = controlModel.ControlType;
                                                if (formEntity.AttrValue == null || formEntity.AttrValue == "") {
                                                    formEntity['AttrValue'] = "";
                                                }
                                                if (controlType == "edoc2Hidden") {
                                                    continue;
                                                }

                                                var tdtr = ' ';
                                                var dateFormat = "dateFormat";
                                                var min = "minDate";
                                                var max = "maxDate";
                                                for (var j = 0; j < sets.length; j++) {

                                                    if (sets[j].id == "readonly") {
                                                        readOnly = sets[j].value;
                                                    }
                                                    if (sets[j].id == "mode") {
                                                        mode = sets[j].value;
                                                    }
                                                    if (sets[j].id == "datasource") {
                                                        datasource = sets[j].value;
                                                    }
                                                    if (sets[j].id == "staticDataSource") {
                                                        staticDataSource = sets[j].value;
                                                    }
                                                    if (sets[j].id == "defaultValue") {
                                                        defaultValue = sets[j].value;
                                                    }
                                                    if (sets[j].id == "dataOnText") {
                                                        dataOnText = sets[j].value;
                                                    }
                                                    if (sets[j].id == "dataOffText") {
                                                        dataOffText = sets[j].value;
                                                    }
                                                    if (sets[j].id == dateFormat) {
                                                        dateFormat = sets[j].value;
                                                    }
                                                    if (sets[j].id == min) {
                                                        min = sets[j].value;
                                                    }
                                                    if (sets[j].id == max) {
                                                        max = sets[j].value;
                                                    }
                                                }
                                                if (controlModel.ControlType == "edoc2Hidden") { // 隐藏域
                                                    isHidden = true;
                                                }


                                                if (controlType == "edoc2Textbox" || controlType == "edoc2RichText"
                                                    || controlType == "edoc2TextArea" || controlType == "edoc2Number") {
                                                    if (readOnly != "true") {
                                                        tdtr += '  <div class="row-item">\n' +
                                                            '                <label class="title">' + formEntity.AttrName + '：</label>\n' +
                                                            '                <div class="content">\n' +
                                                            '                    <input class="' + controlModel.ControlId + '" type="text" id="'+controlModel.ControlId+'">\n' +
                                                            '                </div>\n' +
                                                            '            </div>';
                                                        $("#formContainer").append(tdtr);
                                                    }
                                                } else if (controlType == "edoc2Date") {// 时间框
                                                    if (readOnly != "true") {
                                                        tdtr += '  <div class="row-item">\n' +
                                                            '                <label class="title">' + formEntity.AttrName + ':</label>\n' +
                                                            '                <div class="content">\n' +
                                                            '                    <input class="search_date beginTime" style="height: 36px; width: 200px" id="beginTime">\n' +
                                                            '                    <label style="margin-left: 33px"></label>\n' +
                                                            '                    <input class="search_date endTime" style="height: 36px; width: 200px;" id="endTime">\n' +
                                                            '                </div>\n' +
                                                            '            </div>';
                                                        $("#formContainer").append(tdtr);

                                                    }

                                                } else if (controlType == "edoc2Selectbox") {
                                                    if (mode == "single") {// 单选
                                                        var data;
                                                        if (staticDataSource != '') {
                                                            data = JSON.parse(staticDataSource);
                                                        } else if (datasource != "") {
                                                            data = JSON.parse(datasource);
                                                        }
                                                        if (data != "" && data != undefined) {
                                                            tdtr += '<div class="control-iwrap edoc2selectbox"><span class="form-label">' + formEntity.AttrName +
                                                                '</span><div class="form-input-label" style="width: 300px;">';
                                                            for (var l = 0; l < data.length; l++) {
                                                                tdtr += '<div class="single-box" style="float:left;min-width:12%;box-sizing:border-box;padding:0 20px 0 0;">' +
                                                                    '<label class="control-radio"><input type="radio" class="control-input" ' +
                                                                    'value="' + data[l].value + '" name="0.4715832926523533"><span class="control-indicator">' +
                                                                    '</span><span class="control-description">' + data[l].text + '</span></label></div>';
                                                            }
                                                            tdtr += '</div>' +
                                                                '</div>';
                                                        }
                                                    } else if (mode == "multiple" || mode == "multipleSelectbox") {// 复选框
                                                        var data;
                                                        if (staticDataSource != '') {
                                                            data = JSON.parse(staticDataSource);
                                                        } else if (datasource != "") {
                                                            data = JSON.parse(datasource);
                                                        }
                                                        if (data != "" && data != undefined) {
                                                            tdtr += '<li class="control edoc2SelectboxContainer" controltype="edoc2Selectbox" ' +
                                                                'controlid="' + controlModel.ControlId + '" id="' + controlModel.ControlId + '">' +
                                                                '<div class="control-iwrap edoc2selectbox"><span class="form-label">' + formEntity.AttrName
                                                                + '</span><div class="form-input-label" style="width: 300px;">';
                                                            for (var l = 0; l < data.length; l++) {
                                                                tdtr += '<div class="multiple-box" style="float:left;min-width:12%;box-sizing:border-box;' +
                                                                    'padding:0 20px 0 0;"><label class="control-checkbox">' +
                                                                    '<input type="checkbox" class="control-input" value="' + data[l].value + '" name="">' +
                                                                    '<span class="control-indicator"></span>' +
                                                                    '<span class="control-description">' + data[l].text + '</span></label></div>';
                                                            }
                                                        }
                                                    } else if (mode == "singleSelectbox") {// 单选下拉框
                                                        var selectdata;
                                                        if (staticDataSource != '') {
                                                            selectdata = JSON.parse(staticDataSource);
                                                        } else if (datasource != "") {
                                                            selectdata = JSON.parse(datasource);
                                                        }

                                                        if (selectdata != "" && selectdata != undefined) {
                                                            tdtr += '   <div class="row-item">\n' +
                                                                '                <label class="title">' + formEntity.AttrName + '：</label>\n' +
                                                                '                <div class="content">\n' +
                                                                '                    <!--<input class="carrier" type="text">-->\n' +
                                                                '                    <input class="search-type-' + controlModel.ControlId + '" id="'+ controlModel.ControlId+'"  data-bind="combobox" data-option="width:435,height:36">\n' +
                                                                '                </div>\n' +
                                                                '            </div>\n';
                                                            $("#formContainer").append(tdtr);
                                                            if ($('.search-type-' + controlModel.ControlId).length > 0) {
                                                                $('.search-type-' + controlModel.ControlId).combobox({
                                                                    valueField: 'value',
                                                                    textField: 'text',
                                                                    width: 435,
                                                                    panelHeight: 200,
                                                                    data: selectdata
                                                                });
                                                            }
                                                        }

                                                    }
                                                }
                                            }

                                            $('.search_date').datebox({
                                                panelHeight: 250,
                                                panelWidth: 200
                                            })
                                        }
                                    }
                                });
                            } else {
                                loadDefatulForm();
                                $('.treeChooseType').val("sectname");
                            }
                        },
                        onBeforeExpand: function (node) {
                            if (!node.hasChildren) {
                                var data = getSectArchTypeData(node.isSect, node.id);
                                $(this).tree('append', {
                                    parent: node.target,
                                    data: data
                                });
                            }
                        }
                    });

                }
            }
        }

        return model;

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

        //获取当前用户的用户组列表
        function getUserGroupList() {
            var token = $.cookie("token");
            var data = [];
            $.ajax({
                type: "GET",
                url: "/api/services/OrgUserGroup/GetGroupListOfUserByUserId",
                async: false,
                data: {
                    token: token
                    , userId: inbizsdk.$app.userInfo.ID
                },
                dataType: "json",
                success: function (res) {
                    data = res.data
                }
            });
            return data;
        }
        /******根据档案中心formid获取属性 200106141605_edrms*********/
        function loadDefatulForm() {
            $('#sectDefaultProp').html('');
            var formid = "200504223839_edrms";
            var defaultTr = ' <div class="row-item">\n' +
                '                <label class="title">档案名称：</label>\n' +
                '                <div class="content">\n' +
                '                    <input class="name" type="text" id="name">\n' +
                '                </div>\n' +
                '            </div>\n' +
                '            <div class="row-item">\n' +
                '                <label class="title">档案编号：</label>\n' +
                '                <div class="content">\n' +
                '                    <input class="number" type="text" id="number">\n' +
                '                </div>\n' +
                '            </div>\n' +
                '\n' +
                '\n' +
                '            <div class="row-item">\n' +
                '                <label class="title">成文日期:</label>\n' +
                '                <div class="content">\n' +
                '                    <input class="search_date beginTime" id="beginTime" style="height: 36px; width: 200px">\n' +
                '                    <label style="margin-left: 31px"></label>\n' +
                '                    <input class="search_date endTime" id="endTime" style="height: 36px; width: 200px;">\n' +
                '                </div>\n' +
                '            </div>\n' +
                '\n' +
                '            <div class="row-item">\n' +
                '                <label class="title">载体形式：</label>\n' +
                '                <div class="content">\n' +
                '                    <input class="search-type-carrier" data-bind="combobox" id="carrier" data-option="width:435,height:36">\n' +
                '                </div>\n' +
                '            </div>\n' +
                '\n' +
                '            <div class="row-item">\n' +
                '                <label class="title">实体数量：</label>\n' +
                '                <div class="content">\n' +
                '                    <input class="entitynum" type="text" id="entitynum">\n' +
                '                </div>\n' +
                '            </div>\n' +
                '\n' +
                '            <div class="row-item">\n' +
                '                <label class="title">保管期限：</label>\n' +
                '                <div class="content">\n' +
                '                    <input class="search-type-duration" id="duration" data-bind="combobox" data-option="width:435,height:36">\n' +
                '                </div>\n' +
                '            </div>';
            $('#sectDefaultProp').append(defaultTr);
            $('.search_date').datebox({
                panelHeight: 250,
                panelWidth: 200
            });
            $.ajax({
                type: "get",
                url: "/api/services/MetaData/GetMetaDataTypeById",//获取元数据表单  控件信息接口
                async: false,
                data: {
                    token: inbizsdk.$app.token,
                    typeId: formid
                },
                success: function (e) {
                    if (e.result == "0" && e.data.MetaAttrList) {
                        $('#formContainer').css('display', 'none');
                        $('#sectDefaultProp').css('display', 'inline');
                        for (var i = 0; i < e.data.MetaAttrList.length; i++) {
                            var formEntity = e.data.MetaAttrList[i];
                            var controlModel = formEntity.ControlModel;
                            var checkBoxs = "";
                            // 是否必填
                            // 是否隐藏
                            var isHidden = false;
                            var readOnly = false;
                            var mode = "";
                            // 静态数据源
                            var staticDataSource = "";
                            // 数据源
                            var datasource = "";
                            var defaultValue = "";
                            var dataOnText = "";
                            var dataOffText = "";
                            var sets = formEntity.ControlModel.Setting;
                            var controlType = controlModel.ControlType;
                            if (formEntity.AttrValue == null || formEntity.AttrValue == "") {
                                formEntity['AttrValue'] = "";
                            }
                            if (controlType == "edoc2Hidden") {
                                continue;
                            }

                            var tdtr = ' ';
                            var dateFormat = "dateFormat";
                            var min = "minDate";
                            var max = "maxDate";
                            for (var j = 0; j < sets.length; j++) {

                                if (sets[j].id == "readonly") {
                                    readOnly = sets[j].value;
                                }
                                if (sets[j].id == "mode") {
                                    mode = sets[j].value;
                                }
                                if (sets[j].id == "datasource") {
                                    datasource = sets[j].value;
                                }
                                if (sets[j].id == "staticDataSource") {
                                    staticDataSource = sets[j].value;
                                }
                                if (sets[j].id == "defaultValue") {
                                    defaultValue = sets[j].value;
                                }
                                if (sets[j].id == "dataOnText") {
                                    dataOnText = sets[j].value;
                                }
                                if (sets[j].id == "dataOffText") {
                                    dataOffText = sets[j].value;
                                }
                                if (sets[j].id == dateFormat) {
                                    dateFormat = sets[j].value;
                                }
                                if (sets[j].id == min) {
                                    min = sets[j].value;
                                }
                                if (sets[j].id == max) {
                                    max = sets[j].value;
                                }
                            }
                            if (controlModel.ControlType == "edoc2Hidden") { // 隐藏域
                                isHidden = true;
                            }


                            if (controlType == "edoc2Selectbox") {
                                if (mode == "singleSelectbox") {// 单选下拉框
                                    var selectdata;
                                    if (staticDataSource != '') {
                                        selectdata = JSON.parse(staticDataSource);
                                    } else if (datasource != "") {
                                        selectdata = JSON.parse(datasource);
                                    }
                                    if (selectdata != "" && selectdata != undefined) {
                                        if ($('.search-type-' + controlModel.ControlId).length > 0) {
                                            $('.search-type-' + controlModel.ControlId).combobox({
                                                valueField: 'value',
                                                textField: 'text',
                                                width: 435,
                                                panelHeight: 200,
                                                data: selectdata
                                            });
                                        }
                                    }

                                }
                            }
                        }

                    }
                }
            });
        }


    }
);
