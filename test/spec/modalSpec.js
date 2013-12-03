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
    instance.detach();
  });

  function triggerClose(i) {
    i || (i = 0);
    $modals.eq(i).find('.js-closeModal').eq(0).trigger('click');
  }

  function triggerOpen(i) {
    i || (i = 0);
    $triggers.eq(i).trigger('click');
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

      instance.show($modals.eq(0));

      expect(onShow).toHaveBeenCalled();
    });

    it('can emit a callback set in the options', function() {
      instance.options.events = null;
      instance.options.onShow = onShow;

      instance.show($modals.eq(0));
      
      expect(onShow).toHaveBeenCalled()
    });
  });

  describe('A modal', function() {
    beforeEach(function() {
      before();

      instance = u$.modal({
        modals: $modals
      });
    });
    afterEach(function() {
      after();
    });

    it('can be closed', function() {
      triggerClose();

      expect($modals.eq(0)).toHaveClass('is-invisible');
    });

    it('can be destroyed on close', function() {
      instance.options.destroyOnClose = true;
      triggerClose();

      expect($modals.eq(0).html()).toEqual('');
    });

    it('can be opened when an instance is created', function() {
      expect($modals.eq(0)).not.toHaveClass('is-invisible');
    });

    it('can remain hidden if it is not the first modal', function() {
      expect($modals.eq(1)).toHaveClass('is-invisible');
    });

    it('can be displayed as a lightbox', function() {
      expect($('.js-overlay').length).toEqual(1);
    });

    it('can be displayed without an overlay', function() {
      instance.detach();
      instance = u$.modal({
        modals: $modals,
        isLightbox: false
      });

      expect($('.js-overlay')).toHaveClass('is-invisible');
    });
  });

  describe('A blank instance', function() {
    beforeEach(function() {
      before();

      instance = u$.modal();
    });
    afterEach(function() {
      after();
    });

    it('does not trigger anything on load', function() {
      expect($('.js-modal')).toHaveClass('is-invisible');
    });

    it('can add triggers to the instance', function() {
      var $trigger = $triggers.eq(0);

      instance.add($(document.body));
      $trigger.trigger('click');

      expect($modals.eq(0)).not.toHaveClass('is-invisible');
    });
  });

  describe('An overlay', function() {
    beforeEach(function() {
      before();

      instance = u$.modal($(document.body));
    });
    afterEach(function() {
      after();
    });

    it('can be clicked to close a modal', function() {
      triggerOpen();
      clickOverlay();

      expect($modals.eq(0)).toHaveClass('is-invisible');
    });

    it('can remain open when the overlay is clicked', function() {
      instance.options.clickOverlayToClose = false;
      triggerOpen();
      clickOverlay()

      expect($modals.eq(0)).not.toHaveClass('is-invisible');
    });
  });

  describe('A modal trigger', function() {
    beforeEach(function() {
      before();

      instance = u$.modal($(document.body));
    });
    afterEach(function() {
      after();
    });

    it('can display a modal when clicked', function() {
      triggerOpen();

      expect($modals.eq(0)).not.toHaveClass('is-invisible');
    });

    it('can be removed from the instance', function() {
      instance.detach($triggers.eq(0));
      triggerOpen();
      expect($modals.eq(0)).toHaveClass('is-invisible');
    });

    it('can trigger a modal when `options.triggerClass` is a function',
        function() {
      instance.options.triggerClass = function($trigger) {
        return $trigger.hasClass('js-triggerModal');
      };

      $triggers.eq(0).trigger('click');
      expect($modals.eq(0)).not.toHaveClass('is-invisible');
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

    it('can be destroyed on close', function() {
      instance.options.destroyOnClose = true;
      spyOn($, 'ajax').andCallFake(function(params) {
        params.success(null, null, {responseText: jsonArr});
      });
      
      openClose(instance);
      expect(instance.$modals.length).toEqual(0);
    });

    it('can be closed', function() {
      spyOn($, 'ajax').andCallFake(function(params) {
        params.success(null, null, {responseText: jsonArr});
      });

      openClose(instance);

      expect(instance.$modals.eq(0)).toHaveClass('is-invisible');
    });

    it('can be generated with a JSON Array', function() {
      spyOn($, 'ajax').andCallFake(function(params) {
        params.success(null, null, {responseText: jsonArr});
      });

      triggerOpen();

      expect(instance.$modals.eq(0).html()).toEqual(html);
    });

    it('can be generated with a JSON Object', function() {
      spyOn($, 'ajax').andCallFake(function(params) {
        params.success(null, null, {responseText: jsonObj});
      });

      triggerOpen();

      expect(instance.$modals.eq(0).html()).toEqual(html);
    });

    it('can be generated from an HTML string', function() {
      instance.options.responseType = 'html';

      spyOn($, 'ajax').andCallFake(function(params) {
        params.success(null, null, {responseText: html});
      });

      triggerOpen();

      expect(instance.$modals.eq(0).html()).toEqual(html);
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

      $div = instance.$modals.eq(0).find('div');
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
      
      $modal = instance.$modals.eq(0).html('');
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
});