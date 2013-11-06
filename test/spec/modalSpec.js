describe('Zepto-Compatible jQuery Modal Box', function() {
  it('Immediately displays an in-page modal', function() {
    var modalInstance,
      modals;

    loadFixtures('immediate.html');

    modals = $('.js-modal');
    modalInstance = u$.modal({
      modals: modals
    });

    expect(modals.get(0)).not.toHaveClass('is-invisible');
    expect(modals.get(1)).toHaveClass('is-invisible');
  });
});