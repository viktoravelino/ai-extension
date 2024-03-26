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
