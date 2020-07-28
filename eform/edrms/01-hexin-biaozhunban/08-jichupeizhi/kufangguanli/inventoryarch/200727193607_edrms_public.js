var _style = "<style type='text/css'>"
    + "blockquote, body, button, dd, div, dl, dt, form, h1, h2, h3, h4, h5, h6, html, input, li, ol, p, pre, span, td, textarea, th, ul{list-style:none;}"
    + ".formBlock{ margin-top:0; }"
    + ".custom-column0{float:left;overflow-y: auto;}"
    + ".custom-column1{float:right;overflow-y: auto; width: 83%;border-left: 1px solid #eee;}"
    + ".storageBlock,.roomBlock,.cabinetBlock,.boxBlock,.flieBlock{ margin:15px 0 30px 20px; display: flex;}"
    + ".cardName{width: 80px; height: 30px;line-height:30px; text-align: center!important; background-color: #eeeeee;border-radius: 2px;border: solid 1px #cccccc; margin-left: 20px;}"
    + ".storageDiv{ height: 335px; margin: 0 10px; background-color: #fff}"
    + ".roomDiv{ height: 335px; margin: 0 10px; background-color: #ff4148}"
    + ".cabinetDiv{ height: 335px; margin: 0 10px; background-color: #aeff42}"
    + ".boxDiv{ height: 335px; margin: 0 10px; background-color: #42ff4c}"
    + ".storageCol{width: 250px; height: 250px; float:left; border: 1px solid #eee; margin-right:10px; position: relative;}"
    + ".storageImg >img{width: 250px;margin-top: 20px;}"
    + ".storageTitle{ text-align: left; position: absolute; width: 250px; height: 30px; line-height: 30px; bottom: 0; background-color:rgba(0,0,0,0.6); color: #fff; }"
    + ".storageTitle p,.storageTitle label{ padding: 0 10px; width: 200px; overflow: hidden; white-space: nowrap; text-overflow: ellipsis; }"
    + ".storageTitle img{position: absolute; right: 5px; top: 7px;}"
    + ".storageDetails label,.roomDetails label,.cabinetDetails label,.boxDetails label,.fileDetails label {padding:30px 30px 20px 30px; font-family: MicrosoftYaHei;font-size: 16px;font-weight: normal;font-stretch: normal;line-height: 24px;letter-spacing: 0px;color: #333333; display: block; }"
    + ".storageDetails p,.roomDetails p,.cabinetDetails p,.boxDetails p,.fileDetails p{padding:5px 30px ; color: #666; font-size: 12px; }"
    + ".custom-column1 .form-label{ float: left; height: 34px; line-height: 34px; margin-right: 10px;}"
    + ".custom-column1 >#inventoryId,#sectName,#archName,#archCode,#carrier,#entityNum,#duration,#writtenDate,#inventoryId1,#sectName1,#archName1,#archCode1,#duration1,#remark,#writtenDate1{ float: left; margin: 10px 20px;}"
    + ".custom-column1 >#sectName .form-input-label,#carrier .form-input-label,#duration .form-input-label,#sectName1 .form-input-label,#duration1 .form-input-label{  }"
    + ".custom-column1 >#eformListButton1,#eformListButton2{ float: right !important; margin: 10px 20px; }"
    + ".custom-column1 >.topButtonAdd{ margin:0px 20px 10px 10px;}"
    + ".cardBlock{ float: left; margin:30px 0px 10px 0px }"
    + "#toggle{ float: right; cursor: pointer; padding: 5px 0;}"
    + "#toggle img{ margin-right: 5px;}"
    + ".searchButton{ height: 38px; line-height: 38px; width: 78px;}"
    + "#topButton a{float: left;}"
    + "#topButton .l-btn-primary{float: right;}"
    + ".switchButton .l-btn-left .l-btn-empty{ width: 0px; margin:0px;}"
    + ".switchButton{ padding: 0 10px;}"
    + "#eformDataTable1{ margin-top: 20px;}"
    + ".window .window-header{ background-color: #3974F4 !important}"
    + "blockquote, body, button, dd, div, dl, dt, form, h1, h2, h3, h4, h5, h6, html, input, li, ol, p, pre, span, textarea, ul{list-style: none;}"
    + "#eformDataTable1 tr td{ text-align: center!important;}"
    + ".archtypecss {background:url('/resourcefiles/989657f8-849f-4d59-80e5-13d442424b87.png?system_var_rootId=$system_var_rootId$') no-repeat center center}"
    + "#d45ef460-082a-c04a-ee5d-6206ca1c84f9{ float:left !important;}"
    + "ul{list-style-type: none;margin-bottom: -2px;}"
    + " .inventoryTab{width:100%; margin: 10px!important；}"
    + ".title li{display: inline-block;border: 1px solid #999;border-bottom: 2px solid #47a1fb;background: #fff;text-align: center;width: 60px;height: 30px;margin: 0 1px;line-height: 30px}"
    + ".title .active{border-top:2px solid #47a1fb;border-bottom: 2px solid #fff; }"
    + "#content{margin: 0;border-top: 2px solid #47a1fb;}"
    + "#content div{display: none;padding: 10px 0}"
    + "#content .mod{display: block;}"
    + "</style>";
$("head").append(_style);