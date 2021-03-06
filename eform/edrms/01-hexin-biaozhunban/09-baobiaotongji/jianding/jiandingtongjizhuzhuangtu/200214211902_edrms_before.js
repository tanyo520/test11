eform('eformBar1').method('pushLegend',function(option,charts,type) {
    option.legend.left='true';
    var axisLabel = option.xAxis.axisLabel;
    option.grid.containLabel='true';
    //option.grid.bo='true';
    axisLabel.interval = '0';
    axisLabel.rotate = '40';
    charts.setOption(option);
    return true;
});

eform('eformBar1').method('updateDataSource',function() {

   
    var sectName = eform("sectName").method("getValue");
    var archTypeName = eform("archTypeName").method("getValue");

    var config=this.config;
    var dataType = config.dataType;//数据源类型：procedure:存储过程，view:视图

    var rowsPing = [];

    var filterStrPing = '';
    if(dataType=='view'){
        if (sectName!=''&&archTypeName==''){
            filterStrPing += "   sectName= '"+sectName+"' ";
            var sectParam = {field:'sectName',fieldType:'varchar',operation:'equal',relation:'and',value:sectName};
            rowsPing.push(sectParam);
        }else if(sectName==''&&archTypeName!=''){
            filterStrPing += "   archTypeName= '"+archTypeName+"' ";
            var archTypeParam = {field:'archTypeName',fieldType:'varchar',operation:'equal',relation:'and',value:archTypeName};
            rowsPing.push(archTypeParam);
        }else if(sectName!=null &&sectName!='' && archTypeName!=null&& archTypeName!=''){
            filterStrPing += "  sectName= '"+sectName+"'  and  archTypeName= '"+archTypeName+"' ";
            var sectParam = {field:'sectName',fieldType:'varchar',operation:'equal',relation:'and',value:sectName};
            var archTypeParam = {field:'archTypeName',fieldType:'varchar',operation:'equal',relation:'and',value:archTypeName};
            rowsPing.push(sectParam);
            rowsPing.push(archTypeParam);
        }
        if(filterStrPing){
            var FilterInfo = {};
            FilterInfo.filterStr = filterStrPing;
            FilterInfo.rows = rowsPing;
            config.FilterInfo=FilterInfo;
        }
    }


});