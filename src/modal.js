window.u$ || (window.u$ = {});

(function($, window, document, ns, eventProto) {
'use strict';

ns || (ns = window);

var overlay,

  // Only one modal will be open at a time, and we'll keep track
  // of that modal here for all instances...
  current,

  defaults = {
    
    /**
     * The class name for any element that will cause the current
     * modal to be closed.
     */
    closeClass: 'js-closeModal',

    /**
     * Should the current modal window be completely removed
     * from the DOM when closed?
     */
    destroyOnClose: false,

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
     * The CSS class applied to all modals.
     */
    triggerClass: 'js-triggerModal'
  },
  
  initialize = function(triggers, options) {
    this.options = $.extend({}, defaults, (options || null));

    // The only event that will always be attached is the
    // "close modal" event.
    this.attachModalEvents();

    if (triggers || this.options.modals) {
      if (triggers === null) {
        this.show(null, 0);
      } else {
        this.triggers = triggers;
        this.attach(triggers);
      }
    }
  },

  setEvent = (function() {

    var callbacks = {
      show: function(e) {
        var trigger = $(e.target),
          cssClass = this.options.triggerClass;

        if (!trigger.hasClass(cssClass)) {
          trigger = trigger.parent('.' + cssClass).eq(0);
        }

        if (trigger.length) {
          e.preventDefault();

          this.show(trigger);
        }
      },

      close: function(e) {
        e.preventDefault();

        this.hide();
      }
    };

    return function(name, elems, sel) {
      var ns = (this.options.eventNamespace || '') + 'Modal:' + name + 'Event',
        callback = $.proxy(callbacks[name], this);
      
      elems.on('click.' + ns, sel, callback);
    };
  })(),

  modalProto = {
    attach: function(triggers) {
      setEvent.call(this, 'show', triggers, '.' + this.options.triggerClass);
    },

    attachModalEvents: function() {
      setEvent.call(this, 'close', $(document.body),
          '.' + this.options.closeClass);
    },

    /**
     * Detaches events from the passed-in trigger(s), or detaches all of
     * the `modal` instance events if no triggers are passed in.
     *
     * @param triggers The `$` element(s) from which to remove events.
     */
    detach: function(triggers) {
      var ns = (this.options.eventNamespace || '') + 'Modal:';//showEvent';

      if (triggers) {
        triggers.removeClass(this.options.triggerClass);
      } else {
        triggers = this.triggers;
        this.triggers = null;
        this.modals = null;

        $(document.body).off('click.' + ns + 'closeEvent');
      }

      triggers && triggers.off('click.' + ns + 'showEvent');
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

      current = modal;

      modal.removeClass('is-invisible');
    },

    hide: function() {

      if (current) {

        if (this.options.destroyOnClose) {
          current.empty().remove();
        } else {
          current.addClass('is-invisible');
        }
      }

      current = null;
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