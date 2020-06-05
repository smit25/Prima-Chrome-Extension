// import {block } from './block.js';
// import {unblock } from './block.js';
// import {myfunc} from './block.js';

<<<<<<< HEAD
console.log('Begin')
=======
// FETCH URL FROM HTML
var website = ''
var time = ''

 const form = document.getElementById('inputForm')
 form.addEventListener('submit', (event) => {
   event.preventDefault();
   website = document.getElementById('url').value
   console.log(`smit ${website}`)
 })

var blockUrl = {}
blockUrl['website'] = time
/*
chrome.storage.sync.set({ 'blockUrl': blockUrl }), () => {
  console.log(`BlockUrl set`);
}
var startTime = document.getElementsByName('startTime').value
var endtime = document.getElementsByName('endTime').value

chrome.storage.sync.set({ 'startTime': startTime, 'endTime': endTime }, () => {
  console.log(`Start & End time set`)
})

document.getElementById('start').addEventListener('click', setInterval(background, 2000))
document.getElementById('stop').addEventListener('click', clearInterval(background))

var currDay = 0
var mainUrl = ''
>>>>>>> dca6bbbfc65baf34a4501d510e01ba734e33bd5d
var viewTime = {}
var currDate = new Date()
var currDay = currDate.getDay()
var mainUrl = ''
var flag = true
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
  chrome.storage.sync.get("viewTime", (result) => {
    if (result) {
      viewTime = result['viewTime']
    }
    console.log(viewTime)
    if (typeof (viewTime[mainUrl]) == 'undefined') {
      viewTime[mainUrl] = 0
      chrome.storage.sync.set({"viewTime" : viewTime }, () => {
        console.log(`Website added ${mainUrl}`)
      })
    } else {
      console.log(`Url already present`)
    }
  })
  return mainUrl
}
// RECEIVE URL FROM CHROME API

console.log('Smit')
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
      console.log(Url)
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
}

// BACKGROUND

var background = () => {
  console.log('entered')
  var d = new Date()
  var day = d.getDay()
  var hrs = d.getHours()
  var mins = d.getMinutes()
  let timeSet = []
  let startTime
  let endTime
  var currTime = hrs+"."+mins
  chrome.storage.sync.get("timeSet", (data) => {
    timeSet = data['timeSet']
    startTime = timeSet[0] +"." + timeSet[1]
    endTime = timeSet[2] +"." + timeSet[3]
    if (flag == false) {
      if ((currTime >= endTime) || (currTime < startTime)) {
        unblock(myfunc);
        flag = true
      }
    }
  })
  chrome.storage.sync.get("viewTime", async (result) => {
    if (result) {
      viewTime = result['viewtime']
    }
    if (day != currDay) {
      viewTime.clear()
      chrome.storage.sync.set({"viewTime" : viewTime }, () => {
        console.log('New day, history cleared')
      })
      currDay = day
    }
  })
  chrome.storage.sync.get("blockUrl", (data) => {
    blockUrl = data['blockUrl']
    console.log('blockUrl accessed')

    if (startTime <= currTime < endTime) {
      flag = false
      if (typeof (blockUrl['mainUrl']) != 'undefined' && viewTime['mainUrl'] >= blockUrl['mainUrl']) {
        block(mainUrl, myfunc);
        viewTime[mainUrl] = 'blocked'
        chrome.storage.sync.set({ 'viewTime': viewTime }, () => {
          console.log(`${mainUrl} blocked`)
        })
      }
    } if (viewTime[mainUrl] != 'blocked') {
      let newTime = viewTime[mainUrl] + 1
      viewTime[mainUrl] = newTime
      chrome.storage.sync.set({ 'viewTime': viewTime }, () => {
        console.log('Time updated')
      })
    }
  })
}

const newLocal = 2000

chrome.runtime.onMessage.addListener(
  function (request, sender, sendResponse) {
    console.log(`message received`)
    console.log(sender.tab ?
      'from a content script:' + sender.tab.url :
      'from the extension')

    if (request.command == true) {
      console.log('command = 0')
      sendResponse({ message: "Started" })
      loop = setInterval(background, newLocal)
      console.log('lol')
    } if (request.command == false) {
      console.log(`command = 1`)
      clearInterval(loop)
      sendResponse({ message: "Paused" });
    } 
  });
