eform("eformTree1").method("dialogShowBefore", function (operate, node) {
	// operate.operateType 操作按钮类型(新增，编辑，删除，自定义等)
	// operate.formId    操作按钮绑定的表单
	// operate.operateName  操作按钮的显示名
	eform("step").method("setValue", operate.operateName);
	eform("level").method("setValue", node.attributes.levels);
	eform("Parentid").method("setValue", node.attributes.Id);
});