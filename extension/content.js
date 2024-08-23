console.log('Webgobbler content script loaded');

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Message received in content script:', request);
  if (request.action === "getPageInfo") {
    const pageInfo = {
      url: window.location.href,
      title: document.title,
      description: getMetaContent('description'),
      image: getMetaContent('og:image'),
      favicon: getFaviconUrl(),
    };
    console.log('Sending page info:', pageInfo);
    sendResponse(pageInfo);
  }
  return true;  // Indicates that we will send a response asynchronously
});

function getMetaContent(name) {
  const meta = document.querySelector(`meta[name="${name}"], meta[property="${name}"]`);
  return meta ? meta.getAttribute('content') : '';
}

function getFaviconUrl() {
  const linkElement = document.querySelector('link[rel="shortcut icon"], link[rel="icon"]');
  return linkElement ? linkElement.href : '';
}