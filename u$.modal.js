window.u$||(window.u$={}),function(a,b,c,d){"use strict";d||(d=b);var e,f,g={clickOverlayToClose:!0,closeParams:'<a class="closeModal">close</a>',destroyOnClose:!1,escapeClose:!0,eventNamespace:null,events:null,isLightbox:!0,modals:null,overlayParams:'<div class="overlay"></div>',triggerClass:"js-triggerModal"},h=function(b,d){this.options=a.extend({},this.options,d||null),this.$body=a(c.body),this.attachModalEvents(),(b||this.options.modals||this.options.url)&&(null===b?this.load(null,0):(this.$triggers=b,this.attach(b)))},i=function(){var b={clickOverlay:function(){e.data("clickToClose")&&this.hide()},close:function(a){a.preventDefault(),this.hide()},escapeClose:function(a){27===a.which&&this.hide()},show:function(b){var c=a(b.target),d=this.options.triggerClass,e=!0;a.isFunction(d)?e=d(c):c.hasClass(d)||(c=c.parent("."+d).eq(0),e=!!c.length),e&&(b.preventDefault(),this.load(c))}};return function(c,d,e,f){var g=(this.options.eventNamespace||"")+"Modal."+c+"Event",h=a.proxy(b[c],this);d.on((f||"click")+"."+g,e,h)}}(),j={options:g,attach:function(a){i.call(this,"show",a,"."+this.options.triggerClass)},attachModalEvents:function(){i.call(this,"close",this.$body,".js-closeModal"),i.call(this,"clickOverlay",this.$body,".js-overlay"),this.options.escapeClose&&i.call(this,"escapeClose",this.$body,null,"keyup")},detach:function(a){var b,c=(this.options.eventNamespace||"")+"Modal";a&&a.length?(a.removeClass(this.options.triggerClass),this.$triggers=this.$triggers.not(a)):(b=u$.detach(this,c,"$modals","$triggers","$body"),b.pop()),b||(b=[a]),b.unshift("detach"),this.emit.apply(this,b)},add:function(a,b){this.$triggers&&b===!1?a.addClass(this.options.triggerClass):(this.$triggers=this.$triggers?this.$triggers.add(a):a,this.attach(a))},load:function(b,c){var d,e,f=b?b.data("modalindex"):c;"number"!=typeof f?(e="#"+b.data("modalid"),d=this.$modals&&this.$modals.filter(e),f=d&&d.length?d.index(this.$modals):-1,-1===f&&(f=this.$modals&&this.$modals.length||0,d=a(e),this.$modals=f?this.$modals.add(d):d),b.data("modalindex",f)):(this.$modals||(this.$modals=a(this.options.modals)),d=this.$modals.eq(f)),this.show(d,b)},beforeShow:function(a,b){f=a,this.emit("beforeShow",a,b,e)},render:function(a,b){this.setCloseLink(a),this.center(a).removeClass("is-invisible"),this.showOverlay(),this.emit("show",a,b,e)},center:function(a){return a.addClass("centered"),b.jQuery&&a.css({marginTop:-a.outerHeight()/2+"px",marginLeft:-a.outerWidth()/2+"px"}),a},show:function(a,b){this.beforeShow(a,b),this.render(a,b)},showOverlay:function(){this.options.isLightbox&&(e||(e=u$.render(this.$body,this.options.overlayParams),e.addClass("js-overlay")),e.removeClass("is-invisible").data("clickToClose",!!this.options.clickOverlayToClose))},hide:function(){f&&(this.emit("beforeHide",f,e),this.options.destroyOnClose?(this.$modals=this.$modals.not(f.get(0)),f.empty().remove(),f=null):f.addClass("is-invisible"),e&&e.addClass("is-invisible"),this.emit("hide",f,e)),f=null},setCloseLink:function(a){this.options.closeParams&&!a.find(".js-closeModal").length&&u$.render(a,this.options.closeParams,!0).addClass("js-closeModal")},emit:function(b){var c=this.options.events,d=c?0:1,e=c?this.trigger:this.options[b];a.isFunction(e)&&e.apply(this,[].slice.call(arguments,d))}},k=a.extend(Object.create(j),u$.cacheMixin,u$.loaderMixin,{options:a.extend({},g,{cache:!0,modals:["<div />",{"class":"modal js-modal"}]}),load:function(b){var c,d=this.options.query;a.isFunction(d)&&(d=d(b)),c=this.getCache(d),c?this.show(c,b):a.ajax({url:this.options.url,data:d,beforeSend:function(a,c){this.showLoader(this.showOverlay),this.emit("beforeSend",b,a,c)}.bind(this),success:function(a,c,e){this.hideLoader(),this.setCache(d,e.responseText),this.show(e.responseText,b)}.bind(this),error:function(a,c,d){this.emit("ajaxError",b,a,c,d)}.bind(this)})},show:function(a,b){var c=this.setModal();this.beforeShow(c,b),"json"===this.options.responseType?u$.renderJSON(c,a,this.options.template):c.html(a),this.render(c,b)},setModal:function(){return this.$modals||(this.$modals=u$.render(this.$body,this.options.modals)),this.$modals.eq(0)}});d.modal=function(b,c){var d,e=j;return u$.is$(b)||(c=b,b=null),c&&c.url&&(e=k),d=Object.create(e),c&&c.events&&a.extend(d,c.events),h.call(d,b,c),d}}(window.Zepto||window.jQuery,window,document,u$);