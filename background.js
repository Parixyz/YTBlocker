chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.get({ blockerEnabled: true }, (result) => {
    if (typeof result.blockerEnabled === 'undefined') {
      chrome.storage.sync.set({ blockerEnabled: true });
    }
  });
});
