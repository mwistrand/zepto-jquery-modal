/**
 * Tests not run:
 * 
 * # Is a close button automatically injected?
 * Since the `static.html` fixture does not include close
 * buttons, the tests provided to make sure the modal can
 * be closed implicitly require a close button to be
 * automatically included.
 */

describe('Zepto-Compatible jQuery Modal Box', function() {
  'use strict';

  var $triggers,
    $modals,
    instance;

  afterEach(function() {
    // `instance` is created in the `beforeEach` block of each
    // nested `describe` block.
    detach();
  });

  function detach() {
    instance.hide();
    instance.detach();
  }

  function triggerClose(i) {
    $modals.eq(i || 0).find('.js-closeModal').eq(0).trigger('click');
  }

  function triggerOpen(i) {
    $triggers.eq(i || 0).trigger('click');
  }

  function clickOverlay() {
    $('.js-overlay').trigger('click');
  }

  function before() {
    loadFixtures('static.html');
    $triggers = $('.js-triggerModal');
    $modals = $('.js-modal');
  }

  function after() {
    $triggers.empty().remove();
    $modals.empty().remove();
  }

  describe('An instance', function() {
    beforeEach(function() {
      before();
    });
    afterEach(function() {
      after();
    });

    it('can detach all events', function() {
      var e = $.Event('keyup');

      instance = u$.modal($(document.body));
      e.which = 27;

      // open and close the modal so the overlay is
      // actually available
      triggerOpen();
      triggerClose();

      spyOn(instance, 'show');
      instance.detach();

      expect(instance.$triggers).toBe(null);
      expect(instance.$modals).toBe(null);

      triggerOpen();
      expect(instance.show).not.toHaveBeenCalled();

      spyOn(instance, 'hide');
      clickOverlay();
      expect(instance.hide).not.toHaveBeenCalled();

      $(document.body).trigger(e);
      expect(instance.hide).not.toHaveBeenCalled();
    });
  });

  describe('A modal instance', function() {
    beforeEach(function() {
      before();
    });
    afterEach(function() {
      after();
    });

    describe('without triggers', function() {
      beforeEach(function() {
        instance = u$.modal({
          modals: $modals
        });
      });

      it('displays the modal immediately', function() {
        expect($modals.first()).not.toHaveClass('is-invisible');
      });

      it('displays only the first modal in the collection', function() {
        expect($modals.eq(1)).toHaveClass('is-invisible');
      });
    });

    describe('with triggers', function() {
      beforeEach(function() {
        instance = u$.modal($(document.body));
      });

      it('does not display the modal immediately', function() {
        expect($modals.first()).toHaveClass('is-invisible');
      });

      it('displayed the modal when a trigger is clicked', function() {
        triggerOpen();

        expect($modals.first()).not.toHaveClass('is-invisible');
      });

      it('can remove triggers from the instance', function() {
        instance.detach($triggers.first());
        triggerOpen();
        expect($modals.first()).toHaveClass('is-invisible');
      });

      it('can load trigger elements from a a function', function() {
        instance.options.triggerClass = function($trigger) {
          return $trigger.hasClass('js-triggerModal');
        };

        $triggers.first().trigger('click');
        expect($modals.first()).not.toHaveClass('is-invisible');
      });
    });

    describe('without modal elements', function() {
      beforeEach(function() {
        instance = u$.modal();
      });

      it('does not trigger anything on load', function() {
        expect($modals.first()).toHaveClass('is-invisible');
      });

      it('can add triggers to the instance', function() {
        instance.add($(document.body));
        triggerOpen();

        expect($modals.first()).not.toHaveClass('is-invisible');
      });
    });

    describe('without an overlay', function() {
      beforeEach(function() {
        instance = u$.modal({
          modals: $modals,
          isLightbox: false
        });
      });

      it('does not create an overlay element', function() {
        expect($('.js-overlay')).toHaveClass('is-invisible');
      });
    });

    describe('as a lightbox', function() {
      beforeEach(function() {
        instance = u$.modal({
          modals: $modals
        });
      });

      it('displays an overlay', function() {
        expect($('.js-overlay').length).toEqual(1);
      });
    });
  });

  describe('A modal', function() {
    beforeEach(function() {
      before();
    });
    afterEach(function() {
      after();
    });

    describe('without CSS transition support', function() {
      beforeEach(function() {
        spyOn($, 'cssDetect').andCallFake(function() {
          return false;
        });

        instance = u$.modal({
          modals: $modals
        });
      });

      it('manually positions the modal', function() {
        var marginLeft = parseInt($modals.first().css('margin-left'), 10);

        expect(Math.abs(marginLeft)).toBeGreaterThan(0);
      });
    });

    describe('with CSS transition support', function() {
      beforeEach(function() {
        spyOn($, 'cssDetect').andCallFake(function() {
          return true;
        });

        instance = u$.modal({
          modals: $modals
        });
      });

      it('allows the position to be set by a CSS class', function() {
        var marginLeft = parseInt($modals.first().css('margin-left'), 10);

        expect(marginLeft).toEqual(0);
      });
    });

    describe('when opened', function() {
      beforeEach(function() {
        instance = u$.modal($(document.body));
      });

      it('can be closed and removed from the DOM', function() {
        instance.options.destroyOnClose = true;
        triggerOpen();
        triggerClose();

        expect($modals.first().html()).toEqual('');
      });

      it('can be closed and preserved in the DOM', function() {
        triggerClose();

        expect($modals.first()).toHaveClass('is-invisible');
        
        triggerOpen();
        expect($modals.first()).not.toHaveClass('is-invisible');        
      });

      describe('with absolute positioning', function() {
        beforeEach(function() {
          instance.options.isFixed = false;
          $modals.first().css('position', 'absolute');
        });

        it('displays it at the top of the current scroll position', function() {
          triggerOpen();

          expect($modals.first().css('top')).toEqual($(window).scrollTop() + 100 + 'px');
        });

        it('offsets the modal from the top of the screen', function() {
          instance.options.offset = 200;
          triggerOpen();

          expect($modals.first().css('top')).toEqual($(window).scrollTop() + 200 + 'px');
        });
      });
    });
  });

  describe('An overlay', function() {
    beforeEach(function() {
      before();
    });
    afterEach(function() {
      after();
    });

    describe('when clicked', function() {
      beforeEach(function() {
        instance = u$.modal($(document.body));
      });

      it('can close a modal', function() {
        triggerOpen();
        clickOverlay();

        expect($modals.first()).toHaveClass('is-invisible');
      });

      it('can be set to leave the modal open', function() {
        instance.options.clickOverlayToClose = false;
        triggerOpen();
        clickOverlay();

        expect($modals.first()).not.toHaveClass('is-invisible');
      });
    });
  });

  describe('An Ajax Modal', function() {
    var html = '<a class="closeModal js-closeModal">close</a>' +
        '<div data-id="12345">Test modal contents</div>',
      jsonObj = '{"id": 12345, "text": "Test modal contents"}',
      jsonArr = '[{"id": 12345,"text": "Test modal contents"}]';

    beforeEach(function() {
      $triggers = setFixtures('<a class="js-triggerModal">Trigger Modal</a>').
          find('.js-triggerModal');
      instance = u$.modal($(document.body), {
        url: '../fixtures/json/modal.json',
        responseType: 'json',
        template: '<div data-id="{{id}}">{{text}}</div>'
      });
    });

    function openClose(instance) {
      if (instance) {
        triggerOpen();
        $modals = instance.$modals;
        triggerClose();
      }
    }

    it('can be generated with a JSON Array', function() {
      spyOn($, 'ajax').andCallFake(function(params) {
        params.success(null, null, {responseText: jsonArr});
      });

      triggerOpen();

      expect(instance.$modals.first().html()).toEqual(html);
    });

    it('can be generated with a JSON Object', function() {
      spyOn($, 'ajax').andCallFake(function(params) {
        params.success(null, null, {responseText: jsonObj});
      });

      triggerOpen();

      expect(instance.$modals.first().html()).toEqual(html);
    });

    it('can be generated from an HTML string', function() {
      instance.options.responseType = 'html';

      spyOn($, 'ajax').andCallFake(function(params) {
        params.success(null, null, {responseText: html});
      });

      triggerOpen();

      expect(instance.$modals.first().html()).toEqual(html);
    });

    it('can be generated from a template function', function() {
      var $div;
      
      appendLoadFixtures('template.html');

      instance.options.template = function($container, data) {
        var source = $('#handlebars-template').html(),
          template = Handlebars.compile(source);

        $container.html(template(data));
      };

      spyOn($, 'ajax').andCallFake(function(params) {
        params.success(null, null, {responseText: jsonObj});
      });

      triggerOpen();

      $div = instance.$modals.first().find('div');
      expect($div.data('id')).toEqual(12345);
      expect($div.text()).toEqual('Test modal contents');
    });

    it('can be rendered from the cache', function() {
      var i = 0,
        $modal;

      spyOn($, 'ajax').andCallFake(function(params) {
        i += 1;
        params.success(null, null, {responseText: jsonObj});
      });

      // 1. Load modal HTML from AJAX data
      // 2. Close the modal
      // 3. Clear out the modal HTML
      // 4. Reload the modal from cache
      openClose(instance);
      
      $modal = instance.$modals.first().html('');
      triggerOpen();

      expect(i).toBe(1);
      expect($modal.html()).toEqual(html);
    });

    it('can be displayed with an AJAX loader image', function() {
      instance.options.loaderClass = 'loader--modal';
      instance.showLoader();

      expect(instance.$loader).toHaveClass('loader--modal');

      instance.hideLoader();

      expect(instance.$loader).toBe(null);
    });
  });

  describe('Event Emitter', function() {
    var onShow;

    beforeEach(function() {
      onShow = jasmine.createSpy('onShow');
 
      instance = u$.modal({
        events: Backbone.Events
      });
    });

    it('can take a Backbone-style events object', function() {
      instance.on('show', onShow);

      instance.show($modals.first());

      expect(onShow).toHaveBeenCalled();
    });

    it('can emit a callback set in the options', function() {
      instance.options.events = null;
      instance.options.show = onShow;

      instance.show($modals.first());
      
      expect(onShow).toHaveBeenCalled();
    });
  });
});