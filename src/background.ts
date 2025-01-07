chrome.runtime.onInstalled.addListener(() => {
  // Initialize storage with default values
  chrome.storage.local.set({
    conversionCount: 0,
    isPremium: false
  });
});

// Listen for messages from the popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'INCREMENT_CONVERSION') {
    chrome.storage.local.get(['conversionCount'], (result) => {
      const newCount = (result.conversionCount || 0) + 1;
      chrome.storage.local.set({ conversionCount: newCount });
    });
  }
}); 