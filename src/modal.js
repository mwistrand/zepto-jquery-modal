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
    triggerClass: 'js-triggerModal'
  },
  
  initialize = function(triggers, options) {
    this.options = $.extend({}, defaults, (options || null));

    if (triggers || this.options.modals) {
      if (triggers === null) {
        this.show(null, 0);
      } else {
        this.triggers = triggers;
        this.attach(triggers);
      }
    }
  },

  modalProto = {
    attach: (function() {

      function clickEvent(e) {
        var trigger = $(e.target),
          cssClass = this.options.triggerClass;

        if (!trigger.hasClass(cssClass)) {
          trigger = trigger.parent('.' + cssClass).eq(0);
        }

        if (trigger.length) {
          e.preventDefault();

          this.show(trigger);
        }
      }

      return function(triggers) {
        var ns = this.options.eventNamespace + 'Modal:showEvent',
          sel = '.' + this.options.triggerClass,
          callback = $.proxy(clickEvent, this);
        
        triggers.on('click.' + ns, sel, callback);
      };
    })(),

    /**
     * Detaches events from the passed-in trigger(s), or detaches all of
     * the `modal` instance events if no triggers are passed in.
     *
     * @param triggers The `$` element(s) from which to remove events.
     */
    detach: function(triggers) {
      var ns = this.options.eventNamespace + 'Modal:showEvent';

      if (triggers) {
        triggers.removeClass(this.options.triggerClass);
      } else {
        triggers = this.triggers;
      }

      triggers.off('click.' + ns);
    },

    /**
     * Adds new triggers to `this.triggers` and attaches events. If
     * `isDelegate` is deliberately set to `false`, then it is assumed
     * that the passed-in triggers are child elements of existing triggers.
     *
     * @param triggers The new elements that will trigger modals.
     * @param isDelegate Ignored by default. If set to Boolean `false`, then
     *        no click event will be added, just `this.options.triggerClass`.
     */
    add: function(triggers, isDelegate) {

      if (this.triggers && isDelegate === false) {
        triggers.addClass(this.options.triggerClass);
      } else {
        this.triggers = this.triggers? this.triggers.add(triggers) : triggers;
        
        this.attach(triggers);
      }
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