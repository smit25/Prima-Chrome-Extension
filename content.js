var website = ''
var timeLimit = 0
var startTimeh = 0
var startTimem = 0
var endTimeh = 0
var endTimem = 0
var viewTime = {}
var blockUrl = {}
var st = -1
var end = -1

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
  chrome.storage.sync.get('st', (data) => {
    st = data['st']
    if (st != 'undefined') {
      document.getElementById('startTime').value = st
    }
  })
  chrome.storage.sync.get('end', (data) => {
    end = data['end']
    if (end !='undefined') {
      document.getElementById('stopTime').value = end
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
    console.log("Already present")
  } else {
    blockUrl[stripped] = timeLimit
  }
  document.getElementById('url').value = ''
  document.getElementById('urlLimit').value = ''
})

const form = document.getElementById('inputForm')
form.addEventListener('submit', (event) => {
  event.preventDefault()
  website = document.getElementById('url').value
  timeLimit = document.getElementById('urlLimit').value
  console.log('addcheck' + website)
  let stripped = strip(website)
  if (stripped in blockUrl) {
    console.log("Already present")
  } else {
    blockUrl[stripped] = timeLimit
    console.log(blockUrl)
  }

  st = document.getElementById('startTime').value
  let stlist = st.split(':')
  startTimeh = stlist[0]
  startTimem = stlist[1]
  end = document.getElementById('stopTime').value
  let endlist = end.split(':')
  endTimeh = endlist[0]
  endTimem = endlist[1]
  var timeSet = [startTimeh, startTimem, endTimeh, endTimem]
  chrome.storage.sync.set({ 'blockUrl': blockUrl }, () => {
    console.log(`BlockUrl set`)
  })

  chrome.storage.sync.set({ 'timeSet': timeSet }, () => {
    console.log(`Start & End time set`)
  })
  chrome.storage.sync.set({ 'st': st }, () => {
    console.log('yes 1')
  })
  chrome.storage.sync.set({ 'viewTime': viewTime }, () => {
    console.log(`viewTime set`)
  })
  chrome.storage.sync.set({ 'end': end }, () => {
    console.log('yes 2')
  })
})

let start = document.getElementById('start')
start.addEventListener('click', () => {
  console.log('hey')
  chrome.runtime.sendMessage({ command: true }, (response) => {
    console.log('start background ' + response.message)
  })
})

let pause = document.getElementById('stop')
pause.addEventListener('click', () => {
  chrome.runtime.sendMessage({ command: false }, (response) => {
    console.log(`pause background` + response.message)
  })
})

let viewTab = document.getElementById('viewTab')
viewTab.addEventListener('click' , (e) => {
  e.preventDefault()
  document.getElementById('overlay').style.display = 'block'
  console.log('viewTab clicked')
  chrome.storage.sync.get('viewTime', (data) => {
    try {
      viewTime = data['viewTime']
      console.log(viewTime)
      document.getElementById('list-viewTab').innerHTML = '<ul id = "viewTab-item">' + "View Time of your websites today!" + '</ul>'
      /* for (var i in viewTime) {
        document.getElementsByClassName('viewTab-item').innerHTML += '<li>' + i.key + '&emsp' + i.value + '</li>'
      } */
    } catch (err) {
      console.log(err)
    }
    
  })
})

let blockTab = document.getElementById('blockTab')
blockTab.addEventListener('click', (e) => {
  e.preventDefault()
  console.log('blockTab clicked')
  chrome.storage.sync.get('blockUrl', (data) => {
    try {
      blockUrl = data['blockUrl']
      console.log(blockUrl)
      document.getElementById('list-blockTab').innerHTML = '<ul id = "blockTab-item">' + "The websites you have blocked!" + '</ul>'
      /* for (var i in blockUrl) {
        document.getElementsByClassName('blockTab-item').innerHTML += '<li>' + i.key + "->" + '&emsp' + i.value + <button class = "delete-btn">Remove</button> </li>'
      } */
    } catch (err) {
      console.log(err)
    }
  })
})
function off () {
  document.getElementById("overlay").style.display = "none";
}

let deleteBtn = document.getElementsByClassName("delete-btn");
Array.prototype.slice.call(deleteBtn).forEach(function (item) {
  item.addEventListener("click", function (e) {
    let s = e.target.parentNode.value
    let sList = s.split('->')
    s = sList[0]
    e.target.parentNode.remove()
    chrome.storage.sync.get('blockUrl', (data) =>{
      try {
        blockUrl = data['blockUrl']
        delete blockUrl[s]
        chrome.storage.sync.set({ 'blockUrl': blockUrl }, () => {
          console.log(s + ' removed')
        })
      } catch (err) {
        console.log(err)
      }
    })
  });

})