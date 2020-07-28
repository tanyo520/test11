define(["jquery", "logic/Portal", "cookie", "knockout", "logic/Portal", "inbizsdk"], function ($, cookie, portal, ko, portal, inbizsdk) {
    function resetStyle(id) {
    }

    function model() {
        return {
            vm: {
                archivedTotal: ko.observable(''),
                archTotal: ko.observable(''),
                dossierTotal: ko.observable(''),
                borrowTotal: ko.observable('')
            },
            compositionComplete: function () {
                var current = this;
                var porl = require("logic/Portal");
                portal.Controller.event().on('portal:scroll').then(function (state) {
                    resetStyle(current.$props.id());
                });
                portal.Controller.event().on('portal:tabview.activate').then(function (pluginId) {
                    resetStyle(current.$props.id());
                });

                inbizsdk.$dataset("selectGuiDangTotal", {}, function (data) {
                    var guidangCount = data.Data[0][0]["count(1)"];
                    guidangCount=guidangCount.toString().length>8?"99999999+":guidangCount;
                    current.vm.archivedTotal(guidangCount);
                }, true); //归档量

                inbizsdk.$dataset("countArchNumByArchived", {}, function (data) {
                    var archCount = data.Data[0][0]["count(1)"];
                    archCount=archCount.toString().length>8?"99999999+":archCount;
                    current.vm.archTotal(archCount);
                }, true);// 文件集总量
                inbizsdk.$dataset("countDossierNumByArchived", {}, function (data) {
                    var dossierCount = data.Data[0][0]["count(1)"];
                    dossierCount=dossierCount.toString().length>8?"99999999+":dossierCount;
                    current.vm.dossierTotal(dossierCount);
                }, true);//案卷总量
                inbizsdk.$dataset("countBorrowNum", {}, function (data) {
                    var borrowCount = data.Data[0][0]["count(1)"];
                    borrowCount=borrowCount.toString().length>8?"99999999+":borrowCount;
                    current.vm.borrowTotal(borrowCount);
                }, true);//借阅量
            }
        }
    }

    return model;
});
