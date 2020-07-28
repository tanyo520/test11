eform("eformDataTable1").method("customColumnsFormatter",function (value, row, index, field, fieldName) {
	if(field === "Duration"){
		if(value=="0")
		{
			return "永久";
		}
		else if(value=="10")
		{
			return "10年";
		}
		else if(value=="20")
		{
			return "20年";
		}
		else if(value=="30")
		{
			return "30年";
		}
	
	}

	return value; // if之外的需返回原值
});