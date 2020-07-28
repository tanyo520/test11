var height = $(window).height() - 450;

$('#eformPlaceholder2').parent().append('<div style="height:' + height + 'px"></div>');

var sectId = $.getQueryString("Id");
eform("ID").method("setValue", sectId);

var cityEdit = "";
/*********penglin  编辑 给所在城市赋值 selectSectById start *****************/
eform.dataset("selectSectById", {Id: sectId}, function (result) {
    cityEdit = result.Data[0][0].city;
}, false, false);

/*********penglin  编辑 给所在城市赋值 end *****************/

/********penglin  绑定地区*start ********/
var pro = ["北京市", "天津市", "上海市", "重庆市", "河北", "山西", "辽宁", "吉林", "黑龙江", "江苏", "浙江", "安徽", "福建", "江西", "山东", "河南", "湖北", "湖南", "广东", "海南", "四川", "贵州", "云南", "陕西", "甘肃", "青海", "内蒙古", "广西", "西藏", "宁夏", "新疆维吾尔自治区", "香港", "澳门", "台湾"];

var city = {
    "北京市": [],
    "天津市": [],
    "上海市": [],
    "重庆市": [],
    "河北": ["石家庄", "唐山", "秦皇岛", "邯郸", "邢台", "保定", "张家口", "承德", "沧州", "廊坊", "衡水"],
    "山西": ["太原", "大同", "阳泉", "长治", "晋城", "朔州", "晋中", "运城", "忻州", "临汾", "吕梁"],
    "辽宁": ["沈阳", "大连", "鞍山", "抚顺", "本溪", "丹东", "锦州", "营口", "阜新", "辽阳", "盘锦", "铁岭", "朝阳", "葫芦岛"],
    "吉林": ["长春", "吉林", "四平", "辽源", "通化", "白山", "松原", "白城", "延边朝鲜族自治州"],
    "黑龙江": ["哈尔滨", "齐齐哈尔", "鹤岗", "双鸭山", "鸡西", "大庆", "伊春", "牡丹江", "佳木斯", "七台河", "黑河", "绥化", "大兴安岭"],
    "江苏": ["南京", "苏州", "无锡", "常州", "镇江", "南通", "泰州", "扬州", "盐城", "连云港", "徐州", "淮安", "宿迁"],
    "浙江": ["杭州", "宁波", "温州", "嘉兴", "湖州", "绍兴", "金华", "衢州", "舟山", "台州", "丽水"],
    "安徽": ["合肥", "芜湖", "蚌埠", "淮南", "马鞍山", "淮北", "铜陵", "安庆", "黄山", "滁州", "阜阳", "宿州", "巢湖", "六安", "亳州", "池州", "宣城"],
    "福建": ["福州", "厦门", "莆田", "三明", "泉州", "漳州", "南平", "龙岩", "宁德"],
    "江西": ["南昌", "景德镇", "萍乡", "九江", "新余", "鹰潭", "赣州", "吉安", "宜春", "抚州", "上饶"],
    "山东": ["济南", "青岛", "淄博", "枣庄", "东营", "烟台", "潍坊", "济宁", "泰安", "威海", "日照", "莱芜", "临沂", "德州", "聊城", "滨州", "菏泽"],
    "河南": ["郑州", "开封", "洛阳", "平顶山", "安阳", "鹤壁", "新乡", "焦作", "濮阳", "许昌", "漯河", "三门峡", "南阳", "商丘", "信阳", "周口", "驻马店"],
    "湖北": ["武汉", "黄石", "十堰", "荆州", "宜昌", "襄樊", "鄂州", "荆门", "孝感", "黄冈", "咸宁", "随州", "恩施"],
    "湖南": ["长沙", "株洲", "湘潭", "衡阳", "邵阳", "岳阳", "常德", "张家界", "益阳", "郴州", "永州", "怀化", "娄底", "湘西"],
    "广东": ["广州", "深圳", "珠海", "汕头", "韶关", "佛山", "江门", "湛江", "茂名", "肇庆", "惠州", "梅州", "汕尾", "河源", "阳江", "清远", "东莞", "中山", "潮州", "揭阳", "云浮"],
    "海南": ["海口", "三亚"],
    "四川": ["成都", "自贡", "攀枝花", "泸州", "德阳", "绵阳", "广元", "遂宁", "内江", "乐山", "南充", "眉山", "宜宾", "广安", "达州", "雅安", "巴中", "资阳", "阿坝", "甘孜", "凉山"],
    "贵州": ["贵阳", "六盘水", "遵义", "安顺", "铜仁", "毕节", "黔西南", "黔东南", "黔南"],
    "云南": ["昆明", "曲靖", "玉溪", "保山", "昭通", "丽江", "普洱", "临沧", "德宏", "怒江", "迪庆", "大理", "楚雄", "红河", "文山", "西双版纳"],
    "陕西": ["西安", "铜川", "宝鸡", "咸阳", "渭南", "延安", "汉中", "榆林", "安康", "商洛"],
    "甘肃": ["兰州", "嘉峪关", "金昌", "白银", "天水", "武威", "酒泉", "张掖", "庆阳", "平凉", "定西", "陇南", "临夏", "甘南"],
    "青海": ["西宁", "海东", "海北", "海南", "黄南", "果洛", "玉树", "海西"],
    "内蒙古": ["呼和浩特", "包头", "乌海", "赤峰", "通辽", "鄂尔多斯", "呼伦贝尔", "巴彦淖尔", "乌兰察布", "锡林郭勒盟", "兴安盟", "阿拉善盟"],
    "广西": ["南宁", "柳州", "桂林", "梧州", "北海", "防城港", "钦州", "贵港", "玉林", "百色", "贺州", "河池", "来宾", "崇左"],
    "西藏": ["拉萨", "那曲", "昌都", "林芝", "山南", "日喀则", "阿里"],
    "宁夏": ["银川", "石嘴山", "吴忠", "固原", "中卫"],
    "新疆维吾尔自治区": ["乌鲁木齐", "克拉玛依", "吐鲁番", "哈密", "和田", "阿克苏", "喀什", "克孜勒苏", "巴音郭楞", "昌吉", "博尔塔拉", "伊犁", "塔城", "阿勒泰"],
    "香港": [],
    "澳门": [],
    "台湾": ["台北", "高雄", "基隆", "新竹", "台中", "嘉义", "台南"]
};

var areaData = [];
for (var i = 0; i < pro.length; i++) {
    var proName = pro[i];
    var proInfo = {};
    proInfo.id = proName;
    proInfo.text = proName;
    proInfo.isProv = 1;
    proInfo.iconCls = "proCss";
    proInfo.state = "closed";
    proInfo.children = [];
    var cityData = city[proName];

    if (cityData.length == 0) {
        proInfo.isProv = 0;
    }
    areaData.push(proInfo);
    for (var j = 0; j < cityData.length; j++) {
        proInfo.children.push({id: cityData[j], text: cityData[j], isProv: 0, iconCls: "cityCss"});
    }
}
eform("city").method("getEasyControl").combotree("loadData", areaData);
var options=eform("city").method("getEasyControl").combotree("options");
options.data=areaData;
options.onSelect=function(){

}
options.onBeforeSelect=function (node) {
    if(node.isProv!=0)
    {
        return false;
    }
}
options.onClick= function(node){
    if(node.hasChildren){
        $('.panel-htop')[0].style.display="block";
        eform("city").method("getEasyControl").combotree('tree').tree('expand', node.target);
    }else
    {
        $('.panel-htop')[0].style.display="none";
    }
}
options.onDblClick=function(node){
    eform("city").method("getEasyControl").combotree('tree').tree('collapse',node.target);
}
eform("city").method("getEasyControl").combotree(options);

eform("city").method("getEasyControl").combotree("setValue", cityEdit);

/********penglin  绑定地区*end ********/

/*按钮点击时触发，自定义“动作”的按钮有效
* buttonText 按钮Id值文本
* buttonId 按钮Id值(v1.5.0+)
*/
eform("eformButton1").method("onClick", function (buttonName, buttonId) {

    if (buttonName == "保存") {


        var reg = /^[0-9]*$/;
        var msg = '';
        if (eform("name").method("getValue").trim() == '') {
            msg += '全宗名称不能为空！<br>';
        }
        if (eform("code").method("getValue").trim() == '') {
            msg += '全宗编号不能为空！<br>';
        }
        if (eform("city").method("getEasyControl").combotree("tree").tree("getSelected") == null
            || eform("city").method("getEasyControl").combotree("tree").tree("getSelected").text.trim() == '') {
            msg += '所在城市不能为空！<br>';
        }
        if (eform("sort").method("getValue").trim() == '') {
            msg += '排序不能为空！<br>';
        }

        if (!reg.test(eform("sort").method("getValue"))) {
            msg += '排列序号请输入正确的数字！<br>';
        }
        /*****penglin 20200514 判断全宗名称是否重复 selectSectExist start ********/
        eform.dataset("selectSectExist", {
            sectName: eform("name").method("getValue").trim(),
            Id: sectId
        }, function (result) {
            if (result.Data[0][0].existCount > 0) {
                msg += '全宗名称不能重复！<br>';
            }
        }, false, false);
        /*****penglin 20200514 判断全宗名称是否重复 selectSectExist end ********/

        if (msg) {
            window.top.$.messager.alert("提示", msg);
            return false;
        }

        edoc2Form.formParser.save(function (rid) {

            edoc2Form.formParser.changeFormToEdit(eform.recordId);
            edoc2Form.isNewRecord = false;
            window.top.$.messager.alert("提示", "保存成功！");

            //刷新左侧树
            var treeSrc = $(top.document).find("iframe").eq(0).attr("src");
            $(top.document).find("iframe").eq(0).attr("src", treeSrc);

            //更改右侧区域
            var formId = "200305232631_edrms&page=sect";//默认页面表单id
            var src = "/eform/index?formid=" + formId + "&skin=techblue";
            $(top.document).find("iframe").eq(1).attr("src", src);

        }, null, eform.recordId, "", true, false);

    }

    else if (buttonName == "删除") {//删除

        window.top.$.messager.confirm("提示", "确认此操作吗", function (bool) {
            if (bool === true) {
                var sectId = eform("ID").method("getValue");
                //console.log(sectId)

                var count = 0
                eform.dataset("SelectChildSect", {Id: sectId}, function (result) {
                    count = result.Data[0].length;
                }, false);

                if (count > 0) {
                    window.top.$.messager.alert("提示", "不能删除！该全宗下已有子全宗！");
                    return false
                }

                if (count == "0") {
                    var archTypeCount = 0
                    eform.dataset("SelectArchTypeBySectId", {sectId: sectId}, function (result) {
                        archTypeCount = result.Data[0].length;
                    }, false);
                    if (archTypeCount > 0) {
                        window.top.$.messager.alert("提示", "不能删除！该全宗下已有档案类型！");
                        return false
                    }

                    var param = {Id: sectId};
                    eform.dataset("deleteSect", param, function (result) {
                        if (result.EffectOfRow == "1") {
                            window.top.$.messager.alert("提示", "删除信息成功！");

                            //刷新左侧树
                            var treeSrc = $(top.document).find("iframe").eq(0).attr("src");
                            $(top.document).find("iframe").eq(0).attr("src", treeSrc);

                            //更改右侧区域
                            var formId = "200305232631_edrms&page=sect";//默认页面表单id
                            var src = "/eform/index?formid=" + formId + "&skin=techblue";
                            $(top.document).find("iframe").eq(1).attr("src", src);

                        } else {
                            window.top.$.messager.alert("提示", "删除全宗失败！");
                        }
                    }, false);
                }


            }
        });
    }
});


/*
* 表单提交后事件
* success：是否提交成功
* formId：当前表单编号
*/
eform.engEvent("saveAfter", function (success, formId) {
    if (success == true) { // 判断是否提交成功


        window.$("body").trigger("refresh.sectTree");
    }
});