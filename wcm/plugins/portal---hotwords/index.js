define(["jquery", "logic/Portal", "cookie", "knockout", "logic/Portal", "inbizsdk",
    "pluginsPath/UnifiedSearch/Scripts/insight-search/utils/index"], function ($, cookie, portal, ko, portal, inbizsdk, utils) {
    function resetStyle(id) {
    }

    function model() {
        return {
            vm: {},
            compositionComplete: function () {
                var currentChoose = "arch";//默认选中 档案热搜
                var tds = $('.divHotSearch').find('td');
                inbizsdk.$insight.getHotWordsAsync(function (result) {
                    var data = result.aggregations.keyword.buckets;
                    var rangWords = data.length < 12 ? data : data.slice(0, 12);
                    for (var i = 0; i < rangWords.length; i++) {
                        var words = data[i].key;
                        tds[i].innerText = words;
                        if (i >= 4) {
                            if (words.length < 5) {
                                tds[i].style.fontSize = "14px";
                            } else {
                                tds[i].style.fontSize = "12px";
                            }
                        } else {
                            if (words.length < 10) {
                                tds[i].style.fontSize = "16px";
                            } else {
                                tds[i].style.fontSize = "14px";
                            }
                        }
                    }
                });
                var archLink = $('.divHotSearch').find(".divTbArch"); //档案按钮
                var docLink = $('.divHotSearch').find(".divTbDoc"); //文档按钮
                /***点击档案 显示档案的热搜词***/
                archLink.bind("click", function () {
                    currentChoose = "arch";
                    archLink[0].style.color = "#1989FA";
                    docLink[0].style.color = "#666666";
                    inbizsdk.$insight.getHotWordsAsync(function (result) {
                        var data = result.aggregations.keyword.buckets;
                        var rangWords = data.length < 12 ? data : data.slice(0, 12);
                        for (var i = 0; i < rangWords.length; i++) {
                            var words = data[i].key;
                            tds[i].innerText = words;
                            tds[i].title = "search";
                            if (i >= 4) {
                                if (words.length < 5) {
                                    tds[i].style.fontSize = "14px";
                                } else {
                                    tds[i].style.fontSize = "12px";
                                }
                            } else {
                                if (words.length < 10) {
                                    tds[i].style.fontSize = "16px";
                                } else {
                                    tds[i].style.fontSize = "14px";
                                }
                            }
                        }
                        for (var j = rangWords.length; j < tds.length; j++) {
                            tds[j].innerText = "待发现";
                        }
                    });
                });

                /***点击文档 显示文档的热搜词***/
                docLink.bind("click", function () {
                    currentChoose = "doc";
                    docLink[0].style.color = "#1989FA";
                    archLink[0].style.color = "#666666";
                    $.post('/webcore', {
                        module: 'WebClient',
                        fun: "GetHotWordsList",
                        keyWord: "",
                        type: 0,
                        curFolderId: 1
                    }).done(function (res) {
                        var result = JSON.parse(res);
                        var data = JSON.parse(result.hwList);
                        var rangWords = data.length < 12 ? data : data.slice(0, 12);
                        for (var i = 0; i < rangWords.length; i++) {
                            var words = data[i].text;
                            tds[i].innerText = words;
                            if (i >= 4) {
                                if (words.length < 5) {
                                    tds[i].style.fontSize = "14px";
                                } else {
                                    tds[i].style.fontSize = "12px";
                                }
                            } else {
                                if (words.length < 10) {
                                    tds[i].style.fontSize = "16px";
                                } else {
                                    tds[i].style.fontSize = "14px";
                                }
                            }
                        }
                        for (var j = rangWords.length; j < tds.length; j++) {
                            tds[j].innerText = "待发现";
                        }

                    });
                });

                tds.bind("click", function (value) {
                    var keywordStr = value.currentTarget.textContent;
                    if (value.currentTarget.textContent == "待发现")
                        keywordStr = "*"

                    var sortArry = [];
                    sortArry.push({key: "0", value: "匹配度", sortable: false, sort: "desc"});
                    if (currentChoose == "arch") {
                        location.href = location.origin + "/wcm/edrms/search?keyword=" + escape(keywordStr) + "&searchWhere="
                            + "&insightType=0&sort=" + escape(JSON.stringify(sortArry));
                    }
                    else {
                        location.href = location.origin + "/wcm/edrms/wendangguanli?keyword=" + escape(keywordStr);
                    }
                });


            }
        }
    }

    return model;
});
