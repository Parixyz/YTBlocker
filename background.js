chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.get('blockerEnabled', (result) => {
    if (typeof result.blockerEnabled === 'undefined') {
      chrome.storage.sync.set({ blockerEnabled: true });
    }
  });
});
