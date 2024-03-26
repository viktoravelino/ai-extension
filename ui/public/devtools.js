/* global chrome */
chrome.devtools.panels.create(
    'Targeted', // title for the panel tab
    '', // icon path, empty string for no icon
    'panel.html', // HTML page for the panel's content
    function () {
        // code invoked on panel creation
        console.log('Custom panel created');
    }
);
