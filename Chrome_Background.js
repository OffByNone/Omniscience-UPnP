/* global chrome */

chrome.app.runtime.onLaunched.addListener(function() {
  chrome.app.window.create('Chrome_Main.html', {
    'outerBounds': {
      'width': 400,
      'height': 500
    }
  });
});