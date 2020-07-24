require(["jquery", "inbizsdk"], function ($, inbizsdk) {


// 	var hvobj = inbiz("IFramebb23256a500a4334a68ffcbcd953e22e")
// 	var searchkey=$.getUrlParameter("keyword");
// 	hvobj.afterEvent = function () {


// 		var height = $(window).height();
// // 		$(top.document).find("iframe").eq(0).height(height0-130);

// 		$("#IFramebb23256a500a4334a68ffcbcd953e22e iframe").height(height-130);


// 		var url=hvobj.$model.$props.par_frameUrl()+"&searchkey="+searchkey+"&searchtype=0|1&searchaccuracy=0&t="+Math.random()+"&drop=true"

// 		$("#IFramebb23256a500a4334a68ffcbcd953e22e iframe").attr("src",url)

// 	}


    var jumpUrl = window.location.protocol + '//' + window.location.hostname + '#doc/enterprise/1';
    var hvobj = inbiz("IFramebb23256a500a4334a68ffcbcd953e22e")
    var searchkey = $.getUrlParameter("keyword");
    var insightType=$.getUrlParameter("insightType");
    if(insightType!=null)
    {
        searchkey=null;
    }
    hvobj.afterEvent = function () {


        var height = $(window).height();
// 		$(top.document).find("iframe").eq(0).height(height0-130);

        $("#IFramebb23256a500a4334a68ffcbcd953e22e iframe").height(height - 70);


        var url = jumpUrl;
        if (searchkey != null) {
            url = jumpUrl + "/search?Panelcontrol=0.1.1&searchkey=" + searchkey + "&searchtype=0|1&searchaccuracy=0&t=" + Math.random() + "&drop=true"
        }else
        {
            url=jumpUrl+'?Panelcontrol=0.1.1';
        }
        $("#IFramebb23256a500a4334a68ffcbcd953e22e iframe").attr("src", url)


    }

})
