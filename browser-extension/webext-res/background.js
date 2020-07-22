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

  const inject = false

  getFromStorage('sites').then(
    e => {
      const siteList = e.sites.split('\n')
      // If the does not exist in the sitelist
      if (!siteList.includes(tabDomain)) {
        setToStorage({
          sites: e.sites + '\n' + tabDomain
        }).then(e => {
          chrome.browserAction.setIcon({ path: 'webext-res/toolbar-enabled-icon32.png', tabId: tab.tabId })
          chrome.tabs.executeScript(tab.id, {
            file: 'doom-scroller-1.0.min.js'
          })
        })
      } else {
        // If it already exists here, then remove it.
        const filteredArray = siteList.filter(function (e) { return e !== tabDomain })
        setToStorage({
          sites: filteredArray.join('\n')
        })
        // Update the icon
        chrome.browserAction.setIcon({ path: 'webext-res/toolbar-icon32.png', tabId: tab.tabId })
        // Refresh tab
        const refresh = 'window.location.reload();'
        chrome.tabs.executeScript(tab.id, { code: refresh })
      }
    })
})
// If the active tab domain is in the storage, then show the enabled icon.
chrome.tabs.onActivated.addListener(function (tab) {
  chrome.tabs.query({ active: true, lastFocusedWindow: true }, tabs => {
    const tabDomain = new URL(tabs[0].url).hostname
    getFromStorage('sites')
      .then(({ sites }) => {
        const siteList = sites.split('\n')
        if (siteList.includes(tabDomain)) {
          chrome.browserAction.setIcon({ path: 'webext-res/toolbar-enabled-icon32.png', tabId: tab.tabId })
        } else {
          chrome.browserAction.setIcon({ path: 'webext-res/toolbar-icon32.png', tabId: tab.tabId })
        }
      })
  })
})

chrome.tabs.onUpdated.addListener(function (tabId, change, tab) {
  chrome.tabs.query({ active: true, lastFocusedWindow: true }, tabs => {
    const tabDomain = new URL(tabs[0].url).hostname
    getFromStorage('sites')
      .then(({ sites }) => {
        const siteList = sites.split('\n')
        if (siteList.includes(tabDomain)) {
          chrome.browserAction.setIcon({ path: 'webext-res/toolbar-enabled-icon32.png', tabId: tab.tabId })
        } else {
          chrome.browserAction.setIcon({ path: 'webext-res/toolbar-icon32.png', tabId: tab.tabId })
        }
      })
  })
})
