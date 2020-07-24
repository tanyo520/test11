window.myExtCode.parserBefore();
if(eform.pageType != "mobile"){
			eform("edoc2ListGrid_MyComplete").method("onDataReceived", function(receiveData) {
				if(receiveData && receiveData.rows &&  receiveData.rows.length){
					$.each(receiveData.rows,function(index,item){
						item.Num=1;
					});
				}
				return receiveData;
			});
			}