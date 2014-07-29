# Zepto-Compatible jQuery Modal

First, this is not a plugin. I do a lot of development that requires combining objects together, so I need access to the underlying object.
`$elem.modal().data('modal').methodName` seems inelegant to me, so I chose not to implement this as a plugin.

## Assumptions
Any browser that can run Zepto also supports CSS3 transforms, which are used to center modals on the page. As a result, CSS can be used to center the modal in just about any browser save IE8. However, rather than include extra code to check that transforms are supported and provide a Zepto fallback for `$.fn.outerWidth` and `$.fn.outerHeight`, I assume that jQuery requires manual centering and Zepto can delegate to CSS.

## Dependencies
As much as possible, I separate functionality common across objects into separate functions. These functions are methods of the `u$` object, and can be found in the [u$ library](https://github.com/mwistrand/zepto-jquery-utilities). Specifically used are the `detach`, `render`, `renderJSON`, and `is$` methods, as well as the `loaderMixin` and `cacheMixin` mixins. 

## Usage
I like to store functionality like this in a single global variable: `u$`. So a new modal instance is created by a call to `u$.modal($triggers, options)`.

### Opening a modal
Modal instances created with a `url` option (see below) are treated as AJAX modals. Otherwise, an in-page modal is assumed.

#### Open a modal immediately

```javascript
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
`clickOverlayToClose: true`
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

`isFixed: true`
Does the modal window use fixed positioning? **Note: it is up to your external CSS to determine the `position` style.**

`isLightbox: true`
Will this be displayed with the overlay? **Note: there is only overlay element that is shared between instances.**

`modals: null`
Either the existing modal `$` elements, a selector to fetch existing modals from the DOM, or an HTML string that will be passed to `$`, or an array of data that will be passed to `$` to create a new modal when the AJAX data is fetched.

```javascript
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

`offset: 100`
The vertical offset in pixels that the element should be positioned off the top of the screen. **Note: only used when the `isFixed` flag is `false`.**

`overlayParams: '<div class="overlay"></div>'`
The data that will be used to create the overlay element. Can be an HTML string, or an array of arguments to pass to `$`:
`overlayParams: ['<div />', {'class': 'overlay'}]`
The class `js-overlay` will be added to this element.

`triggerClass: 'js-triggerModal'`
The CSS class applied to all triggers.

#### AJAX-specific options
`loaderClass: 'loader--modal`
The CSS class that will be added to the optional loader/spinner (`<div class="loader" />`)

`loaderHTML: <div />`
The HTML that will be used to generate the optional loader/spinner element.

`query: '' || function($trigger) {}`
Either a string of a data that will be passed to the `data` option of `$.ajax`, or a function that will generate that data from the passed-in
trigger. Note that any function here must return a string.

`template: '<div>{{field}}</div>' || function($container, data) {}`
The template that will be used to generate the modal HTML from the fetched JSON data. If the JSON is very simple and only one level deep (for example, `[{"id": 1, title: "Article 1"}, {"id": 2, "Article 2"}]` or `{"id": 1, title: "Article 1"}`, then the built-in template parser will suffice. Otherwise, you can specify a function that takes the container and JSON object (not string) and use a more powerful templating engine like Handlebars:

```javascript
function($container, data) {
  var source = $('#handlebars-template').html(),
    template = Handlebars.compile(source);

  $container.html(template(data));
}
```

`cache: true`
Whether the AJAX requests should be cached. Note that the full URL (domain, path, and query/data) for the request is used to build the cache.

`modals: ['<div />', {
  'class': 'modal js-modal'
}]`
The HTML data used to generate the modal element. The HTML parsed from the AJAX response will be injected into this element.

### Events
`detach: function($modals, $triggers) {}`
When triggers are detached, or the whole instance is detached.

`beforeShow: function($modal, $trigger, $overlay) {}`
Before the modal is displayed.

`show: function($modal, $trigger, $overlay) {}`
When the modal is displayed (after the HTML has been rendered and the optional overlay has been displayed).

`beforeHide: function($modal, $overlay) {}`
Before the overlay and modal are closed.

`hide: function($modal, $overlay) {}`
After the overlay and modal are closed.

#### AJAX Events
`beforeSend: function($trigger, xhr, settings) {}`
Before the AJAX request is sent, but after the loader is displayed.

`ajaxError: function($trigger, xhr, errorType, error) {}`
When there is a problem with the AJAX request.