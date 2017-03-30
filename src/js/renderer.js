// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
const {shell} = require('electron');
const ipc = require('electron').ipcRenderer;
const fs = require('fs');
const http = require ('http');
const unzip = require('unzip');
const dmg = require('dmg');
const ncp = require ('ncp');

// Machine OS
const os = process.platform;

// Variables to save JSON data
let emulData = '';
let platformList;
let sortyByList;
let emulators;

// Variables to create HTML template
let listTemplate = '';
let platformTemplate;
let sortTemplate;

// Element where templates goin to be inserted
let list = document.getElementById('latList');
let filter = document.getElementById('platform');
let sortBy = document.getElementById('sortBy');
let showBy = document.getElementById('orderBy');
let emulatorView = document.getElementById('eList');
let emulatorName = document.getElementById('emulName');
let emulatorDesc = document.getElementById('emulDesc');
let emulatorInfo = document.getElementById('aditionalInfo');
let emulPage = document.getElementById('emulPage');
let emulLogo = document.getElementById('emulLogo');
let emulDownload = document.getElementById('emulDownload');
let progress = document.getElementById('progress');
let status = document.getElementById('status');
let emulatorSelected;

// Defaul filters
let platform = 'All';
let sort = 'release';
let order = 'desc';

// Other variables
let extencion;
let currentId;
let fileSize = 0;
let fileDownloaded = 0;
let numOfDownloads = 0;
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
    // Clean variable
    listTemplate = '';

    if(platform === 'All') {
        emulData.forEach(res => {
        if(res.installed)
            return;
            
        listTemplate +=
            `<div onclick="emulSelected(${res.id})" value="${res.id}" class="select-emul" title="${res.name}">
                <img src="${res.image}">
            </div>`;
        });
    } else {
        emulData.forEach(res => {
        if(res.installed || res.platform !== platform)
            return;
            
        listTemplate +=
            `<div onclick="emulSelected(${res.id})" value="${res.id}" class="select-emul" title="${res.name}">
                <img src="${res.image}">
            </div>`;
        });
    }
    list.innerHTML = listTemplate ;
}

// Select an Emulator
window.emulSelected = emulSelected;

function emulSelected(id, set = false){
    if(set) {
        emulatorView.removeAttribute('style');
        emulLogo.removeAttribute('src');
        emulLogo.setAttribute('hidden', true);
        emulatorName.innerHTML = '';
        emulatorDesc.innerHTML = '';
        emulatorInfo.innerHTML = '';
        emulPage.setAttribute('disabled', true);
        emulDownload.setAttribute('disabled', true);
    } else {
        currentId = setEmul(id);
        emulatorSelected = document.getElementsByClassName('select-emul');
        for(let a = 0; a < emulatorSelected.length; a++){
            if(Number(emulatorSelected[a].getAttribute('value')) === id)
                emulatorSelected[a].style.animation = 'emulSelected 0.7s infinite';
            else
                emulatorSelected[a].removeAttribute('style');
        }
        emulatorView.setAttribute('style',
            `background: linear-gradient(rgba(32, 85, 167, 0.5) -23%, rgba(0, 0, 0, 0.83) 60%) -30px,
                        url(${emulators[currentId].image}) no-repeat;
            background-size: auto, cover;`);
        emulLogo.removeAttribute('hidden');
        emulLogo.setAttribute('src',`${emulators[currentId].logo}`);
        emulatorName.innerHTML = emulators[currentId].name;
        emulatorDesc.innerHTML = emulators[currentId].description;
        emulatorInfo.innerHTML = 
            `<ul><label>Autor : </label>${emulators[currentId].autor}</ul>
            <ul><label>Size : </label>${emulators[currentId].size}</ul>
            <ul><label>OS Supported : </label>${emulators[currentId].os}</ul>`;
        emulPage.removeAttribute('disabled');
        emulDownload.removeAttribute('disabled');
        emulPage.setAttribute('value', emulators[currentId].homepage);
        emulDownload.setAttribute('value', emulators[currentId].link);
    }   
}

// Open emulators home page
emulPage.addEventListener('click', function(e) {
    let url = e.currentTarget.value;
    shell.openExternal(url);
});

// Download & install new Emulator
emulDownload.addEventListener('click', function(e) {
    let url = e.currentTarget.value;
    let newIntance;

    if(!fs.existsSync('./src/EMULATORS')) {
        fs.mkdirSync('./src/EMULATORS');
    }
    
    progress.style.height = '4px';
    status.removeAttribute('hidden');
    status.innerHTML = `WAITING RESPONSE`;
    
    downloadEmul(url);
});

// Download emulator
function downloadEmul(url) {
    let newEmulator;
    // TODO: ADD network validation
    http.get(url, function(response) {
        if(response.statusCode !== 200) {
            status.innerHTML = `EMULATOR NOT FOUND`;
            return;
        }
       fs.mkdirSync(`./src/EMULATORS/${emulators[currentId].name}`);
       newEmulator = fs.createWriteStream(`./src/EMULATORS/${emulators[currentId].name}/emulator.${extencion}`)
       
       numOfDownloads++;
       fileSize = response.headers[ 'content-length' ];
       
       progress.setAttribute('max', fileSize);
       if(numOfDownloads > 1)
            status.innerHTML = `DOWNLOADING ${numOfDownloads} ELEMENTS`;
       
       status.innerHTML = `DOWNLOADING ${numOfDownloads} ELEMENT`;
       
       response.pipe(newEmulator);

       response.on('data', function(chunk) {
           fileDownloaded += chunk.length;
           progress.setAttribute('value', fileDownloaded);
       });

       response.on('end', function() {
           fileDownloaded = 0;
           numOfDownloads--;
           if(numOfDownloads === 0) {
               status.innerHTML = `INSTALLING`;
               installEmul();
           }
           else {
               status.innerHTML += `<br>INSTALLING`;
           }
       });
    }).on('error',(e) => {
        console.log(e.message);
    });
}
// Unpackage new emulator
function installEmul(path) {
    switch(os) {
        case 'darwin':
            dmg.mount(`${globalPath}/src/EMULATORS/${emulators[currentId].name}/emulator.dmg`, function(err, path) {    
                cloneDir(path);
                //Create rooms folder
                fs.mkdirSync(`${globalPath}/src/EMULATORS/${emulators[currentId].name}/roms`);
                updateState();
                dmg.unmount(path, function(err) {});
            });
            break;
    }

    

    // // TODO: Add OS Validation to use the right unpackage method
    // fs.createReadStream(`./src/EMULATORS/${emulators[currentId].name}/emulator.${extencion}`).pipe(unzip.Extract({ path: `./src/EMULATORS/${emulators[currentId].name}`}));
}

function cloneDir(path) {
    ncp.limit = 16;
    ncp(path, `${globalPath}/src/EMULATORS/${emulators[currentId].name}`, function(err) {
        if(err) {
        return;
        }
    });
}

function updateState() {
    status.innerHTML = `DONE`;
    

    // Delete emulator package
    fs.unlinkSync(`${globalPath}/src/EMULATORS/${emulators[currentId].name}/emulator.${extencion}`);

    setTimeout(function() {
        progress.removeAttribute('style');
        progress.setAttribute('value', 0);
        status.setAttribute('hidden', true);
    },500);

    // Change emulator state to installed
    emulData[currentId].installed = true;

    // Write change on file
    fs.writeFileSync(`${globalPath}/src/data/emulators-data.json`, JSON.stringify(emulData), {encoding: 'utf-8'});

    // Update list
    setUp(emulData, platformList, sortyByList);

    //Update modal content
    if(emulData[currentId++])
        emulSelected(9999, true);
    else
        emulSelected(9999, true);
}

function setEmul(id) {
    for(let i = 0; i < emulators.length; i++) {
        if(id === emulators[i].id) {
            return i;
        }
    }
}




