const getFromStorage = (keys) => {
  if (chrome.storage) {
    return new Promise((resolve, reject) => chrome.storage.local.get(keys, resolve));
  } else {
    return browser.storage.local.get(keys);
  }
};
const setToStorage = (object) => {
  if (chrome.storage) {
    return new Promise((resolve, reject) => chrome.storage.local.set(object, resolve));
  } else {
    return browser.storage.local.set(object);
  }
};
function saveOptions(e) {
  e.preventDefault();
  setToStorage({
    sites: document.querySelector("#sites").value,
  });
}

function restoreOptions() {
  function setCurrentChoice({sites}) {
    console.log(sites)
    document.querySelector("#sites").value = sites || 'facebook.com\ntwitter.com';
  }

  getFromStorage('sites').then(setCurrentChoice);
}

document.addEventListener("DOMContentLoaded", restoreOptions);
document.querySelector("textarea").onchange = saveOptions;
