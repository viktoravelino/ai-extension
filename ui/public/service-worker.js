/* global chrome */
const installEvent = () => {
    self.addEventListener('install', () => {
        console.log('service worker installed!!!!');
    });
};

installEvent();

const activateEvent = () => {
    self.addEventListener('activate', () => {
        console.log('service worker activated!!!');
    });
};

activateEvent();

//listen for messages from the panel
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'requestTabURL') {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            const currentTabURL = tabs[0].url;
            sendResponse({ tabURL: currentTabURL });
        });
    }
    // Keep the message port open for asynchronous responses
    return true;
});
