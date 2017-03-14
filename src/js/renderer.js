// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
const ipc = require('electron').ipcRenderer
const fs = require('fs');
const http = require ('http');

// Create folder & json to store emulators path
// if (!fs.existsSync('./emulPaths')) {
//     fs.mkdirSync('./emulPaths');
// }

// if (!fs.existsSync('./emulPaths/paths.json')) {
//     fs.openSync('./emulPaths/paths.json', 'w');
// }

//console.log(JSON.parse(fs.readFileSync('./emulPaths/paths.json',{encoding: 'utf-8'})));

//GET PATH APP
 /*const appInfoBtn = document.getElementById('path')

 appInfoBtn.addEventListener('click', function() {
    ipc.send('get-app-path')
 })

 ipc.on('got-app-path', function (event, path) {
   const message = `This app is located at: ${path}`
   console.log(message);
 })*/

// Read res folder to get 




