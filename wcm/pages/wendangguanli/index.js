require(["jquery", "inbizsdk"], function ($, inbizsdk) {


// 	var hvobj = inbiz("IFramef6d20962b8dd4c9fa57c299439c6bd41")
// 	var searchkey=$.getUrlParameter("keyword");
// 	hvobj.afterEvent = function () {


// 		var height = $(window).height();
// // 		$(top.document).find("iframe").eq(0).height(height0-130);

// 		$("#IFramef6d20962b8dd4c9fa57c299439c6bd41 iframe").height(height-130);


// 		var url=hvobj.$model.$props.par_frameUrl()+"&searchkey="+searchkey+"&searchtype=0|1&searchaccuracy=0&t="+Math.random()+"&drop=true"

// 		$("#IFramef6d20962b8dd4c9fa57c299439c6bd41 iframe").attr("src",url)

// 	}
    var port=window.location.port;
    var jumpUrl =  '/index.html#doc/enterprise/1';
	console.log(jumpUrl);
    var hvobj = inbiz("IFramef6d20962b8dd4c9fa57c299439c6bd41")
    var searchkey = $.getUrlParameter("keyword");
    var insightType=$.getUrlParameter("insightType");
    if(insightType!=null)
    {
        searchkey=null;
    }
    hvobj.afterEvent = function () {


        var height = $(window).height();
// 		$(top.document).find("iframe").eq(0).height(height0-130);

        $("#IFramef6d20962b8dd4c9fa57c299439c6bd41 iframe").height(height - 70);


        var url = jumpUrl;
        if (searchkey != null) {
            url = jumpUrl + "/search?Panelcontrol=0.1.1&searchkey=" + searchkey + "&searchtype=0|1&searchaccuracy=0&t=" + Math.random() + "&drop=true"
        }else
        {
            url=jumpUrl+'?Panelcontrol=0.1.1';
        }
        $("#IFramef6d20962b8dd4c9fa57c299439c6bd41 iframe").attr("src", url)


    }

})