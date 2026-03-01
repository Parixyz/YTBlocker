// Adding null checks with optional chaining and validating chrome.storage exists

function exampleFunction() {
    // Check if chrome.storage is available
    if (typeof chrome !== 'undefined' && chrome.storage) {
        chrome.storage.local.get(['key'], (result) => {
            // Optional chaining to handle potential null values
            const value = result.key ?? 'default value';
            console.log(value);
        });
    } else {
        console.error('chrome.storage is not available');
    }
}