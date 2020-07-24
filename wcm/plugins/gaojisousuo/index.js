define(["jquery",
        "logic/Portal",
        "knockout",
        'scroll/js/scrollbar',
        "pluginsPath/UnifiedSearch/Scripts/insight-search/searchInput/index",
        "pluginsPath/UnifiedSearch/Scripts/insight-search/searchLabel/index", "inbizsdk"],
    function ($, p, ko, scrollbar, SearchInput, SearchLabel, inbizsdk) {
        var searchInput=null;  var searchLabel=null;
        function getVM() {
            var vm = {
                labelData: ko.observable(null),
                labelkeyValue: ko.observable(null),
                showCond: ko.observable(true)
            }
            return vm;
        }

        function getVF(self) {
            var vf = {
                //搜索前处理特定逻辑
                searchBeforeAction: function () {
                    // todo
                    console.log("todo", "searchBeforeAction")
                    //关闭搜索div
                    $('.topSearchDiv').css('display','none');
                    $('.archDivMask').css('display','none');
                },
                //点击搜索标签返回数据
                searchChangeLabel: function (data) {

                    /****彭琳 start ****/
                    if (data) {
                        var rowItem = JSON.parse(data.Value);
                        if (rowItem.length > 0) {
                            var archtypeid = "";
                            var archTypeName = "";
                            for (var i = 0; i < rowItem.length; i++) {
                                if (rowItem[i]["typeId"] != undefined) {
                                    archtypeid = rowItem[i].typeId;
                                    archTypeName = rowItem[i].value;
                                }

                            }
                            /**如果没有 所档案类   则默认属性为通用的****/
                            if (archtypeid == "") {
                                $('#formContainer').html('');
                                $("#sectArchTypeTree").combotree({value: ''});
                                loadDefatulForm();
                                for (var i = 0; i < rowItem.length; i++) {
                                    $('#' + rowItem[i].key).val(rowItem[i].value);
                                }
                            } else {
                                $("#sectArchTypeTree").combotree({value: archTypeName});
                                //如果有档案类型ID or全宗ID
                                $('#formContainer').html('');
                                $('#sectDefaultProp').html('');
                                $('#sectDefaultProp').css('display', 'none');
                                $('#formContainer').css('display', 'inline');
                                var resData = selectArchTypeForm(archtypeid);//表单id

                                if (resData == undefined) {
                                    loadDefatulForm();
                                    for (var i = 0; i < rowItem.length; i++) {
                                        if (rowItem[i].type == "time") {
                                            var values = rowItem[i].value.split(',');
                                            var ids = rowItem[i].labelId.split(',');
                                            $('#' + ids[0]).val(values[0]);
                                            $('#' + ids[1]).val(values[1]);
                                        }
                                        else {
                                            $('#' + rowItem[i].key).val(rowItem[i].value);
                                        }

                                    }
                                } else {
                                    var formid = resData.form_id;
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
                                                                '                    <input class="' + controlModel.ControlId + '" type="text" id="' + controlModel.ControlId + '">\n' +
                                                                '                </div>\n' +
                                                                '            </div>';
                                                            $("#formContainer").append(tdtr);
                                                        }
                                                    } else if (controlType == "edoc2Date") {// 时间框
                                                        if (readOnly != "true") {
                                                            tdtr += '  <div class="row-item">\n' +
                                                                '                <label class="title">' + formEntity.AttrName + ':</label>\n' +
                                                                '                <div class="content">\n' +
                                                                '                    <input class="search_date beginTime" style="height: 36px; width: 200px" id="begtinTime">\n' +
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
                                                                    '                    <input class="search-type-' + controlModel.ControlId + '" id="' + controlModel.ControlId + '"  data-bind="combobox" data-option="width:435,height:36">\n' +
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
                                    for (var i = 0; i < rowItem.length; i++) {
                                        $('#' + rowItem[i].key).val(rowItem[i].value);
                                    }
                                }
                            }
                        }
                    }
                    /****彭琳 end ****/
                    // if (data) {
                    //     self.vm.labelData(data)
                    //     var arry = JSON.parse(data.Value);
                    //     var timeValue = self.vf.getValueByKey(arry, "datetime");
                    //     var model = {
                    //         contents: self.vf.getValueByKey(arry, "contents"),
                    //         suffix: self.vf.getValueByKey(arry, "suffix"),
                    //         userName: self.vf.getValueByKey(arry, "userName"),
                    //         beginTime: timeValue === "" ? "" : timeValue.split(",")[0],
                    //         endTime: timeValue === "" ? "" : timeValue.split(",")[1],
                    //     }
                    //     $(".beginTime").datebox("setValue", model.beginTime)
                    //     $(".endTime").datebox("setValue", model.endTime)
                    //     self.vm.labelkeyValue(model)
                    // }
                },

                //保存搜索标签
                saveSearchLabel: function () {
                    var data = self.vm.labelData();
                    var formValue = self.vf.getFormLabelValue()
                    var labelValue = JSON.stringify(formValue);
                    if (formValue.length) {
                        if (data === null) {
                            var labelName = "新建标签";
                            self.searchLabel().vf.addLabel(labelName, labelValue, function (res) {
                                if (res.result === 0) {
                                    self.searchLabel().vf.getLabelList();
                                    self.vf.resetValue();
                                }
                            })
                        }
                        else {
                            self.searchLabel().vf.editLabel(data.LableId, labelValue, function (res) {
                                if (res.result === 0) {
                                    self.searchLabel().vf.getLabelList();
                                    self.vf.resetValue();
                                }
                            })
                        }
                    }
                    else {
                        alert("请填写搜索条件");
                    }
                },

                //搜索
                search: function () {
                    var keyword = $(".search-input-view .search-ul .searchKeywords").val();
                    var labelValue = self.vf.getFormLabelValue();
                    var searchWhere = "";
                    $.each(labelValue, function (index, item) {
                        switch (item.type) {
                            case "text":
                                searchWhere += " AND " + item.key + ":(" + item.value + ")";
                                break;
                            case "time":
                                var value = item.value.split(",");
                                searchWhere += " AND " + item.key + ":[" + value[0] + " TO " + value[1] + "]";
                                break;
                            default:
                                break;
                        }
                    });
                    self.searchInput().vf.searchInputAction(keyword, searchWhere)
                },
                //获取页面的值
                getFormLabelValue: function () {

                    // var contents = $(".contents").val();
                    // var suffix = $(".suffix").val();
                    // var userName = $(".userName").val();
                    // var beginTime = $(".beginTime").datebox("getValue");
                    // var endTime = $(".endTime").datebox("getValue");
                    //
                    // var arryValue = [];
                    // if (contents !== "") {
                    //     arryValue.push({ key: "contents", value: contents, type: "text" })
                    // }
                    // if (suffix !== "") {
                    //     arryValue.push({ key: "suffix", value: suffix, type: "text" })
                    // }
                    // if (userName !== "") {
                    //     arryValue.push({ key: "userName", value: userName, type: "text" })
                    // }
                    // if (beginTime !== "") {
                    //     arryValue.push({ key: "datetime", value: beginTime + "," + endTime, type: "time" })
                    // }
                    /***彭琳 start***/
                    var arryValue = [];
                    // $('.form-search-row').find('.content .name').val()
                    var rowItemTitle = $('.form-search-row').find('.title');
                    var rowItemContent = $('.form-search-row').find('.content');
                    debugger
                    for (var i = 0; i < rowItemContent.length; i++) {
                        var className = rowItemContent[i].firstElementChild.className;
                        var elementId = rowItemContent[i].firstElementChild.id;
                        var type = rowItemContent[i].firstElementChild.type;
                        var inputValue = $('.form-search-row').find('.content #' + elementId).val();
                        if (className.indexOf("easyui-combotree")>-1) {
                            inputValue = $('.form-search-row').find('.easyui-combotree').combo('textbox')[0].value;
                            var archtypeid = $('.form-search-row').find('.content input[type="hidden"]')[0].value;
                            var keyname = $('.form-search-row').find('.content .treeChooseType')[0].value;
                            if (inputValue != '') {
                                arryValue.push({
                                    key: keyname,
                                    value: inputValue,
                                    type: 'text',
                                    lableName: "所属档类",
                                    typeId: archtypeid
                                })
                            }
                        }
                        else if (className.indexOf("search_date")>-1) {
                            var dateArray = $('.form-search-row').find('.content .search_date');
                            if (dateArray[0].value != "" || dateArray[1].value != "") {
                                arryValue.push({
                                    key: "writtendate",
                                    value: dateArray[0].value + "," + dateArray[1].value,
                                    type: "time",
                                    lableName: rowItemTitle[i].innerText,
                                    labelId: dateArray[0].id + "," + dateArray[1].id
                                })
                            }
                        } else if (inputValue != '') {
                            arryValue.push({
                                key: elementId,
                                value: inputValue,
                                type: type,
                                lableName: rowItemTitle[i].innerText
                            })
                        }

                    }
                    /***彭琳 end***/
                    return arryValue;
                },
                //根据key获取值
                getValueByKey: function (arry, key) {
                    var value = "";
                    if (arry !== null) {
                        arry.some(function (item) {
                            if (item.key === key) {
                                value = item.value;
                            }
                        });
                    }
                    return value;
                },
                //下拉框改变事件
                changeSelect: function (newData, oldData) {
                    console.log("newData", newData)
                    console.log("oldData", oldData)
                    if (newData.type === "insight") {
                        self.vm.showCond(true)
                    }
                    else {
                        self.vm.showCond(false)
                    }
                },
                //重置页面值
                resetValue: function () {
                    self.vm.labelData(null);
                    self.vm.labelkeyValue(null);

                    // $(".contents").val("");
                    // $(".suffix").val("");
                    // $(".userName").val("");
                    // $(".beginTime").datebox("setValue", "")
                    // $(".endTime").datebox("setValue", "")
                    /********penglin  清空属性内容 start ********/
                    /********penglin  清空属性内容 end ********/
                    var contentHtml = $('#divArchSearch').find('.content');
                    for (var i = 0; i < contentHtml.length; i++) {
                        if (contentHtml[i].firstElementChild.className.indexOf("easyui-combotree")>-1) {
                            $("#sectArchTypeTree").combotree({value: ''});
                        } else if (contentHtml[i].firstElementChild.className.indexOf("search_date")>-1) {
                            var dateArray = contentHtml.find('.search_date');
                            $('#' + dateArray[0].id).datebox('setValue', '');
                            $('#' + dateArray[1].id).datebox('setValue', '');
                        } else {
                            contentHtml[i].firstElementChild.value = "";
                        }

                    }
                }
            }
            return vf;
        }

        function CustomSearch() {
            this.vm = getVM();
            this.vf = getVF(this);

            //初始化下拉框选项
            var arry = [];
            arry.push({key: "档案", value: "档案", isChecked: true, type: "insight"})
            arry.push({key: "文档", value: "文档", isChecked: false, type: "dms"})

            this.searchInput = ko.observable(new SearchInput(this, arry))
            this.searchLabel = ko.observable(new SearchLabel(this))

            this.setInitialValue()
        }

        var pt = CustomSearch.prototype;
        //给搜索框和搜索标签初始化值
        pt.setInitialValue = function () {
            //索引字段排序
            var sortArry = [];
            sortArry.push({key: "0", value: "匹配度", sortable: false, sort: "desc"})
            //sortArry.push({key: "updatetime", value: "更新时间"})

            //搜索结果组件页面地址
            this.searchInput().vm.pageUrl("/wcm/edrms/search") //index2
            this.searchInput().vm.sortArry(sortArry)
            this.searchInput().vm.changeSelectAction([this.vf.changeSelect])
            this.searchInput().vm.searchBeforeAction([this.vf.searchBeforeAction])

            this.searchInput().vm.ecmUrl("/wcm/edrms/wendangguanli")
            this.searchInput().vm.ecmHash("#wendangguanli")
            this.searchInput().vm.isJump(false)

            this.searchLabel().vm.changeLabelAction([this.vf.searchChangeLabel])

        }
        pt.init = function () {

        }

        pt.compositionComplete = function (view) {
            var current = this
            $('.search_date').datebox({
                panelHeight: 250,
                panelWidth: 200
            })

            setTimeout(function () {
                $(".form-search-row").perfectScrollbar("update").perfectScrollbar();
            }, 0)
        }

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
                '                    <label style="margin-left: 33px"></label>\n' +
                '                    <input class="search_date endTime" id="endTime" style="height: 36px; width: 200px;">\n' +
                '                </div>\n' +
                '            </div>\n' +
                '\n' +
                '            <div class="row-item">\n' +
                '                <label class="title">载体形式：</label>\n' +
                '                <div class="content">\n' +
                '                    <!--<input class="carrier" type="text">-->\n' +
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
                                        console.log("下拉框");
                                        console.log(selectdata);
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

        function selectArchTypeForm(archTypeId) {
            var res = {}
            var param = {
                arch_type_id: archTypeId
                , formstate: 0
                , form_type: 0
            }
            inbizsdk.$dataset("selectForm", param, function (result) {
                res = result.Data[0][0];
            }, false, false);
            return res;
        }

        return CustomSearch;
    });
