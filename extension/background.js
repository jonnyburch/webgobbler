import config from './config.js'

chrome.browserAction.onClicked.addListener((tab) => {
  chrome.tabs.sendMessage(tab.id, { action: "getPageInfo" }, (response) => {
    // Send the response to Google Apps Script Web App
    fetch(config.GOOGLE_APPS_SCRIPT_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(response)
    })
    .then(() => console.log('Page info sent to Google Sheets'))
    .catch(error => console.error('Error:', error));
  });
});