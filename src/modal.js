window.u$ || (window.u$ = {});

(function($, window, document, ns, eventProto) {
'use strict';

ns || (ns = window);

var overlay,

  defaults = {

    /**
     * Either the existing modal `$` elements, a selector to fetch
     * existing modals from the DOM, or an HTML string that will be
     * passed to `$`, or an array of data that will be passed to `$`
     * to create a new modal when the AJAX data is fetched.
     *
        `modals: '.js-modal'`
     * - OR -
        `modals: $('.js-modal')`
     * - OR -
        `modals: ['div', {
          'class': 'js-modal'
        }]`
     * - OR -
        `modals: '<div class="modal"></div>'`
     */
    modals: null
  },
  
  initialize = function(triggers, options) {
    this.options = $.extend({}, defaults, (options || null));

    if (triggers === null) {
      this.show(0);
    } else {

    }
  },

  modalProto = {
    show: function(i) {
      this.modals || (this.modals = $(this.options.modals));
      this.modals.eq(i).removeClass('is-invisible');
    }
  },

  ajaxModalProto = $.extend({}, modalProto, {

  });

ns.modal = function(triggers, options) {
  var proto = modalProto,
    instance;

  if (!(triggers instanceof $)) {
    options = triggers;
    triggers = null;
  }

  if (options && options.url) {
    proto = ajaxModalProto;
  }

  instance = Object.create(proto);

  initialize.call(instance, triggers, options);

  return instance;
};

})((window.Zepto || window.jQuery), window, document, u$);