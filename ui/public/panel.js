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

function displayTabURL(tabURL) {
    // Assume you have a <div id="tabURL"> in your panel.html for displaying the tab URL
    const urlDiv = document.getElementById('tabURL');
    urlDiv.innerHTML = `Tab URL: <a href="${tabURL}" target="_blank">${tabURL}</a>`;
}
// Listen for tab URL messages from the background script
// Send a message to request the tab URL
chrome.runtime.sendMessage({ action: 'requestTabURL' }, (response) => {
    if (response && response.tabURL) {
        const tabURL = response.tabURL;
        console.log('Tab URL received in panel:', tabURL);
        // Display the tab URL in the panel, or process it as needed
        displayTabURL(tabURL);
    }
});

// Listen for HTML selection messages from the content script
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
        //remove disabled attribute from the getCSS button
        document.getElementById('getCSS').removeAttribute('disabled');

        sendResponse({ status: 'HTML received by panel' });
    }
});
//add listener on click of getCSS button
async function sendHtmlAndUrlToServer(html, url) {
    try {
        const response = await fetch('http://localhost:3001/get-css', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ html, url }),
        });

        if (response.ok) {
            const data = await response.json();
            const { cssText } = data;
            // Handle the received cssText as needed
            console.log('Received CSS:', cssText);
            displayElementCSS(cssText);
        } else {
            console.error('Error:', response.statusText);
        }
    } catch (error) {
        console.error('Error:', error);
    }
}
document.getElementById('getCSS').addEventListener('click', () => {
    console.log('getCSS button clicked');
    // Send the HTML and tab URL to the server
    const htmlDiv = document.getElementById('elementHtml');
    const html = htmlDiv.innerText;
    const urlDiv = document.getElementById('tabURL');
    const url = urlDiv.querySelector('a').href;
    sendHtmlAndUrlToServer(html, url);
});

function displayElementHtml(html) {
    // Assume you have a <div id="elementHtml"> in your panel.html for displaying the element's HTML
    const htmlDiv = document.getElementById('elementHtml');
    htmlDiv.innerHTML = `Selected Element HTML: <code>${escapeHtml(html)}</code>`;
}
function displayElementCSS(css) {
    // Assume you have a <div id="elementCSS"> in your panel.html for displaying the element's CSS
    const cssDiv = document.getElementById('elementCSS');
    cssDiv.innerHTML = `Selected Element CSS: <code>${css}</code>`;
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
