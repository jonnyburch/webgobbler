import { initializeConfig } from './config.js';

document.addEventListener('DOMContentLoaded', () => {
  console.log('Popup DOM loaded');

  // Initialize config
  initializeConfig().then(() => {
    console.log('Config initialized');
  }).catch(error => {
    console.error('Error initializing config:', error);
  });

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

        // Send message to background script to save the page info
        chrome.runtime.sendMessage({
          action: "savePageInfo",
          note: note,
          tags: tags
        }, (response) => {
          if (chrome.runtime.lastError) {
            console.error('Error sending message:', chrome.runtime.lastError);
            alert('Error: ' + chrome.runtime.lastError.message);
            return;
          }

          console.log('Received response:', response);

          if (response && response.success) {
            console.log('Page saved to Google Sheets');
            alert('Page saved successfully!');
            window.close();  // Close the popup after saving
          } else {
            console.error('Error saving to Google Sheets:', response ? response.error : 'Unknown error');
            alert('Error saving to Google Sheets: ' + (response ? response.error : 'Unknown error') + '. Please try again.');
          }
        });
      });
    });
  } else {
    console.error('Save button not found');
  }
});