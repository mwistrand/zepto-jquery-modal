# Zepto-Compatible jQuery Modal

First, this is not a plugin. I do a lot of development that requires combining objects together, so I need access to the underlying object.
`$elem.modal().data('modal').methodName` seems inelegant to me, so I chose not to implement this as a plugin.

## Usage
I like to store functionality like this in a single global variable: `u$`. So a new modal instance is created by a call to `u$.modal($triggers, options)`.

### Opening a modal
Modal instances created with a `url` option (see below) are treated as AJAX modals. Otherwise, an in-page modal is assumed.

#### Open a modal immediately
```
u$.modal({modals: $modal})
// OR
u$.modal().show($modal)
```
#### Click a trigger to open a modal
Assign the ID of the modal as the value of the trigger's `data-modalid` attributes. If a `url` option is specified, then a new modal window will be generated from the `modals` option (see below).
```
<a class="js-triggerModal" data-modalid="myModal">Open Modal</a>

// note use of event delegation
u$.modal($(document.body), {
	triggerClass: 'js-triggerModal'
})
```

### Options
`clickOverlayToClose: true
If this is `true` (the default), the modal can be closed by clicking the overlay.

`closeParams: '<a class="closeModal">close</a>'`
The data that will be used to create the "close" link/button. Can be an HTML string, or an array of arguments to pass to `$`:
`closeParams: ['<a />', {'class': 'closeModal', text: 'close'}]`
The class `js-closeModal` will be added to this element, which will be added as the first child to the modal. If you don't want to use this, set this to null, but then you'll be responsible for giving users an obvious way to close the modal.

`destroyOnClose: false`
Should the current modal window be completely removed from the DOM when closed?

`escapeClose: true`
Should hitting the 'esc' key close the modal?

`eventNamespace: null`
The prefix for the event namespace. The namespace is generated as follows:
`eventNamespace + 'Modal:' + name + 'Event'`
For example, `myAppModal:showEvent`.
    
`events: null`
A Backbone style events object that will be integrated with the `modal` object (on instantiation, via `$.extend`). Any such object must implement a `trigger` method in order to function properly. If this is `null` (the default), then a basic internal emitter will be used (and event callbacks specified as options).

`isLightbox: true`
Will this be displayed with the overlay? **Note: there is only overlay element that is shared between instances.**

`modals: null`
Either the existing modal `$` elements, a selector to fetch existing modals from the DOM, or an HTML string that will be passed to `$`, or an array of data that will be passed to `$` to create a new modal when the AJAX data is fetched.
```
modals: '.js-modal'
// OR
modals: $('.js-modal')
// OR
modals: ['<div />', {
  'class': 'js-modal'
}]
// OR
modals: '<div class="modal"></div>'
```

`overlayParams: '<div class="overlay"></div>'`
The data that will be used to create the overlay element. Can be an HTML string, or an array of arguments to pass to `$`:
`overlayParams: ['<div />', {'class': 'overlay'}]`
The class `js-overlay` will be added to this element.

`triggerClass: 'js-triggerModal'`
The CSS class applied to all triggers.

#### AJAX-specific options

### Events