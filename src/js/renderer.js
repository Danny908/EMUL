// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
const {shell} = require('electron');
const ipc = require('electron').ipcRenderer;
const fs = require('fs');

// Required local files 
const downloadEmulator = require('./donwloadEmul');
const launchEmulator = require('./launchEmul');

// Machine OS
const os = process.platform;

// Element where templates goin to be inserted
let eList = document.getElementById('eList');
let emulName = document.getElementById('emulName');
let emulDesc = document.getElementById('emulDesc');
let aditionalInfo = document.getElementById('aditionalInfo');
let emulPage = document.getElementById('emulPage');
let emulLogo = document.getElementById('emulLogo');
let emulDownload = document.getElementById('emulDownload');
let templateContainer = [eList, emulName, emulDesc, aditionalInfo, emulPage, emulLogo, emulDownload];
let progress = document.getElementById('progress');
let status = document.getElementById('status');

// Variables to save JSON data
let emulData = '';
let platformList;
let sortyByList;
let emulators;

// Other variables
let extencion;
let emulExtencion;
let globalPath;
let runTimeIDs;

// Default filters value
let filter = 'release';
let order = 'desc';
let platform = 'All';

// Get app path
 ipc.send('get-app-path');
 ipc.on('got-app-path', function (event, path) {
    globalPath = path;
    // Read data folder to get list of emulators
    emulData = JSON.parse(fs.readFileSync(`${path}/src/data/emulators-data.json`,{encoding: 'utf-8'}));
    platformList = JSON.parse(fs.readFileSync(`${path}/src/data/platforms.json`,{encoding: 'utf-8'}));
    sortyByList = JSON.parse(fs.readFileSync(`${path}/src/data/filters.json`,{encoding: 'utf-8'}));

    if(process.platform === 'darwin') {
        emulators = JSON.parse(fs.readFileSync(`${path}/src/data/mac-emulators.json`,{encoding: 'utf-8'}));
        extencion = 'dmg';
        emulExtencion = '.app';
    } else {

    }
    downloadEmulator.setUp(emulData, globalPath, platformList, sortyByList);
    launchEmulator.setUp(emulData);
 });

/* = = = = = = = = = = = =
/*   Modal section
/* = = = = = = = = = = = */
// Filters call functions
window.onChangePlatform = onChangePlatform;
function onChangePlatform(e) {
    platform = e.value;
    downloadEmulator.sort(filter, order, emulData, platform);
}
window.onChangeSort = onChangeSort;
function onChangeSort(e) {
    filter = e.value;
    downloadEmulator.sort(filter, order, emulData, platform);
}
window.onChangeOrder = onChangeOrder;
function onChangeOrder(e) {
    order = (order === 'desc') ? 'asc' : 'desc';
    downloadEmulator.sort(filter, order, emulData, platform);
}
window.emulSelected = emulSelected;
function emulSelected(id){
  runTimeIDs = downloadEmulator.detailsTemplate(id, emulators, templateContainer);
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
    downloadEmulator.download(url, emulData, emulators, progress, status, runTimeIDs, extencion, globalPath);
});

/* = = = = = = =
* Main section
= = = = = = = */

// Launch emulators




