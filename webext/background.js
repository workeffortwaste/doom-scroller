const setToStorage = (object) => {
  if (chrome.storage) {
    return new Promise((resolve, reject) => chrome.storage.local.set(object, resolve))
  } else {
    return browser.storage.local.set(object)
  }
}

const getFromStorage = (keys) => {
  if (chrome.storage) {
    return new Promise((resolve, reject) => chrome.storage.local.get(keys, resolve))
  } else {
    return browser.storage.local.get(keys)
  }
}

chrome.runtime.onInstalled.addListener(function () {
  setToStorage({
    sites: 'facebook.com\ntwitter.com'
  })
})

chrome.browserAction.onClicked.addListener(function (tab) {
  // If the current tab doesn't exist in storage, then add it and launch the doom-scroller.
  const tabDomain = new URL(tab.url).hostname

  getFromStorage('sites').then(
    e => {
      setToStorage({
        sites: e.sites + '\n' + tabDomain
      })
    })

  chrome.tabs.executeScript(tab.id, {
    file: 'doom-scroller-1.0.min.js'
  })
})
