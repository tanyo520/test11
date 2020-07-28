/*
    lizheng创建于2015年6月8日
    描述:文件上传模块
 */

define(['durandal/app', 'knockout', "komapping", "jquery", "WebUploader",
    "header/userinfo/constinfo", "header/userinfo/cookie", "doc/navigation/index", lang(), "edoc2ErrorCode", "doc/tactic/processStrategy/processStrategy"],//"css!../style/1.css" 可以使用 require-css来加载样式
    function (app, ko, komapping, jquery,
        //WebUploader引用
        webUploader,
        //通用方法模块
        constInfo,
        $cookie,
        navigation,
        //多语言
        lang,
        errorCode, process
    ) {
        //false=显示 true=销毁 其他值隐藏（要写onClose）
        var showWindow = ko.observable(1);
        //当前文件夹
        var currentFolder = ko.observable();
        //被调用时，保存前一个文件夹
        var previousFolder = ko.observable();
        //文件列表
        var fileList = ko.observableArray();
        //运行时 html5 或 flash
        var runtime = ko.observable();
        //是否支持图片Base64
        var isSupportBase64 = true;
        var isProcess = false;
        var uploader;
        //组件状态 ready,finish,paused,uploading
        var state = ko.observable();
        //重命名组件
        var renameComponent = ko.observable();
        //重命名组件参数
        var renameData = ko.observable();
        //保存冲突策略
        var renameStrategy = {};
        //后台上传时的显示信息
        var miniInfo = ko.observable();
        //单文件最大值
        var fileSingleSizeLimit = 4 * 1024 * 1024 * 1024; //4G
        var person = ko.observable(false);
        //是否外发列表中上传文件
        var isOuPublish = false;
        //是否是附件文件上传
        var isAttachFile=false;
        //用于文件夹上传时，忽略本地选择的根目录名称，使用此目录名称代替
        var rootFolderName = "";
        //当前窗口的提示信息
        //var messageTip = ko.observable();
        var headMd5Size = 1024 * 1024;
        var minChunkSize = 5 * 1024 * 1024;// 5M
        var _fileNumLimit = 500; // 一次选择或拖拽的文件个数上限
        var $uploadContainer, $pickContainer, $placeholder, $renameComponent, $fileList, $filePicker, $mini, $folderPicker, $buttonFolder, $inputFolderDiv, $inputFolder, $labelFolder;
        //保存是否eform上传
        var isEformEnv = false;
        //是否跨域
        var isCrossDomain = false;
        //是否支持多文件选择，流程只支持单文件
        var uploadMultiple = ko.observable(true);
        // 入队前回调函数
        var onBeforeFileQueued = undefined;
        //只允许单文件上传
        if ($.getQueryString("singleuploadmode") === "true") {
            _fileNumLimit = 1;
        }
        if (_fileNumLimit === 1) {
            uploadMultiple = ko.observable(false);
        }
        // 文件上传数量限制，默认500
        var uploadFilesNum = ko.observable(_fileNumLimit);
        var uploadAccept={};
        //元数据是否启用强制策略
        var isPrevInherit = false;
        //编辑文件元数据权限
        var updateMetaPerm = false;
        //设置密级权限
        var setLvlPerm = false;
        var hideWindow = function () {
            showWindow(1);
            //如果前一个文件夹有数据
            if (previousFolder()) {
                //切换文件夹
                switchFolder(previousFolder(), currentFolder());
                //清空前一个文件夹
                previousFolder = ko.observable();
            }
            //后台上传时更新一下信息
            updateMiniInfo();
            //如果上传全部完成，移除列表
            if (state() === 'finish') {
                fileList.removeAll();
                uploader.reset();
            }
            if(/^#system/.test(window.location.hash)){
                app.trigger('templatelist:reload', 'Refresh');
            }
             
            // 处理门户取消上传后不能关闭窗口问题
            if (!isCrossDomain) {
                if (window.parent.activeUploaderHost && window.parent.activeUploaderHost.onHideWindow) {
                    window.parent.activeUploaderHost.onHideWindow();
                }
            }

        };

        //更新后台上传时的显示信息
        var updateMiniInfo = function () {
            //设置上传信息
            if (showWindow()) {
                //cq.wuyongwen修改于2018-2-1 个人内容库内存变化
                app.trigger('person:updateCapacity');
                //var img = '<img src ="scripts/lib/webuploader/' + state() + '.gif"/>';
                if (state() === 'uploading') {
                    //modify: 2017-11-21 haibin.long 需要统计 队列中，暂定两个状态的数据

                    miniInfo(lang.miniInfoUploading + (uploader.getFiles("queued", "interrupt").length));
                } else if (state() === 'paused') {
                    miniInfo(lang.miniInfoPaused);
                }
            }
        };
        //最后一批文件（同文件夹算一批）
        var lastBatch = { folderId: 0, fileIds: [] };

        //切换文件夹，将两个文件夹相同的属性交换
        var switchFolder = function (folder1, folder2) {

            for (var key in folder2) {
                //ko数据不处理
                if (key === '__ko_mapping__') {
                    continue;
                }
                if (folder1[key]) {
                    var temp = folder2[key]();
                    folder2[key](folder1[key]());
                    folder1[key](temp);
                }
            }
        };

        var supportWebkitdirectory = undefined;
        var testWebkitdirectory = function () {
            if (supportWebkitdirectory) {
                return supportWebkitdirectory;
            }
            var tester = document.createElement('input');
            tester.type = 'file';
            if ('multiple' in tester && 'webkitdirectory' in tester) {
                supportWebkitdirectory = true;
            } else {
                supportWebkitdirectory = false;
            }
            return supportWebkitdirectory;
        };
        

        //初始化
        var init = function (options) {
            //ie9关闭上传框后第二次点击上传又会出现flash.exec报错的问题
            if (options && options.forceInit) {
                uploader = null;
            }
            /* 没用到
            var fileNumLimit = 300;
            if ($.getQueryString("singleuploadmode") === "true") { fileNumLimit = 1; }
            */
            if (!uploader) {
                //判断浏览器是否支持Base64
                var data = new Image();
                data.onload = data.onerror = function () {
                    if (this.width != 1 || this.height != 1) {
                        isSupportBase64 = false;
                    }
                };
                data.src = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==";

                //var serverurl = constInfo.systemInfo.uploadUrl + (constInfo.isPubilsh ? ("?code=" + constInfo.code) : "?token=" + getTokenByCondition());
                var serverurl = getUploadUrl({
                    RegionType: 1
                });

                constInfo.reloadSysConfigInfo();
                var confInfo = constInfo.getSysConfigInfo();
                var isLimit = false;
                var currentChunkSize = confInfo.ChunkSize * 1024 * 1024;
                if (constInfo.systemInfo && constInfo.systemInfo.uploadLimit && constInfo.systemInfo.uploadLimit > 0) {
                    isLimit = true;
                    currentChunkSize = constInfo.systemInfo.uploadLimit;
                }
                var vvv = confInfo.isEnableChunked;
                // 实例化
                uploader = webUploader.create({
                    //添加文件按钮
                    pick: {
                        id: $filePicker,
                        label: lang.addFile,
                        multiple: uploadMultiple()
                    },
                    //formData: {
                    //    token: 123
                    //},
                    //上传框内部拖拽
                    dnd: $placeholder,
                    //粘贴处理事件元素
                    paste: document.body,
                    // 去重， 根据文件名字、文件大小和最后修改时间来生成hash Key
                    duplicate: true,
                    //粘贴前事件，自定义添加，非自带
                    pasteBefore: function () {
                        var event = arguments.callee.caller.caller.caller.caller.caller.arguments[0];
                        //不是文本框并且上传窗口显示时才可以粘贴文件
                        if (event.target == document.body && !showWindow()) {
                            return true;
                        }
                        return false;
                    },
                    //flash路径
                    swf: 'scripts/lib/webuploader/Uploader.swf',
                    //分片传输
                    chunked: true,
                    //分片大小5M
                    chunkSize: currentChunkSize,
                    //chunkSize: 512 * 1024,
                    //上传接受的服务器端
                    server: serverurl,

                    //runtimeOrder: 'flash',
                    accept: uploadAccept,

                    // 禁掉全局的拖拽功能。这样不会出现图片拖进页面的时候，把图片打开。
                    disableGlobalDnd: true,
                    //最大文件数
                    fileNumLimit: uploadFilesNum(),
                    //不使用图片压缩
                    compress: null,
                    //同时只有一个文件在传输
                    threads: 1,
                    //有文件自动开始传输
                    auto: true,
                    //限制大小2g，单文件
                    fileSingleSizeLimit: fileSingleSizeLimit,
                    //prepareNextFile:true
                    //所有文件大小
                    //fileSizeLimit: 200 * 1024 * 1024,   
                    isSpeedLimit: isLimit
                });
                //保存当前运行时
                runtime(uploader.request('predict-runtime-type'));
                //当有文件添加进来时
                uploader.onFileQueued = function (file) {
                    if (!currentFolder()) return;
                    if (isEformEnv) {
                        if (!isCrossDomain) {
                            if (window.parent.activeUploaderHost && window.parent.activeUploaderHost.onBeforeFileQueued) {
                                if (window.parent.activeUploaderHost.onBeforeFileQueued(file) == false) {
                                    uploader.cancelFile(file.id);
                                    return;
                                }
                            }
                        }
                    }
                    //属性赋值
                    file.folderId = currentFolder().id();
                    var obj = {};
                    obj.id = file.id;
                    //根据文件名 最后修改时间 大小来生成的hash
                    obj.hash = file.__hash;
                    obj.name = file.name;
                    obj.size = constInfo.formatSize(file.size);
                    obj.ext = file.ext;
                    obj.type = file.type;
                    obj.folderId = currentFolder().id();
                    obj.folderName = currentFolder().name();
                    obj.folderPath = currentFolder().path();
                    obj.fileId = 0; // 后台返回的fileId
                    //文件夹相对路径
                    obj.folderRelativePath = "";
                    obj.regionHash = "";
                    //进度% 
                    obj.percent = 0;
                    //速度 字节
                    obj.speed = 0;
                    var ico = constInfo.getFileIcon(file.ext);
                    if (!ico) {
                        ico = "unknown";
                    }
                    obj.icon = $.format("external/icon-file-type/32/{0}.png", ico);
                    //状态信息
                    obj.statusText = "queued";
                    //文件错误信息的原因
                    obj.reason = "";
                    //文件冲突的策略
                    obj.strategy = "";
                    obj.uploadId = constInfo.getGuid(); // 进度条缓存id
                    obj.fullPath = file.source.fullPath || "";
                    obj.regionId = 1;
                    obj.approved = true; // checkAndCreateDocInfo是否通过
                    var koObj = komapping.fromJS(obj);

                    //速度信息 63%(1.26 MB/s)
                    koObj.speedInfo = ko.computed(function () {
                        if (/*this.percent() == 0 &&*/ this.speed() === 0) {
                            return "";
                        }
                        return $.format("{0}/s", constInfo.formatSize(this.speed())); //({0}%){1}/s
                    }, koObj);

                    fileList.push(komapping.fromJS(koObj));
                    //文件状态改变的处理事件
                    file.on('statuschange', function (cur, prev) {
                        var obj = findFile(file.id);
                        if (file.size == 0) {
                            if (obj.statusText() !== "complete" && obj.statusText() !== "error" && obj.statusText() !== "cancelled")
                                obj.statusText(cur);
                            else
                                cur = obj.statusText();
                            if (obj.statusText() === "error") {
                                file.setStatus("error");
                            } else if (obj.statusText() === "cancelled") {
                                file.setStatus("complete");
                            }
                        }
                        else {
                            if (obj.statusText() !== "cancelled")
                                obj.statusText(cur);
                        }
                        if (cur === 'progress') {
                            //如果开始上传了，把之前的错误信息清空
                            obj.reason('');
                            //记录
                            if (!file.startTime) {
                                file.startTime = new Date();
                            }
                        }

                    });
                    //生成缩略图
                    uploader.makeThumb(file, function (error, src) {
                        if (error) {
                            return;
                        }
                        if (isSupportBase64) {
                            koObj.icon(src);
                        }
                    }, 64, 64);
                };
                uploader.onFileDequeued = function (file) {
                    //alert(file.name);
                };
                uploader.onUploadProgress = function (file, percentage) {
                    //从fileList里找到和触发事件id相等的对象
                    var obj = findFile(file.id);
                    if (!obj) return;
                    //计算进度和速度
                    if (obj.percent() == 100) {
                        return;
                    }
                    var percentFixed = (percentage * 100).toFixed(2);
                    obj.percent(percentFixed);
                    var uploadSize = file.size * percentage;
                    var s = (new Date() - file.startTime) / 1000;
                    obj.speed(uploadSize / s);

                };
                // 文件被加入队列之前触发，返回值为false，文件不会被添加进入队列
                uploader.on("beforeFileQueued", function (file) {
                    if (onBeforeFileQueued) {
                        if (!onBeforeFileQueued(file)) {
                            return false;
                        }
                    }
                    //clog("fullPath: " + file.source.fullPath);
                    if (file.source.fullPath) {
                        if (rootFolderName) {
                            var arr = file.source.fullPath.split('/');
                            if (arr && arr.length > 2) {
                                file.source.fullPath = file.source.fullPath.replace("/" + arr[1] + "/", "/" + rootFolderName + "/");
                            }
                        }
                        // 判断有没有创建文件夹权限
                        if (!currentFolder()) return;
                        var folderId = currentFolder().id();
                        if (!checkCreateFolderPerm(folderId, null, false)) { // 同步获取创建[文件夹]权限
                            isShowNoCreateFolderTip = true;
                            return false; // 不加入列队
                        }
                    }
                });
                var isShowNoCreateFolderTip = false;
                // 当一批文件添加进队列以后触发，files个数为0也会触发
                uploader.on("filesQueued", function (files) {
                    if (isShowNoCreateFolderTip) {
                        isShowNoCreateFolderTip = false;
                        app.trigger("message:show", { type: 'error', message: lang.noPermCreateFolder });
                    }
                    // 更新后台上传时的显示信息
                    updateMiniInfo();
                });
                //某个文件开始上传前触发，一个文件只会触发一次(其实retry后，还会触发)
                uploader.on('uploadStart', function (file) {
                    // 开始上传 tangbangguo 2018/6/25
                    if (isEformEnv && !isCrossDomain && parent.window.activeUploaderHost) {
                        // 如果是eform上传，会去校验名称是否存在，如果存在就提示文件已存在。 // tangbangguo 2018/6/25 
                        // 附件列表文件集合
                        var files = parent.window.activeUploaderHost.files;
                    }
                    var obj = findFile(file.id);
                    if (!obj) return;
                    var strategy = "";
                    if (file.nResult && file.nResult === 610) {
                        if (obj.strategy && obj.strategy()) {
                            //单独处理过重名策略
                            strategy = obj.strategy();
                        }
                        if (!strategy && renameStrategy[obj.folderId()]) {
                            //应用处理过重名策略
                            strategy = renameStrategy[obj.folderId()];
                        }

                    }

                    // 判断是上传还是更新
                    var FILE_MODE = strategy ? "UPDATE" : "UPLOAD";
                    var masterFileId = "";
                    if (currentFolder().masterFile()) {
                        masterFileId = currentFolder().masterFile().id();
                    }
                    var folderId = obj.folderId();
                    //var hash = buildHash(folderId, file);
                    var code = constInfo.isPubilsh ? constInfo.code : "";

                    var lastModifiedDate;
                    if (file.lastModifiedDate instanceof Date) {
                        lastModifiedDate = file.lastModifiedDate.format("yyyy-MM-dd hh:mm:ss");
                    } else {
                        try {
                            lastModifiedDate = new Date(file.source.source.lastModified).format("yyyy-MM-dd hh:mm:ss");
                        } catch (e) {
                            lastModifiedDate = "";
                        }
                    }

                    var postCheckData = {
                        folderId: folderId,
                        masterFileId: masterFileId,
                        token: constInfo.userInfo.token,
                        fileName: obj.name(),
                        fileRemark: "",
                        size: file.size,
                        type: file.type,
                        attachType: 0,
                        fullPath: file.source.fullPath,
                        code: code,
                        //hash: hash,
                        strategy: strategy,
                        lastModifiedDate: lastModifiedDate,
                        fileModel: FILE_MODE
                    };
                    if (isEformEnv) {
                        //eform更新文件,通过fileid
                        try {
                            if (currentFolder().operateType() === "update" && currentFolder().updateFileId()) {
                                postCheckData.fileId = currentFolder().updateFileId();
                                postCheckData.strategy = currentFolder().strategy();
                                postCheckData.fileModel = "UPDATE";
                            }
                        }
                        catch (ex) { }
                    }
                    checkAndCreateDocInfo(postCheckData, false, function (result) {
                        if (result.result === 0) {
                            obj.approved(true); // 通过验证
                            obj.regionHash(result.data.RegionHash); // 服务器返回的hash值
                            obj.fileId(result.data.FileId);// 服务器返回的FileId
                            obj.regionId(result.data.RegionId);
                            var __uploadUrl = getUploadUrl(result.data);
                            uploader.option('server', __uploadUrl);
                            file.nResult = result.result;
                            if (file.size > 0) {
                                if (!isEformEnv) {
                                    md5Verification(uploader, file, result.data.RegionId); // 验证md5
                                }
                            }
                            else {
                                var fileId = result.data.FileId;
                                uploader.skipFile(file);
                                obj.statusText("complete");
                                obj.percent(100); // 进度条百分百

                                if (lastBatch.folderId !== folderId) {
                                    lastBatch.folderId = folderId;
                                    lastBatch.fileIds = [fileId];
                                } else {
                                    //如果相等，把fileIds加入新id
                                    lastBatchPush(fileId);
                                }
                            }
                        } else {
                            obj.approved(false); // 不通过
                            uploader.option('server', serverurl);
                            file.nResult = result.result;
                            file.FILE_MODE = FILE_MODE;
                            if (result.result === 4302 || result.result === 2048 || result.result === 4096) {
                                file.reason = result.reason;
                            }else{
                                file.reason = result.result;
                            }
                            if (file.size == 0) {
                                if (result.result == 610) {
                                    uploader.stop();
                                    file.setStatus("error", result.result);
                                    obj.reason(lang.ErrorCode610);
                                    //showWindow610(obj, uploader, file);
                                    strategy610(obj, uploader, file);
                                } else {
                                    reason = convertReason(file.reason, FILE_MODE);
                                    obj.reason(reason);
                                    obj.statusText("error");
                                }
                            }
                        }

                    });

                });
                uploader.on('error', function (action, limit, file) {
                    switch (action) {
                        case "Q_EXCEED_NUM_LIMIT":
                            app.trigger("message:show", { type: 'error', message: $.format(lang.outnumlimit, limit) });
                            //messageTip({ type: 'error', message: $.format(lang.outnumlimit, limit) });
                            break;
                        case "F_EXCEED_SIZE":
                            app.trigger("message:show", { type: 'error', message: $.format(lang.uploadedFileSize, constInfo.formatSize(limit)) });
                            //messageTip({ type: 'error', message: $.format("上传的文件大小不能超过{0}", constInfo.formatSize(limit)) });
                            break;
                        default:
                    }

                });
                uploader.on('uploadError', function (file, reason) {
                    uploader.stop();
                    //出错误时，要把开始时间设置undefined，否则会有计算速度问题
                    file.startTime = undefined;
                    var obj = findFile(file.id);
                    if (!obj) return;
                    obj.uploadId(constInfo.getGuid());  // 更新进度条缓存id
                    reason = convertReason(reason, file.FILE_MODE);

                    obj.reason(reason);
                    obj.percent(0);
                    //如果出错原因是重名，需要继续处理    
                    if (file.nResult && file.nResult === 610) {
                        strategy610(obj, uploader, file);
                    } else if (parseInt(reason) === 4) {
                        //特殊处理，如果返回4，说明没有登录或登陆失效，直接跳转登陆页面
                        obj.reason(errorCode["ErrorCode4"]);
                        window.top.location.href = "api/auth/login?returnUrl=" + window.encodeURIComponent(window.location.href);
                    } else {
                        if (uploader.getFiles("queued", "interrupt").length > 0) {
                            upload();
                        }

                    }
                });
                //不管成功或者失败，文件上传完成时触发
                uploader.on('uploadComplete', function (file) {
                    updateMiniInfo();
                });
                //上传确认事件
                uploader.on('uploadAccept', function (obj, ret, cb) {
                    var file = findFile(obj.file.id); // obj.file是上传组件的file，findFile(obj.file.id)是obj
                    if (!file) {
                        return false;
                    }

                    if (ret && ret.status) {
                        //如果状态是Error，需要处理
                        if (ret.status === "Error") {
                            //if (cb) cb(ret.message);
                            if (cb) {
                                if (ret.errorCode === 4302) {
                                    cb(ret.message);
                                } else {
                                    cb(ret.errorCode);
                                }
                            }
                            return false;
                        } else {
                            /*
                            //"tag":"605|958|电子文件元数据标准设计框架研究.doc|2601|false"
                            var split = ret.tag.split('|');
                            if (split.length < 0) {
                                return false;
                            }*/
                            var fileId = file.fileId();
                            //if (split.length >= 5 && split[4] == "true") { // 是秒传
                            if (ret.tag === "true") { // reg.tag不在返回其他数据，只有"true"or"false"值，判断是否秒传
                                uploader.skipFile(obj.file);   // 剩下的块不再传输到后台
                                file.secondPass = true;
                                file.statusText("secondPass"); // 更改标识为秒传，用于显示“秒传”文字和“已完成”的icon
                                file.percent(100);             // 前端进度进百分百
                            }

                            if (file.secondPass || ret.status === "End") { // 秒传 或 正常完成
                                //如果最后一批文件的folderId 不等，把最新的赋值
                                if (lastBatch.folderId != obj.file.folderId) {
                                    lastBatch.folderId = obj.file.folderId;
                                    lastBatch.fileIds = [fileId];
                                } else {
                                    //如果相等，把fileIds加入新id
                                    lastBatchPush(fileId);
                                }

                                return true;
                            }
                        }

                        if (file.statusText && file.statusText() === 'pausing') {
                            //暂停修改为，传输完当前块再暂停
                            uploader.stop(true);
                            updateMiniInfo();
                        }

                        return true;

                    } else {
                        //没有返回正确信息
                        return false;
                    }
                });
                //开始上传前触发事件
                uploader.on('uploadBeforeSend', function (block, data) {
                    // block为分块数据。
                    //alert("uploadBeforeSend");
                    // file为分块对应的file对象。
                    var file = block.file;
                    var obj = findFile(file.id);
                    if (!obj) return;
                    if (obj.approved() === false) {
                        // 不通过
                        data.approved = false;
                        data.reason = file.reason;
                    }

                    // 修改data可以控制发送哪些携带数据。
                    //data.FILE_INFO = $.format("{0}\1{1}\1{2}\1{3}\1{4}\1{5}", obj.folderId(), obj.name(),
                    //    "", //file_remark,
                    //    masterFileId, //masterFileId,
                    //    "0", //attachType,
                    //    strategy);
                    data.fileName = obj.name();
                    //data.hash = buildHash(obj.folderId(), file);
                    data.regionHash = obj.regionHash();
                    data.regionId = obj.regionId();
                    data.uploadId = obj.uploadId(); // 进度条缓存参数
                    data.chunkSize = uploader.options.chunkSize;
                    data.blockSize = block.blob.size;
                    //data.fullPath = file.source.fullPath || "";
                    if (file.fileMd5) {
                        data.fileMd5 = file.fileMd5;
                    }

                    // 删除其他数据
                    // delete data.key;
                });
                //接受所有事件
                uploader.on('all', function (type) {
                    //  //test point 是否有完成时类型
                    //根据事件来改变上传状态  没那么难                         
                    switch (type) {
                        case 'ready':
                            state('ready');
                            break;
                        case 'uploadFinished': // 当所有文件上传结束时触发
                            if (uploader.getFiles('error').length > 0) {
                                if (isEformEnv) {

                                }
                                else {
                                    state('paused');
                                    updateMiniInfo();
                                    return;
                                }
                            } 
                            state('finish');
                            if (uploader.getFiles().length === 0) {
                                return;
                            }
                            if (lastBatch.fileIds.length > 0) {
                                //test point 看能否修改文件列表
                                var files = $.extend({}, lastBatch.fileIds);
                                //$.unique(files.sort());// 去重
                                //var sfiles = uploader.getFiles();
								//不能取所有的状态文件,只取完成的,其他的顾虑掉的失败的等等不要,防止lastBatch.fileIds,sfiles数量不等,导致filesArray错误,mikahuang,202001
                                //文件上传状态:inited 初始状态,queued 已经进入队列,progress 上传中,complete 上传完成,error 上传出错，可重试,interrupt 上传中断,invalid 文件不合格，cancelled 文件被移除
                                var sfiles = uploader.getFiles("complete");
                                //0字节问题修复,complete状态无法获取,可取progress
                                var _sfiles_progress = uploader.getFiles("progress");
                                if (_sfiles_progress.length) {
                                    sfiles = sfiles.concat(_sfiles_progress);
                                }
                                var filesArray = [];
                                $.each(files, function (index, data) {
                                    filesArray.push({
                                        name: sfiles[index].name,
                                        size:sfiles[index].size,
                                        id: data,
                                        fileType: 2,
                                        parentId: lastBatch.folderId,
                                        Ext: sfiles[index].ext
                                    });
                                });
                                //判断是否有元数据编辑权限及设置密级权限
                                updateMetadataPerm(lastBatch.fileIds[0]);
                                var uploadMessage = $.format(lang.uploadFinishNorm, lastBatch.fileIds.length);
                                if (/^#doc\/enterprise/.test(window.location.hash) && constInfo.LicMetaData() && !isAttachFile) {
                                    var metaMess = updateMetaPerm ? lang.uploadMetadata : "";
                                    var lvlMess = setLvlPerm ? lang.uploadLvlPerm : "";
                                    uploadMessage = $.format(isOuPublish === true ? lang.uploadFinishNoMetadata : lang.uploadFinish, lastBatch.fileIds.length, metaMess, lvlMess);
                                }
                                //eform上传回调
                                if (isEformEnv) {
                                    if (isCrossDomain) {
                                        top.postMessage(JSON.stringify(filesArray), '*');
                                    }
                                    else {
                                        if (window.parent.activeUploaderHost && window.parent.activeUploaderHost.onUploadFinish) {
                                            //处理多次上传(如移除文件等操作会触发二次上传),会重复触发onUploadFinish事件导致数据重复问题,mikahuang,202001
                                            var _filesArray = [];
                                            window.__uploadFinishFiles = window.__uploadFinishFiles || {};
                                            $.each(filesArray, function (index, item) {
                                                if (!window.__uploadFinishFiles[item.fileType +"_"+ item.id])
                                                {
                                                    _filesArray.push(item);
                                                }
                                            });
                                            if (_filesArray.length) {
                                                parent.window.activeUploaderHost.onUploadFinish(_filesArray);
                                                //onUploadFinish事件后记录已经上传完成的文件ID
                                                $.each(_filesArray, function (index, item) {
                                                    window.__uploadFinishFiles[item.fileType + "_" + item.id] = 1;
                                                });
                                            }
                                        }
                                    }
                                } else {


                                    //判断上传成功后判断是否启用元数据强制应用策略
                                    getFldMetaTypes(sfiles[0].folderId);
                                    ko.$store.dispatch('setUploadFiles', filesArray);
                                    if (isPrevInherit) {
                                        //得到所有文件的Id
                                        var filesIds = lastBatch.fileIds.join();
                                        isMetadataMaintenance(filesIds);
                                        if (updateMetaPerm) {
                                            app.trigger("component:show", {
                                                moduleId: "doc/metadata/index",
                                                message: message,
                                                datas: filesArray
                                            });
                                        } else {
                                            app.trigger("message:show", {
                                                type: 'success',
                                                message: uploadMessage,
                                                delay: 4000, handler: function (Ismetadata) {
                                                    if (Ismetadata) {
                                                        app.trigger('component:show', {
                                                            moduleId: "doc/metadata/index",
                                                            message: message,
                                                            datas: filesArray
                                                        });
                                                    } else {
                                                        app.trigger('component:show', {
                                                            moduleId: "doc/informationbar/basicinfo/singlefile/batchmoficationlevel/index",
                                                            message: message,
                                                            datas: filesArray
                                                        });
                                                    }
                                                }
                                            });
                                        }
                                    }
                                    else {
                                        app.trigger("message:show", {
                                            type: 'success',
                                            message: uploadMessage,
                                            delay: 4000, handler: function (Ismetadata) {
                                                if (Ismetadata) {
                                                    app.trigger('component:show', {
                                                        moduleId: "doc/metadata/index",
                                                        message: message,
                                                        datas: filesArray
                                                    });
                                                } else {
                                                    app.trigger('component:show', {
                                                        moduleId: "doc/informationbar/basicinfo/singlefile/batchmoficationlevel/index",
                                                        message: message,
                                                        datas: filesArray
                                                    });
                                                }
                                            }
                                        });
                                    }

                                }
                            }

                            window.setTimeout(function () {//全部完成重新赋值
                                lastBatch = { folderId: 0, fileIds: [] };
                                if (message === "enterprise:reload") {
                                    setTimeout(function () { app.trigger('enterprise:reload', { force: true, needResetViewType: false, needSavePageNum: true, customSort: true }); }, 10);
                                }
                                else if (message === "person:reload") {
                                    setTimeout(function () { app.trigger('person:reload', { force: true, needResetViewType: false, needSavePageNum: true, customSort: true }); }, 10);
                                }
                                else if (message === "enterpriselist:reload") {
                                    setTimeout(function () { app.trigger('enterprise:reload', { force: true, needResetViewType: false }); }, 10);
                                }
                                else if (message === "personlist:reload") {
                                    setTimeout(function () { app.trigger('person:reload', { force: true, needResetViewType: false, needSavePageNum: true }); }, 10);
                                }
                                else if (message === "team:load" || message === "teamlist:reload") {
                                    setTimeout(function () { app.trigger(message, currentFolder()); }, 10);
                                }
                                else if (message === "teamdata:reload") {//团队列表右键上传时
                                    setTimeout(function () { message && app.trigger(message, { id: currentFolder().id() }); }, 10);
                                }
                                else if (message === "outpublish:reload") {
                                    setTimeout(function () { app.trigger('outpublish:reload'); }, 10);
                                }
                                else {
                                    setTimeout(function () { message && app.trigger(message); }, 10);
                                }
                                //}, 4000);//4秒太久了，改为1秒 cq.taiqi 2017年12月22日 11:22:30
                            }, 1000);
                            setTimeout(function () {
                                foldersPerm = undefined; // 重置文件夹权限
                                hideWindow();
                                if (runtime() !== 'html5') {
                                    setTimeout(function () {
                                        init({ forceInit: true });
                                    }, 500);
                                }
                            }, 1200);
                            
                            updateMiniInfo();
                            break;
                        case 'startUpload':
                            state('uploading');
                            break;
                        case 'stopUpload':
                            state('paused');
                            break;
                    }
                });

                //html5 运行时
                if (runtime() === 'html5') {
                    //全局拖拽
                    var $dropOverlay = jquery('<div id="dropOverlay"><h1>' + lang.dndGlobal + '</h1></div>').appendTo(document.body);
                    var dragenter = function (e) {
                        //解决vdrive端禁止拖拽
                        if (constInfo.parseQueryString().IsVDriver) {
                            e.preventDefault();
                            e.stopPropagation();
                            return;
                        }
                        //modify: 2017-11-22 haibin.long 判断拖入的是否为文件
                        var dTrans = e.originalEvent.dataTransfer;
                        var types = dTrans.types;
                        var fileCount = 0;
                        $.each(types, function (index, item) {
                            if (item.toLowerCase() === 'files') {
                                fileCount++;
                            }
                        });
                        if (fileCount === 0) { //modify: 2018-02-26 haibin.long 处理safari拖拽上传失效的Bug #5906
                            return;
                        }
                        e.preventDefault();
                        e.stopPropagation();
                        //快速导航不处理
                        if (/\/quick/.test(window.location.hash)) {
                            return;
                        }
                        if (/^#system/.test(window.location.hash)) {
                            return;
                        }
                        //团队根目录不触发文件拖拽上传.modify:2018-10-8 min.tian
                        if (/^#doc\/team/.test(window.location.hash) && currentFolder().id() === 7) {
                            return;
                        }
                        //如果上传窗口打开了，不处理外部的拖拽了
                        if (!showWindow()) return;
                        $dropOverlay.css("display", "block");
                    };
                    var dragover = function (e) {
                        e.preventDefault();
                        e.stopPropagation();
                        //如果上传窗口打开了，不处理外部的拖拽了
                        if (!showWindow()) return;
                    };
                    var dragleave = function (e) {
                        e.preventDefault();
                        e.stopPropagation();
                        //如果上传窗口打开了，不处理外部的拖拽了
                        if (!showWindow()) return;
                        $dropOverlay.css("display", "none");
                    };
                    var drop = function (e) {
                        e.preventDefault();
                        e.stopPropagation();
                        //如果上传窗口打开了，不处理外部的拖拽了
                        if (!showWindow()) return;
                        $dropOverlay.css("display", "none");
                        if (runtime() === 'html5') {
                            ///uploader.request('predict-runtime-type');
                            //showWindow(false);
                            //不能直接显示，不然全路经可能为空
                            app.trigger("upload:show", { showWindow: true });
                            if (isProcess) {
                                isProcess = false;
                                return;
                            }
                            //添加文件
                            uploader.request("enter", e);
                            //WebUploader.Runtime.Html5.Dnd._dropHandler(e);
                        }
                    };
                    //鼠标进入时让遮罩隐藏，ie下有bug不触发drop
                    var mouseover = function (e) {
                        e.preventDefault();
                        e.stopPropagation();
                        $dropOverlay.css('display', 'none');
                    };
                    //清除遮罩
                    var dblclick = function (e) {
                        e.preventDefault();
                        e.stopPropagation();
                        $dropOverlay.css("display", "none");
                    };
                    //全局拖入
                    jquery(document.body).on({
                        dragenter: dragenter
                    });
                    $dropOverlay.on({
                        dragover: dragover,
                        dragleave: dragleave,
                        drop: drop,
                        dblclick: dblclick
                    });
                }
            }
        };
        //开始上传
        var upload = function () {
            uploader.upload();
        };
        //找到对应的前台对象
        var findFile = function (id) {
            return $.grep(fileList(), function (cur, i) {
                return cur.id() == id;
            })[0];
        };
        var cancelFile = function (obj, uploader) {
            uploader.cancelFile(obj.id());
            //obj.size(lang.skip);// 这为什么是skip
            uploader.retry();
        };
        var skipFile = function (obj, uploader, file) {
            obj.statusText("cancelled");
            uploader.skipFile(file);
            uploader.upload();
        }
        var showWindow610 = function (obj, uploader, file) {
            renameData(null);
            renameData({
                fileName: obj.name(),
                folderId: obj.folderId(),
                folderName: obj.folderName(),
                attachmentRename: obj.folderId() === 3,//是否是附件文件夹
                callback: function (param) {
                    //只有重命名不能应用策略，先处理
                    if (param.processStrategy === "rename") {
                        obj.name(param.newFileName);
                    } else {
                        //判断是否应用策略
                        if (param.alwaysApplyCurStrategy) {
                            renameStrategy[obj.folderId()] = param.processStrategy;
                        } else {
                            obj.strategy(param.processStrategy);
                        }
                    }

                    // 如果选择跳过，就直接取消文件
                    if (param.processStrategy === "skip") {
                        skipFile(obj, uploader, file);
                    } else {
                        if (file.size == 0) {
                            obj.statusText("");
                            obj.reason("");
                        }
                        uploader.retry(file);
                    }
                }
            });
            //加载冲突窗口
            renameComponent(null);
            showWindow(false);
            renameComponent("doc/versionManagement/renamed/index");
        };
        var strategy610 = function (obj, uploader, file) {
            var strategy = "";
            if (obj.strategy && obj.strategy()) {
                //单独处理过重名策略
                strategy = obj.strategy();
            }
            if (!strategy && renameStrategy[obj.folderId()]) {
                //应用处理过重名策略
                strategy = renameStrategy[obj.folderId()];
            }
            if (isEformEnv) {
                strategy = currentFolder().strategy();
                if (strategy) {
                    if (strategy === "skip") {// 如果选择跳过，就直接取消文件
                        //cancelFile(obj, uploader);
                        skipFile(obj, uploader, file);
                    }
                    else {
                        if (strategy === "rename") { //只有重命名不能应用策略，先处理
                            obj.name(obj.name().substring(0, obj.name().lastIndexOf(".")) + new Date().valueOf() + obj.name().substring(obj.name().lastIndexOf(".")));
                            //不需要设置策略
                            //obj.strategy(strategy);
                        } else { // 更新策略
                            renameStrategy[obj.folderId()] = strategy;//设置策略
                            obj.strategy(strategy);
                        }
                        if (file.size == 0) {
                            obj.statusText("");
                            obj.reason("");
                        }
                        if (file.size > 0)
                            uploader.retry(file);
                        else {
                            setTimeout(function () {
                                uploader.retry(file);
                            }, 1);
                        }
                    }
                }
                else {//如果策略为空 取消文件
                    cancelFile(obj, uploader);
                }
                //uploader.retry();
            }
            //跳过的话，不再弹出窗口
            else if (strategy === "skip") {
                skipFile(obj, uploader, file);
            }
            else if (strategy) {//liuning.yao  检测策略是否存在
                if (file.size == 0) {
                    obj.statusText("");
                    obj.reason("");
                }
                if (file.size > 0)
                    uploader.retry(file);
                else {
                    setTimeout(function () {
                        uploader.retry(file);
                    }, 1);
                }
            } else {
                showWindow610(obj, uploader, file);
            }
        };
        var module;
        var selectData;
        var message;
        function removeFile(data) {
            var strategy = "";
            if (data.strategy && data.strategy()) {
                //单独处理过重名策略
                strategy = data.strategy();
            }
            if (!strategy && renameStrategy[data.folderId()]) {
                //应用处理过重名策略
                strategy = renameStrategy[data.folderId()];
            }

            //只对上传进行处理
            if (!strategy) {
                $.ajax({
                    data: {
                        module: "WebClient",
                        fun: "UndoCreateFile",
                        folderId: data.folderId(),
                        fileName: data.name(),
                        fullPath: data.fullPath()
                    }
                }).done(function (data) {
                    if (data.result === 0) {
                        //删除文件时，如果没有错误的文件，就继续上传，增加中断状态判断
                        if (uploader.getFiles("queued", "interrupt").length >= 0) {
                            upload();
                        }
                    }
                });
            }
            else {
                if (uploader.getFiles("queued", "interrupt").length >= 0) {
                    upload();
                }
            }

            uploader.removeFile(data.id(), true);
            fileList.remove(data);
        }
        function getFldMetaTypes(folderId) {
            $.ajax({
                data: {
                    token: constInfo.userInfo.token,
                    module: "MetaDataManager",
                    fun: "GetFldMetaTypesAndAttr",
                    fldId: folderId,
                    objType: 4,//4 文件策略 9文件夹策略
                    isFillMetaAttr: true
                },
                async: false
            }).done(function (data) {
                if (data) {
                    //强制应用
                    isPrevInherit = data.isForce;
                }
            });
        }
        //元数据启用强制策略时候，上传文件状态全部改为元数据维护中
        function isMetadataMaintenance(fileIds) {
            $.ajax({
                data: {
                    module: "WebClient",
                    fun: "FilesMetadataMaintenance",
                    fileIds: fileIds,
                    isMetadataMaintenance: true
                }
            }).done(function (data) {
                if (data.result !== 0) {
                    app.trigger("message:show", { type: 'error', message: data.result });
                }
            });           
        }
        //判断是否有元数据编辑权限
        function updateMetadataPerm(fileId) {
            $.ajax({
                data: {
                    module: "WebClient",
                    fun: "GetPermByFileId",
                    fileId: fileId,
                },
                async: false
            }).done(function (data) {
                if (data) {
                    updateMetaPerm = data.metadataPerm;
                    setLvlPerm = data.setLvlPerm;
                }
            });
        }
        function retryFile(data) {
            uploader.retry(data.id());
        }
        function isExistsHeadMd5(headMd5, regionId, fn) {
            $.ajax({
                data: {
                    module: "UploadFileManager",
                    fun: "IsExistsHeadMd5",
                    headMd5: headMd5,
                    regionId: regionId // 区域编号
                }
            }).done(function (data) {
                var exists = data.exists === true;
                fn && fn(exists);
            });
        }
        //根据文件的hash值找到对应的前台对象
        function getFileByHash(hash) {
            return $.grep(fileList(), function (cur, i) {
                return cur.hash() === hash;
            })[0];
        };
        function paused(data) {
            if (data.statusText() === 'interrupt') {
                // uploader.upload(data.id());
                //if (uploader.getFiles('error').length == 0) {
                upload();
                //uploader.upload();
                //uploader.upload(data.id());
                //}

            }
            else if (data.statusText() === 'progress') {
                //开始暂停
                data.statusText('pausing');
                //uploader.stop();
            }
            updateMiniInfo();
        }
        function buildHash(folderId, file) {
            //return constInfo.userInfo.token + "_" + folderId + "_" + fileHash; // 存在重复隐患
            if (file.serverHash) {
                return file.serverHash;
            } else {
                var serverHash = constInfo.getGuid() + constInfo.userInfo.token + "_" + folderId + "_" + file.__hash;
                file.serverHash = serverHash;
                return serverHash;
            }
        }
        function convertReason(reason, fileModel) {
            var val = "";
            if (typeof (reason) === "number") {
                if (reason === 5) {
                    val = fileModel == "UPDATE" ? lang.ErrorCode5Update : lang.ErrorCode5Create;
                } else {
                    val = lang["ErrorCode" + reason];
                }
                if (val === undefined) {
                    val = lang.ErrorCodeOther + reason;
                }
            } else if (reason === "abort") {
                val = lang.uploaderEnd;
            } else
                val = reason;
            return val;
        }
        function md5Verification(uploader, file, regionId) {
            if (file.size <= minChunkSize)
                return;
            // 如果文件上传出错后，又重新上传的，但fileMd5值已经计算完成
            if (file.fileMd5) {
                clog("之前算过：" + file.name + "'s md5 --> " + file.fileMd5);
                var _obj = findFile(file.id);
            } else {

                if (file.size > headMd5Size) { // 大于 1024 * 1024 的文件

                    uploader.md5File(file, 0, headMd5Size).then(function (headMd5) { // 请求后台查询headMd5是否存在

                        isExistsHeadMd5(headMd5, regionId, function (isExists) {

                            if (!isExists) { // 不存在相同headMd5，不秒传
                                return;
                            }

                            // 存在相同headMd5，继续计算全量md5来判断是否秒传
                            uploader.md5File(file).then(function (retMd5) {
                                clog(file.name + "-->" + retMd5);
                                file.fileMd5 = retMd5;
                            });

                        });
                    });

                } else {

                    // 计算全量md5来判断是否秒传
                    uploader.md5File(file).then(function (retMd5) {
                        clog(file.name + "-->" + retMd5);
                        file.md5 = retMd5;
                    });
                }

            }

        }

        var foldersPerm = undefined; // 缓存创建文件夹权限, 所有文件上传完成时清除
        function checkCreateFolderPerm(folderId, fn, async) {
            var havePerm = false;
            if (foldersPerm === undefined || foldersPerm[folderId] === undefined) {
                if (!foldersPerm)
                    foldersPerm = {};
                $.ajax({
                    async: async === undefined ? true : async,
                    data: {
                        module: "FolderOperationManager",
                        fun: "HaveCreateFolderPerm",
                        folderId: folderId
                    }
                }).done(function (data) {
                    havePerm = data.havePerm;
                    foldersPerm[folderId] = data.havePerm;
                    fn && fn(data.havePerm);
                });
            }
            else {
                havePerm = foldersPerm[folderId];
            }
            return havePerm;
        }
        function clog(info) {
            if (window.console) {
                console.log(info);
            }
        }

        function lastBatchPush(fileId) {
            var isExists = false;
            $.each(lastBatch.fileIds, function (index, _fileId) {
                if (_fileId === fileId) {
                    isExists = true;
                    return false;
                }
            });
            if (!isExists)
                lastBatch.fileIds.push(fileId);
        }
        function getUploadUrl(uploadRule) {
            var token = getTokenByCondition();
            if (uploadRule.RegionType === 1) // 主区域
                return constInfo.systemInfo.uploadUrl + (constInfo.isPubilsh ? ("?code=" + constInfo.code) : "?token=" + token);
            else {
                var regionUrl = uploadRule.RegionUrl;
                regionUrl = regionUrl.lastIndexOf("/") === regionUrl.length - 1 ? regionUrl : regionUrl + "/";
                return regionUrl + "document/upload" + (constInfo.isPubilsh ? ("?code=" + constInfo.code) : "?token=" + token);
            }
        }
        // 校验并获取规则
        function checkAndCreateDocInfo(parameter, async, fn) {
            var data = $.extend({
                module: "RegionDocOperationApi",
                fun: "CheckAndCreateDocInfo"
            }, parameter);
            $.ajax({
                async: async === undefined ? true : async,
                data: data
            }).done(function (result) {
                fn(result);
            });
        }
        return {
            //多语言
            lang: lang,
            //运行时
            runtime: runtime,
            //窗口显示变量
            showWindow: showWindow,
            //messageTip:messageTip,
            //点击显示
            clickShow: function () {
                var currentFolder = this.currentFolder();
                if (currentFolder) {
                    if (!currentFolder.relativePath() && currentFolder.folderType() !== -1) { // -1是回收站
                        constInfo.getFolderRelativePath(currentFolder.path()).done(function (path) {
                            currentFolder.relativePath(path);
                        });
                    }
                }
                showWindow(false);
            },
            //隐藏窗口
            hideWindow: hideWindow,
            //当前对应的文件夹对象
            currentFolder: currentFolder,
            //当前对应的文件夹对象的路径，相对路径
            path: ko.computed(function () {
                if (!currentFolder()) {
                    return "";
                }
                var _currentFolder = komapping.toJS(currentFolder);
                if (_currentFolder.masterFile) {
                    var relativePath="";
                    if(_currentFolder.relativePath){
                        relativePath= _currentFolder.relativePath.split('\\');
                        relativePath=relativePath[relativePath.length-1];
                    }
                    return lang.toAttachment + "'"+relativePath+"'" + lang.updateAttachment;
                }
                var relativePath = _currentFolder.relativePath;
                //个人内容库的情况
                if (relativePath && ((_currentFolder.namePath && /^PersonalRoot/i.test(_currentFolder.namePath))
                    || _currentFolder.id === window.constInfo.userInfo.topPersonalFolderId //个人内容库根目录点空白，然后点上传
                    || _currentFolder.parentFolderId == window.constInfo.userInfo.topPersonalFolderId)) //个人内容库选中文件夹，然后点上传
                {
                    var arrRelativePath = relativePath.split("\\");
                    arrRelativePath.splice(1, 1);
                    relativePath = arrRelativePath.join("\\");
                }

                return lang.toFolder + relativePath;
            }),
            //上传方法
            upload: upload,
            //组件状态
            state: state,
            //要上传的文件的列表
            fileList: fileList,
            //冲突组件地址变量
            renameComponent: renameComponent,
            //冲突组件参数
            renameData: renameData,
            //后台上传时的显示信息
            miniInfo: miniInfo,
            binding: function () {
                //绑定方法，动态创建元素
                $uploadContainer = jquery("#uploadContainer");
                //顶部容器
                $pickContainer = jquery('<div class="pickContainer"></div>').appendTo($uploadContainer);
                //目标文件夹路径
                //jquery('<span class="targetpath" data-bind="text:path,attr: {title: path }"></span>').appendTo($pickContainer);
                jquery('<div class="form" style="padding: 0px 20px; word-break: break-all;" data-bind="text:path,attr: {title: path }"></div>').appendTo($pickContainer);
                //开始上传按钮
                jquery('<button type="button" class="form-button start" style="display: none" data-bind="click:upload">start</button>').appendTo($pickContainer);
                //placeholder
                $placeholder = jquery('<div class="placeholder" data-bind="css:{solid:fileList().length>0}" ></div>').appendTo($uploadContainer);
                //$renameComponent
                $renameComponent = jquery('<div style="display:none" data-bind="compose:{model:renameComponent}"></div>').appendTo($uploadContainer);

                var _fileListHtml = '<ul class="filelist uploadModuleFlag">' +
                    '<!--ko foreach:fileList -->' +
                    '<li>' +
                    '<div class="inline-mask" data-bind="style: { width: $data.percent()+ \'%\'},visible:$data.statusText() != \'error\'"></div>' +
                    '<div class="inline-content">' +
                    '<img class="fileicon" data-bind="attr: { src: $data.icon}" onerror="this.src=\'external/icon-file-type/32/unknown.png\'; this.onerror=null;"/>' +
                    '<span class="filename vertical-mid" data-bind="text:$data.fullPath()+$data.name(),attr: {title: $data.fullPath()+$data.name() }"></span>' +
                    '<span class="filesize vertical-mid" data-bind="text:$data.size"></span>' +
                    '<span class="speedinfo vertical-mid" data-bind="text:$data.speedInfo,visible:$data.statusText() == \'progress\'"></span>' +

                    '<span class="status " data-bind="visible:$data.statusText() != \'complete\'&&$data.statusText() != \'error\'&&$data.statusText() != \'pausing\',attr:{title:$data.reason()},style:{ backgroundImage : \'url(scripts/lib/webuploader/\'+$data.statusText()+\'.png)\'},click:$root.paused"></span>' +//右侧状态，正在上传
                    '<span class="status " data-bind="visible:$data.statusText() == \'paused\',attr:{title:$data.reason()},style:{ backgroundImage : \'url(scripts/lib/webuploader/\'+$data.statusText()+\'.png)\'}"></span>' +//右侧状态，开始
                    '<span class="status " data-bind="visible:$data.statusText() == \'uploading\',attr:{title:$data.reason()},style:{ backgroundImage : \'url(scripts/lib/webuploader/\'+$data.statusText()+\'.png)\'}"></span>' +//右侧状态,暂停
                    '<span class="status " data-bind="visible:$data.statusText() != \'complete\'&&$data.statusText() == \'error\',attr:{title:$data.reason()},style:{ backgroundImage : \'url(scripts/lib/webuploader/ic_retry.png)\'},click:$root.retryFile"></span>' +//右侧状态，重传


                    '<span class="file-successinfo " data-bind="text:$data.folderRelativePath(),attr: {title: $data.name },visible:$data.statusText() == \'complete\'"></span>' +
                    '<span class="error" data-bind="text:$data.reason(),attr: {title: $data.reason() },visible:$data.statusText() == \'error\'"></span>' +//项中部，错误
                    '<span class="status_mid vertical-mid" style=\'width:48px\' data-bind="attr: {title: $data.name },text:$root.lang.suspend,visible:$data.statusText() == \'interrupt\'"></span>' +//项中部，已暂停
                    '<span class="status_mid vertical-mid" style=\'width:48px\' data-bind="attr: {title: $data.name },text:$root.lang.uploaded,visible:$data.statusText() == \'complete\'"></span>' +//项中部，已经传
                    '<span class="status_mid vertical-mid" style=\'width:48px\' data-bind="attr: {title: $data.name },text:$root.lang.queued,visible:$data.statusText() == \'queued\'"></span>' +//项中部，等待
                    '<span class="status_mid vertical-mid" style=\'width:48px\' data-bind="attr: {title: $data.name },text:$root.lang.secondPass,visible:$data.statusText() == \'secondPass\'"></span>' +//项中部，秒传
                    '<span class="status_mid vertical-mid" style=\'width:48px\' data-bind="attr: {title: $data.name },text:$root.lang.skip,visible:$data.statusText() == \'cancelled\'"></span>' +//项中部，已跳过
                    '</div>' +
                    '<span class="remove" data-bind="css:{ remove: ($data.statusText() != \'complete\'&&$data.statusText() != \'cancelled\'&&$data.statusText() != \'secondPass\'), success: ($data.statusText() == \'complete\'||$data.statusText() == \'cancelled\'||$data.statusText() == \'secondPass\')},click:$root.removeFile"></span>' +
                    '</li>' +
                    '<!--/ko-->';
                //ie9下flash.exec报错修复
                if ($.browser.msie9) {
                    _fileListHtml += '<li class="dnd-upload-button" data-bind="css:{\'webuploader-element-invisible\':fileList().length>0}"></li>';
                    _fileListHtml += '<li class="dnd-tip" data-bind="visible:runtime() != \'html5\' && fileList().length==0"><h1>' + $.format(lang.dndTip3, _fileNumLimit) + '</h1><p>' + lang.dndTip2 + '</p></li>';
                }
                else {
                    _fileListHtml += '<li class="dnd-upload-button" data-bind="visible:fileList().length==0" ></li>';
                    _fileListHtml += '<li class="dnd-tip" data-bind="visible:runtime() == \'html5\' && fileList().length==0"><h1>' + $.format(lang.dndTip1, _fileNumLimit) + '</h1></li>';
                }
                _fileListHtml += '</ul>';
                //文件列表
                $fileList = jquery(_fileListHtml).appendTo($placeholder);
                //文件选择器
                $filePicker = jquery('<div class="filePicker"></div>').appendTo($placeholder.find(".dnd-upload-button"));

                if (testWebkitdirectory()) {
                    $folderPicker = jquery('<div class="filePicker webuploader-container "  ></div>').appendTo($placeholder.find(".dnd-upload-button"));

                    $buttonFolder = jquery('<div class="webuploader-pick">' + lang.addFolder + '</div>').appendTo($folderPicker);
                    $inputFolderDiv = jquery('<div style="position: absolute; top: 0px; left: 0px; width: 120px; height: 36px; overflow: hidden; bottom: auto; right: auto;"></div>').appendTo($folderPicker);
                    $inputFolder = jquery('<input type="file" name="file" class="webuploader-element-invisible" style="display:none" webkitdirectory multiple />').appendTo($inputFolderDiv);
                    $labelFolder = jquery('<label style="opacity: 0; width: 100%; height: 100%; display: block; cursor: pointer; background: rgb(255, 255, 255);"></label>').appendTo($inputFolderDiv);

                    $labelFolder.on('click', function () {
                        $inputFolder.trigger('click');
                    });
                    $labelFolder.on('mouseenter mouseleave', function (e) {
                        switch (e.type) {
                            case 'mouseenter':
                                $buttonFolder.addClass('webuploader-pick-hover');
                                break;

                            case 'mouseleave':
                                $buttonFolder.removeClass('webuploader-pick-hover');
                                break;
                        }
                    });
                    $inputFolder.on('change', function (e) {
                        var files = e.target.files;
                        if (files && files.length > 0) {
                            files = $.map(files, function (file) {
                                var arr = file.webkitRelativePath.split('/');
                                if (arr && arr.length > 0) {
                                    arr = arr.slice(0, arr.length - 1);
                                    file.fullPath = "/" + arr.join('/') + "/";
                                }
                                return file;
                            });
                            uploader.addFile(files);
                            $inputFolder.val("");
                        }
                    });
                }
                //后台上传元素，先将元素附加到当前容器，让它和ko绑定，然后后边在把他移动到document.body上
                $mini = jquery('<div class="mini-upload" data-bind="visible:showWindow()&&(state()==\'uploading\'||state()==\'paused\'),attr: {title: miniInfo },click:clickShow"><img data-bind="attr:{src:\'scripts/lib/webuploader/\'+state()+\'.gif\'}" style="vertical-align: middle;height:14px" /><span data-bind="text:miniInfo" style="vertical-align: middle;line-height: 14px;"></span></div>').appendTo($uploadContainer);

                $fileList.css("position", "relative");
                $fileList.perfectScrollbar('update').perfectScrollbar();
            },
            attached: function (view, parent) {
                //后台上传元素移动到document.body
                $mini.appendTo(document.body);
                var urlParam = $.getQueryString("moduledata");
                if (urlParam) {

                    var wfData = JSON.parse(urlParam);
                    if (wfData && wfData.datas && wfData.datas.multiple) {
                        uploadMultiple(wfData.datas.multiple);
                    }
                    if (wfData && wfData.datas && wfData.datas.fileNum) {
                        uploadFilesNum(wfData.datas.fileNum);
                    }
                    if (wfData && wfData.datas && wfData.datas.accept) {
                        uploadAccept=wfData.datas.accept;
                    }
                }
                //初始化
                init();
                $("ul.filelist.uploadModuleFlag").perfectScrollbar('update');
            },
            compositionComplete: function (view, parent) {
                if(/^#system/.test(window.location.hash)){
                    app.trigger('templatelist:reload', 'Refresh');
                }
                var msg = {
                    module: "update",
                    message: "team"
                };
                app.trigger('upload:init', msg);
                //监控文件夹id改变
                app.on("upload:init").then(function (node) {
                    var selectEntry = node.select[0];
                    //忽略不是文件夹的消息
                    if (constInfo.getObjType(selectEntry) !== "folder") {
                        return;
                    }
                    //相对路径 声明，后边赋值
                    selectEntry.relativePath = "";

                    selectEntry.masterFile = ko.observable();
                    if (selectEntry.data) {
                        selectEntry = $.extend({}, selectEntry, selectEntry.data);
                    }
                    //得到消息中的文件夹对象，并保存下来
                    if (!selectEntry.name) {
                        selectEntry.name = "folder name empty";
                    }
                    var tmp = komapping.fromJS(selectEntry);
                    currentFolder(tmp);
                });

                //监控是否组件显示
                app.on("upload:show").then(function (node) {
                    if (node.isOutpublish) {
                        isOuPublish = true;
                    }
                    if (node.rootFolderName) {
                        rootFolderName = node.rootFolderName;
                    }
                    var $parent = ko.dataFor(parent);
                    module = $parent.moduleName();
                    selectData = $parent.datas();
                    message = $parent.message();
                    if (module === "favoritelist") {
                        var data = process.IsProcessStrategy(selectData, 1);
                        if (data.IsProcessStrategy) {
                            node.window = false;
                            isProcess = true;
                            app.trigger("message:show", { type: 'error', message: lang.ProcessEnabled });
                            return;
                        }
                    }
                    if (module === "enterprise") {
                        if (process.getProcessStrategy(selectData, "create")) {
                            node.window = false;
                            isProcess = true;
                            return;
                        }
                    }
                    isAttachFile=false;
                    //显示窗口
                    if (node.showWindow) {
                        //如果浏览器支持选择本地文件夹，并且通过参数传递，是需要显示文件夹选择功能
                        if (testWebkitdirectory() && node.localFolderSelect) {
                            $placeholder.find(".webuploader-container").css('display', 'inline-block').css('margin', '0 10px');
                        }
                        else if ($folderPicker){
                            $folderPicker.css('display', 'none');
                        }
                        //附件
                        if (node.masterFile) {
                            isAttachFile=true;
                            var tempFolder = {};
                            tempFolder.id = 3;//附件文件夹id
                            tempFolder.name = "Attachment";
                            tempFolder.relativePath = "";
                            tempFolder.path = node.masterFile.path().substr(0, node.masterFile.path().length - 1);//去掉最后一个\
                            previousFolder.fromJS(tempFolder);
                            previousFolder().masterFile = ko.observable(node.masterFile);

                            //modify: 2027-12-07 haibin.long 处理 预览界面 关联附加 功能没有currentFolder的Bug
                            if (currentFolder()) {
                                //切换文件夹
                                switchFolder(currentFolder(), previousFolder());
                            } else {
                                //currentFolder不存的情况，为预览界面 关联附加 功能触发
                                currentFolder = previousFolder;
                            }
                        }
                        //特定文件夹，被调用时|eform调用时不调用
                        if (!node.isEformEnv && node.folder) {
                            //app.trigger("upload:show", { showWindow: true, folder: { id:1, name:"企业内容库", path:"1" } });//至少有id name path
                            node.folder.relativePath = "";
                            previousFolder.fromJS(node.folder);

                            //切换文件夹
                            switchFolder(currentFolder(), previousFolder());
                        }
                        if (node.isEformEnv) {
                            var _eformFolder = {
                                id: node.folder.id,
                                name: node.folder.name,
                                path: node.folder.path,
                                relativePath: node.folder.relativePath,
                                masterFile: ko.observable(),
                                strategy: node.strategy,
                                operateType: node.operateType,
                                updateFileId: node.updateFileId,
                                namePath: node.folder.namePath, //个人库需要
                                parentFolderId: node.folder.parentFolderId
                            };
                            isEformEnv = node.isEformEnv;
                            isCrossDomain = node.isCrossDomain;
                            currentFolder(komapping.fromJS(_eformFolder));

                        }

                        if (!currentFolder() || !currentFolder().path()) {
                            return;
                        }
                        //将值取反转换成dialog需要的值
                        showWindow(!node.showWindow);
                        //20180906 liqi 流程上传控件显示问题
                        var urlParam = $.getQueryString("moduledata");
                        if (urlParam) {
                            var wfData = JSON.parse(urlParam);
                            if (wfData && wfData.datas && wfData.datas.isEformEnv) {
                                $('.panel.window').addClass('isEformEnvAttachmentList');
                            }
                        }

                        //modify:2017-11-22 haibin.long 更新滚动条
                        $("ul.filelist.uploadModuleFlag").perfectScrollbar('update');
                        //modify: 2018-07-09 haibin.long 对接eform的文档上传控件
                        if ($parent.moduleDataType && ko.unwrap($parent.moduleDataType) === 'custom') {
                            $('#uploadContainer').closest('.window').css({
                                top: 0
                            });
                        }
                        //只有显示窗口的时候才去取路径，减少请求
                        constInfo.getFolderRelativePath(currentFolder().path()).done(function (path) {
                            if (node.masterFile) {
                                currentFolder().relativePath($.format("{0}\\{1}", path, node.masterFile.name()));
                            }
                            else {
                                currentFolder().relativePath(path);
                            }
                        });
                    }
                });

                //	$fileList.perfectScrollbar('update').perfectScrollbar();
            },
            activate: function () {
                $("ul.filelist.uploadModuleFlag").perfectScrollbar('update');
            },
            //删除文件
            removeFile: function (data) {
                removeFile(data);
            },
            //gs:增加暂停ui
            paused: function (data) {
                paused(data);
            },
            //增加重试ui
            retryFile: function (data) {
                retryFile(data);
            }
        };
    });
