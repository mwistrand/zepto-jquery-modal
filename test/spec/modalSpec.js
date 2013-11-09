describe('Zepto-Compatible jQuery Modal Box', function() {
  var triggers,
    modals,
    instance;

  beforeEach(function() {
    loadFixtures('static.html');
    triggers = $('.js-triggerModal');
    modals = $('.js-modal');
  });
  afterEach(function() {
    triggers.empty().remove();
    modals.empty().remove();

    // `instance` is created in the `beforeEach` block of each
    // nested `describe` block.
    instance.detach();
  });

  function triggerClose(i) {
    i || (i = 0);
    modals.eq(i).find('.js-closeModal').eq(0).trigger('click');
  }

  function triggerOpen(i) {
    i || (i = 0);
    triggers.eq(i).trigger('click');
  }

  it('detaches all events', function() {
    instance = u$.modal($(document.body));
    
    spyOn(instance, 'hide');
    instance.detach();

    expect(instance.triggers).toBe(null);
    expect(instance.modals).toBe(null);

    triggerClose();
    expect(instance.hide).not.toHaveBeenCalled();
  });

  describe('Event Emitter', function() {
    var onShow;

    beforeEach(function() {
      onShow = jasmine.createSpy('onShow');
 
      instance = u$.modal({
        events: Backbone.Events
      });

      instance.on('show', onShow);
    });

    it('can take a Backbone-style events object', function() {
      instance.show(modals.eq(0));

      expect(onShow).toHaveBeenCalled();
    });
  });

  describe('A modal', function() {
    beforeEach(function() {
      instance = u$.modal({
        modals: modals
      });
    });

    it('can be closed', function() {
      triggerClose();

      expect(modals.eq(0)).toHaveClass('is-invisible');
    });

    it('can be destroyed on close', function() {
      instance.options.destroyOnClose = true;
      triggerClose();
      expect(modals.eq(0).html()).toEqual('');
    });

    it('can be opened when an instance is created', function() {
      expect(modals.eq(0)).not.toHaveClass('is-invisible');
    });

    it('can remain hidden if it is not the first modal', function() {
      expect(modals.eq(1)).toHaveClass('is-invisible');
    });
  });

  describe('A blank instance', function() {
    beforeEach(function() {
      instance = u$.modal();
    });

    it('does not trigger anything on load', function() {
      expect($('.js-modal')).toHaveClass('is-invisible');
    });

    it('can add triggers to the instance', function() {
      var trigger = triggers.eq(0);

      instance.add($(document.body));
      trigger.trigger('click');

      expect(modals.eq(0)).not.toHaveClass('is-invisible');
    });
  });

  describe('A modal trigger', function() {
    beforeEach(function() {
      instance = u$.modal($(document.body));
    });

    it('can display a modal when clicked', function() {
      triggerOpen();

      expect(modals.eq(0)).not.toHaveClass('is-invisible');
    });

    it('can be removed from the instance', function() {
      instance.detach(triggers.eq(0));
      triggerOpen();
      expect(modals.eq(0)).toHaveClass('is-invisible');
    });

    it('can trigger a modal when `options.triggerClass` is a function',
        function() {
      instance.options.triggerClass = function(trigger) {
        return trigger.hasClass('js-triggerModal');
      };

      triggers.eq(0).trigger('click');
      expect(modals.eq(0)).not.toHaveClass('is-invisible');
    });
  });

  describe('An Ajax Modal', function() {
    var html = '<div data-id="12345">Lorem ipsum dolor sit amet</div>';

    beforeEach(function() {
      instance = u$.modal($(document.body), {
        url: '../fixtures/json/modal.json',
        template: '<div data-id="{{id}}">{{text}}</div>'
      });
    });

    /*it('can be generated with JSON', function() {
      triggers.eq(0).trigger('click');

      expect(instance.modals).toBeDefined();
    });*/
  });
});