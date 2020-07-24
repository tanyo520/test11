define(["jquery", "logic/Portal", "cookie", "knockout", "logic/Portal", "inbizsdk"], function ($, cookie, portal, ko, portal, inbizsdk) {
    function resetStyle(id) {
    }

    function model() {
        return {
            vm: {
                archivedTotal: ko.observable(0),
                archTotal: ko.observable(0),
                dossierTotal: ko.observable(0),
                borrowTotal: ko.observable(0)
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
                    current.vm.archivedTotal(guidangCount);
                }, true); //归档量

                inbizsdk.$dataset("countArchNumByArchived", {}, function (data) {
                    var archCount = data.Data[0][0]["count(1)"];
                    current.vm.archTotal(archCount);
                }, true);// 文件集总量
                inbizsdk.$dataset("countDossierNumByArchived", {}, function (data) {
                    var dossierCount = data.Data[0][0]["count(1)"];
                    current.vm.dossierTotal(dossierCount);
                }, true);//案卷总量
                inbizsdk.$dataset("countBorrowNum", {}, function (data) {
                    var borrowCount = data.Data[0][0]["count(1)"];
                    current.vm.borrowTotal(borrowCount);
                }, true);//借阅量
            }
        }
    }

    return model;
});
