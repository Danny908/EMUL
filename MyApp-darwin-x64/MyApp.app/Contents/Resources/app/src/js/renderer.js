// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
const ipc = require('electron').ipcRenderer
const fs = require('fs');

console.log(window && window.process && window.process.type);
// Get app path
//  ipc.send('get-app-path');

//  ipc.on('got-app-path', function (event, path) {
//    const message = `This app is located at: ${path}`
   
//    // Create folder & json to store emulators path
//     if (!fs.existsSync(`${path}/src/emulators-path`)) {
//       fs.mkdirSync(`${path}/src/emulators-path`);
//     }
//  });



// if (!fs.existsSync(`${app_path}/emulators_path/paths.json`)) {
//      fs.openSync(`${app_path}/emulators_path/paths.json`, 'w');
// }

//console.log(JSON.parse(fs.readFileSync('./emulPaths/paths.json',{encoding: 'utf-8'})));


// Read data folder to get list of emulators
let emulData = JSON.parse(fs.readFileSync('./src/data/emulators-data.json',{encoding: 'utf-8'}));
let platformList = JSON.parse(fs.readFileSync('./src/data/platforms.json',{encoding: 'utf-8'}));
let sortyByList = JSON.parse(fs.readFileSync('./src/data/filters.json',{encoding: 'utf-8'}));
let listTemplate = '';
let platformTemplate;
let sortTemplate;

let list = document.getElementById('latList');
let filter = document.getElementById('platform');
let sortBy = document.getElementById('sortBy'); 

// Defaul filters
let platform = 'All';
let sort = 'release';

sortList(sort);
templateList();

// Populate filters dropdown
platformList.forEach(res => {
    platformTemplate += `<option value="${res}">${res}</option>`;
});

sortyByList.forEach( res => {
    sortTemplate += `<option value="${res.value}">${res.field}</option>`
});

list.innerHTML = listTemplate ;
filter.innerHTML = platformTemplate;
sortBy.innerHTML = sortTemplate;

// Sort emulators list
function sortList(value) {
    if(typeof(emulData[0][value]) === 'number')
        emulData.sort(function(x, y) {
            return x[value] - y[value];
        });
    else
        emulData.sort(function(x, y) {
            return (x[value] > y[value]) - (x[value] < y[value]);
        });
}

// Create modal list html template
function templateList() {
    emulData.forEach(res => {
    if(res.installed)
        return;

    listTemplate +=
        `<div click="emulSelected(${res.id})" class="select-emul" title="${res.name}">
            <img src="${res.image}">
        </div>`;
    });
}




