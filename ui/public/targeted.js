// Assuming necessary setup for theme toggling remains unchanged...

/* global chrome */
let isTargetMode = false;
let hoveredElement = null;
let overlayElement = null;

// Create and insert the toggle button
// const toggleButton = document.createElement('button');
// toggleButton.textContent = 'Target Mode OFF';
// toggleButton.style.position = 'fixed';
// toggleButton.style.top = '10px';
// toggleButton.style.right = '10px';
// toggleButton.style.zIndex = '99999999';
// document.body.appendChild(toggleButton);
// console.log('Target Mode button added');

// Store original methods to restore later
const originalAddEventListener = EventTarget.prototype.addEventListener;
const originalRemoveEventListener = EventTarget.prototype.removeEventListener;

let allowedAddEventListenerFn = null;

// Function to override event methods
function overrideEventMethods(enable) {
    if (enable) {
        // Block adding new click listeners
        EventTarget.prototype.addEventListener = function (type, listener, options) {
            if (type === 'click' && listener !== allowedAddEventListenerFn) {
                console.warn('Blocked attempt to add click event listener:', listener);
                return;
            }
            originalAddEventListener.call(this, type, listener, options);
        };

        // Block removing click listeners
        EventTarget.prototype.removeEventListener = function (type, listener, options) {
            if (type === 'click') {
                console.warn('Blocked attempt to remove click event listener:', listener);
                return;
            }
            originalRemoveEventListener.call(this, type, listener, options);
        };
    } else {
        // Restore original methods
        EventTarget.prototype.addEventListener = originalAddEventListener;
        EventTarget.prototype.removeEventListener = originalRemoveEventListener;
    }
}
let styleSheet;
// Event listener to toggle the target mode
function toggleTargetMode() {
    // isTargetMode = !isTargetMode;
    // toggleButton.textContent = `Target Mode ${isTargetMode ? 'ON' : 'OFF'}`;
    if (isTargetMode) {
        if (!styleSheet) {
            styleSheet = document.createElement('style');
            styleSheet.type = 'text/css';
            styleSheet.innerHTML = `* { cursor: default !important; }`;
            document.head.appendChild(styleSheet);
        }
        overrideEventMethods(true);
        allowedAddEventListenerFn = stopPropagationListener;
        // document.addEventListener('mousedown', onElementMouseDown, true);
        document.addEventListener('mouseup', onElementMouseUp, true);
        document.addEventListener('mouseover', onElementMouseOver);
        document.addEventListener('mouseout', onElementMouseOut);
    } else {
        overrideEventMethods(false);
        allowedAddEventListenerFn = null;
        document.removeEventListener('mousedown', onElementMouseUp, true);
        document.removeEventListener('mouseover', onElementMouseOver);
        document.removeEventListener('mouseout', onElementMouseOut);
        removeOverlay();
        removeStopPropagationListener(document.documentElement); // Remove event listeners from the entire document
        if (styleSheet) {
            styleSheet.remove();
            styleSheet = null;
        }
    }
}
function sendElementHtml(elementHtml) {
    // Send the element's HTML representation to the DevTools panel

    chrome.runtime.sendMessage(
        { action: 'elementSelected', elementHtml: elementHtml },
        function (response) {
            console.log('Response from panel:', response);
        }
    );
}
function onElementMouseUp(event) {
    if (!isTargetMode) return;
    console.log('Clicked Element2:', event.target);
    // This could be in a content script or background script
    const elementHtml = event.target.outerHTML;
    sendElementHtml(elementHtml);
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
    // Prevent any further default actions or event propagation
    addStopPropagationListener(event.target);
    toggleTargetMode();
}

function stopPropagationListener(e) {
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();

    // For specific event types, prevent default action
    switch (e.type) {
        case 'click':
            e.preventDefault();
            break;
        case 'auxclick':
            if (e.button === 1) {
                // Middle mouse button
                e.preventDefault();
            }
            break;
        case 'contextmenu':
            e.preventDefault();
            break;
        // Add more cases as needed
    }
}

function addStopPropagationListener(element) {
    element.addEventListener('click', stopPropagationListener, true);
    element.addEventListener('auxclick', stopPropagationListener, true);
    element.addEventListener('contextmenu', stopPropagationListener, true);

    const childElements = Array.from(element.children);
    childElements.forEach((child) => addStopPropagationListener(child));
}

function removeStopPropagationListener(element) {
    element.removeEventListener('click', stopPropagationListener, true);
    element.removeEventListener('auxclick', stopPropagationListener, true);
    element.removeEventListener('contextmenu', stopPropagationListener, true);

    const childElements = Array.from(element.children);
    childElements.forEach((child) => removeStopPropagationListener(child));
}

function onElementMouseOver(event) {
    if (!isTargetMode) return;

    hoveredElement = event.target;
    renderOverlay(hoveredElement);
}

function onElementMouseOut(event) {
    if (!isTargetMode || event.target !== hoveredElement) return;

    removeOverlay();
    hoveredElement = null;
}

function renderOverlay(element) {
    removeOverlay();
    overlayElement = document.createElement('div');
    overlayElement.style.position = 'absolute';

    const rect = element.getBoundingClientRect();
    const scrollX = window.pageXOffset || document.documentElement.scrollLeft;
    const scrollY = window.pageYOffset || document.documentElement.scrollTop;

    overlayElement.style.top = `${rect.top + scrollY}px`;
    overlayElement.style.left = `${rect.left + scrollX}px`;
    overlayElement.style.width = `${rect.width}px`;
    overlayElement.style.height = `${rect.height}px`;
    overlayElement.style.backgroundColor = 'rgba(255, 0, 0, 0.3)';
    overlayElement.style.zIndex = '10000'; // Ensure it's above other elements
    overlayElement.style.pointerEvents = 'none'; // Ensure clicks pass through
    document.body.appendChild(overlayElement);
}

function removeOverlay() {
    if (overlayElement) {
        overlayElement.remove();
        overlayElement = null;
    }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message.action === 'requestToggleTargetMode') {
        // Make sure this matches the action sent from panel.js
        isTargetMode = !isTargetMode; // Assuming you toggle the state here
        console.log('Target Mode toggled to: ', isTargetMode);
        toggleTargetMode(); // Ensure this function doesn't asynchronously affect isTargetMode after the response is sent
        sendResponse({ action: 'toggleTargetMode', isTargetMode: isTargetMode });
    }
    return true; // Keep the message channel open for async response
});
