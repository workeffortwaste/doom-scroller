window.doomScroller = window.doomScroller || []
/* Get script location */
if (chrome && chrome.runtime && chrome.runtime.getURL) {
  window.doomScroller.location = chrome.runtime.getURL('doom-res/').replace(/\/doom-res\/$/, '')
} else if (browser && browser.runtime && browser.runtime.getURL) {
  window.doomScroller.location = browser.runtime.getURL('doom-res/').replace(/\/doom-res\/$/, '')
} else {
  window.doomScroller.location = document.currentScript.src.substring(0, document.currentScript.src.lastIndexOf('/'))
}
doomScroller.start = function () {
  const url = window.doomScroller.location

  /* Inject the CSS into the head */
  const head = document.getElementsByTagName('head')[0]
  const style = document.createElement('link')
  style.href = `${url}/doom-res/doom-scroller-1.0.css`
  style.type = 'text/css'
  style.rel = 'stylesheet'
  head.append(style)

  /* Inject the HTML into the body */
  const html = `
    <div id="doom-gameover"></div>
    <div id="doom-damage"></div>
    <div id="doom-bar" style="display:none">
        <div id="doom-console">
            <div id="doom-health"><img id="doom-health-img" src="${url}/doom-res/damage.png"></div>
            <div id="doom-face"><img id="doom-face-img" src="${url}/doom-res/face.png"></div>
            <img id="doom-full-console" src="${url}/doom-res/hud-full.png">
            <img id="doom-res-console" src="${url}/doom-res/hud-res.png">
        </div>
    </div>
    `
  document.body.insertAdjacentHTML('beforeend', html)

  /* The main script */
  const doomPainURL = `${url}/doom-res/dsplpain.wav`
  const doomDeathUrl = `${url}/doom-res/dspdiehi.wav`

  let doomPain
  let doomDeath
  let doomAudioContext
  let doomSound = false
  let doomFaceState = 1
  let doomLastScroll = 0
  let nextDamagePosition = null
  let ticking = false
  let doomScrollDamage = 1

  // Set the scroll damage from the optional settings (if it exists)
  if (doomScroller.scrollDamage !== undefined) {
    doomScrollDamage = doomScroller.scrollDamage
  }

  // Disable the gameover logo if the optional setting exists.
  if (doomScroller.gameoverLogo === false) {
    document.getElementById('doom-gameover').style.backgroundImage = 'none'
  }

  // Click the doom console to activate sound.
  document.getElementById('doom-console').addEventListener('click', function () {
    doomAudioContextInit()
    doomSound = true
  })

  async function doomAudioContextInit () {
    doomAudioContext = new AudioContext()
    doomPain = await doomLoadSound(doomPainURL)
    doomDeath = await doomLoadSound(doomDeathUrl)
  }

  function doomLoadSound (file) {
    return fetch(file)
      .then(response => response.arrayBuffer())
      .then(arrayBuffer => doomAudioContext.decodeAudioData(arrayBuffer))
      .then(audioBuffer => {
        return audioBuffer
      })
  }

  function doomPlay (audioBuffer) {
    const source = doomAudioContext.createBufferSource()
    source.buffer = audioBuffer
    source.connect(doomAudioContext.destination)
    source.start()
  }

  function doomUpdateFace (face) {
    let offset
    switch (face) {
      case 0:
        offset = '0%'
        break
      case 1:
        offset = '19.1%'
        break
      case 2:
        offset = '38.2%'
        break
      case 3:
        offset = '58.1%'
        break
      case 4:
        offset = '78.9%'
        break
      case 5:
        offset = '99%'
        break
    }
    // switch for orientation
    document.getElementById('doom-face-img').style.backgroundPositionY = offset
  }

  function doomRemainingUpdate (face) {
    let offset
    switch (face) {
      case 0:
        offset = '0%'
        break
      case 1:
        offset = '20%'
        break
      case 2:
        offset = '40%'
        break
      case 3:
        offset = '60%'
        break
      case 4:
        offset = '80%'
        break
      case 5:
        offset = '100%'
        break
    }
    document.getElementById('doom-health-img').style.backgroundPositionY = offset
  }

  function doomTakeDamage () {
    // If sound is enabled and we're not about to die play the pain sound.
    if (doomSound && doomFaceState < 5) {
      doomPlay(doomPain)
    }
    doomRemainingUpdate(doomFaceState)
    doomUpdateFace(doomFaceState++)
    // Add and then remove the CSS damage animation.
    const a = document.getElementById('doom-damage')
    a.classList.add('doom-damage')
    setTimeout(function () {
      a.classList.remove('doom-damage')
    }, 200)
    // If the switch case for the faceState is the final image, then trigger a game over.
    if (doomFaceState === 6) {
      doomGameOver()
      // If sound is enabled play the final death sound.
      if (doomSound) {
        doomPlay(doomDeath)
      }
    }
  }

  function doomGameOver () {
    // Trigger the game over CSS animation.
    document.getElementById('doom-gameover').classList.add('doom-gameover-animate')
  }

  function doomCheckForDamage (scrollPos) {
    // Do something with the scroll position
    if ((scrollPos > nextDamagePosition) && (doomFaceState <= 5)) {
      doomTakeDamage()
      nextDamagePosition += (window.innerHeight * doomScrollDamage)
    }
  }

  window.addEventListener('scroll', function (e) {
    if (nextDamagePosition === null) {
      nextDamagePosition = (window.innerHeight * doomScrollDamage) + window.scrollY
    }
    doomLastScroll = window.scrollY

    if (!ticking) {
      window.requestAnimationFrame(function () {
        doomCheckForDamage(doomLastScroll)
        ticking = false
      })

      ticking = true
    }
  })
  return function () {
  }
}
if (chrome || browser) {
  const getFromStorage = (keys) => {
    if (chrome.storage) {
      return new Promise((resolve, reject) => chrome.storage.local.get(keys, resolve))
    } else {
      return browser.storage.local.get(keys)
    }
  }
  getFromStorage('sites')
    .then(({ sites }) => {
      const siteList = sites.split('\n')
      if (siteList.includes(window.location.hostname)) {
        doomScroller.start()
      }
    })
} else if (doomScroller.autoStart !== false) {
  doomScroller.start()
}
