define(["knockout", "jquery", "inbizsdk"], function (ko, $, inbizsdk) {
    var archDetail = {};
    var archFormId = '';
    var arch_table_name = '';
    var sectname = "";
    var tdtr = '';
    var favoritesId = ''; //如果已经收藏，这个是收藏的主键id
    var borrowCarId = ''; //如果已经加入借阅车，这个是加入借阅车的主键id


    // 获取档案条目的字段属性
    function getLocationValue(name) {

        var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
        var r = window.location.search.substr(1).match(reg);
        if (r != null) return decodeURI(r[2]);
        return null;
    }

    var id = getLocationValue("id");
    var archtypeid = getLocationValue("archtypeid");

    /**
     * 查询表单
     *@param archTypeId   档案类型id
     *@param archState      档案状态 0整编库，1档案库，2鉴定库，3销毁库，4回收站
     *@param formType     表单类型  0文件属性，1文件列表，2案卷属性，3案卷列表，4未组卷-文件列表，5归卷，6组卷
     **/
    function selectArchTypeForm(archTypeId, archState, formType) {
        var res = {};
        var param = {
            arch_type_id: archTypeId
            , formstate: archState
            , form_type: formType
        };
        inbizsdk.$dataset("selectForm", param, function (result) {
            res = result.Data[0][0];
        }, false);
        return res;
    }

    var resData = selectArchTypeForm(archtypeid, '0', '0');//获取dangantiaomu表单id
    if (resData) {
        archFormId = resData.form_id;
    }

    /************1、获取档案详情数据*************/
    inbizsdk.$dataset("Selectarchtype", {Id: archtypeid}, function (data) {
        arch_table_name = data.Data[0][0].arch_table_name;
        inbizsdk.$dataset("selectArchById", {tableName: arch_table_name, archId: id}, function (data) {

            archDetail = data.Data[0][0];

            for (var item in archDetail) {
                if (archDetail[item] == null || archDetail[item] == 'null') {
                    archDetail[item] = "";
                }
            }
            $("#archNameId").html(archDetail.name + "档案详情");
            console.log(archDetail);
        }, false, false);
    }, false, false);


    //加入收藏夹
    function addcollection() {
        debugger;
        if (archDetail.Id == "") {
            //alert(`请选择需要收藏的档案信息!`);
            inbizsdk.$components.tip.info("加入收藏夹操作失败");
        }
        var message = "";
        var values = "";
        var userId = window.webSite.userInfo.ID;   //当前用户的guid


        var name = archDetail.name;  //档案名称
        var param = {
            createId: window.webSite.userInfo.ID,
            archId: archDetail.Id
        };
        inbizsdk.$dataset("selectFavoritesByArchId", param, function (result) {
            if ((result.Data[0].length > 0)) {
                favoritesId = result.Data[0][0].Id;
                message = message + "档案：" + name + "<br>"
            }
        }, false);

        if (message) {
            var deleteParam = {
                Id: favoritesId
            };
            inbizsdk.$dataset("removeFavorites", deleteParam, function (result) {
                if (result.EffectOfRow > 0) {
                    $('#add_click').removeClass('selectStore');
                    $('#add_click').addClass('unselectStore');
                    inbizsdk.$components.tip.info("移除收藏成功！");
                } else {
                    inbizsdk.$components.tip.info("移除收藏失败！");
                }
            }, false);
        } else {
            var Id = guid(),
                formId = ",'" + archFormId + "'",
                tableName = ",'" + arch_table_name + "'",
                archId = ",'" + archDetail.Id + "'",
                archiveName = ",'" + archDetail.name + "'",
                archiveNo = ",'" + archDetail.number + "'",
                secret = ",'" + archDetail.secert + "'",
                writeDate = ",'" + archDetail.writtendate + "'";
            values = "('" + Id + "',now(),now(),'" + userId + "','" + userId + "'" + formId + tableName + archId + archiveName + archiveNo + secret + writeDate + ")";


            var batchParam = {
                params: values
            };
            inbizsdk.$dataset("BatchInsertMyfavorites", batchParam, function (result) {
                if (result.EffectOfRow > 0) {
                    $('#add_click').removeClass('unselectStore');
                    $('#add_click').addClass('selectStore');
                    inbizsdk.$components.tip.info("收藏成功！");
                } else {
                    inbizsdk.$components.tip.info("收藏失败！");
                }
            }, false);

        }

    }


    //加入借阅车
    function adduse() {
        debugger;
        // var selectedRows = inbiz("UnifiedSearchb58dcdfdc10d475aabbc6a3825cb85f9").$model.vf.getSelectedRow();
        if (archDetail.Id == "") {
            inbizsdk.$components.tip.info("加入借阅车操作失败！");
        }
        var msg = "";
        var userId = window.webSite.userInfo.ID;


        var archName = archDetail.name == null ? ' ' : archDetail.name;
        var param = {
            createId: window.webSite.userInfo.ID,
            archiveId: archDetail.Id
        };
        inbizsdk.$dataset("selectBorrowCarByArchId", param, function (result) {
            if (result.Data[0].length>0) {
                borrowCarId = result.Data[0][0].Id;
                msg = msg + "档案:" + archName + "<br>";
            } else {
                inbizsdk.$dataset("SelectSect", {Id: archDetail.sectid}, function (result) {
                    var data = result.Data[0][0];
                    sectname = data.name;
                }, false);
            }
        }, false);

        if (msg) {

            var deleteParam = {
                Id: borrowCarId
            };
            inbizsdk.$dataset("removeUse", deleteParam, function (result) {
                if (result.EffectOfRow > 0) {
                    $('#borrow_click').removeClass('selectBorrow');
                    $('#borrow_click').addClass('unselectBorrow');
                    inbizsdk.$components.tip.info("移除借阅车成功！");

                } else {
                    inbizsdk.$components.tip.info("移除借阅车失败！");
                }
            }, false);

        } else {
            var Id = guid(),
                sectName = ",'" + sectname + "'",
                name = ",'" + archName + "'",
                archiveId = ",'" + archDetail.Id + "'",
                sectId = ",'" + archDetail.sectid + "'",
                archTypeId = ",'" + archDetail.archtypeid + "'",
                formId = ",'" + archFormId + "'",
                archTypeName = ",'" + "'",
                number = ",'" + archDetail.number + "'";
            var values = "('" + Id + "',now(),now(),'" + userId + "','" + userId + "'" + sectName + name + archiveId + sectId + archTypeId + formId + archTypeName + number + ")";

            var batchParam = {
                params: values
            };
            inbizsdk.$dataset("BatchInsertBorrowCar", batchParam, function (result) {
                if (result.EffectOfRow > 0) {
                    $('#borrow_click').removeClass('unselectBorrow');
                    $('#borrow_click').addClass('selectBorrow');
                    inbizsdk.$components.tip.info("加入借阅车成功！");
                } else {
                    inbizsdk.$components.tip.info("加入借阅车失败！");
                }
            }, false);
        }
    }

    //发起借阅
    function useBorrow() {
        debugger;

        var archId = archDetail.Id;
        var domain = window.location.protocol+"//" + window.location.host;//api请求地址
        var formId = '200206210516_edrms';//借阅申请 表单id

        var processId ;//借阅流程id
        inbizsdk.$dataset("selectProcessIdByProcessName",{ProcessName:'档案借阅'},function(data){

            processId=data.Data[0][0].ID_;
        },false);

        var newFormUrl = domain + "/eform/Default/default?formId=" + formId + "&skin=techblue&processId=" + processId + "&taskType=begintask&formver=0&borrowType=first&archInfoId="+archId+"&archTypeId="+archtypeid+"&formver=0";    //ui页面的存放地址,add-file-copy为重构后的页面

        showMessageDialog(newFormUrl,'借阅申请',900,700,true)

    }


    function showMessageDialog(url, title, width, height, shadow) {

        var content = '<iframe id="useBorrowIF" src="' + url + '" width="100%" height="99%" frameborder="0" scrolling="no"></iframe>';
        var boarddiv = '<div id="msgwindow" title="' + title + '"></div>'//style="overflow:hidden;"可以去掉滚动条
        $(document.body).append(boarddiv);
        var win = $('#msgwindow').dialog({
            content: content,
            width: width,
            height: height,
            modal: shadow,
            title: title,
            onClose: function () {
                $(this).dialog('destroy');//后面可以关闭后的事件
            }
        });
        win.dialog('open');
    }



    function guid() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }


    function writeCurrentDate() {
        var now = new Date();
        var year = now.getFullYear(); //得到年份
        var month = now.getMonth();//得到月份
        var date = now.getDate();//得到日期
        var day = now.getDay();//得到周几
        var hour = now.getHours();//得到小时
        var minu = now.getMinutes();//得到分钟
        var sec = now.getSeconds();//得到秒
        var MS = now.getMilliseconds();//获取毫秒

        if (month < 10) month = "0" + month;
        if (date < 10) date = "0" + date;
        if (hour < 10) hour = "0" + hour;
        if (minu < 10) minu = "0" + minu;
        if (sec < 10) sec = "0" + sec;
        if (MS < 100) MS = "0" + MS;

        var time = "";
        time = year + "年" + month + "月" + date + "日" + " " + hour + ":" + minu + ":" + sec;
        //当前日期赋值给当前日期输入框中（jQuery easyUI）
        return time;

    }

    function model() {
        return {
            //属性
            //方法
            vf: {
                addcollection: addcollection,
                adduse: adduse,
                useBorrow: useBorrow
            },
            //数据绑定开始前
            activate: function () {
            },
            //数据绑定时
            binding: function () {
            },
            //数据绑定完成
            bindingComplete: function () {
            },
            //加载到父级dom后执行
            attached: function () {
            },
            //全部组装完成后执行
            compositionComplete: function () {

                var userId = window.webSite.userInfo.ID;

                //我的收藏
                inbizsdk.$dataset("selectFavoritesByArchId", {archId: id,createId:userId}, function (result) {
                    debugger;
                    if (result.Data[0].length>0) {

                        $('#add_click').addClass('selectStore');
                        favoritesId = result.Data[0][0].Id;
                    }else {
                        $('#add_click').addClass('unselectStore');
                    }
                }, false, false);
                //借阅车
                inbizsdk.$dataset("selectBorrowCarByArchId", {archiveId: id,createId:userId}, function (result) {
                    debugger;
                    if (result.Data[0].length>0) {

                        $('#borrow_click').addClass('selectBorrow');
                        borrowCarId = result.Data[0][0].Id;
                    }else {

                        $('#borrow_click').addClass('unselectBorrow')
                    }
                }, false, false);

                var token = $.cookie("token");
                if (archDetail) {
                    $.ajax({
                        type: "get",
                        url: "/api/services/MetaData/GetMetaDataTypeById",//获取元数据表单  控件信息接口
                        async: true,
                        data: {
                            token: token,
                            typeId: archFormId
                        },
                        success: function (e) {
                            $("#archNameId").html(archDetail.name + "档案详情");
                            if (e.result == "0" && e.data.MetaAttrList) {
                                $.each(e.data.MetaAttrList, function (index, item) {
                                    if (item.ControlModel.ControlType != "edoc2Hidden") {
                                        //tdtr = ' <tr><td>' + item.ControlModel.Name + ':</td><td> '+archDetail[item.ControlModel.ControlId]+'</td></tr>'
                                        tdtr = ' <tr style="height: 50px;">\n' +
                                            '                <td style="width: 120px;">' + item.ControlModel.Name + '&nbsp; : </td>\n' +
                                            '                <td style="width: 280px;">' + archDetail[item.ControlModel.ControlId] + ' </td>\n' +
                                            '            </tr>\n';
                                        $("#archDetailItemsTab").append(tdtr);
                                    }
                                });
                            }
                        },
                        error: function () {
                        }
                    });
                    inbizsdk.$dataset("selectFilesByArchId", {archId: id}, function (result) {
                        var files = result.Data[0];
                        if (files.length > 0) {
                            for (var i = 0; i < files.length; i++) {
                                var fileName = files[i].Name;
                                var fileId = files[i].FileId;
                                //var fileName = '哈哈哈.png';
                                var arr = fileName.split(".");
                                var fileFormat = arr[arr.length - 1]; //格式
                                var imgHTML = '<ul style="height: 43px;"><img style="height: 20px;width: 20px;margin-right: 10px;" src="/external/icon-file-type/32/' + fileFormat + '.png"><a  target=view_window href="http://'+window.location.host+'/preview.html?fileid='+fileId+'">' + fileName + '</a></ul>';
                                $("#archFilesP").append(imgHTML);

                            }
                        }
                    }, false, false);
                }
            },
            //从dom移除后执行
            detached: function () {
            }
        };
    }


    return model;
});
