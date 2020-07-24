eform("archMap").method("setIsShowTipDescribe", true); //显示自定义小黑板

/***设置标题样式***/
eform("archMap").method("setTitleStyle", {
    fontSize: 14.0
});

/****第一个数字的样式**/
eform("archMap").method("setSubTitleOneNumStyle", {
    fontFamily: "ArialMT",
    fontSize: 24.0,
    color: "#1989fa"
});

/****第一个数字下面的标题样式**/
eform("archMap").method("setSubTitleOneStrStyle", {
    fontFamily: "MicrosoftYaHei",
    fontSize: 14.0,
    color: "#666666"
});

/****第二个数字的样式**/
eform("archMap").method("setSubTitleTwoNumStyle", {
    fontName: 'ArialMT',
    fontSize: 24.0,
    color: "#1989fa"
});

/****第二个数字下的标题的样式**/
eform("archMap").method("setSubTitleTwoStrStyle", {
    fontFamily: "MicrosoftYaHei",
    fontSize: 14.0,
    color: "#666666"
});

// "香港市": [115.12, 21.23],
//     "澳门市": [115.07, 21.33],
//     "台北市": [121.3, 25.03],
//     "合川市": [106.15, 30.02],
//     "江津市": [106.16, 29.18],
//     "南川市": [107.05, 29.1],
//     "永川市": [105.53, 29.23]

/*********设置地图默认数据**************/
eform("archMap").method("setMapDefaultData", {
    "香港": [115.12, 21.23],
    "澳门": [115.07, 21.33],
    "台北": [121.3, 25.03],
    "合川": [106.15, 30.02],
    "江津": [106.16, 29.18],
    "南川": [107.05, 29.1],
    "永川": [105.53, 29.23]});


/***设置 副标题  全宗总数  城市总数***/

eform.dataset("selectSectCityCount", {}, function (result) {
    eform("archMap").method("setSubTitle", [result.Data[0][0].sectCount, '全宗总数', result.Data[0][0].cityCount, '城市']);
}, false);

eform("archMap").method("setMagnification", 1);
eform("archMap").method("setMagnify", 0);