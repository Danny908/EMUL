// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
const {shell} = require('electron');
const ipc = require('electron').ipcRenderer;
const fs = require('fs');

// Required local files 
const newEmulator = require('./donwloadEmul');

// Machine OS
const os = process.platform;

// Variables to save JSON data
let emulData = '';
let platformList;
let sortyByList;
let emulators;

// Other variables
let extencion;
let globalPath;

// Get app path
 ipc.send('get-app-path');
 ipc.on('got-app-path', function (event, path) {
    globalPath = path
    // Read data folder to get list of emulators
    emulData = JSON.parse(fs.readFileSync(`${path}/src/data/emulators-data.json`,{encoding: 'utf-8'}));
    platformList = JSON.parse(fs.readFileSync(`${path}/src/data/platforms.json`,{encoding: 'utf-8'}));
    sortyByList = JSON.parse(fs.readFileSync(`${path}/src/data/filters.json`,{encoding: 'utf-8'}));

    if(process.platform === 'darwin') {
        emulators = JSON.parse(fs.readFileSync(`${path}/src/data/mac-emulators.json`,{encoding: 'utf-8'}));
        extencion = 'dmg';
    } else {

    }

    newEmulator.setUp(emulData, platformList, sortyByList, globalPath);
 });

// Filters call functions
window.onChangePlatform = onChangePlatform;
function onChangePlatform(e) {
    newEmulator.filter(e, emulData);
}
window.onChangeSort = onChangeSort;
function onChangeSort(e) {
    newEmulator.sortBy(e, emulData);
}
window.onChangeOrder = onChangeOrder;
function onChangeOrder(e) {
    newEmulator.showBy(e, emulData);
}
window.emulSelected = emulSelected;
function emulSelected(id, set = false){
  newEmulator.emulDetails(id, emulators, set);
}

// Open emulators home page
emulPage.addEventListener('click', function(e) {
    let url = e.currentTarget.value;
    shell.openExternal(url);
});

// Download & install new Emulator
// TODO: Add support for multiple downloads
emulDownload.addEventListener('click', function(e) {
    let url = e.currentTarget.value;
    newEmulator.downloadEmul(url, emulators, extencion, emulData, platformList, sortyByList);
});




