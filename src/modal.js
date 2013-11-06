window.u$ || (window.u$ = {});

(function($, window, document, ns, eventProto) {
'use strict';

ns || (ns = window);

var overlay,

  defaults = {
    
    /**
     * The prefix for the event namespace. The namespace is generated
     * as follows: `eventNamespace + 'Modal:' + name + 'Event'`
     * For example, 'myAppModal:showEvent'.
     */
    eventNamespace: null,

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
    modals: null,

    /**
     *
     */
    triggerSelector: '.js-triggerModal'
  },
  
  initialize = function(triggers, options) {
    this.options = $.extend({}, defaults, (options || null));

    if (triggers || this.options.modals) {
      if (triggers === null) {
        this.show(null, 0);
      } else {
        this.triggers = triggers;
        this.attach();
      }
    }
  },

  modalProto = {
    attach: function() {
      var ns = this.options.eventNamespace + 'Modal:showEvent',
        sel = this.options.triggerSelector,
        callback = $.proxy(function(e) {
          var trigger = $(e.target);

          if (!trigger.is(sel)) {
            trigger = trigger.parent(sel).eq(0);
          }

          if (trigger.length) {
            e.preventDefault();

            this.show(trigger);
          }
        }, this);

      this.triggers.on('click.' + ns, sel, callback);
    },

    loadModal: function(trigger, i) {
      var index = trigger ? trigger.data('modalindex') : i,
        modal;

      if (typeof index !== 'number') {
        index = this.modals && this.modals.length || 0;
        modal = $('#' + trigger.data('modalid'));
        this.modals = index ? this.modals.add(modal) : modal;
        trigger.data('modalindex', index);
      } else {
        this.modals || (this.modals = $(this.options.modals));
        modal = this.modals.eq(index);
      }
      return modal;
    },

    show: function(trigger, i) {
      var modal = this.loadModal(trigger, i);

      modal.removeClass('is-invisible');
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