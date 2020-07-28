define(["jquery", "logic/Portal", "cookie", "knockout", "logic/Portal"], function ($, cookie, portal, ko, portal) {
    function resetStyle(id) {
    }

    function model() {
        return {
            vm: {},
            compositionComplete: function () {
                $('.archDivMask').on("click", function () {
                    $('.topSearchDiv').css('display', 'none');
                    $('.archDivMask').css('display', 'none');
                });
            }
        }
    }

    return model;
});
