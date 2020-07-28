$('#topButton').addClass("topButtonAdd");
$('.custom-column1 li:first-child').append('<div class="clear"></div>');

$('#eformListButton1').append('<a id="toggle" ><img src="/resourcefiles/5246215c-e70e-4415-9c50-723bb7f57d78.png?system_var_rootId=$system_var_rootId$" width="9"/>收起</a>');
$('#df01abe4-80d8-2357-5a29-7c7c53a184ea').addClass('searchButton');

$('#ec1221e4-fd83-67be-2d59-f50594d8b03e').addClass('switchButton');
$('#ec1221e4-fd83-67be-2d59-f50594d8b03e').append('<img src="/resourcefiles/64f20eec-86fb-423d-b0af-d62eb462e7b2.png?system_var_rootId=$system_var_rootId$" width="20"/>');
$('#eformDataTable1')[0].style.display = "none";

//默认隐藏搜索块
$('#inventoryId')[0].style.display = "none";
$('#sectName')[0].style.display = "none";
$('#archName')[0].style.display = "none";
$('#archCode')[0].style.display = "none";
$('#carrier')[0].style.display = "none";
$('#entityNum')[0].style.display = "none";
$('#duration')[0].style.display = "none";
$('#writtenDate')[0].style.display = "none";
$('#eformListButton1')[0].style.display = "none";
$('.searchButton')[0].style.display = "block";


/***点击收起隐藏搜索面板***/
$(document).on("click", "#toggle", function () {
    $('#inventoryId')[0].style.display = "none";
        $('#sectName')[0].style.display = "none";
        $('#archName')[0].style.display = "none";
        $('#archCode')[0].style.display = "none";
        $('#carrier')[0].style.display = "none";
        $('#entityNum')[0].style.display = "none";
        $('#duration')[0].style.display = "none";
        $('#writtenDate')[0].style.display = "none";
        $('#eformListButton1')[0].style.display = "none";
        $('.searchButton')[0].style.display = "block";
});

/***点击搜索按钮显示搜索面板***/
$(document).on("click", ".searchButton", function () {
    $('#inventoryId')[0].style.display = "block";
        $('#sectName')[0].style.display = "block";
        $('#archName')[0].style.display = "block";
        $('#archCode')[0].style.display = "block";
        $('#carrier')[0].style.display = "block";
        $('#entityNum')[0].style.display = "block";
        $('#duration')[0].style.display = "block";
        $('#writtenDate')[0].style.display = "block";
        $('#eformListButton1')[0].style.display = "block";
});

/***列表与卡片切换***/
$(document).on("click", '.switchButton', function () {
    var cardList = document.getElementById("cardBlock");
    var tableList = document.getElementById("eformDataTable1");
    show_hidden(cardList);
    show_hidden(tableList);
    function show_hidden(obj) {
        if (obj.style.display == 'block') {
            obj.style.display = 'none';
        } else {
            obj.style.display = 'block';
        }
    }
});