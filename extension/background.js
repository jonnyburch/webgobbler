let config = {};

function getConfig() {
  return new Promise((resolve) => {
    chrome.storage.local.get(['GOOGLE_APPS_SCRIPT_URL'], (result) => {
      config = result;
      console.log('Config loaded:', config);
      resolve(config);
    });
  });
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "savePageInfo") {
    getConfig().then(() => {
      chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
        chrome.tabs.sendMessage(tabs[0].id, { action: "getPageInfo" }, (response) => {
          if (chrome.runtime.lastError) {
            console.error('Error getting page info:', chrome.runtime.lastError);
            sendResponse({error: chrome.runtime.lastError.message});
            return;
          }

          if (!response) {
            console.error('No response from content script');
            sendResponse({error: 'No response from content script'});
            return;
          }

          // Add any additional info from the popup
          response.note = request.note;
          response.tags = request.tags;

          if (!config.GOOGLE_APPS_SCRIPT_URL) {
            console.error('Google Apps Script URL is not set');
            sendResponse({error: 'Configuration error: Google Apps Script URL is not set'});
            return;
          }

          console.log('Sending data to Google Apps Script:', response);
          fetch(config.GOOGLE_APPS_SCRIPT_URL, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(response)
          })
          .then(response => {
            if (!response.ok) {
              throw new Error('Network response was not ok');
            }
            return response.text();
          })
          .then(data => {
            console.log('Page info sent to Google Sheets:', data);
            sendResponse({success: true});
          })
          .catch(error => {
            console.error('Error:', error);
            sendResponse({error: error.message});
          });
        });
      });
    });
    return true; // Indicates that we will send a response asynchronously
  }
});