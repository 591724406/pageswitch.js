(function($){
	var privateFun = function(){
		//
	}
	/* 获取浏览器前缀 */ 
	var _prefix = (function(temp){
		var aPrefix = ["webkit","Moz","o","ms"];
			props = "";
		for(var i = 0; i < aPrefix.length; i++){
			props = aPrefix[i] + "Transition";
			if (temp.style[props] != undefined) {
				return "-" + aPrefix[i].toLowerCase()+ "-";
			}
		}
		return false;
	})(document.createElement(pageswitch));
	var pageswitch = (function(){
		function pageswitch(element,options){
			this.settins = $.extend(true,$.fn.pageswitch.defaults,options||{});
			this.element = element;
			this.init();
		}
		pageswitch.prototype = {
			/* 初始化插件 */ 
			init : function(){
				var me = this;
				me.selectors = me.settins.selectors;
				me.sections = me.element.find(me.selectors.sections);
				me.section = me.sections.find(me.selectors.section);

				me.direction = me.settins.direction == "vertical"?true:false;
				me.pagesCount = me.pagesCount();
				me.index = (me.settins.index>=0 && me.settins.index < me.pagesCount)? me.settins.index : 0;

				me.canScroll = true;
				if (!me.direction) {
					me._initLayout();
				}
				if (me.settins.pagination) {
					me._initPaging();
				}

				me._initEvent();
			},
			/* 获取滑动页面数量 */ 
			pagesCount:function(){
				return this.section.length;
			},
			/* 获取滑动的宽度或高度 */ 
			switchLength : function(){
				return this.direction ? this.element.height() : this.element.width();
			},
			/* 上一页方法 */
			prev : function(){
				var me = this;
				if (me.canScroll) {
                    if (me.index > 0) {
                        me.index--;
                    } else if (me.settins.loop) {
                        me.index = me.pagesCount - 1;
                    }
                    me._scrollPage();
                }
			},
			/* 下一页方法 */
			next : function(){
				var me = this;
                if (me.canScroll) {
                    if (me.index < me.pagesCount - 1) {
                        me.index++;
                    } else if (me.settins.loop) {
                        me.index = 0;
                    }
                    me._scrollPage();
                }
			} ,
			/* 主要针对横屏情况进行页面布局 */ 
			_initLayout : function(){
				var me = this;
				var width=(me.pagesCount * 100) + "%",
					cellWidth = (100 / me.pagesCounts).toFixed(2) + "%";
				me.sections.width(width);
				me.section.width(cellWidth).css("float","left");
			},
			/* 实现分页的dom结构以及css样式 */ 
			_initPaging : function(){
				var me = this;
					pageClass = me.selectors.page.substring(1);
				me.activeClass = me.selectors.active.substring(1);
				var pageHtml = "<ul class="+pageClass+">";
				for (var i=0;i<me.pagesCount;i++) {
					pageHtml +="<li></li>";
				}
				pageHtml +="</ul>";
				me.element.append(pageHtml);
				var pages = me.element.find("ul" + me.selectors.page);
				me.pageItme = pages.find("li");
				me.pageItme.eq(me.index).addClass(me.activeClass);
				if (me.direction) {
					pages.addClass("vertical");
				}
				else{
					pages.addClass("horizontal");
				}
			},
			/* 初始化插件事件 */ 
			_initEvent : function(){
				var me = this;
				me.element.on("click",me.element.pages+"li",function(){
					me.index = $(this).index();
					me._scrollPage();
				});
				me.element.on("mousewheel DOMmouseScroll",function(e){
					if (me.canScroll) {
						var delta = e.originalEvent.wheelDelta || -e.originalEvent.wheelDelta;
						if (delta > 0 && (me.index && !me.settins.loop || me.settins.loop)) {
							me.prev();
						}else if(delta < 0 && ( me.index < (me.pagesCount-1) && !me.settins.loop || me.settins.loop)){
							me.next();
						}
					}	
				});
				if (me.settins.keyboard) {
					$(window).on("keydown",function(e){
						var keyCode = e.keyCode;
						if (keyCode == 37 || keyCode == 38) {
							me.prev();
						}else if(keyCode == 39 || keyCode == 40){
							me.next();
						}
					});
				};
				$(window).resize(function(){
					var currentLength = me.switchLength();
						offset = me.settins.vertical ? me.section.eq(me.index).offset().top : me.section.eq(me.index).offset().left;
					if (Math.abs(offset) > currentLength/2 && me.index < (me.pagesCount-1)) {
						me.index ++;
					}
					if (me.index) {
						me._scrollPage();
					}
				});
				me.sections.on("webkitTransitionEnd msTransitionend mozTransitionend transitionend",function(){
					me.canScroll = true;
					if (me.settins.callback &&　$.type(me.settins.callback) == "function") {
						me.settins.callback(); 
					}
				})
			},
			/* 滑动动画 */
			_scrollPage : function(){
				var me = this;
					dest = me.section.eq(me.index).position();
				if (!dest) return;
				me.canScroll = false;
				if (_prefix) {
					me.sections.css(_prefix + "transition", "all " + me.settins.duration + "ms " + me.settins.easing);
					var translate = me.direction? "translateY(-"+dest.top+"px)":"translateX(-"+dest.left+"px)";
					me.sections.css(_prefix+ "transform" ,translate);
				}else{
					var animateCss = me.direction ? {top : -dest.top} : {left : -dest.left};
                    me.sections.animate(animateCss, me.settins.duration, function () {
                        me.canScroll = true;
                        if (me.settins.callback&&$.type(me.settins.callback) == "function") {
							me.settins.callback(); 
						}
                    })
				}
				if (me.settins.pagination) {
					me.pageItme.eq(me.index).addClass(me.activeClass).siblings("li").removeClass(me.activeClass);
				}
			} 
		};
		return pageswitch;
	})();
	$.fn.pageswitch = function(options){
		return this.each(function(){
			var me = $(this),
			instance = me.data("pageswitch");
			if (!instance) {
				instance = new pageswitch(me,options);
				me.data("pageswitch",instance);
			}
			if ($.type(options) == "string") return instance[options]();
		})
	}
	$.fn.pageswitch.defaults = {
		selectors:{
			sections :".sections",
			section :".section",
			page : ".page",
			active : ".active"
		},
		index : 0, //页面开始
		easing : "ease", //动画效果
		duration :500, //动画时间
		loop : true, //是否循环
		pagination : true, //是否进行分页
		keyboard : true, //键盘事件
		direction : "vertical", //滑动方向 horizontal
		callback : "" //回调函数
	}
	$(function(){
		$("[data-pageswitch]").pageswitch();
	})
})(jQuery);