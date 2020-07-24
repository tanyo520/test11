var ParentId= eform.parentForm("Parentid").method("getValue"); //获取父页面的值
eform("ParentId").method("setValue",ParentId); //获取父页面的值
var level= eform.parentForm("level").method("getValue"); //获取父页面的值
console.log(level);

if(level=="1"){
	eform("ArchivesCenterName").method("hide");
	eform("ArchivesCenterNum").method("hide");
	eform("FilecabinetNum").method("hide");
	eform("Archives").method("hide");
	eform("Row").method("hide");
	eform("column").method("hide");
	eform("Specifications").method("hide");
	eform("FileBoxNum").method("hide");
	eform("FilingCabinet").method("hide");
	eform("Action").method("hide");
	eform("List").method("hide");
	eform("eformTextArea2").method("hide");
}else if(level=="2"){
	eform("ArchiveName").method("hide");
	eform("ArchiveNum").method("hide");
	eform("Storagelocation").method("hide");
	eform("StorageUser").method("hide");
	eform("FilecabinetNum").method("hide");
	eform("Archives").method("hide");
	eform("Row").method("hide");
	eform("column").method("hide");
	eform("Specifications").method("hide");
	eform("FileBoxNum").method("hide");
	eform("FilingCabinet").method("hide");
	eform("Action").method("hide");
	eform("List").method("hide");
	eform("eformTextArea2").method("hide");
}
else if(level=="3"){
	eform("ArchiveName").method("hide");
	eform("ArchiveNum").method("hide");
	eform("Storagelocation").method("hide");
	eform("StorageUser").method("hide");
	eform("ArchivesCenterName").method("hide");
	eform("ArchivesCenterNum").method("hide");
	eform("FileBoxNum").method("hide");
	eform("FilingCabinet").method("hide");
	eform("Action").method("hide");
	eform("List").method("hide");
	eform("eformTextArea2").method("hide");

}
else if(level=="4"){
	eform("ArchivesCenterName").method("hide");
	eform("ArchivesCenterNum").method("hide");
	eform("ArchiveName").method("hide");
	eform("ArchiveNum").method("hide");
	eform("Storagelocation").method("hide");
	eform("StorageUser").method("hide");
	eform("FilecabinetNum").method("hide");
	eform("Archives").method("hide");
	eform("Row").method("hide");
	eform("column").method("hide");
	eform("Specifications").method("hide");	
	eform("eformTextArea2").method("hide");
}