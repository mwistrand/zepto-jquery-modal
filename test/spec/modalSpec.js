describe('Zepto-Compatible jQuery Modal Box', function() {

  describe('Common Functionality', function() {
    var instance;

    beforeEach(function() {
      instance = u$.modal();
      loadFixtures('immediate.html');
    });

    it('Does not trigger anything on load', function() {
      expect($('.js-modal')).toHaveClass('is-invisible');
    });
  });

  describe('Immediately-invoked in-page modal', function() {
    var modalInstance,
      modals;

    beforeEach(function() {
      loadFixtures('immediate.html');

      modals = $('.js-modal');
      modalInstance = u$.modal({
        modals: modals
      });
    });

    it('Unhides the first modal', function() {
      expect(modals.eq(0)).not.toHaveClass('is-invisible');
    });

    it('Keeps other in-page modals hidden.', function() {
      expect(modals.eq(1)).toHaveClass('is-invisible');
    });
  });

  describe('Triggered in-page modal', function() {
    var modalInstance;

    beforeEach(function() {
      loadFixtures('static.html');

      modalInstance = u$.modal($(document.body));
    });

    it('Displays the appropriate modal when a trigger is clicked', function() {
      $('.js-triggerModal').eq(0).trigger('click');

      expect($('.js-modal').eq(0)).not.toHaveClass('is-invisible');
    });
  });
});