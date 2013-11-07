describe('Zepto-Compatible jQuery Modal Box', function() {

  describe('Common Functionality', function() {
    var instance,
      triggers,
      modals;

    beforeEach(function() {
      instance = u$.modal();
      loadFixtures('static.html');
      triggers = $('.js-triggerModal');
      modals = $('.js-modal');
    });

    it('Does not trigger anything on load', function() {
      expect($('.js-modal')).toHaveClass('is-invisible');
    });

    it('Adds triggers to the instance', function() {
      var trigger = triggers.eq(0);

      instance.add($(document.body));
      trigger.trigger('click');

      expect(modals.eq(0)).not.toHaveClass('is-invisible');
    });
  });

  describe('Immediately-invoked in-page modal', function() {
    var instance,
      modals;

    beforeEach(function() {
      loadFixtures('immediate.html');

      modals = $('.js-modal');
      instance = u$.modal({
        modals: modals
      });
    });

    it('Unhides the first modal', function() {
      expect(modals.eq(0)).not.toHaveClass('is-invisible');
    });

    it('Keeps other in-page modals hidden.', function() {
      expect(modals.eq(1)).toHaveClass('is-invisible');
    });

    it('Closes a modal window', function() {
      var modal = modals.eq(0);

      // get the 'close' link, click it.
      modal.find('.js-closeModal').trigger('click');
      
      expect(modal).toHaveClass('is-invisible');
    });

    it('Destroys the modal on close', function() {
      var modal = modals.eq(0);

      instance.options.destroyOnClose = true;

      setTimeout(function() {
        modal.find('.js-closeModal').trigger('click');

        expect(modal).toBeEmpty();
      }, 50);
    });
  });

  describe('Triggered in-page modal', function() {
    var instance;

    beforeEach(function() {
      loadFixtures('static.html');

      instance = u$.modal($(document.body));
    });

    it('Detaches the click event from a trigger', function() {
      var triggers = $('.js-triggerModal'),
        modal = $('.js-modal').eq(0);

      // detach events from an element
      instance.detach(triggers.eq(0));
      triggers.eq(0).trigger('click');
      expect(modal).toHaveClass('is-invisible');
    });

    it('Detaches all instance events', function() {
      instance.detach();

      $('.js-triggerModal').eq(0).trigger('click');
      expect($('.js-modal')).toHaveClass('is-invisible');
    });

    it('Displays the appropriate modal when a trigger is clicked', function() {
      $('.js-triggerModal').eq(0).trigger('click');

      expect($('.js-modal').eq(0)).not.toHaveClass('is-invisible');
    });
  });
});