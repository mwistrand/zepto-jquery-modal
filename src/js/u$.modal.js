window.u$ || (window.u$ = {});

(function($, window, document, ns) {
'use strict';

ns || (ns = window);

var $overlay,

  // Only one modal will be open at a time, and we'll keep track
  // of that modal here for all instances...
  $current,
  
  defaults = {
    // EVENTS
    // detach: function($modals, $triggers) {},
    // beforeShow: function($modal, $trigger, $overlay) {},
    // show: function($modal, $trigger, $overlay) {},
    // beforeHide: function($modal, $overlay) {},
    // hide: function($modal, $overlay) {},

    /**
     * If this is `true`, the modal can be closed by clicking the overlay.
     */
     clickOverlayToClose: true,

    /**
     * The data that will be used to create the "close" link/button.
     * Can be an HTML string, or an array of arguments to pass to `$`:
     *
       `closeParams: ['<a />', {'class': 'closeModal', text: 'close'}]
     *
     * The class `js-closeModal` will be added to this element, which
     * will be added as the first child to the modal.
     * If you don't want to use this, set this to null, but then
     * you'll be responsible for giving users an obvious way to close
     * the modal.
     */
    closeParams: '<a class="closeModal">close</a>',

    /**
     * Should the current modal window be completely removed
     * from the DOM when closed?
     */
    destroyOnClose: false,

    /**
     * Should hitting the 'esc' key close the modal?
     */
    escapeClose: true,

    /**
     * The prefix for the event namespace. The namespace is generated
     * as follows: `eventNamespace + 'Modal:' + name + 'Event'`
     * For example, 'myAppModal:showEvent'.
     */
    eventNamespace: null,

    /**
     * A Backbone style events object that will be integrated
     * with the `modal` object (on instantiation, via `$.extend`).
     * Any such object must implement a `trigger` method in order
     * to function properly.
     */
    events: null,

    /**
     * Will this be displayed with the overlay?
     */
    isLightbox: true,

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
        `modals: ['<div />', {
          'class': 'js-modal'
        }]`
     * - OR -
        `modals: '<div class="modal"></div>'`
     */
    modals: null,

    /**
     * The data that will be used to create the overlay element.
     * Can be an HTML string, or an array of arguments to pass to `$`:
     *
       `overlayParams: ['<div />', {'class': 'overlay'}]
     *
     * The class `js-overlay` will be added to this element.
     */
    overlayParams: '<div class="overlay"></div>',

    /**
     * The CSS class applied to all triggers.
     */
    triggerClass: 'js-triggerModal'
  },
  i = 0,
  initialize = function($triggers, options) {
    this.options = $.extend({}, this.options, (options || null));
    this.$body = $(document.body);
    this._i = ++i;
    // The only event that will always be attached is the
    // "close modal" event.
    this.attachModalEvents();

    if ($triggers || this.options.modals || this.options.url) {

      if ($triggers === null) {
        this.load(null, 0);
      } else {
        this.$triggers = $triggers;
        this.attach($triggers);
      }
    }
  },

  setEvent = (function() {
    var callbacks = {
      clickOverlay: function() {
        if ($overlay.data('clickToClose')) {
          this.hide();
        }
      },

      close: function(e) {
        e.preventDefault();

        this.hide();
      },

      escapeClose: function(e) {
        if (e.which === 27) {
          this.hide();
        }
      },

      show: function(e) {
        var $trigger = $(e.target),
          cssClass = this.options.triggerClass,
          show = true;

        if ($.isFunction(cssClass)) {
          show = cssClass($trigger);
        } else if (!$trigger.hasClass(cssClass)) {
          $trigger = $trigger.parent('.' + cssClass).eq(0);
          show = !!$trigger.length;
        }

        if (show) {
          e.preventDefault();

          this.load($trigger);
        }
      }
    };

    return function(name, $elems, sel, event) {
      var ns = (this.options.eventNamespace || '') + 'Modal.' + name + 'Event',
        callback = $.proxy(callbacks[name], this);
      
      $elems.on((event || 'click') + '.' + ns, sel, callback);
    };
  })(),

  modalProto = {
    options: defaults,

    attach: function($triggers) {
      setEvent.call(this, 'show', $triggers, '.' + this.options.triggerClass);
    },

    attachModalEvents: function() {
      setEvent.call(this, 'close', this.$body, '.js-closeModal');
      setEvent.call(this, 'clickOverlay', this.$body, '.js-overlay');

      if (this.options.escapeClose) {
        setEvent.call(this, 'escapeClose', this.$body, null, 'keyup');
      }
    },

    /**
     * Detaches events from the passed-in trigger(s), or detaches all of
     * the `modal` instance events if no triggers are passed in.
     *
     * @param triggers The `$` element(s) from which to remove events.
     */
    detach: function($triggers) {
      var ns = (this.options.eventNamespace || '') + 'Modal',
        args;

      if ($triggers && $triggers.length) {
        $triggers.removeClass(this.options.triggerClass);
        this.$triggers = this.$triggers.not($triggers);
      } else {
        args = u$.detach(this, ns, '$modals', '$triggers', '$body');
        args.pop(); // $body won't be passed to `this.emit`
      }

      args || (args = [$triggers]);
      args.unshift('detach');
      this.emit.apply(this, args);
    },

    /**
     * Adds new triggers to `this.$triggers` and attaches events. If
     * `isDelegate` is deliberately set to `false`, then it is assumed
     * that the passed-in triggers are child elements of existing triggers.
     *
     * @param $triggers The new elements that will trigger modals.
     * @param isDelegate Ignored by default. If set to Boolean `false`, then
     *        no click event will be added, just `this.options.triggerClass`.
     */
    add: function($triggers, isDelegate) {
      if (this.$triggers && isDelegate === false) {
        $triggers.addClass(this.options.triggerClass);
      } else {
        this.$triggers = this.$triggers?
            this.$triggers.add($triggers) : $triggers;
        
        this.attach($triggers);
      }
    },

    load: function($trigger, i) {
      var index = $trigger ? $trigger.data('modalindex') : i,
        $modal,
        modalId;

      if (typeof index !== 'number') {
        modalId = '#' + $trigger.data('modalid');
        $modal = this.$modals && this.$modals.filter(modalId);
        index = $modal && $modal.length ? $modal.index(this.$modals) : -1;
        
        if (index === -1) {
          index = this.$modals && this.$modals.length || 0;
          $modal = $(modalId);
          this.$modals = index ? this.$modals.add($modal) : $modal;
        }

        $trigger.data('modalindex', index);
      } else {
        this.$modals || (this.$modals = $(this.options.modals));
        $modal = this.$modals.eq(index);
      }

      this.show($modal, $trigger);
    },

    beforeShow: function($modal, $trigger) {
      $current = $modal;
      this.emit('beforeShow', $modal, $trigger, $overlay);
    },

    // this may not be the best name for the method
    render: function($modal, $trigger) {
      this.setCloseLink($modal);
      this.position($modal).removeClass('is-invisible');
      this.showOverlay();
      this.emit('show', $modal, $trigger, $overlay);
    },

    position: function($modal) {
      return $.cssDetect('transform') ? $modal : $modal.css({
        left: '50%',
        marginLeft: -$modal.outerWidth() / 2 + 'px',
        position: 'absolute',
        top: $(window).scrollTop() + 100 + 'px'
      });
    },

    show: function($modal, $trigger) {
      this.beforeShow($modal, $trigger);
      this.render($modal, $trigger);
    },

    showOverlay: function() {
      if (this.options.isLightbox) {

        if (!$overlay) {
          $overlay = u$.render(this.$body, this.options.overlayParams);

          $overlay.addClass('js-overlay');
        }

        $overlay.removeClass('is-invisible').data('clickToClose',
            !!this.options.clickOverlayToClose);
      }
    },

    hide: function() {
      if ($current) {
        this.emit('beforeHide', $current, $overlay);

        if (this.options.destroyOnClose) {
          this.$modals = this.$modals.not($current.get(0));
          $current.empty().remove();
          $current = null;
        } else {
          $current.addClass('is-invisible');
        }

        $overlay && $overlay.addClass('is-invisible');
        this.emit('hide', $current, $overlay);
      }

      $current = null;
    },

    setCloseLink: function($modal) {
      if (this.options.closeParams &&
          !$modal.find('.js-closeModal').length) {
        u$.render($modal, this.options.closeParams, true).
            addClass('js-closeModal');
      }
    },

    emit: function(name) {
      var events = this.options.events,
        start = events ? 0 : 1,
        method = events ? this.trigger : this.options[name];

      if ($.isFunction(method)) {
        method.apply(this, [].slice.call(arguments, start));
      }
    }
  },

  ajaxModalProto = $.extend(Object.create(modalProto), u$.cacheMixin,
      u$.loaderMixin, {

    options: $.extend({}, defaults, {
      // EVENTS
      // beforeSend: function($trigger, xhr, settings) {},
      // ajaxError: function($trigger, xhr, errorType, error) {},

      // loaderClass: 'loader--modal',
      // loaderHTML: '<div />'
      // responseType: 'html', /* default; or 'json'*/
      // query: '' || function($trigger) {},
      // template: '<div>{{field}}</div>' || function($container, data) {}

      cache: true,
      modals: ['<div />', {
        'class': 'modal js-modal'
      }]
    }),

    load: function($trigger) {
      var query = this.options.query,
        cache;

      if ($.isFunction(query)) {
        query = query($trigger);
      }

      cache = this.getCache(query);

      if (cache) {
        this.show(cache, $trigger);
      } else {
        $.ajax({
          url: this.options.url,
          data: query,
          beforeSend: function(xhr, settings) {
            this.showLoader(this.showOverlay);
            this.emit('beforeSend', $trigger, xhr, settings);
          }.bind(this),
          success: function(data, status, xhr) {
            this.hideLoader();
            this.setCache(query, xhr.responseText);
            this.show(xhr.responseText, $trigger);
          }.bind(this),
          error: function(xhr, errorType, error) {
            this.emit('ajaxError', $trigger, xhr, errorType, error);
          }.bind(this)
        });
      }
    },

    show: function(response, $trigger) {
      var $modal = this.setModal();

      this.beforeShow($modal, $trigger);

      if (this.options.responseType === 'json') {
        u$.renderJSON($modal, response, this.options.template);
      } else {
        $modal.html(response);
      }

      this.render($modal, $trigger);
    },

    setModal: function() {
      this.$modals || (this.$modals = u$.render(this.$body,
          this.options.modals));

      return this.$modals.eq(0);
    }
  });

ns.modal = function($triggers, options) {
  var proto = modalProto,
    instance;

  if (!u$.is$($triggers)) {
    options = $triggers;
    $triggers = null;
  }

  if (options && options.url) {
    proto = ajaxModalProto;
  }

  instance = Object.create(proto);

  if (options && options.events) {
    $.extend(instance, options.events);
  }

  initialize.call(instance, $triggers, options);

  return instance;
};

})((window.Zepto || window.jQuery), window, document, u$);