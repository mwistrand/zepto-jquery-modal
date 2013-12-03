window.u$ || (window.u$ = {});

(function($, window, document, ns) {
'use strict';

ns || (ns = window);

var $overlay,

  $body,

  // Only one modal will be open at a time, and we'll keep track
  // of that modal here for all instances...
  $current,

  // Is the passed-in object a Zepto/jQuery object?
  isInstanceOf$ = function(obj) {
    return (window.Zepto) ? $.zepto.isZ(obj) : (obj instanceof $);
  },
  
  defaults = {

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
     * Any such object must implement a `trigger` function in order
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
     * The CSS class applied to all modals.
     */
    triggerClass: 'js-triggerModal'
  },

  initialize = function($triggers, options) {
    this.options = $.extend({}, this.options, (options || null));
    $body && $body.length || ($body = $(document.body));

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

  // Creates a `$` object from an array/string of data
  // and injects it into the optional parent.
  renderElement = function(info, parent, prepend) {
    var $elem = $.isArray(info) ? $.apply($, info) : $(info),
      method = prepend ? 'prependTo' : 'appendTo';

    if (parent) {
      $elem[method](parent);
    }

    return $elem;
  },

  // Used by `ajaxModalProto`. Provides basic template rendering capabilities.
  // 
  // Usage:
  //   `var template = '<div data-id="{{id}}">{{title}}</div>',
  //     data = [{'id': 12345, 'title': 'Lorem ipsum dolor sit amet'}];
  //   render(template, data, $('#container'));
  //
  render = (function() {
    var pattern = /\{\{([A-Za-z0-9\-_]+)\}\}/gi;

    function setHTML(template, item, $container) {
      var html = template.replace(pattern, function(matched, key) {
        var replacement = item[key];

        return replacement || '';
      });

      if (html.length) {
        $(html).appendTo($container);
      }
    }

    return function(template, data, $container) {
      $container.html('');

      if ($.isArray(data)) {
        data.forEach(function(item) {
          setHTML(template, item, $container);
        });
      } else {
        setHTML(template, data, $container);
      }
    };
  })(),

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
      var ns = (this.options.eventNamespace || '') + 'Modal:' + name + 'Event',
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
      setEvent.call(this, 'close', $body, '.js-closeModal');
      setEvent.call(this, 'clickOverlay', $body, '.js-overlay');

      if (this.options.escapeClose) {
        setEvent.call(this, 'escapeClose', $body, null, 'keyup');
      }
    },

    /**
     * Detaches events from the passed-in trigger(s), or detaches all of
     * the `modal` instance events if no triggers are passed in.
     *
     * @param triggers The `$` element(s) from which to remove events.
     */
    detach: function($triggers) {
      var ns = (this.options.eventNamespace || '') + 'Modal:',
        $modals;

      if ($triggers) {
        $triggers.removeClass(this.options.triggerClass);
      } else {
        this.hide();
        $triggers = this.$triggers;
        $modals = this.$modals;
        this.$triggers = null;
        this.$modals = null;

        $body.off('click.' + ns + 'closeEvent');
        $body.off('click.' + ns + 'clickOverlayEvent');
        $body.off('keyup.' + ns + 'escapeCloseEvent');
      }

      $triggers && $triggers.off('click.' + ns + 'showEvent');

      this.emit('detach', $modals, $triggers);
    },

    /**
     * Adds new triggers to `this.$triggers` and attaches events. If
     * `isDelegate` is deliberately set to `false`, then it is assumed
     * that the passed-in triggers are child elements of existing triggers.
     *
     * @param triggers The new elements that will trigger modals.
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
        $modal;

      if (typeof index !== 'number') {
        index = this.$modals && this.$modals.length || 0;
        $modal = $('#' + $trigger.data('modalid'));
        this.$modals = index ? this.$modals.add($modal) : $modal;
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

    render: function($modal, $trigger) {
      this.setCloseLink($modal);
      $modal.removeClass('is-invisible').center();
      this.showOverlay();
      this.emit('show', $modal, $trigger, $overlay);
    },

    show: function($modal, $trigger) {
      this.beforeShow($modal, $trigger);
      this.render($modal, $trigger);
    },

    showOverlay: function() {
      if (this.options.isLightbox) {

        if (!$overlay) {
          $overlay = renderElement(this.options.overlayParams,
              $body);

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
        renderElement(this.options.closeParams, $modal, true).
            addClass('js-closeModal');
      }
    },

    emit: function(name) {
      var events = this.options.events,
        start = events ? 0 : 1,
        method = events ? this.trigger : this.options['on' +
            name.charAt(0).toUpperCase() + name.slice(1)];

      if ($.isFunction(method)) {
        method.apply(this, [].slice.call(arguments, start));
      }
    }
  },

  ajaxModalProto = $.extend({}, modalProto, {
    options: $.extend({}, defaults, {
      // loaderClass: 'modal__loader',
      // loaderHTML: '<div />'
      // responseType: 'json', /* default; or 'HTML'*/
      // query: '' || function(trigger) {},
      // template: '<div>{{field}}</div>' || function(container, data) {}

      cache: true,
      modals: ['<div />', {
        'class': 'modal js-modal'
      }]
    }),

    setCache: function(key, data) {
      if (this.options.cache) {
        this._cache || (this._cache = {});
        this._cache[key] = data;
      }
    },

    getCache: function(key) {
      return this._cache && this._cache[key] || null;
    },

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
            this.showLoader();
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

    showLoader: function() {
      if (this.options.loaderClass) {
        this.showOverlay();
        this.$loader = $((this.options.loaderHTML || '<div />')).
            addClass(this.options.loaderClass);
      }
    },

    hideLoader: function() {
      if (this.$loader) {
        this.$loader.remove();
        this.$loader = null;
      }
    },

    show: function(response, $trigger) {
      var method = 'render' + ((this.options.responseType === 'html') ?
          'HTML' : 'JSON'),
        $modal = this.setModal();

      this.beforeShow($modal, $trigger);
      this[method]($modal, response);
      this.render($modal, $trigger);
    },

    setModal: function() {
      this.$modals || (this.$modals = renderElement(this.options.modals,
          $body));

      return this.$modals.eq(0);
    },

    renderJSON: function($modal, json) {
      var obj = $.parseJSON(json),
        template = this.options.template;

      if ($.isFunction(template)) {
        template($modal, obj);
      } else {
        render(template, obj, $modal);
      }
    },
    
    renderHTML: function($modal, response) {
      $modal.html(response);
    }
  });

ns.modal = function($triggers, options) {
  var proto = modalProto,
    instance;

  if (!isInstanceOf$($triggers)) {
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