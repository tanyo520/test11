require(["jquery", "inbizsdk"], function ($, inbizsdk) {

    var jumpUrl = '/index.html#system?Panelcontrol=0.1.1';
    var hvobj = inbiz("IFrame473809f378e7406db54806f6bd503c4f")
    hvobj.afterEvent = function () {
        var height = $(window).height();
        $("#IFrame473809f378e7406db54806f6bd503c4f iframe").height(height - 130);

        $("#IFrame473809f378e7406db54806f6bd503c4f iframe").attr("src", jumpUrl)


    }

})