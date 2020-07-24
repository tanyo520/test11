require(["jquery", "inbizsdk"], function ($, inbizsdk) {

    var jumpUrl = window.location.protocol + '//' + window.location.hostname + '#system?Panelcontrol=0.1.1';
    var hvobj = inbiz("IFrame1c45912b7d614daaacecdd68969b602f")
    hvobj.afterEvent = function () {
        var height = $(window).height();
        $("#IFrame1c45912b7d614daaacecdd68969b602f iframe").height(height - 130);

        $("#IFrame1c45912b7d614daaacecdd68969b602f iframe").attr("src", jumpUrl)


    }

})