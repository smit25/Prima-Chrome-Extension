// import {block } from './block.js';
// import {unblock } from './block.js';
// import {myfunc} from './block.js';

console.log('Begin')
var viewTime = {}
var currDay = ''
var mainUrl = ''
var blockUrl = {}
var loop = 0
// console.log('Smit')

function strip (url) {
  if (url.includes('http://')) {
    let urlList = url.split('/')
    let add = 'http://'
    url = add.concat(urlList[2])
  } else if (url.includes('https://')) {
    let urlList = url.split('/')
    let add = 'https://'
    url = add.concat(urlList[2])
  } else {
    let urlList = url.split('/')
    url = urlList[0]
  }
  return url
}
var receive = (url) => {
  mainUrl = strip(url)
  chrome.storage.local.get("viewTime", (result) => {
    if (result) {
      viewTime = result['viewTime']
      // console.log(viewTime)
      if (typeof (viewTime[mainUrl]) == 'undefined') {
        viewTime[mainUrl] = 0
        chrome.storage.local.set({"viewTime" : viewTime }, () => {
          console.log(`Website added ${mainUrl}`)
        })
      } else {
        console.log(`Url already present`)
      }
    }
  })
  return mainUrl
}
// RECEIVE URL FROM CHROME API

// console.log('Smit')
chrome.tabs.onActivated.addListener(function (activeInfo) { // Event Fires when the active tab in a window changes.
  chrome.tabs.get(activeInfo.tabId, async function (tab) {
    let Url = tab.url// url of new tab
    try {
      mainUrl = await receive(Url)
      console.log(`Url found ${mainUrl}`)
    } catch (err) {
      console.log(err)
    }
  })
})

// UPDATION OF TABS
chrome.tabs.onUpdated.addListener(async (tabId, change, tab) => { // Fired when a tab is updated
  if (tab.active && change.url) {
    let Url = change.url
    try {
      // console.log(Url)
      let main = receive(Url)
      console.log(`Url updated ${main}`)
    } catch (err) {
      console.log(err)
    }
  }
})
// UPDATION AND DELETE.
var tabToUrl = {}
chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
  tabToUrl[tabId] = tab.url
})
chrome.tabs.onRemoved.addListener(function (tabId, removeInfo) { // Fired when a tab is closed
// mapping for getting url of removed tab sinse tab is not available inside onRemoved
  console.log(`Tab closed ${tabToUrl[tabId]}`)
  // Remove information for non-existent tab
  delete tabToUrl[tabId]
})

var myfunc = function (details) {
  return { cancel: true }
}

var block = (url, myfunc) => {
  chrome.webRequest.onBeforeRequest.addListener(
    myfunc,
    { urls: [`${url}/*`] },
    ['blocking'])
  console.log('Website blocked ' + url)
}

var unblock = (myfunc) => {
  chrome.webRequest.onBeforeRequest.removeListener(myfunc)
  console.log('All websites unblocked')
  chrome.tabs.reload(() => { console.log('reloaded') })
  chrome.storage.local.get("viewTime", (data) => {
    viewTime = data['viewTime']
    // console.log('lmao')
    let l = Object.keys(viewTime).length
    for (let i = 0; i < l; i++) {
      if (viewTime[Object.keys(viewTime)[i]] == 'blocked') { viewTime[Object.keys(viewTime)[i]] = 0 }
    }
    chrome.storage.local.set({ "viewTime" : viewTime }, () => { console.log(`unblocked and updated`) })
  })
}

// BACKGROUND

var background = () => {
  var d = new Date()
  var day = d.getDay()
  var hrs = d.getHours()
  var mins = d.getMinutes()
  let timeSet = []
  var startTime = ''
  var endTime = ''
  var currTime = hrs+"."+mins
  console.log(typeof (currTime))
  
  chrome.storage.local.get("timeSet", (data) => {
    timeSet = data['timeSet']
    console.log('----' + typeof (timeSet))
    startTime = timeSet[0] + "." + timeSet[1]
    endTime = timeSet[2] + "." + timeSet[3]
  })
  console.log(typeof (startTime))
  chrome.storage.local.get("viewTime", (result) => {
    if (result) {
      viewTime = result['viewTime']
      // console.log(viewTime)
    }
    if (day != currDay) {
      viewTime = {}
      chrome.storage.local.set({"viewTime" : viewTime }, () => {
        console.log('New day, history cleared')
      })
    }
    currDay = day

    chrome.storage.local.get("blockUrl", (data) => {
      blockUrl = data['blockUrl']
      // console.log('blockUrl accessed')
      // console.log(startTime + '-' + currTime + '-' + endTime)
      if (startTime <= currTime && currTime < endTime) {
        // console.log(viewTime[mainUrl] + ' ' + blockUrl[mainUrl])
        if ((mainUrl in blockUrl) && (viewTime[mainUrl] >= blockUrl[mainUrl]) && (viewTime[mainUrl] != 'blocked')) {
          block(mainUrl, myfunc)
          chrome.tabs.reload(() => { console.log('reloaded') })
          viewTime[mainUrl] = 'blocked'
          chrome.storage.local.set({ 'viewTime': viewTime }, () => {
            console.log(`${mainUrl} blocked`)
          })
        }
      } if (viewTime[mainUrl] != 'blocked') {
        let newTime = viewTime[mainUrl] + 2
        viewTime[mainUrl] = newTime
        chrome.storage.local.set({ 'viewTime': viewTime }, () => {
          console.log('Time updated')
        })
      }
    })
  })
}

const newLocal = 2000

chrome.runtime.onMessage.addListener(
  function (request, sender, sendResponse) {
    console.log(`message received`)
    console.log(sender.tab ?
      'from a content script:' + sender.tab.url :
      'from the extension')

    if (request.command == '0') {
      console.log('command = 0')
      sendResponse({ message: "Started" })
      loop = setInterval(background, newLocal)
      // console.log('lol')
    } if (request.command == '1') {
      console.log(`command = 1`)
      clearInterval(loop)
      sendResponse({ message: "Paused" });
    } 
    if (request.command == '2') {
      console.log(`command = 2`)
      unblock(myfunc)
      sendResponse({ message: "Unblocked All!" });
    } 
  });
