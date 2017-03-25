// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
const ipc = require('electron').ipcRenderer
const fs = require('fs');

// Variables to save JSON data
let emulData = '';
let platformList;
let sortyByList;

// Variables to create HTML template
let listTemplate = '';
let platformTemplate;
let sortTemplate;

// Element where templates goint
let list = document.getElementById('latList');
let filter = document.getElementById('platform');
let sortBy = document.getElementById('sortBy');
let showBy = document.getElementById('orderBy');

// Defaul filters
let platform = 'All';
let sort = 'release';
let order = 'desc';

// Get app path
 ipc.send('get-app-path');
 ipc.on('got-app-path', function (event, path) {
    
    // Read data folder to get list of emulators
    emulData = JSON.parse(fs.readFileSync(`${path}/src/data/emulators-data.json`,{encoding: 'utf-8'}));
    platformList = JSON.parse(fs.readFileSync(`${path}/src/data/platforms.json`,{encoding: 'utf-8'}));
    sortyByList = JSON.parse(fs.readFileSync(`${path}/src/data/filters.json`,{encoding: 'utf-8'})); 

    setUp(emulData, platformList, sortyByList);
 });

// Load default data view
function setUp(emulData, platformList, sortyByList) {
    sortList(sort, order);
    templateList(platform);

    // Populate filters dropdown
    platformList.forEach(res => {
        platformTemplate += `<option value="${res}">${res}</option>`;
    });

    sortyByList.forEach( res => {
        sortTemplate += `<option value="${res.value}">${res.field}</option>`
    });

    filter.innerHTML = platformTemplate;
    sortBy.innerHTML = sortTemplate;
}

// Filters functions
filter.addEventListener('change', function(e) {
    platform =  e.target.value;
    sortList(sort, order);
    templateList(platform);
});

sortBy.addEventListener('change',function(e) {
    sort = e.target.value;
    sortList(sort, order);
    templateList(platform);
});

showBy.addEventListener('click',function(e) {
    if (e.target.value === 'desc')
        order = 'asc';
    else
        order = 'desc';

    this.setAttribute('value', order);
    this.setAttribute('title', order.toUpperCase());
    sortList(sort, order);
    templateList(platform);
});

// Sort emulators list
function sortList(value, order) {
    if(order === 'desc') {
        if(typeof(emulData[0][value]) === 'number')
            emulData.sort(function(x, y) {
                return x[value] - y[value];
            });
        else
            emulData.sort(function(x, y) {
                return (x[value] > y[value]) - (x[value] < y[value]);
            });
    } else {
        if(typeof(emulData[0][value]) === 'number')
            emulData.sort(function(x, y) {
                return y[value] - x[value];
            });
        else
            emulData.sort(function(x, y) {
                return (y[value] > x[value]) - (y[value] < x[value]);
            });
    }
}

// Create modal list html template
function templateList(platform) {
    //Clean variable
    listTemplate = '';

    if(platform === 'All') {
        emulData.forEach(res => {
        if(res.installed)
            return;
            
        listTemplate +=
            `<div click="emulSelected(${res.id})" class="select-emul" title="${res.name}">
                <img src="${res.image}">
            </div>`;
        });
    } else {
        emulData.forEach(res => {
        if(res.installed || res.platform !== platform)
            return;
            
        listTemplate +=
            `<div click="emulSelected(${res.id})" class="select-emul" title="${res.name}">
                <img src="${res.image}">
            </div>`;
        });
    }
    list.innerHTML = listTemplate ;
}




