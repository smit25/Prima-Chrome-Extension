var website = ''
var timeLimit = -1
var startTimeh = 0
var startTimem = 0
var endTimeh = 0
var endTimem = 0
var viewTime = {}
var blockUrl = {}
var st = -1
var end = -1
var list = ''

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

if (st == -1 && end == -1) {
  chrome.storage.sync.get("st", (data) => {
    let st2 = data['st']
    if (st2 != 'undefined') {
      document.getElementById('startTime').value = st2
    }
  })
  chrome.storage.sync.get("end", (data) => {
    let end2 = data['end']
    if (end2 != 'undefined') {
      document.getElementById('stopTime').value = end2
    }
  })
}
var maxField = 5

let add = document.getElementById('add')
add.addEventListener('click', (e) => {
  e.preventDefault()
  website = document.getElementById('url').value
  timeLimit = document.getElementById('urlLimit').value
  let stripped = strip(website)
  console.log('addcheck' + website)
  if (stripped in blockUrl) {
    document.getElementById('write-message').innerHTML = 'Website already Present!'
    document.getElementById('url').value = ''
    document.getElementById('urlLimit').value = ''
    setTimeout(() => {
      document.getElementById('write-message').innerHTML = ''
    }, 1500)
  } if (website == null) {
    document.getElementById('write-message').innerHTML = 'Please enter the website you wish to block'
    setTimeout(() => {
      document.getElementById('write-message').innerHTML = ''
    }, 1500)
  } else if (timeLimit == '') {
    document.getElementById('write-message').innerHTML = 'Please enter the timeLimit for the website'
    setTimeout(() => {
      document.getElementById('write-message').innerHTML = ''
    }, 1500)
  } else {
    blockUrl[stripped] = timeLimit
    console.log(blockUrl)
    chrome.storage.sync.set({ "blockUrl" : blockUrl }, () => {
      console.log('added!')
      document.getElementById('url').value = ''
      document.getElementById('urlLimit').value = ''
      document.getElementById('write-message').innerHTML = 'Website and its time added!'
      setTimeout(() => {
        document.getElementById('write-message').innerHTML = ''
      }, 1500)
    })
  }
})

const form = document.getElementById('inputForm')
form.addEventListener('submit', (event) => {
  event.preventDefault()
  st = document.getElementById('startTime').value
  let stlist = st.split(':')
  startTimeh = stlist[0]
  startTimem = stlist[1]
  end = document.getElementById('stopTime').value
  let endlist = end.split(':')
  endTimeh = endlist[0]
  endTimem = endlist[1]
  var timeSet = [startTimeh, startTimem, endTimeh, endTimem]

  chrome.storage.sync.set({ "timeSet": timeSet }, () => {
    console.log(`Start & End time set`)
  })
  chrome.storage.sync.set({ "st":st }, () => {
    console.log('yes 1')
  })
  chrome.storage.sync.set({ "viewTime": viewTime }, () => {
    console.log(`viewTime set`)
  })
  chrome.storage.sync.set({ "end": end }, () => {
    console.log('yes 2')
  })
})

let start = document.getElementById('start')


start.addEventListener('click', () => {
  chrome.storage.sync.get("viewTime", (data) => {
    if (!data['viewTime']) {
      document.getElementById('write-message').innerHTML = 'Please Set'
    } else {
      chrome.runtime.sendMessage({ command: '0' }, (response) => {
        console.log('start background ' + response.message)
      })
    }
  })
})
let pause = document.getElementById('stop')
pause.addEventListener('click', () => {
  chrome.runtime.sendMessage({ command: '1' }, (response) => {
    console.log(`pause background` + response.message)
  })
})

let viewTab = document.getElementById('viewTab')
viewTab.addEventListener('click', (e) => {
  e.preventDefault()
  document.getElementById('overlay').style.display = 'block'
  console.log('viewTab clicked')
  chrome.storage.sync.get("viewTime", (data) => {
    try {
      viewTime = data['viewTime']
      console.log(viewTime)
      document.getElementById('list').innerHTML = '<ul id = "viewTab-item">' + "View Time of your websites today!" + '</ul>'
      for (var i in viewTime) {
        document.getElementsByClassName('viewTab-item').innerHTML += '<li>' + i.key + '&emsp' + i.value + '</li>'
      }
    } catch (err) {
      console.log(err)
    }
  })
})

let blockTab = document.getElementById('blockTab')
blockTab.addEventListener('click', (e) => {
  e.preventDefault()
  console.log('blockTab clicked')
  chrome.storage.sync.get("blockUrl", (data) => {
    try {
      blockUrl = data['blockUrl']
      console.log(blockUrl)
      list = '<ul id = "list">'
      list += "Websites you have entered!"
      let len = Object.keys(blockUrl).length
      console.log()
      for (let i = 0; i < len; i++) {
        console.log(Object.keys(blockUrl)[i] + '-' + blockUrl[Object.keys(blockUrl)[i]])
        list += '<li>' + Object.keys(blockUrl)[i] + '<&emsp>' + blockUrl[Object.keys(blockUrl)[i]] + '<button class = "delete-btn">Remove</button>' + '</li>'
      }
      list += '</ul>'
      document.getElementById('overlay').innerHTML = list
      document.getElementById('overlay').style.display = 'inline-block'
    } catch (err) {
      console.log(err)
    }
  })
})

let unblockAll = document.getElementById('unblock')
unblockAll.addEventListener('click', (e) => {
  e.preventDefault()
  chrome.runtime.sendMessage({ command: '2' }, (response) => {
    console.log(`pause background` + response.message)
  })
})
function off () {
  document.getElementById('overlay').style.display = "none";
  list = ''
  document.getElementById('overlay').innerHTML = list
}

document.getElementById('overlay').onclick = () => { off() }
let deleteBtn = document.getElementsByClassName("delete-btn");
Array.prototype.slice.call(deleteBtn).forEach(function (item) {
  item.addEventListener("click", function (e) {
    let s = e.target.parentNode.value
    let sList = s.split('->')
    s = sList[0]
    e.target.parentNode.remove()
    chrome.storage.sync.get("blockUrl", (data) =>{
      try {
        blockUrl = data['blockUrl']
        delete blockUrl[s]
        chrome.storage.sync.set({ "blockUrl": blockUrl }, () => {
          console.log(s + ' removed')
        })
      } catch (err) {
        console.log(err)
      }
    })
  });
})
