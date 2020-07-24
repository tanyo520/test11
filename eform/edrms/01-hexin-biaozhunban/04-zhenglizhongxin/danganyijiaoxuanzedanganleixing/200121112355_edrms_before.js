eform("eformListGrid2").method("hide");


eform("eformListGrid2").method("getControl").onGetParentWindow = function () {
    try {
        if (window.top.location.href.toLowerCase().indexOf("/eform") > -1) {
            return window.top;
        }
        else if (window.top.location.href.toLowerCase().indexOf("/wcm") > -1) {
            return window.top;
        }
        else if (window.top.location.href.toLowerCase().indexOf("/inbiz") > -1) {
            return window.top;
        }
        else if (window.parent.location.href.toLowerCase().indexOf("/eform") > -1) {
            return window.parent;
        }
        else if (window.parent.location.href.toLowerCase().indexOf("/wcm") > -1) {
            return window.parent;
        }
        else if (window.parent.location.href.toLowerCase().indexOf("/inbiz") > -1) {
            return window.parent;
        }
        else {
            return window;
        }
    }
    catch (ex) {
        return window;
    }
};



window.setTimeout(function(){
    eform("eformListGrid2").method("getControl").isLoaded = true;
},1000);