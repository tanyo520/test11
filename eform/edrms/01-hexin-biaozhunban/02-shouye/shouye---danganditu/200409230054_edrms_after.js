/***根据档案类型获取整编库和档案库的数据表  并统计数据   传统立卷、一文一件、卷内文件****/
eform("archMap").method("onMouseover", function (data) {
    if (data.componentType == "series") { //设置圆点提示
        var message = [

            {
                name: data.data.allData.name,
                value: [
                    {
                        name: "总和",
                        value: data.data.allData.value
                    }

                ]

            }


        ];
        eform("archMap").method("setToolTipData", message);
    }

});
var preAreaName="";

eform("archMap").method("onClick", function (data, tip) {
	
    if (tip) {
		
        if(tip[0].style.display=="inline" && preAreaName==data.name)
        {
            tip[0].style.display="none";
            return;
        }
        else{
            tip[0].style.display="inline";
        }
        //获取区域名称
        var areaName = data.name;
        preAreaName=data.name;
        var tipHTML = '';
        // 画个蓝色圆点
        tipHTML += '<div class="divTitle" ><div style="background-color:#67BDFF;border-radius:15px;width:16px;height:16px;display:inline-block;float: left;"></div>';
        //画个标题
        tipHTML += '<div  style="display:inline-block;padding-left: 11px;color: #ffffff "><span style="font-size:14px;">' + areaName + '全宗</span></div></div>';

        tipHTML += '<div class="collectTitle"><div color="white" style="width: 37px;font-size:12px;float:left;">整编数</div>';
        //根据全宗获取整编统计数据
        eform.dataset("selectDossierCount", {archStatus: 0, city: areaName}, function (result) {
            tipHTML += '<div style="font-size:12px;color: white;padding-left: 53px;">传统立卷：' +result.Data[0][0].dossierCount+'</div> </div>';
        }, false, false);

        //根据全宗获取整编统计数据

        eform.dataset("selectArchCountOfDossier", {archStatus: 0, city: areaName}, function (result) {
            tipHTML += '<div class="collect"><span color="white" style="font-size:12px;">卷内文件：' + result.Data[0][0].archOfCount + '</span></div>';
        }, false, false);
        //根据全宗获取整编统计数据

        eform.dataset("selectArchCount", {archStatus: 0, city: areaName}, function (result) {
            tipHTML += '<div  class="collect"><span color="white" style="font-size:12px;">一文一件：' + result.Data[0][0].archCount + '</span></div> ';
        }, false, false);

        tipHTML += '<div class="collectTitle"><div style="width: 37px;font-size:12px;float:left;">档案数</div>';

        eform.dataset("selectDossierCount", {archStatus: 1, city: areaName}, function (result) {
            tipHTML += '<div style="font-size:12px;color: white;padding-left: 53px;">传统立卷：' + result.Data[0][0].dossierCount + '</div></div>';
        }, false, false);

        eform.dataset("selectArchCountOfDossier", {archStatus: 1, city: areaName}, function (result) {
            tipHTML += '<div class="collect"><span color="white" style="font-size:12px;">卷内文件：' + result.Data[0][0].archOfCount + '</span></div>';
        }, false, false);
        eform.dataset("selectArchCount", {archStatus: 1, city: areaName}, function (result) {
            tipHTML += '<div  class="collect"><span color="white" style="font-size:12px;">一文一件：' + result.Data[0][0].archCount + '</span></div></br>';
        }, false, false);


        //根据区域获取 区域下全宗的统计数据
        // eform.dataset("selectSectByCity", {city:areaName}, function (result) {
        //     var sectList=result.Data[0];
        //
        //     for(var i=0;i<sectList.length;i++){
        //         // 画个蓝色圆点
        //         tipHTML+='<div class="divTitle" ><div style="background-color:#67BDFF;border-radius:15px;width:20px;height:20px;display:inline-block;padding-left:10px"></div>';
        //         //画个标题
        //         tipHTML+='<div  style="display:inline-block;padding-left: 28px;color: #ffffff "><span style="font-size:16px;">'+sectList[i].name+'</span></div></div>';
        //
        //         tipHTML+='<div class="collectTitle"><span color="white" style="font-size:14px;">整编数</span></div>';
        //         //根据全宗获取整编统计数据
        //         eform.dataset("selectDossierCount", {archStatus:0,sectId:sectList[i].Id}, function (result) {
        //             tipHTML+='<div class="collect"><span color="white" style="font-size:14px;">传统立卷：'+result.Data[0][0].dossierCount+'</span></div>';
        //         }, false,false);
        //         //根据全宗获取整编统计数据
        //         eform.dataset("selectArchCountOfDossier", {archStatus:0,sectId:sectList[i].Id}, function (result) {
        //             tipHTML+='<div class="collect"><span color="white" style="font-size:14px;">卷内文件：'+result.Data[0][0].archOfCount+'</span></div>';
        //         }, false,false);
        //         //根据全宗获取整编统计数据
        //         eform.dataset("selectArchCount", {archStatus:0,sectId:sectList[i].Id}, function (result) {
        //             tipHTML+='<div  class="collect"><span color="white" style="font-size:14px;">一文一件：'+result.Data[0][0].archCount+'</span></div>';
        //         }, false,false);
        //
        //         tipHTML+='<div class="collectTitle"><span style="font-size:14px;">档案数</span></div>';
        //
        //         eform.dataset("selectDossierCount", {archStatus:1,sectId:sectList[i].Id}, function (result) {
        //             tipHTML+='<div  class="collect"><span color="white" style="font-size:14px;">传统立卷：'+result.Data[0][0].dossierCount+'</span></div>';
        //         }, false,false);
        //         eform.dataset("selectArchCountOfDossier", {archStatus:1,sectId:sectList[i].Id}, function (result) {
        //             tipHTML+='<div class="collect"><span color="white" style="font-size:14px;">卷内文件：'+result.Data[0][0].archOfCount+'</span></div>';
        //         }, false,false);
        //         eform.dataset("selectArchCount", {archStatus:1,sectId:sectList[i].Id}, function (result) {
        //             tipHTML+='<div  class="collect"><span color="white" style="font-size:14px;">一文一件：'+result.Data[0][0].archCount+'</span></div></br>';
        //         }, false,false);
        //
        //
        //
        //
        //     }
        //
        // }, false,false);

        tip[0].style.display="inline";
        tip[0].innerHTML = tipHTML;
    }

});

eform("archMap").method("setTipDescribe", {
    opacity: 0.5,
    borderRadius: 2,
    backgroundColor: "#000000",
    width:160,
    height:188
});

/***根据档案类型获取整编库和档案库的数据表  并统计数据   传统立卷、一文一件、卷内文件****/