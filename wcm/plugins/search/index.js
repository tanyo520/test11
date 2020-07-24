define(["knockout", "jquery", "inbizsdk"], function (ko, $, inbizsdk) {

    function getHeight(height) {

        if (height) {
            return height + 'px';
        }
        return 'auto';
    }

    /*function getSelect() {
        var selectedRows = inbiz("UnifiedSearch8af2dd6265da41ff93a7c99e47052948").$model.vf.getSelectedRow();
        if (selectedRows) {
            alert(`选择了${selectedRows.length}项`)
        }
    }*/

    function addcollection() {
        var selectedRows = inbiz("UnifiedSearch8af2dd6265da41ff93a7c99e47052948").$model.vf.getSelectedRow();
        if (selectedRows.length == "0") {
            //alert(`请选择需要收藏的档案信息!`);
            inbizsdk.$components.tip.info("请选择需要收藏的档案");
            return false;
        }
        var AllMessage = "";
        var message = "";
        var message2 = "";
        var values = "";
        var userId = window.webSite.userInfo.ID;
        for (var i = 0; i < selectedRows.length; i++) {
            var name = selectedRows[i].RawData._source.name;
            var param = {
                createId: window.webSite.userInfo.ID,
                archId: selectedRows[i].RawData._source.objectid
            };
            inbizsdk.$dataset("CountMyfavoritesByCreateIdAndArchId", param, function (result) {
                if ((result.Data[0][0].count - 0) > 0) {
                    message = message  + name + "<br>"
                }else {

                    message2 = message2  + selectedRows[i].RawData._source.name + "<br>";

                    var Id = guid(),
                        formId = ",'" + selectedRows[i].RawData._source.formid + "'",
                        tableName = ",'" + selectedRows[i].RawData._source.archTableName + "'",
                        archId = ",'" + selectedRows[i].RawData._source.objectid + "'",
                        archiveName = ",'" + selectedRows[i].RawData._source.name + "'",
                        archiveNo = ",'" + selectedRows[i].RawData._source.number + "'",
                        secret = ",'" + selectedRows[i].RawData._source.secert + "'",
                        writeDate = ",'" + selectedRows[i].RawData._source.writtendate + "'";
                    values = values + ",('" + Id + "',now(),now(),'" + userId + "','" + userId + "'" + formId + tableName + archId + archiveName + archiveNo + secret + writeDate + ")"

                }
            }, false);
        }
        if (values) {
            values = values.substring(1);
            var batchParam = {
                params: values
            };
            inbizsdk.$dataset("BatchInsertMyfavorites", batchParam, function (result) {
                if (result.EffectOfRow > 0) {
                    message2 += '收藏成功！';
                    //inbizsdk.$components.tip.info("收藏成功！");
                } else {
                    message2 += '收藏失败！';
                    //inbizsdk.$components.tip.info("收藏失败！");
                }
            }, false);

        }
        if(message){
            message = '以下档案:<br>'+message+'已经加入收藏，不能重复加入！<br>';
        }
        if(message2){
            message2 = '以下档案:<br>'+message2;
        }
        AllMessage = message + message2;
        inbizsdk.$components.tip.info(AllMessage);
    }

    //发起借阅
    function useBorrow() {
        var selectedRows = inbiz("UnifiedSearch8af2dd6265da41ff93a7c99e47052948").$model.vf.getSelectedRow();
        if (selectedRows.length == "0") {
            inbizsdk.$components.tip.info("请选择需要借阅的档案！");
            return false;
        }else if(selectedRows.length >"1") {
            inbizsdk.$components.tip.info("请选择单个档案进行借阅！");
            return false;
        }
        //批量借阅的话 以下很需要
        /*    var param={};
        var list=[];
        var userId = window.webSite.userInfo.ID;
        for (var i = 0; i < selectedRows.length; i++) {
            var objectid = selectedRows[i].RawData._source.objectid;
            var archTypeName=selectedRows[i].RawData._source.archTableName;

            param={objectid:objectid,archTypeName:archTypeName};
            list.push(param);
        }
       var paramStr= JSON.stringify(list);*/

        var archId = selectedRows[0].RawData._source.objectid ;
        var archTypeId = selectedRows[0].RawData._source.archtypeid ;
        var domain = "http://" + window.location.host;//api请求地址
        var formId = '200206210516_edrms';//'200504142204_edrms';//借阅申请 表单id

        var processId ;//归档流程id
        inbizsdk.$dataset("selectProcessIdByProcessName",{ProcessName:'档案借阅'},function(data){
            processId=data.Data[0][0].ID_;
        },false);

        var newFormUrl = domain + "/eform/Default/default?formId=" + formId + "&skin=techblue&processId=" + processId + "&taskType=begintask&formver=0&borrowType=first&archInfoId="+archId+"&archTypeId="+archTypeId+"&formver=0";   //ui页面的存放地址,add-file-copy为重构后的页面

        showMessageDialog(newFormUrl,'借阅申请',950,730,true)

    }

    function showMessageDialog(url, title, width, height, shadow) {

        var content = '<iframe src="' + url + '" width="100%" height="99%" frameborder="0" scrolling="no"></iframe>';
        var boarddiv = '<div id="msgwindow" title="' + title + '"></div>'    //style="overflow:hidden;"可以去掉滚动条
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


    /**
     * 加入借阅车
     * @returns {boolean}
     */
    function adduse() {
        var selectedRows = inbiz("UnifiedSearch8af2dd6265da41ff93a7c99e47052948").$model.vf.getSelectedRow();
        if (selectedRows.length == "0") {
            inbizsdk.$components.tip.info("请选择加入借阅车的档案！");
            return false;
        }
        var msg = "";
        var msg2 = "";
        var values = "";
        var userId = window.webSite.userInfo.ID;
        var sectname = "";
        for (var i = 0; i < selectedRows.length; i++) {

            var archName = selectedRows[i].RawData._source.name;
            var param = {
                createId: window.webSite.userInfo.ID,
                archiveId: selectedRows[i].RawData._source.objectid
            };
            inbizsdk.$dataset("CountMyfavoritesByCreateIdAndArchiveId", param, function (result) {
                if (result.Data[0][0].count - 0 > 0) {
                    msg = msg + archName + "已经加入借阅车,不可重复加入！<br>";
                } else {

                    inbizsdk.$dataset("SelectSect", {Id: selectedRows[i].RawData._source.sectid}, function (result) {
                        var data = result.Data[0][0];
                        sectname = data.name;
                    }, false);

                    msg2 = msg2 + selectedRows[i].RawData._source.name + "<br>";

                    var Id = guid(),
                        sectName = ",'" + sectname + "'",
                        name = ",'" + selectedRows[i].RawData._source.name + "'",
                        archiveId = ",'" + selectedRows[i].RawData._source.objectid + "'",
                        sectId = ",'" + selectedRows[i].RawData._source.sectid + "'",
                        archTypeId = ",'" + selectedRows[i].RawData._source.archtypeid + "'",
                        formId = ",'" + selectedRows[i].RawData._source.formid + "'",
                        archTypeName = ",'" + "'",
                        number = ",'" + selectedRows[i].RawData._source.number + "'";

                        values = values + ",('" + Id + "',now(),now(),'" + userId + "','" + userId + "'" + sectName + name + archiveId + sectId + archTypeId + formId + archTypeName + number + ")"

                }
            }, false);
           }
        if (values){
            values = values.substring(1);
            var batchParam = {
                params: values
            };
            inbizsdk.$dataset("BatchInsertBorrowCar", batchParam, function (result) {
                if (result.EffectOfRow > 0) {
                    msg2 += '加入借阅车成功！';
                   // inbizsdk.$components.tip.info("加入借阅车成功！");
                } else {
                    msg2 += '加入借阅车失败！';
                   // inbizsdk.$components.tip.info("加入借阅车失败！");
                }
            }, false);
        }
        if(msg){
            msg = '以下档案:<br>'+msg+'已经加入借阅车，不能重复加入！<br>';
        }
        if(msg2){
            msg2 = '以下档案:<br>'+msg2;
        }

        var AllMsg = msg + msg2;
        inbizsdk.$components.tip.info(AllMsg);
    }


    var title = ko.observable('');
    var bianhao = ko.observable('');
    //var datefrom = ko.observable('');
    //var dateto = ko.observable('');

    // function search() {
    //     debugger
    //     // var query = ` AND name: (${title()}) AND number: (${bianhao()})`;
    //     var query = ' AND name: ('+title()+') AND number: ('+bianhao()+')';
    //
    //     inbiz("UnifiedSearch8af2dd6265da41ff93a7c99e47052948").$model.vf.twoSearch(query);
    // }



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
            vm: {
                // title: title,
                // bianhao: bianhao
            },
            //方法
            vf: {
                getHeight: getHeight,
                //getSelect: getSelect,
                addcollection: addcollection,
                adduse: adduse,
                // search: search,
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
            },
            //从dom移除后执行
            detached: function () {
            }
        };
    }


    return model;
});
