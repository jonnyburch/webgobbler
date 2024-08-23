export function initializeConfig() {
  return new Promise((resolve, reject) => {
    chrome.storage.local.set({
      GOOGLE_APPS_SCRIPT_URL: 'YOUR_GOOGLE_APPS_SCRIPT_URL_HERE'
    }, () => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        resolve();
      }
    });
  });
}