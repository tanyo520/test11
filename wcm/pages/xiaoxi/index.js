require(["jquery","inbizsdk"],function($,inbizsdk){
    var hvObj =inbiz("Messageb1a38bb1c8b940b2aacf598acbabcfb7");
    var height0=getClientHeight();
    hvObj.afterEvent=function(){
        $(top.document).find("iframe").eq(0).height(height0-210);//设置iframe高度
        $(top.document).find("iframe").eq(0).on('load',function(event){
            var iframeMessage=$(this);
            var interval=setInterval(function(){
                var messageList=iframeMessage.contents().find('#applicationHost').find('.myMessageList');
                if(messageList.length>0)
                {
                    console.log("我要绑定事件.............");
                    messageList.on('click','.myMessageBox',function() {
                        console.log("这是我点击的.............");
                        setTimeout(function() {
                            /****这是唐邦国的 start *****/
                            console.log("进来了.............");
                            console.log($('.Menu .nav-counter-message'));
                            if (parseInt($('.Menu .nav-counter-message').find('span').html()) > 0) {
                                var curMessageCount = parseInt($('.Menu .nav-counter-message').find('span').html()) - 1;
                                if (curMessageCount == 0) {
                                    $('.Menu .nav-counter-message').css('display', 'none');

                                } else {
                                    $('.Menu .nav-counter-message').find('span')[0].innerText = curMessageCount;
                                }
                            }
                            /****这是唐邦国的 end *****/
                        },1000 );

                    });

                    clearInterval(interval);
                }
            },500);
        });

    }
})

/********获取高度***********/
function getClientHeight() {
    var clientHeight = 0;
    if (document.body.clientHeight && document.documentElement.clientHeight) {
        var clientHeight = (document.body.clientHeight < document.documentElement.clientHeight) ? document.body.clientHeight : document.documentElement.clientHeight;
    }
    else {
        var clientHeight = (document.body.clientHeight > document.documentElement.clientHeight) ? document.body.clientHeight : document.documentElement.clientHeight;
    }
    return clientHeight;
}

function loadMessage(){
    /*******penglin  小铃铛上增加数字提醒* start **********/
    $.ajax({
        type: "get",
        url: "/inbiz/api/WechatManager/GetMessageCount",
        async: false,
        data: {
            token: $.cookie("token")
        },
        success: function (e) {
            if (e.result == 0) {
                var timer = setInterval(function () {
                    if ($('.testClass1').length > 0 && e.data > 0) {
                        if (e.data > 99) {
                            e.data = "99+";
                        }
                        if( $('.Menu .nav-counter-message').length > 0) {
                            var curMessageCount = parseInt($('.Menu .nav-counter-message').find('span').html()) - 1;
                            if (curMessageCount == 0) {
                                $('.Menu .nav-counter-message').css('display', 'none');

                            } else {
                                $('.Menu .nav-counter-message').find('span')[0].innerText = curMessageCount;
                            }
                        }
                        clearInterval(timer);
                    }
                }, 100);
            }
        }
    });
    /*******penglin  小铃铛上增加数字提醒* start **********/
}