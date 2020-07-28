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
var defaultData={

};
eform("archMap").method("setMapDefaultData", {
    "香港": [114.177314,22.266416],
    "澳门": [113.549134,22.198751],
    "合川": [106.15, 30.02],
    "江津": [106.16, 29.18],
    "南川": [107.05, 29.1],
    "永川": [105.53, 29.23],
    "延边朝鲜族自治州":[129.51323,42.904823],
    "石家庄":[114.502464,38.045475],
    "唐山":[118.17539,39.635113],
    "秦皇岛":[119.58658,39.94253],
    "邯郸":[114.490685,36.612274],
    "邢台":[114.50885,37.0682],
    "保定":[115.48233,38.867657],
    "张家口":[114.884094,40.8119],
    "承德":[117.939156,40.976204],
    "沧州":[116.85746,38.31058],
    "廊坊":[116.70444,39.523926],
    "衡水":[115.66599,37.735096],
    "太原":[112.54925,37.857014],
    "大同":[113.29526,40.09031],
    "阳泉":[113.58328,37.861187],
    "长治":[113.113556,36.191113],
    "晋城":[112.85127,35.497555],
    "朔州":[112.43339,39.33126],
    "晋中":[112.736465,37.696495],
    "运城":[111.00396,35.022778],
    "忻州":[112.733536,38.41769],
    "临汾":[111.517975,36.08415],
    "吕梁":[111.13434,37.524364],
    "沈阳":[123.42909,41.79677],
    "大连":[121.61862,38.91459],
    "鞍山":[122.99563,41.110626],
    "抚顺":[123.92111,41.875957],
    "本溪":[123.770515,41.29791],
    "丹东":[124.38304,40.124294],
    "锦州":[121.13574,41.11927],
    "营口":[122.23515,40.66743],
    "阜新":[121.648964,42.011795],
    "辽阳":[123.18152,41.2694],
    "盘锦":[122.06957,41.124485],
    "铁岭":[123.84428,42.290585],
    "朝阳":[120.45118,41.57676],
    "葫芦岛":[120.85639,40.755573],
    "长春":[125.3245,43.88684],
    "吉林":[126.55302,43.84358],
    "四平":[124.37079,43.170345],
    "辽源":[125.14535,42.90269],
    "通化":[125.9365,41.721176],
    "白山":[126.42784,41.942505],
    "松原":[124.82361,45.118244],
    "白城":[122.84111,45.619026],
    "延边朝鲜族自治州":[129.51323,42.904823],
    "哈尔滨":[126.64246,45.756966],
    "齐齐哈尔":[123.95792,47.34208],
    "鹤岗":[130.27748,47.332085],
    "双鸭山":[131.1573,46.64344],
    "鸡西":[130.97597,45.300045],
    "大庆":[125.11272,46.590733],
    "伊春":[128.8994,47.724773],
    "牡丹江":[129.6186,44.582962],
    "佳木斯":[130.36163,46.809605],
    "七台河":[131.01558,45.771267],
    "黑河":[127.49902,50.249584],
    "绥化":[126.99293,46.637394],
    "大兴安岭":[124.711525,52.335262],
    "南京":[118.76741,32.041546],
    "苏州":[120.61958,31.29938],
    "无锡":[120.30167,31.57473],
    "常州":[119.946976,31.772753],
    "镇江":[119.45275,32.204403],
    "南通":[120.86461,32.016212],
    "泰州":[119.91518,32.484882],
    "扬州":[119.421005,32.393158],
    "盐城":[120.14,33.377632],
    "连云港":[119.17882,34.600018],
    "徐州":[117.184814,34.26179],
    "淮安":[119.02126,33.597507],
    "宿迁":[118.27516,33.96301],
    "杭州":[120.15358,30.287458],
    "宁波":[121.54979,29.868387],
    "温州":[120.67211,28.000574],
    "嘉兴":[120.75086,30.762653],
    "湖州":[120.1024,30.867199],
    "绍兴":[120.582115,29.997116],
    "金华":[119.649506,29.089523],
    "衢州":[118.87263,28.941708],
    "舟山":[122.106865,30.016027],
    "台州":[121.4286,28.661379],
    "丽水":[119.92178,28.451994],
    "合肥":[117.28304,31.86119],
    "芜湖":[118.37645,31.326319],
    "蚌埠":[117.36323,32.939667],
    "淮南":[117.018326,32.647575],
    "马鞍山":[118.507904,31.689362],
    "淮北":[116.79466,33.971706],
    "铜陵":[117.816574,30.929935],
    "安庆":[117.04355,30.50883],
    "黄山":[118.31732,29.709238],
    "滁州":[118.31626,32.303627],
    "阜阳":[115.81973,32.89697],
    "宿州":[116.984085,33.633892],
    "巢湖":[117.87415,31.600517],
    "六安":[116.507675,31.75289],
    "亳州":[115.782936,33.86934],
    "池州":[117.48916,30.656036],
    "宣城":[118.757996,30.945667],
    "福州":[119.30624,26.075302],
    "厦门":[118.11022,24.490475],
    "莆田":[119.00756,25.431011],
    "三明":[117.635,26.265444],
    "泉州":[118.589424,24.908854],
    "漳州":[117.661804,24.510897],
    "南平":[118.17846,26.635628],
    "龙岩":[117.02978,25.091602],
    "宁德":[119.527084,26.65924],
    "南昌":[115.89215,28.676493],
    "景德镇":[117.21466,29.29256],
    "萍乡":[113.85219,27.622946],
    "九江":[115.99281,29.712034],
    "新余":[114.93083,27.810835],
    "鹰潭":[117.03384,28.238638],
    "赣州":[114.94028,25.85097],
    "吉安":[114.986374,27.111698],
    "宜春":[114.391136,27.8043],
    "抚州":[116.35835,27.98385],
    "上饶":[117.97118,28.44442],
    "济南":[117.00092,36.675808],
    "青岛":[120.35517,36.08298],
    "淄博":[118.047646,36.814938],
    "枣庄":[117.55796,34.856422],
    "东营":[118.66471,37.434563],
    "烟台":[121.39138,37.539295],
    "潍坊":[119.10708,36.70925],
    "济宁":[116.58724,35.415394],
    "泰安":[117.12907,36.19497],
    "威海":[122.116394,37.50969],
    "日照":[119.461205,35.42859],
    "莱芜":[117.677734,36.214397],
    "临沂":[118.32645,35.06528],
    "德州":[116.30743,37.453968],
    "聊城":[115.98037,36.456013],
    "滨州":[118.016975,37.38354],
    "菏泽":[115.46938,35.246532],
    "郑州":[113.66541,34.757977],
    "开封":[114.341446,34.79705],
    "洛阳":[112.43447,34.66304],
    "平顶山":[113.30772,33.73524],
    "安阳":[114.352486,36.103443],
    "鹤壁":[114.29544,35.748238],
    "新乡":[113.88399,35.302616],
    "焦作":[113.238266,35.23904],
    "濮阳":[115.0413,35.768234],
    "许昌":[113.826065,34.022957],
    "漯河":[114.026405,33.575855],
    "三门峡":[111.1941,34.777336],
    "南阳":[112.54092,32.99908],
    "商丘":[115.6505,34.437054],
    "信阳":[114.07503,32.123276],
    "周口":[114.64965,33.620358],
    "驻马店":[114.024734,32.980167],
    "武汉":[114.29857,30.584354],
    "黄石":[115.07705,30.220074],
    "十堰":[110.78792,32.646908],
    "荆州":[112.23813,30.326857],
    "宜昌":[111.29084,30.702637],
    "襄樊":[112.250092848,32.2291685915],
    "鄂州":[114.890594,30.396536],
    "荆门":[112.204254,31.03542],
    "孝感":[113.92666,30.926422],
    "黄冈":[114.879364,30.447712],
    "咸宁":[114.328964,29.832798],
    "随州":[113.37377,31.717497],
    "恩施":[109.48676,30.282406],
    "长沙":[112.98228,28.19409],
    "株洲":[113.15173,27.835806],
    "湘潭":[112.94405,27.82973],
    "衡阳":[112.6077,26.900358],
    "邵阳":[111.46923,27.237843],
    "岳阳":[113.13286,29.37029],
    "常德":[111.691345,29.040224],
    "张家界":[110.47992,29.127401],
    "益阳":[112.35504,28.570066],
    "郴州":[113.03207,25.793589],
    "永州":[111.60802,26.434517],
    "怀化":[109.97824,27.550081],
    "娄底":[112.0085,27.728136],
    "湘西":[109.73974,28.314297],
    "广州":[113.28064,23.125177],
    "深圳":[114.085945,22.547],
    "珠海":[113.553986,22.22498],
    "汕头":[116.708466,23.37102],
    "韶关":[113.591545,24.801323],
    "佛山":[113.12272,23.028763],
    "江门":[113.09494,22.590431],
    "湛江":[110.364975,21.274899],
    "茂名":[110.91923,21.659752],
    "肇庆":[112.47253,23.051546],
    "惠州":[114.4126,23.079405],
    "梅州":[116.117584,24.299112],
    "汕尾":[115.364235,22.774485],
    "河源":[114.6978,23.746265],
    "阳江":[111.975105,21.859222],
    "清远":[113.05122,23.685022],
    "东莞":[113.74626,23.046238],
    "中山":[113.38239,22.521112],
    "潮州":[116.6323,23.661701],
    "揭阳":[116.355736,23.543777],
    "云浮":[112.04444,22.929802],
    "海口":[110.33119,20.031971],
    "三亚":[109.50827,18.247871],
    "成都":[104.065735,30.659462],
    "自贡":[104.773445,29.352764],
    "攀枝花":[101.716,26.580446],
    "泸州":[105.44335,28.889137],
    "德阳":[104.39865,31.12799],
    "绵阳":[104.74172,31.46402],
    "广元":[105.82976,32.433666],
    "遂宁":[105.57133,30.513311],
    "内江":[105.06614,29.58708],
    "乐山":[103.76126,29.582024],
    "南充":[106.08298,30.79528],
    "眉山":[103.83179,30.048319],
    "宜宾":[104.63082,28.76019],
    "广安":[106.63337,30.456398],
    "达州":[107.50226,31.209484],
    "雅安":[103.00103,29.987722],
    "巴中":[106.75367,31.858809],
    "资阳":[104.641914,30.122211],
    "阿坝":[102.221375,31.899792],
    "甘孜":[101.96381,30.050663],
    "凉山":[102.25874,27.886763],
    "贵阳":[106.71348,26.578342],
    "六盘水":[104.84674,26.584642],
    "遵义":[106.93726,27.706627],
    "安顺":[105.93219,26.245544],
    "铜仁":[109.19155,27.718346],
    "毕节":[105.28501,27.301693],
    "黔西南":[104.89797,25.08812],
    "黔东南":[107.977486,26.583351],
    "黔南":[107.51716,26.258219],
    "昆明":[102.71225,25.04061],
    "曲靖":[103.79785,25.501556],
    "玉溪":[102.54391,24.35046],
    "保山":[99.16713,25.111801],
    "昭通":[103.71722,27.337],
    "丽江":[100.233025,26.872108],
    "普洱":[100.97234,22.77732],
    "临沧":[100.08697,23.886566],
    "德宏":[98.57836,24.436693],
    "怒江":[98.8543,25.850948],
    "迪庆":[99.70647,27.826853],
    "大理":[100.24137,25.593067],
    "楚雄":[101.54614,25.040913],
    "红河":[103.384186,23.366776],
    "文山":[104.24428,23.369217],
    "西双版纳":[100.79794,22.001724],
    "西安":[108.94802,34.26316],
    "铜川":[108.97961,34.91658],
    "宝鸡":[107.14487,34.369316],
    "咸阳":[108.70512,34.33344],
    "渭南":[109.502884,34.499382],
    "延安":[109.49081,36.59654],
    "汉中":[107.02862,33.077667],
    "榆林":[109.741196,38.29016],
    "安康":[109.029274,32.6903],
    "商洛":[109.93977,33.86832],
    "兰州":[103.823555,36.05804],
    "嘉峪关":[98.277306,39.78653],
    "金昌":[102.18789,38.514236],
    "白银":[104.17361,36.54568],
    "天水":[105.725,34.57853],
    "武威":[102.6347,37.929996],
    "酒泉":[98.510796,39.744022],
    "张掖":[100.455475,38.932896],
    "庆阳":[107.638374,35.73422],
    "平凉":[106.68469,35.54279],
    "定西":[104.6263,35.57958],
    "陇南":[104.92938,33.3886],
    "临夏":[103.21163,35.59941],
    "甘南":[102.91101,34.986355],
    "西宁":[101.778915,36.623177],
    "海东":[102.10327,36.502914],
    "海北":[100.90106,36.959435],
    "海南":[100.619545,36.280354],
    "黄南":[102.01999,35.517742],
    "果洛":[100.24214,34.4736],
    "玉树":[97.00876,33.00393],
    "海西":[97.37079,37.374664],
    "呼和浩特":[111.6708,40.81831],
    "包头":[109.84041,40.65817],
    "乌海":[106.82556,39.673733],
    "赤峰":[118.9568,42.27532],
    "通辽":[122.26312,43.617428],
    "鄂尔多斯":[109.99029,39.81718],
    "呼伦贝尔":[119.75817,49.215332],
    "巴彦淖尔":[107.41696,40.7574],
    "乌兰察布":[113.11454,41.034126],
    "锡林郭勒盟":[116.090996,43.94402],
    "兴安盟":[122.07032,46.076267],
    "阿拉善盟":[105.70642,38.844814],
    "南宁":[108.32001,22.82402],
    "柳州":[109.411705,24.314617],
    "桂林":[110.29912,25.274216],
    "梧州":[111.29761,23.474804],
    "北海":[109.119255,21.473343],
    "防城港":[108.345474,21.614632],
    "钦州":[108.624176,21.967127],
    "贵港":[109.60214,23.0936],
    "玉林":[110.154396,22.63136],
    "百色":[106.61629,23.897741],
    "贺州":[111.552055,24.41414],
    "河池":[108.0621,24.695898],
    "来宾":[109.229774,23.733767],
    "崇左":[107.35393,22.404108],
    "拉萨":[91.13221,29.66036],
    "那曲":[92.06021,31.476004],
    "昌都":[97.17845,31.136875],
    "林芝":[91.11,29.97],
    "山南":[91.7506438744,29.2290269317],
    "日喀则":[88.88515,29.267519],
    "阿里":[80.1055,32.503185],
    "银川":[106.278175,38.46637],
    "石嘴山":[106.376175,39.01333],
    "吴忠":[106.19941,37.986164],
    "固原":[106.28524,36.004562],
    "中卫":[105.18957,37.51495],
    "乌鲁木齐":[87.61773,43.792816],
    "克拉玛依":[84.87395,45.595886],
    "吐鲁番":[89.184074,42.947613],
    "哈密":[93.5283550928,42.78],
    "和田":[79.92754,37.108944],
    "阿克苏":[80.2629,41.171272],
    "喀什":[75.98838,39.46786],
    "克孜勒苏":[76.17283,39.713432],
    "巴音郭楞":[86.15097,41.76855],
    "昌吉":[87.304115,44.013184],
    "博尔塔拉":[82.074776,44.90326],
    "伊犁":[81.31795,43.92186],
    "塔城":[82.983986,46.74628],
    "阿勒泰":[88.13874,47.84891],
    "台北":[121.565170,25.037798],
    "高雄":[120.311922,22.620856],
    "基隆":[121.746248,25.130741],
    "新竹":[120.968798,24.806738],
    "台中":[120.679040,24.138620],
    "嘉义":[120.452538,23.481568],
    "台南":[120.279363,23.172478]

});


/***设置 副标题  全宗总数  城市总数***/

eform.dataset("selectSectCityCount", {}, function (result) {
    eform("archMap").method("setSubTitle", [result.Data[0][0].sectCount, '全宗总数', result.Data[0][0].cityCount, '城市']);
}, false);

eform("archMap").method("setMagnification", 1);
eform("archMap").method("setMagnify", 0);