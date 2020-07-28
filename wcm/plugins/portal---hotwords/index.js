define(["jquery", "logic/Portal", "cookie", "knockout", "logic/Portal", "inbizsdk",
    "pluginsPath/UnifiedSearch/Scripts/insight-search/utils/index"], function ($, cookie, portal, ko, portal, inbizsdk, utils) {
    function resetStyle(id) {
    }

    function model() {
        return {
            vm: {},
            compositionComplete: function () {
                var currentChoose = "arch";//默认选中 档案热搜
                // window.globalvalue_DocHotWords=[];// 文档热搜词  存在全局变量的是 上一次接口返回的8个
                /********start penglin add 增加授权判断  如果非edrms则不显示 文档热搜******/
                if (window.globalvalue_ermsVersion != "edrms" || window.globalvalue_ermsVersion == undefined) {
                    if ($('.divTbDoc') != undefined && $('.divTbDoc').length > 0) {
                        $('.divTbDoc').remove();
                    }
                }
                /********end penglin add 增加授权判断  如果非edrms则不显示 文档热搜******/
                var tds = $('.divHotSearch').find('td');
                inbizsdk.$insight.getHotWordsAsync(function (result) {
                    var archHotWordsFromApi = result.aggregations.keyword.buckets;
                    archHotWordsFromApi = archHotWordsFromApi.length < 8 ? archHotWordsFromApi : archHotWordsFromApi.slice(0, 8);
                    for (var i = 0; i < archHotWordsFromApi.length; i++) {
                        var words = archHotWordsFromApi[i].key;
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
                    if (docLink.length > 0) {
                        docLink[0].style.color = "#666666"
                    }
                    inbizsdk.$insight.getHotWordsAsync(function (result) {
                        var archHotWordsFromApi = result.aggregations.keyword.buckets;
                        archHotWordsFromApi = archHotWordsFromApi.length < 8 ? archHotWordsFromApi : archHotWordsFromApi.slice(0, 8);
                        for (var i = 0; i < archHotWordsFromApi.length; i++) {
                            var words = archHotWordsFromApi[i].key;
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
                        for (var j = archHotWordsFromApi.length; j < tds.length; j++) {
                            tds[j].innerText = "待发现";
                        }
                    });

                });

                /***点击文档 显示文档的热搜词***/
                docLink.bind("click", function () {
                    currentChoose = "doc";
                    if (docLink.length > 0) {
                        docLink[0].style.color = "#1989FA"
                    }
                    ;
                    archLink[0].style.color = "#666666";
                    $.post('/webcore', {
                        module: 'WebClient',
                        fun: "GetHotWordsList",
                        keyWord: "",
                        type: 0,
                        curFolderId: 1
                    }).done(function (res) {
                        var result = JSON.parse(res);
                        var arrayResult = JSON.parse(result.hwList);
                        var docHotWordsFromApi = [];
                        for (var a = 0; a < arrayResult.length; a++) {
                            docHotWordsFromApi.push(arrayResult[a].text);
                        }
                        docHotWordsFromApi.reverse();
                        var docHotWordsLength = docHotWordsFromApi.length;
                        var tdInnertTextMaxLength = 8;
                        var tdInnerText = new Array(tdInnertTextMaxLength);
                        for (var b = 0; b < tdInnertTextMaxLength; b++) {
                            if(b < docHotWordsLength)
                            {
                                tdInnerText[b] = docHotWordsFromApi[b];
                            }else
                            {
                                tdInnerText[b] = "待发现";
                            }
                        }
                        if (window.globalvalue_DocHotWords.length < 0) {
                            window.globalvalue_DocHotWords = tdInnerText;
                        } else {
                            var pushCount = 0;
                            var pushMax = tdInnertTextMaxLength - docHotWordsLength;
                            for (var i = 0; i < window.globalvalue_DocHotWords.length; i++) {
                                if (pushCount >= pushMax) {
                                    break;
                                }
                                if (tdInnerText.indexOf(window.globalvalue_DocHotWords[i]) == -1) {
                                    tdInnerText[docHotWordsLength + pushCount] = window.globalvalue_DocHotWords[i];
                                    pushCount++;
                                }

                            }
                        }
                        window.globalvalue_DocHotWords = tdInnerText;
                        tdInnerText = tdInnerText.length < 8 ? tdInnerText : tdInnerText.slice(0, 8);
                        for (var i = 0; i < tdInnerText.length; i++) {
                            var words = tdInnerText[i];
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
