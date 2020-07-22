chrome.runtime.onInstalled.addListener(function() {
    const setToStorage = (object) => {
        if (chrome.storage) {
            return new Promise((resolve, reject) => chrome.storage.local.set(object, resolve))
        } else {
            return browser.storage.local.set(object)
        }
    }
    setToStorage({
        sites: 'facebook.com\ntwitter.com'
    })
});
