chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  try {
    if (changeInfo.status === 'complete' && tab && tab.url && tab.url.includes('youtube.com')) {
      chrome.scripting.executeScript({
        target: { tabId: tabId },
        function: blockShorts
      });
    }
  } catch (error) {
    console.error('Error in tab update listener:', error);
  }
});

function blockShorts() {
  try {
    if (window.location.pathname && window.location.pathname.includes('/shorts/')) {
      window.location.href = 'https://www.youtube.com';
    }
  } catch (error) {
    console.error('Error blocking shorts:', error);
  }
}