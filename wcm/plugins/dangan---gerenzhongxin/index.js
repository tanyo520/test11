define(["jquery", "logic/Portal", "cookie", "knockout", "logic/Portal","inbizsdk"], function ($, cookie, portal, ko, portal,inbizsdk) {
    function resetStyle(id) {
    }
    function model() {
        return {
            vm: {
                myTodo: ko.observable(0),
                myDone: ko.observable(0),
                myArchived: ko.observable(0),
                userName:ko.observable(''),
                departName:ko.observable('')
            },
            compositionComplete: function () {
                /********start penglin add 增加授权判断  如果非edrms则不显示我的移交******/
                if(window.globalvalue_ermsVersion!="edrms" ||window.globalvalue_ermsVersion==undefined)
                {
                    if($('.myTransArch')!=undefined && $('.myTransArch').length>0)
                    {
                        $('.myTransArch').remove();
                    }
                }
                /********end penglin add 增加授权判断  如果非edrms则不显示我的移交******/
                var current = this;
                current.vm.userName(inbizsdk.$app.userInfo.Name);
                current.vm.departName(inbizsdk.$app.userInfo.MainDepartmentName);
                $('.userImg img')[0].src="/ImageType/GetUserAvatar?token="+inbizsdk.$app.token+"&userId="+inbizsdk.$app.userInfo.IdentityId+"&flag=&r="+Math.random();

                var porl = require("logic/Portal");
                portal.Controller.event().on('portal:scroll').then(function (state) {
                    resetStyle(current.$props.id());
                });
                portal.Controller.event().on('portal:tabview.activate').then(function (pluginId) {
                    resetStyle(current.$props.id());
                });

                var url = "/edoc2Flow-web/edoc-task/getCountByUserId?";
                var userId = window.webSite.userInfo.ID;
                var query = "userId=" + userId + "&type=inbox&groupType=Process&rand=" + Math.random();
                var queryPath = url + query;

                porl.Interface.ajax({
                    type: "GET",
                    url: queryPath,
                    pluginInceId: current.$props.id(),
                    success: function (result) {
                        var data = result;
                        if (data && data.all) {
                            $('.myTodo').css('visibility',data.all.InboxCount>0?"visible":"hidden");
                            $('.myDone').css('visibility',data.all.CompleteCount>0?"visible":"hidden");
                            $('.myArchived').css('visibility',data.all.ArchiveCount>0?"visible":"hidden");
                            if(data.all.InboxCount>99)
                            {
                                data.all.InboxCount="99+";
                            }
                            if(data.all.CompleteCount>99)
                            {
                                data.all.CompleteCount="99+";
                            }
                            if(data.all.ArchiveCount>99)
                            {
                                data.all.ArchiveCount="99+";
                            }
                            current.vm.myTodo(data.all.InboxCount);
                            current.vm.myDone(data.all.CompleteCount);
                            current.vm.myArchived(data.all.ArchiveCount);
                        }
                    }
                });
            }
        }
    }
    return model;
});
