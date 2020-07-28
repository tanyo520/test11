define(["knockout", "jquery"], function (ko, $) {
    function getHeight(height) {
        if (height) {
            return height + 'px';
        }
        return 'auto';
    }

    function model() {
        return {
            //属性
            vm: {
                content: ko.observable('')
            },
            //方法
            vf: {
                getHeight: getHeight
            },
            //数据绑定开始前
            activate: function () {

            },
            //数据绑定时
            binding: function () {
                this.vm.content('binding');
            },
            //数据绑定完成
            bindingComplete: function () {

            },
            //加载到父级dom后执行
            attached: function () {

            },
            //全部组装完成后执行
            compositionComplete: function () {

            },
            //从dom移除后执行
            detached: function () {

            }
        };
    }
    return model;
});