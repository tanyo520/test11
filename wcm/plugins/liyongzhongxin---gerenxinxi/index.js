define(["jquery", "logic/Portal", "cookie", "knockout", "logic/Portal","inbizsdk"], function ($, cookie, portal, ko, portal,inbizsdk) {
    function resetStyle(id) {
    }

    function model() {
        return {
            vm: {
                userName:ko.observable(''),
                departName:ko.observable('')
            },
            compositionComplete: function () {
                var current = this;
                current.vm.userName(inbizsdk.$app.userInfo.Name);
                current.vm.departName(inbizsdk.$app.userInfo.MainDepartmentName);
                $('.userImg img')[0].src="/ImageType/GetUserAvatar?token="+inbizsdk.$app.token+"&userId="+inbizsdk.$app.userInfo.IdentityId+"&flag=&r="+Math.random();
            }
        }
    }

    return model;
});
