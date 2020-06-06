/*
    function storeUserPrefs() {
    var key = "myKey",
        testPrefs = JSON.stringify({
            'val': 10
        });
    var jsonfile = {};
    jsonfile[key] = testPrefs;
    chrome.storage.sync.set(jsonfile, function () {
        console.log('Saved', key, testPrefs);
    });
}

import { readFile, writeFile } from 'fs'
var permission = ''
var url = 'www.facebook.com'
readFile('./manifest.json', 'utf8', (err, jsonString) => {
  if (err) {
    console.log("Error reading file from disk:", err)
    return
  }
  try {
    permission = JSON.parse(jsonString)
  } catch (err) {
    console.log('Error parsing JSON string:', err)
  }
})
permission['permissions'].append(`*://*${url}/`)
const updatejson = JSON.stringify(permission)
writeFile('./manifest.json', updatejson, err => {
  if (err) {
    console.log('Error writing file', err)
  } else {
    console.log('Successfully wrote file')
  }
})
*/
function strip (url) {
  if (url.includes('http://') ) {
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
