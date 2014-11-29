/**
 * 基于zepto的 lazydata
 * 
 * ref: https://github.com/kissygalleryteam/lazyload/blob/master/2.0.0/index.js
 *
 * @todo 优化
 * ref: https://github.com/kissygalleryteam/datalazyload
 * 
 * @method Lazyload
 * @author huixisheng
 * @version [version]
 * @date    2014-09-24
 * @return  {[type]}   [description]
 * @public
 */
;(function(){
    var win = window;

    function Lazyload( options ){
        var settings = {
            threshold: 0, // 临界点
            events: 'scroll touchmove resize',
            effect: 'show',
            container: document,
            attribute: 'data-lazyload',
            load: null,
            complete: null
        };

        var config = $.extend( settings, options );
        this.config = config;
        this.container = $( config.container );
        this._containerIsDocument = this.container[0].nodeType == 9;
        this.lazyElements = this._getLazyElements();

        this._loadElements();
        this.resume();
    }

    Lazyload.prototype = {
        _loadElements: function(){
            var self = this;
            var container = self.container;
            var lazyElements = self.lazyElements;
            var completeCallback = self.config.complete;

            if( !self._containerIsDocument && !container.width() ){
                return;
            }



            for(var i = 0; i < lazyElements.length; i++){
                var element = lazyElements[i];
                if( self.isInViewport( element ) ){
                    self.renderElement( element );
                    lazyElements.splice(i--, 1);
                }
            }

            if( lazyElements.length < 1 ){
                // 添加 loadCallback
                if( $.isFunction(completeCallback) ){
                    completeCallback.call(self);
                }
                self.destroy();
            }
        },

        _getLazyElements: function(){
            var self = this;
            var config = self.config;
            var container = self.container;

            var elements = container.find("[" + config.attribute +"]");

            return Array.prototype.slice.call( elements );
        },

        // 判断element 是否在可视范围内
        isInViewport: function(element){
            var self = this;
            var config = self.config;
            var container = self.container;
            var isDoc = self._containerIsDocument;
            var threshold = config.threshold;
            var $el = $(element);
            var elOffset = $el.offset();
            
            var isBelow; // 是否在视窗的下方
            var isAbove; // 是否在视窗的上方
            var isLeft; // 是否在视窗的左边
            var isRight; // 是否在视窗右边
            // debugger;
            if( isDoc ){
                var w = win.innerWidth;
                var h = win.innerHeight;
                var x = win.scrollX;
                var y = win.scrollY;
                // 这个判断有点绕，画画图就容易理解
                isBelow = h + y + threshold <= elOffset.top;
                isRight = w + x + threshold <= elOffset.left
                isAbove = y >= elOffset.top + $el.height() + threshold;
                isLeft = x >= elOffset.left + $el.width() + threshold;

            } else {
                //debugger;
                var scrollTop = container.scrollTop();
                var scrollLeft = container.scrollLeft();
                var containerOffset = container.offset();
                var w = container.width();
                var h = container.height();
                // 个人觉得 kissy的lazyload 的这部分代码的临界点的设置有问题的
                // @todo 
                isBelow = h +  threshold + scrollTop <= scrollTop + elOffset.top - containerOffset.top;
                isRight = w  + threshold +  scrollLeft <= elOffset.left - containerOffset.left + scrollLeft;
                isAbove = 0 >= elOffset.top - containerOffset.top + $el.height() + threshold;
                isLeft = 0 >= elOffset.left - containerOffset.left + $el.width() + threshold;

            }

            return !isBelow && !isRight && !isAbove && !isLeft;

        },

        pause: function(){
            var self = this;
            var events = self.config.events;
            var load = self._loadElements;

            $(win).off(events, load );
            if( self._containerIsDocument ){
                self.container.off(events, load );
            }
        },

        resume: function(){
            var self = this;
            var events = self.config.events;
            var load = self._loadElements;

            $(win).on(events, $.proxy(load, self) );
            if( !self._containerIsDocument ){
                self.container.on(events, $.proxy(load, self) );
            }
        },

        // 渲染可视范围的element
        renderElement: function(element){
            var self = this;
            var config = self.config;
            var nodeName = element.nodeName.toUpperCase();
            var $el = $(element);
            var loadCallback = config.load;

            // @todo background
            if( nodeName == 'IMG' ){
                // @todo img onload callback
                var src = $el.attr( config.attribute );
                $el.attr('src', src);
            } else if( nodeName == 'TEXTAREA' ){
                var html = $el.html();
                var $wrap = $('<div/>');
                $wrap.html( html ).insertBefore( $el );
                $el.hide();
            } else {
                return ;
            }

            // 添加 loadCallback
            if( $.isFunction(loadCallback) ){
                loadCallback.call(this, element);
            }
            
        },
        destroy: function(){
            this.pause();
        }
    }

    window.Lazyload = Lazyload;

})()