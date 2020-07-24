define({
    //站点初始化执行，定义全局变量
    website_onPreLoad: function () {
        window.globalvalue_hiddenFolderId = "14";//隐藏文件夹ID
        window.globalvalue_everyoneId = "516fb90d601a4f2a8eb9c43e4ff2bfb3";//everyone用户组id
        window.globalvalue_integrationKey = "46aa92ec-66af-4818-b7c1-8495a9bd7f17";//集成登录密钥
    },
    //每次页面加载前都会执行，这里可以更改页面插件的参数等
    page_onPreLoad: function () {
        $('.topSearchDiv').css('display', 'none');//高级检索
        $('.archDivMask').css('display', 'none');
        var plugins = window.Plugins;
        if (plugins) {
            $.each(plugins, function (id, plugin) {
                if (plugin.pluginId == "IFrame") {
                    plugin.par_autoHeight = "false";
                }
            });
        }
    },
    page_onLoad: function () {

        $("#0193b6f2d2f14f45acfff2173c09ddac637243646211280997").height(60);
        var menu = inbiz("Menu5df0aaf59f384ee49ec0fb896d444fe5");
        menu.afterEvent = function () {
            $('.topSearchDiv').addClass("advanceSearch");
            var customMenus = [{
                hoverText: '', //鼠标悬浮提示
                classes: 'kehuduan', //样式class
                backgroundImg: '',
                title: '客户端下载', //文字
                onClick: function () { //点击事件

                    var newFormUrl = window.location.protocol + "//" + window.location.host + "/passport/ClientDownload";


                    var content = '<iframe src="' + newFormUrl + '" width="100%" height="99%" frameborder="0"  scrolling="no"></iframe>';
                    var boarddiv = '<div id="msgwindow"   title="客户端下载"></div>'//style="overflow:hidden;"可以去掉滚动条
                    $(document.body).append(boarddiv);
                    var win = $('#msgwindow').dialog({
                        content: content,
                        width: 900,
                        height: 700,
                        modal: true,
                        title: '客户端下载',
                        onClose: function () {
                            $(this).dialog('destroy');//后面可以关闭后的事件
                        }
                    });
                    win.dialog('open');

                }
            }, {
                hoverText: '搜索', //鼠标悬浮提示
                classes: 'topSearchIcon', //样式class
                backgroundImg: '',//'/resourcefiles/12ebfb56-f77e-461d-9f86-6cb99c63b12e.png?system_var_rootId=$system_var_rootId$', //背景图
                title: '', //文字
                onClick: function () { //点击事件
                    /****控制 搜索栏***/
                    var searchDisplay = $('.topSearchDiv')[0].style.display;
                    if (searchDisplay == "inline") {
                        $('.topSearchDiv').css('display', 'none');//高级检索
                        $('.archDivMask').css('display', 'none');

                    } else {
                        $('.topSearchDiv').css('display', 'inline'); //高级搜索组件
                        $('.archDivMask').css('display', 'inline');
                        $(".topSearchDiv .lable-dataGrid").datagrid("resize"); // 高级搜索里 无数据图标
                    }

                }
            },
                {
                    hoverText: '设置', //鼠标悬浮提示
                    classes: 'archSystemSetting', //样式class
                    backgroundImg: '', //背景图
                    title: '', //文字
                    onClick: function () { //点击事件
                        location.hash = "#edocxitongguanli";
                    }
                },
                {
                    hoverText: '消息', //鼠标悬浮提示
                    classes: 'testClass1', //样式class
                    backgroundImg: '', //背景图
                    title: '', //文字
                    onClick: function () { //点击事件
                        location.hash = '#xiaoxi';
                        // 	window.parent.location.href=window.parent.location.origin+pathName;
                    }
                }]
            this.$model.vm.customIcons(customMenus);

            /******penglin 动态获取 系统配置 的权限 start **********/
            $.ajax({
                url: "/WebCore",
                data: {
                    module: 'OrgnizationManager',
                    fun: 'OverGetTopFunctionsIncludeCustom',
                    token: $.cookie().token
                },
                type: 'Post',
                dataType: "json",
                success: function (data) {
                    if (data.result && data.result.length > 0) {
                        $('.archSystemSetting').show();
                    } else {
                        $('.archSystemSetting').hide();
                    }

                }


            });
            /******penglin 动态获取 系统配置 的权限 end **********/

            /*******penglin  小铃铛上增加数字提醒* start **********/
            var timer = setInterval(function () {
                var messageCount = getMessageCount();
                if ($('.testClass1').length > 0 && messageCount > 0) {
                    messageCount=messageCount>99?"99+":messageCount;
                    var divMessageCount = ' <div class="nav-counter-message"><span>' + messageCount + '</span></div>';
                    $('.testClass1').append(divMessageCount);
                    clearInterval(timer);
                }
            }, 100);
            setInterval(function () {
                var messageCount = getMessageCount();
                if ($('.testClass1').length > 0) {
                    if ($('.Menu .nav-counter-message').length > 0) {
                        if (messageCount== 0) {
                            $('.Menu .nav-counter-message').css('visibility', 'hidden');
                        } else {
                            messageCount=messageCount>99?"99+":messageCount;
                            $('.Menu .nav-counter-message').find('span')[0].innerText = messageCount;
                            $('.Menu .nav-counter-message').css('visibility', 'visible');
                        }

                    } else {
                        if(messageCount>0) {
                            messageCount = messageCount > 99 ? "99+" : messageCount;
                            var divMessageCount = ' <div class="nav-counter-message"><span>' + messageCount + '</span></div>';
                            $('.testClass1').append(divMessageCount);
                        }
                    }
                    clearInterval(timer);
                }

            }, 5000)
            /*******penglin  小铃铛上增加数字提醒* end **********/

        }


        /**start 档案管理 左侧菜单 图标 **/
        //1、先获取自定义图标库
        !function (h) {
            var a, l, i, t, v, e, o,
                n = '<svg><symbol id="icon-daishengxiaoliebiao" viewBox="0 0 1024 1024"><path d="M512 1024a448 448 0 1 1 448-448 448 448 0 0 1-448 448zM512 192a384 384 0 1 0 384 384 384 384 0 0 0-384-384zM64 328.96l-56.32-30.72A576 576 0 0 1 305.28 38.4l23.04 59.52A512 512 0 0 0 64 328.96z"></path><path d="M928.64 328.96a512 512 0 0 0-264.96-231.04l23.04-59.52a576 576 0 0 1 298.24 259.84zM704 640H448V352h64V576h192v64z"></path></symbol><symbol id="icon-huishouzhan" viewBox="0 0 1024 1024"><path d="M1024 192h-256V0H256v192H0v64h128v768h768V256h128V192zM320 64h384v128H320V64z m512 896H192V256h640v704z m-448-192h64V448H384v320z m192 0h64V448H576v320z"></path></symbol><symbol id="icon-danganku" viewBox="0 0 1024 1024"><path d="M64 64v896h256V64H64z m192 832H128V128h128v768zM256 256H128V192h128v64z m0 128H128V320h128v64z m0 128H128V448h128v64z m128-448v896h256V64H384z m192 832H448V128h128v768zM576 256H448V192h128v64z m0 128H448V320h128v64z m0 128H448V448h128v64z m128-448v896h256V64h-256z m192 832h-128V128h128v768z m0-640h-128V192h128v64z m0 128h-128V320h128v64z m0 128h-128V448h128v64z"></path></symbol><symbol id="icon-jiandingku" viewBox="0 0 1024 1024"><path d="M928 1024h-832a32 32 0 0 1-32-32V318.08a31.424 31.424 0 0 1 14.72-26.88L359.04 9.6A32.512 32.512 0 0 1 382.08 0h545.92a32 32 0 0 1 32 32v960a32 32 0 0 1-32 32zM140.16 320H384V75.52zM896 64H448v320H128v576h768V64zM433.92 732.16l302.72-302.72 45.44 45.44-348.16 347.52-192-192 45.44-44.8z"></path></symbol><symbol id="icon-guidangtongji" viewBox="0 0 1024 1024"><path d="M64 416v576h896v-576H64z m832 512H128v-448h768v448z m-128-256H256v64h512v-64z m128-448H128v64h768v-64z m-64-192H192v64h640v-64z"></path></symbol><symbol id="icon-jieyuetongji" viewBox="0 0 1024 1024"><path d="M889.6 896H200.32L128 256h832zM256 832h576l59.52-512H200.96zM384 1024a128 128 0 0 1-128-128h64a64 64 0 0 0 128 0h64a128 128 0 0 1-128 128zM704 1024a128 128 0 0 1-128-128h64a64 64 0 0 0 128 0h64a128 128 0 0 1-128 128z"></path><path d="M133.76 291.2l-24.32-225.92H0v-64h167.04l30.08 283.52-63.36 6.4zM544 717.44L329.6 502.4l44.8-44.8L544 626.56l169.6-168.96 44.8 44.8-214.4 215.04z"></path><path d="M128 128h832v64H128z"></path></symbol><symbol id="icon-xitongshezhi" viewBox="0 0 1027 1024"><path d="M676.75776 999.68a98.56 98.56 0 0 1-68.48-27.52L598.03776 960a131.84 131.84 0 0 0-170.24 0l-8.96 9.6a97.28 97.28 0 0 1-97.28 25.6 565.76 565.76 0 0 1-64-32 476.8 476.8 0 0 1-64-38.4A93.44 93.44 0 0 1 167.95776 832l4.48-14.08a116.48 116.48 0 0 0-13.44-85.76 121.6 121.6 0 0 0-72.32-55.68h-13.44A94.08 94.08 0 0 1 1.55776 599.68a405.76 405.76 0 0 1 0-71.04 421.76 421.76 0 0 1 0-71.04A96 96 0 0 1 73.87776 384h14.72a122.24 122.24 0 0 0 70.4-55.04 116.48 116.48 0 0 0 12.8-87.68l-3.84-12.8a92.8 92.8 0 0 1 28.8-95.36 616.32 616.32 0 0 1 60.8-38.4A534.4 534.4 0 0 1 321.55776 64a96.64 96.64 0 0 1 97.28 23.04l10.88 10.88a128 128 0 0 0 168.96 0l9.6-10.24A97.92 97.92 0 0 1 705.55776 64a459.52 459.52 0 0 1 64 32 495.36 495.36 0 0 1 64 38.4 94.72 94.72 0 0 1 28.16 95.36l-5.12 15.36a116.48 116.48 0 0 0 14.08 85.12 124.16 124.16 0 0 0 69.12 53.76h13.44A94.72 94.72 0 0 1 1025.55776 458.24a503.04 503.04 0 0 1 0 70.4 405.76 405.76 0 0 1 0 71.04 96 96 0 0 1-69.12 71.68h-15.36a122.24 122.24 0 0 0-70.4 55.04 117.76 117.76 0 0 0-12.8 87.04l3.84 12.8a93.44 93.44 0 0 1-28.16 98.56 548.48 548.48 0 0 1-64 38.4 534.4 534.4 0 0 1-64 32 85.12 85.12 0 0 1-28.8 4.48zM513.55776 865.28a192 192 0 0 1 128 50.56l11.52 12.16a35.84 35.84 0 0 0 30.08 7.04 494.08 494.08 0 0 0 54.4-27.52 333.44 333.44 0 0 0 51.2-32.64 28.8 28.8 0 0 0 8.32-26.24l-3.2-16.64a179.84 179.84 0 0 1 19.2-136.32 187.52 187.52 0 0 1 110.08-83.2l16.64-3.84a33.92 33.92 0 0 0 21.76-20.48 462.08 462.08 0 0 0 0-58.88 341.76 341.76 0 0 0 0-60.16 30.72 30.72 0 0 0-21.76-21.12h-16a192 192 0 0 1-110.72-83.84 182.4 182.4 0 0 1-20.48-136.32l5.76-16.64a29.44 29.44 0 0 0-8.32-26.24 496 496 0 0 0-51.2-32 455.68 455.68 0 0 0-55.04-27.52 35.2 35.2 0 0 0-29.44 2.56l-12.8 13.44a192 192 0 0 1-256 0L372.75776 128a34.56 34.56 0 0 0-29.44-7.04 455.68 455.68 0 0 0-55.04 27.52 414.72 414.72 0 0 0-51.2 32.64 28.8 28.8 0 0 0-7.68 26.24l4.48 14.72a183.04 183.04 0 0 1-19.84 137.6A192 192 0 0 1 104.59776 448h-17.28a33.92 33.92 0 0 0-21.76 21.76 462.08 462.08 0 0 0 0 58.88 468.48 468.48 0 0 0 0 59.52 32.64 32.64 0 0 0 20.48 20.48l15.36 3.2a192 192 0 0 1 111.36 85.12A179.84 179.84 0 0 1 233.87776 832l-4.48 15.36a29.44 29.44 0 0 0 7.68 26.88 478.08 478.08 0 0 0 51.84 32.64 494.08 494.08 0 0 0 54.4 27.52 37.12 37.12 0 0 0 29.44-7.04l12.8-10.24a192 192 0 0 1 128-51.84z m0-117.12a222.08 222.08 0 0 1-224-219.52 224 224 0 0 1 448 0A222.08 222.08 0 0 1 513.55776 748.16z m0-374.4a158.08 158.08 0 0 0-160 154.88 160 160 0 0 0 320 0A158.08 158.08 0 0 0 513.55776 373.76z"></path></symbol><symbol id="icon-jieyueliebiao" viewBox="0 0 1024 1024"><path d="M448 448H0V0h448zM64 384h320V64H64zM448 1024H0V576h448z m-384-64h320v-320H64zM512 192h448v64H512zM512 384h448v64H512zM512 768h448v64H512zM512 960h448v64H512z"></path></symbol><symbol id="icon-jiandingtongji" viewBox="0 0 1024 1024"><path d="M768 128V0H256v128H64v896h896V128h-192zM320 64h384v128H320V64z m576 896H128V192h128v64h512V192h128v768zM416 498.56l-214.4 215.04 44.8 44.8L416 589.44l192 192 214.4-215.04-44.8-44.8-169.6 168.96z"></path></symbol><symbol id="icon-xiaohuitongji" viewBox="0 0 1024 1024"><path d="M800 256V0h-576v256h-192v256h960V256h-192z m-512-192h448v192h-448V64z m640 384h-832V320h832v128z m-448 576h64v-384h-64v384z m-384-64h64v-320h-64v320z m192-128h64v-192h-64v192z m384 0h64v-192h-64v192z m192 128h64v-320h-64v320z"></path></symbol><symbol id="icon-zhengbianku" viewBox="0 0 1024 1024"><path d="M64 928v-320l128-512h640l128 512v320H64z m718.08-768H241.92l-112 448H384v64h256v-64h254.08z m-78.08 512v64H320v-64H128v192h768v-192h-192z m-448-192h512v64H256v-64z m32-128h448v64h-448v-64z m32-128h384v64H320v-64z"></path></symbol><symbol id="icon-xiaohuiku" viewBox="0 0 1024 1024"><path d="M32 608v-256h192v-320h365.44l210.56 210.56V352h192v256H32z m576-466.56V224h82.56z m128 146.56h-192v-192h-256v256h448v-64z m192 128h-832v128h832v-128z m-768 576h-64v-256h64v256z m256 0h-64v-256h64v256z m256 0h-64v-256h64v256z m256 0h-64v-256h64v256z"></path></symbol><symbol id="icon-gerenzhongxin" viewBox="0 0 1024 1024"><path d="M617.216 578.368H404.8c-177.024 0-308.8 114.112-308.8 278.72v16.832C96 960 237.568 960 416.576 960H607.36c171.072 0 320.64 0 320.64-86.08v-16.832c-2.048-164.608-133.76-278.72-310.784-278.72z m246.784 295.552C842.112 896 695.168 896 607.36 896H416.576c-93.696 0-235.264 0-258.112-24.192l1.536-14.72c0-126.464 100.608-214.72 244.8-214.72h212.416c143.744 0 245.248 88.64 246.784 215.488v16.064zM512 64a224 224 0 1 0 224 224A224 224 0 0 0 512 64z m0 384a160 160 0 1 1 160-160A160 160 0 0 1 512 448z"></path></symbol><symbol id="icon-jieyuezhongxin" viewBox="0 0 1024 1024"><path d="M1001.657749 771.692042l-4.732773-2.814081c-31.338631-24.879036-190.07839-157.396675-203.38132-171.65895l-1.982648-1.982648-1.918691-1.982648a72.846328 72.846328 0 0 0-42.786825-17.076356H432.062142a63.444739 63.444739 0 0 0-14.773926 0 69.776421 69.776421 0 0 0-62.997044 76.044147 87.940036 87.940036 0 0 0 73.16611 84.934086c10.424892 1.854735 25.582556 3.709471 43.682214 5.692119h-159.890975c-21.809129-15.029752-88.323774-60.822527-133.02929-93.18446l-0.959346-0.959346a147.611348 147.611348 0 0 0-112.115551-28.588506 88.707513 88.707513 0 0 0-54.298975 38.373834l-0.89539 0.959346a61.590003 61.590003 0 0 0 2.941994 65.36343l1.982648 1.982648 1.982648 1.982648c51.165112 43.810127 223.847364 187.903873 237.406119 200.1835a61.078352 61.078352 0 0 0 49.438289 10.360935h354.510269a66.066951 66.066951 0 0 1 30.379285 12.343583s57.0491 46.624208 70.352029 56.985143l0.895389 0.89539a68.817075 68.817075 0 0 0 40.868133 14.326231 76.236017 76.236017 0 0 0 44.769473-18.035702l160.530538-163.024837a51.612807 51.612807 0 0 0 15.221621-39.077354 43.682214 43.682214 0 0 0-19.570655-32.042152zM801.538205 959.404046a16.500749 16.500749 0 0 1-1.662866-0.511651l-1.662866-1.343084c-12.791278-10.169066-69.26477-56.025797-69.26477-56.025797a133.413029 133.413029 0 0 0-61.65396-26.094207 69.26477 69.26477 0 0 0-8.889938-0.639564H303.893537a63.508695 63.508695 0 0 0-12.791278 1.279128c-16.372836-14.262275-59.927137-50.781373-106.103651-89.538946-43.618258-36.583055-89.538946-75.276671-116.848324-98.364928a25.198818 25.198818 0 0 1 11.256325-5.947944h8.122461a84.550347 84.550347 0 0 1 49.24642 15.925141 54.874582 54.874582 0 0 0 4.029253 3.19782c42.275174 30.635111 103.801221 73.102153 129.511689 90.88203a83.143307 83.143307 0 0 0 40.804177 14.454144h159.890974a64.020346 64.020346 0 0 0 6.90729-127.91278 591.468692 591.468692 0 0 1-39.33318-5.052555 24.111559 24.111559 0 0 1-20.72187-23.216169c-0.575608-7.418941 2.366386-10.80863 5.116511-11.128412a84.294522 84.294522 0 0 0 9.017851 0.511651h314.729394c16.948443 18.739222 157.524588 135.779415 200.759107 170.95543zM750.884744 0.0582H272.938644a76.747668 76.747668 0 0 0-79.625705 73.102154v255.825559a72.718415 72.718415 0 0 0 44.065952 65.36343l238.941072 109.621252a86.021344 86.021344 0 0 0 71.247418 0l238.941072-109.621252a72.846328 72.846328 0 0 0 44.001997-65.36343v-255.825559A76.747668 76.747668 0 0 0 750.884744 0.0582z m15.797229 328.863756a10.424892 10.424892 0 0 1-6.843334 7.291029L520.833611 445.77028A21.233521 21.233521 0 0 1 511.751803 447.752928a21.681216 21.681216 0 0 1-9.081807-1.982648L263.664967 336.149028a10.296979 10.296979 0 0 1-6.779377-7.227072v-255.825559A15.157664 15.157664 0 0 1 272.938644 64.01459h477.9461a15.157664 15.157664 0 0 1 15.925141 9.145764v255.825559zM670.747388 191.92737H352.180611a31.978195 31.978195 0 0 1-31.978195-31.978195 31.978195 31.978195 0 0 1 31.978195-31.978195h318.566777a31.978195 31.978195 0 0 1 31.978195 31.978195 31.978195 31.978195 0 0 1-31.5305 31.978195z m-63.95639 127.912779H415.625349a31.978195 31.978195 0 0 1-31.978194-31.978195 31.978195 31.978195 0 0 1 31.978194-31.978195h191.165649a31.978195 31.978195 0 0 1 31.978195 31.978195 31.978195 31.978195 0 0 1-31.274674 31.978195z"></path></symbol></svg>',
                m = (a = document.getElementsByTagName("script"))[a.length - 1].getAttribute("data-injectcss");
            if (m && !h.__iconfont__svg__cssinject__) {
                h.__iconfont__svg__cssinject__ = !0;
                try {
                    document.write("<style>.svgfont {display: inline-block;width: 1em;height: 1em;fill: currentColor;vertical-align: -0.1em;font-size:16px;}</style>")
                } catch (h) {
                    console && console.log(h)
                }
            }

            function z() {
                e || (e = !0, t())
            }

            l = function () {
                var h, a, l, i, t, v = document.createElement("div");
                v.innerHTML = n, n = null, (h = v.getElementsByTagName("svg")[0]) && (h.setAttribute("aria-hidden", "true"), h.style.position = "absolute", h.style.width = 0, h.style.height = 0, h.style.overflow = "hidden", a = h, (l = document.body).firstChild ? (i = a, (t = l.firstChild).parentNode.insertBefore(i, t)) : l.appendChild(a))
            }, document.addEventListener ? ~["complete", "loaded", "interactive"].indexOf(document.readyState) ? setTimeout(l, 0) : (i = function () {
                document.removeEventListener("DOMContentLoaded", i, !1), l()
            }, document.addEventListener("DOMContentLoaded", i, !1)) : document.attachEvent && (t = l, v = h.document, e = !1, (o = function () {
                try {
                    v.documentElement.doScroll("left")
                } catch (h) {
                    return void setTimeout(o, 50)
                }
                z()
            })(), v.onreadystatechange = function () {
                "complete" == v.readyState && (v.onreadystatechange = null, z())
            })
        }(window);
        var leftMenuIconSrc = ['#icon-daishengxiaoliebiao', '#icon-zhengbianku', '#icon-danganku', '#icon-jiandingku',
            '#icon-xiaohuiku', '#icon-huishouzhan', '#icon-guidangtongji', '#icon-xiaohuitongji', '#icon-jieyuetongji',
            '#icon-jiandingtongji', '#icon-xitongshezhi', '#icon-jieyueliebiao', '#icon-gerenzhongxin', '#icon-jieyuezhongxin'];

        //2、根据菜单的样式名称匹配出图标
        // if (window.location.hash == '#daishengxiaoliebiao1') {


        // 左侧菜单
        setTimeout(function () {
            var citeDiv = $('.ArchManageMenu').find('.inbiz-nav-item a');
            if (citeDiv.length > 0) {
                $.each(citeDiv, function (i, item) {
                    // 显示档案生效列表时 默认选中该菜单       inbiz-this
                    if (item.href != undefined && item.href != "" && item.href == window.location.href) {
                       if (!item.parentElement.className.indexOf('inbiz-this')>-1) {
                            item.parentElement.className += ' inbiz-this';
                        }

                    }
                    if (item.getElementsByTagName("i").length > 0 && item.getElementsByTagName("svg").length==0 ) {
                        var iclassName = item.getElementsByTagName("i")[0].className;
                        item.innerHTML = '<svg class="icon svg-icon" aria-hidden="true" style="width: 1em;  height: 1em;  vertical-align: -0.15em;  fill: currentColor;  overflow: hidden;">' +
                            '<use xlink:href="#' + iclassName + '"></use></svg>' + item.innerHTML;
                      //  item.getElementsByTagName("i")[0].remove();
                    }
                });
            }
        }, 0);

        // }
        /**end  档案管理 左侧菜单 图标 **/

    }
})
function getMessageCount() {
    //获取消息数量
    var messageCount=0;
    $.ajax({
        type: "get",
        url: "/inbiz/api/WechatManager/GetMessageCount",
        async: false,
        data: {
            token: $.cookie("token")
        },
        success: function (e) {
            if (e.result == 0) {
                messageCount = e.data;
            }
        }
    });
    return messageCount;
}

