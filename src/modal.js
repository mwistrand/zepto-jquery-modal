window.u$ || (window.u$ = {});

(function($, window, document, ns) {
'use strict';

ns || (ns = window);

var overlay,

  // Only one modal will be open at a time, and we'll keep track
  // of that modal here for all instances...
  current,

  isInstanceOf$ = function(obj) {
    return (window.Zepto) ? $.zepto.isZ(obj) : (obj instanceof $);
  },

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
     * A Backbone style events object that will be integrated
     * with the `modal` object (on instantiation, via `$.extend`).
     * Any such object must implement a `trigger` function in order
     * to function properly.
     */
    events: null,

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
     * The CSS class applied to all modals.
     */
    triggerClass: 'js-triggerModal'
  },

  initialize = function(triggers, options) {
    this.options = $.extend({}, this.options, (options || null));

    // The only event that will always be attached is the
    // "close modal" event.
    this.attachModalEvents();

    if (triggers || this.options.modals || this.options.url) {
      if (triggers === null) {
        this.load(null, 0);
      } else {
        this.triggers = triggers;
        this.attach(triggers);
      }
    }
  },

  // Creates a `$` object from an array/string of data
  // and injects it into the optional parent.
  renderElement = function(info, parent, prepend) {
    var elem = $.isArray(info) ? $.apply($, info) : $(info),
      method = prepend ? 'prependTo' : 'appendTo';

    if (parent) {
      elem[method](parent);
    }

    return elem;
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

    function setHTML(template, item, container) {
      var html = template.replace(pattern, function(matched, key) {
        var replacement = item[key];

        return replacement || '';
      });

      if (html.length) {
        $(html).appendTo(container);
      }
    }

    return function(template, data, container) {
      container.html('');

      if ($.isArray(data)) {
        data.forEach(function(item) {
          setHTML(template, item, container);
        });
      } else {
        setHTML(template, data, container);
      }
    };
  })(),

  setEvent = (function() {

    var callbacks = {
      /*show: function(e) {
        var trigger = $(e.target),
          cssClass = this.options.triggerClass;

        if (!trigger.hasClass(cssClass)) {
          trigger = trigger.parent('.' + cssClass).eq(0);
        }

        if (trigger.length) {
          e.preventDefault();

          this.show(trigger);
        }
      },*/

      show: function(e) {
        var trigger = $(e.target),
          cssClass = this.options.triggerClass,
          show = true;

        if ($.isFunction(cssClass)) {
          show = cssClass(trigger);
        } else if (!trigger.hasClass(cssClass)) {
          trigger = trigger.parent('.' + cssClass).eq(0);
          show = !!trigger.length;
        }

        if (show) {
          e.preventDefault();

          this.load(trigger);
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
    options: defaults,

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

    load: function(trigger, i) {
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

      this.show(modal, trigger);
    },

    show: function(modal, trigger) {
      current = modal;

      modal.removeClass('is-invisible');

      if (this.options.events) {
        this.trigger('show', modal, trigger);
      }
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
    options: $.extend({}, defaults, {
      // responseType: 'json', /* default; or 'HTML'*/
      // query: '' || function(trigger) {},
      // template: '<div>{{field}}</div>' || function(container, data) {}

      cache: true,
      modals: ['<div />', {
        'class': 'js-modal'
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

    load: function(trigger) {
      var query = this.options.query,
        cache;

      if ($.isFunction(query)) {
        query = query(trigger);
      }

      cache = this.getCache(query);

      if (cache) {
        this.show(cache);
      } else {
        $.ajax({
          url: this.options.url,
          success: function(data, status, xhr) {
            this.setCache(query, xhr.responseText);
            this.show(xhr.responseText);
          }.bind(this)
        });
      }
    },

    show: function(response) {
      var method = 'render' + ((this.options.responseType === 'html') ?
          'HTML' : 'JSON');
      this.modals || (this.modals = renderElement(this.options.modals,
          $(document.body)));

      this[method](this.modals.eq(0), response);
    },

    renderJSON: function(modal, json) {
      var obj = $.parseJSON(json),
        template = this.options.template;

      if ($.isFunction(template)) {
        template(modal, obj);
      } else {
        render(template, obj, modal);
      }
    },
    
    renderHTML: function(modal, response) {
      modal.html(response);
    }
  });

ns.modal = function(triggers, options) {
  var proto = modalProto,
    instance;

  if (!isInstanceOf$(triggers)) {
    options = triggers;
    triggers = null;
  }

  if (options && options.url) {
    proto = ajaxModalProto;
  }

  instance = Object.create(proto);

  if (options && options.events) {
    $.extend(instance, options.events);
  }

  initialize.call(instance, triggers, options);

  return instance;
};

})((window.Zepto || window.jQuery), window, document, u$);