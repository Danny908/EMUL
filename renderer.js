// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
const ipc = require('electron').ipcRenderer
const fs = require('fs');

//GET PATH APP
// const appInfoBtn = document.getElementById('path')

// appInfoBtn.addEventListener('click', function() {
//    ipc.send('get-app-path')
// })

// ipc.on('got-app-path', function (event, path) {
//   const message = `This app is located at: ${path}`
//   console.log(message);
// })