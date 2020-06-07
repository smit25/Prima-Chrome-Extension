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
  chrome.storage.local.get("st", (data) => {
    let st2 = data['st']
    if (st2 != 'undefined') {
      document.getElementById('startTime').value = st2
    }
  })
  chrome.storage.local.get("end", (data) => {
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
  } if (website == '') {
    document.getElementById('write-message').innerHTML = 'Please enter the url!'
    setTimeout(() => {
      document.getElementById('write-message').innerHTML = ''
    }, 1500)
  } else if (timeLimit == '') {
    document.getElementById('write-message').innerHTML = 'Please enter the time limit!'
    setTimeout(() => {
      document.getElementById('write-message').innerHTML = ''
    }, 1500)
  } else {
    chrome.storage.local.get("blockUrl", (data) => {
      if ((blockUrl) != 'undefined' && Object.keys(blockUrl).length >= 12) {
        blockUrl = data['blockUrl']
        document.getElementById('url').value = ''
        document.getElementById('urlLimit').value = ''
        document.getElementById('write-message').innerHTML = 'Url limit reached!'
        setTimeout(() => {
          document.getElementById('write-message').innerHTML = ''
        }, 1500)
      } else {
        blockUrl[stripped] = timeLimit // *60 CONVERT TO MINS
        console.log(blockUrl)
        chrome.storage.local.set({ "blockUrl" : blockUrl }, () => {
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

  chrome.storage.local.set({ "timeSet": timeSet }, () => {
    console.log(`Start & End time set`)
  })
  chrome.storage.local.set({ "st":st }, () => {
    console.log('yes 1')
  })
  chrome.storage.local.set({ "viewTime": viewTime }, () => {
    console.log(`viewTime set`)
  })
  chrome.storage.local.set({ "end": end }, () => {
    console.log('yes 2')
  })
})

let start = document.getElementById('start')

start.addEventListener('click', () => {
  document.getElementById('write-message').innerHTML = "It's time to be productive!"
  setTimeout(() => {
    document.getElementById('write-message').innerHTML = ''
  }, 1500)
  chrome.storage.local.get("viewTime", (data) => {
    if (!data['viewTime']) {
      document.getElementById('write-message').innerHTML = 'Please Set'
      setTimeout(() => {
        document.getElementById('write-message').innerHTML = ''
      }, 1500)
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
    document.getElementById('write-message').innerHTML = "You're on a break!"
    setTimeout(() => {
      document.getElementById('write-message').innerHTML = ''
    }, 1500)
  })
})

let viewTab = document.getElementById('view-tab')
viewTab.addEventListener('click', (e) => {
  e.preventDefault()
  console.log('viewTab clicked')
  document.getElementById('blockurl').style.display = 'none'
  chrome.storage.local.get("viewTime", (data) => {
    try {
      viewTime = data['viewTime']
      console.log(viewTime)
      list = '<h4>Websites and their use time:</h4>'
      list += '<table id = "block-table">'
      list += '<tr>'
      list += '<th> Website Url </th>'
      list += '<th> Time Used </th>'
      list += '</tr>'
      let len = Object.keys(viewTime).length
      console.log()
      for (let i = 0; i < len; i++) {
        if (Object.keys(viewTime)[i] == '') { continue }
        list += '<tr>'
        list += '<td>' + Object.keys(viewTime)[i] + '</td>'
        list += '<td>' + viewTime[Object.keys(viewTime)[i]] + '</td>'
        list += '</tr>'
      }
      list += '</table>'
      document.getElementById('view').innerHTML = list
      document.getElementById('view').style.display = 'block'

    } catch (err) {
      console.log(err)
    }
  })
})

let home = document.getElementById('nav-home-tab')
home.onclick = (e) => {
  document.getElementById('blockurl').innerHTML = ''
  document.getElementById('view').innerHTML = ''
}

let blockTab = document.getElementById('block-tab')
blockTab.addEventListener('click', (e) => {
  e.preventDefault()
  document.getElementById('view').innerHTML = ''
  console.log('blockTab clicked')
  chrome.storage.local.get("blockUrl", (data) => {
    try {
      blockUrl = data['blockUrl']
      console.log(blockUrl)
      list = '<h4>Your list of unproductive websites:</h4>'
      list += '<table id = "block-table">'
      list += '<tr>'
      list += '<th> Website Url </th>'
      list += '<th> Time Limit for that URL </th>'
      list += '<th> Delete </th>'
      list += '</tr>'
      let len = Object.keys(blockUrl).length
      console.log()
      for (let i = 0; i < len; i++) {
        console.log(Object.keys(blockUrl)[i] + '-' + blockUrl[Object.keys(blockUrl)[i]])
        list += '<tr>'
        list += '<td>' + Object.keys(blockUrl)[i] + '</td>'
        list += '<td>' + blockUrl[Object.keys(blockUrl)[i]] + '</td>'
        list += '<td><button type = "button" id = "delete-btn">Remove</button> </td>'
        list += '</tr>'
      }
      list += '</table>'
      document.getElementById('blockurl').innerHTML = list
      document.getElementById('blockurl').style.display = 'block'
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
    document.getElementById('write-message').innerHTML = 'Unblocked all websites!'
    setTimeout(() => {
      document.getElementById('write-message').innerHTML = ''
    }, 1500)
  })
})

$('#blockurl').on('click', '#delete-btn', (e) => {
  e.preventDefault()
  console.log('Harvey Donna')
  var td = e.target.parentNode
  var tr = td.parentNode // the row to be removed
  console.log(tr)
  let s = tr.cells[0].innerHTML
  console.log(s)
  tr.parentNode.removeChild(tr)
  chrome.storage.local.get("blockUrl", (data) =>{
    try {
      blockUrl = data['blockUrl']
      delete blockUrl[s]
      console.log(blockUrl)
      chrome.storage.local.set({ "blockUrl": blockUrl }, () => {
        console.log(s + ' removed')
      })
    } catch (err) {
      console.log(err)
    }
  })
})
