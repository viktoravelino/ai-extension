/* eslint-disable @typescript-eslint/no-unused-vars */
/* global chrome */
let isTargetMode = false;

document.addEventListener('DOMContentLoaded', () => {
    const toggleButton = document.getElementById('toggleButton');
    toggleButton.addEventListener('click', toggleTargetMode);
    updateButtonText(); // Set initial button text
});

function toggleTargetMode() {
    isTargetMode = !isTargetMode;
    // updateButtonText();
    // Query the active tab and send a message to it
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const currentTabId = tabs[0].id;
        chrome.tabs.sendMessage(currentTabId, { action: 'requestToggleTargetMode' }, (response) => {
            console.log('Response received in panel.js:', response);
            isTargetMode = response.isTargetMode;
            updateButtonText();
        });
    });
}

function updateButtonText() {
    const buttonText = `Toggle Target Mode ${isTargetMode ? 'ON' : 'OFF'}`;
    document.getElementById('toggleButton').innerText = buttonText;
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'elementSelected') {
        const elementHtml = message.elementHtml;
        console.log('Element HTML received in panel:', elementHtml);
        // Check if we are in target mode, and if so, toggle it off
        if (isTargetMode) {
            toggleTargetMode();
        }
        // Display the HTML in the panel, or process it as needed
        displayElementHtml(elementHtml);

        sendResponse({ status: 'HTML received by panel' });
    }
});

function displayElementHtml(html) {
    // Assume you have a <div id="elementHtml"> in your panel.html for displaying the element's HTML
    const htmlDiv = document.getElementById('elementHtml');
    htmlDiv.innerHTML = `Selected Element HTML: <code>${escapeHtml(html)}</code>`;
}

// Utility function to escape HTML special characters for safe insertion
function escapeHtml(unsafeHtml) {
    return unsafeHtml
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}
