require(["jquery","inbizsdk"],function($,inbizsdk){

	debugger;

	//url获取传的值
	var archFormId = getLocationValue("archFormId"); //文件列表表单id
	var dossierFormId = getLocationValue("dossierFormId"); //案卷列表表单id
	var sectId = getLocationValue("sectId"); //全宗id
	var archTypeId = getLocationValue("archTypeId"); //档案类型id
	var entrystate = getLocationValue("entrystate");//档案或者案卷状态
	var year = getLocationValue("year");//虚拟分类年度
	var duration = getLocationValue("duration");//虚拟分类保管期限
	
	var tabTest =inbiz("TabView1595853809974");
	tabTest.afterEvent=function(){

		var archSrc ="/eform/index?formid="+archFormId+"&skin=techblue&sectId="+sectId+"&archTypeId="+archTypeId+"&isSect=2&entrystate="+entrystate+"&ifDossiered=1";
			

		var dossierSrc ="/eform/index?formid="+dossierFormId+"&skin=techblue&sectId="+sectId+"&archTypeId="+archTypeId+"&isSect=2&entrystate="+entrystate;
		//$(top.document).find("iframe").eq(0).attr('src',src);

		if(year){
						
			archSrc+="&year="+year;
							
			dossierSrc+="&year="+year;
			
		}
		if(duration){
						
			archSrc+="&duration="+duration;
			
			dossierSrc+="&duration="+duration;
		}
		
		$("#TabView128e194d7e8d4c9890f4c887b727f335档案0").attr('src',archSrc);

		$("#TabView128e194d7e8d4c9890f4c887b727f335案卷0").attr('src',dossierSrc);
	}	



})


//url获取传的值
function getLocationValue(name) {

	var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
	var r = window.location.search.substr(1).match(reg);
	if (r != null) return decodeURI(r[2]);
	return null;
}