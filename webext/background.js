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
  const tabDomain = new URL(tab.url).hostname

  getFromStorage('sites').then(
    e => {
      setToStorage({
        sites: e.sites + '\n' + tabDomain
      })
    })

  // Update the icon
  chrome.browserAction.setIcon({ path: 'webext/toolbar-enabled-icon32.png', tabId: tab.tabId })

  // Inject the script
  chrome.tabs.executeScript(tab.id, {
    file: 'doom-scroller-1.0.min.js'
  })
})

// If the active tab domain is in the storage, then show the enabled icon.
chrome.tabs.onActivated.addListener(function (tab) {
  console.log(tab)
  chrome.tabs.query({ active: true, lastFocusedWindow: true }, tabs => {
    const tabDomain = new URL(tabs[0].url).hostname
    getFromStorage('sites')
      .then(({ sites }) => {
        const siteList = sites.split('\n')
        if (siteList.includes(tabDomain)) {
          chrome.browserAction.setIcon({ path: 'webext/toolbar-enabled-icon32.png', tabId: tab.tabId })
        }
      })
  })
})
