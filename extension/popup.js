import config from './config.js'

document.addEventListener('DOMContentLoaded', () => {
  console.log('Popup DOM loaded');
  const saveButton = document.getElementById('save');
  if (saveButton) {
    console.log('Save button found');
    saveButton.addEventListener('click', () => {
      console.log('Save button clicked');
      chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
        if (chrome.runtime.lastError) {
          console.error('Error querying tabs:', chrome.runtime.lastError);
          return;
        }
        console.log('Active tab:', tabs[0]);

        const note = document.getElementById('note').value;
        const tags = document.getElementById('tags').value;
        console.log('Note:', note, 'Tags:', tags);

        // Set up a timeout for the sendMessage call
        const timeoutDuration = 5000; // 5 seconds
        const timeout = setTimeout(() => {
          console.error('Timeout: No response from content script');
          alert('Error: No response from page. Please refresh the page and try again.');
        }, timeoutDuration);

        chrome.tabs.sendMessage(tabs[0].id, { action: "getPageInfo" }, (response) => {
          clearTimeout(timeout); // Clear the timeout as we got a response

          if (chrome.runtime.lastError) {
            console.error('Error getting page info:', chrome.runtime.lastError);
            alert(`Error: ${chrome.runtime.lastError.message}. Please refresh the page and try again.`);
            return;
          }

          console.log('Received page info:', response);

          if (!response) {
            console.error('No response received from content script');
            alert('Error: No response from page. Please refresh the page and try again.');
            return;
          }

          response.note = note;
          response.tags = tags;

          console.log('Sending data to Google Apps Script:', JSON.stringify(response));
          fetch(config.GOOGLE_APPS_SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(response)
          })
          .then(() => {
            console.log('Page saved to Google Sheets');
            alert('Page saved successfully!');
            window.close();  // Close the popup after saving
          })
          .catch(error => {
            console.error('Error saving to Google Sheets:', error);
            alert('Error saving to Google Sheets. Please try again.');
          });
        });
      });
    });
  } else {
    console.error('Save button not found');
  }
});