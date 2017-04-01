/* * * * *
* DOWNLOAD SECTION FUNCTIONS [MODAL WINDOWS]
* * * * */
const fs = require('fs');
const http = require ('http');
const unzip = require('unzip');
const dmg = require('dmg');
const ncp = require ('ncp');

// Machine OS
const os = process.platform;

// Defaul filters
let platform = 'All';
let order = 'desc';
let sort = 'release';

// Variables to create HTML template
let listTemplate = '';
let platformTemplate;
let sortTemplate;

// Element where templates goin to be inserted
let list = document.getElementById('latList');
let filter = document.getElementById('platform');
let sortBy = document.getElementById('sortBy');
let showBy = document.getElementById('orderBy');
let progress = document.getElementById('progress');
let status = document.getElementById('status');
let emulatorSelected;

// Element where templates goin to be inserted
let emulatorView = document.getElementById('eList');
let emulatorName = document.getElementById('emulName');
let emulatorDesc = document.getElementById('emulDesc');
let emulatorInfo = document.getElementById('aditionalInfo');
let emulPage = document.getElementById('emulPage');
let emulLogo = document.getElementById('emulLogo');
let emulDownload = document.getElementById('emulDownload');

// Other variables
let fileSize = 0;
let fileDownloaded = 0;
let numOfDownloads = 0;
let localId;
let globalId;
let globalPath;

// Main module
module.exports = {
    // Load default data view
    setUp: function(data, platformList, sortyByList, global = null) {
        module.exports.sortList('release', order, data);

        // Populate filters dropdown
        platformList.forEach(res => {
            platformTemplate += `<option value="${res}">${res}</option>`;
        });

        sortyByList.forEach( res => {
            sortTemplate += `<option value="${res.value}">${res.field}</option>`
        });

        filter.innerHTML = platformTemplate;
        sortBy.innerHTML = sortTemplate;
        if(global)
            globalPath = global;
    },
    // Sort emulators list
    sortList: function(value, order, data) {
        let sortData = '';
        if(order === 'desc') {
            if(typeof(data[0][value]) === 'number')
                sortData = data.sort(function(x, y) {
                    return x[value] - y[value];
                });
            else
                sortData = data.sort(function(x, y) {
                    return(x[value] > y[value]) - (x[value] < y[value]);
                });
        } else {
            if(typeof(data[0][value]) === 'number')
                sortData = data.sort(function(x, y) {
                    return y[value] - x[value];
                });
            else
                sortData = data.sort(function(x, y) {
                    return (y[value] > x[value]) - (y[value] < x[value]);
                });
        }
        module.exports.templateList(platform, sortData);
    },
    // Create modal list html template
    templateList: function(platform, data) {
        listTemplate = '';
        if(platform === 'All') {
            data.forEach(res => {
            if(res.installed)
                return;
                
            listTemplate +=
                `<div onclick="emulSelected(${res.id})" value="${res.id}" class="select-emul" title="${res.name}">
                    <img src="${res.image}">
                </div>`;
            });
        } else {
            data.forEach(res => {
            if(res.installed || res.platform !== platform)
                return;
                
            listTemplate +=
                `<div onclick="emulSelected(${res.id})" value="${res.id}" class="select-emul" title="${res.name}">
                    <img src="${res.image}">
                </div>`;
            });
        }
        list.innerHTML = listTemplate ;
    },
    // Filter by
    filter: function(element, data) {
        platform =  element.value;
        module.exports.sortList(sort, order, data);
    },
    // Sort by
    sortBy: function(element, data){
        sort = element.value;
        module.exports.sortList(sort, order, data);
    },
    // Show by
    showBy: function(element, data) {
        if (element.getAttribute('value') === 'desc')
            order = 'asc';
        else
            order = 'desc';

        element.setAttribute('value', order);
        element.setAttribute('title', order.toUpperCase());
        module.exports.sortList(sort, order, data);
    },
    // Show emulator details
    emulDetails: function(id, emulators, set = false) {
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
            for(let i = 0; i < emulators.length; i++) {
                if(id === emulators[i].id)
                    localId = i;
                    globalId = id;
            }
            emulatorSelected = document.getElementsByClassName('select-emul');
            for(let a = 0; a < emulatorSelected.length; a++){
                if(Number(emulatorSelected[a].getAttribute('value')) === id)
                    emulatorSelected[a].style.animation = 'emulSelected 0.7s infinite';
                else
                    emulatorSelected[a].removeAttribute('style');
            }
            emulatorView.setAttribute('style',
                `background: linear-gradient(rgba(32, 85, 167, 0.5) -23%, rgba(0, 0, 0, 0.83) 60%) -30px,
                            url(${emulators[localId].image}) no-repeat;
                background-size: auto, cover;`);
            emulLogo.removeAttribute('hidden');
            emulLogo.setAttribute('src',`${emulators[localId].logo}`);
            emulatorName.innerHTML = emulators[localId].name;
            emulatorDesc.innerHTML = emulators[localId].description;
            emulatorInfo.innerHTML = 
                `<ul><label>Autor : </label>${emulators[localId].autor}</ul>
                <ul><label>Size : </label>${emulators[localId].size}</ul>
                <ul><label>OS Supported : </label>${emulators[localId].os}</ul>`;
            emulPage.removeAttribute('disabled');
            emulDownload.removeAttribute('disabled');
            emulPage.setAttribute('value', emulators[localId].homepage);
            emulDownload.setAttribute('value', emulators[localId].link);
        } 
    },
    // Download selected emulator
    downloadEmul: function(url, emulators, extencion, data, platformList, sortyByList) {
        let newEmulator;
        if(!fs.existsSync('./src/EMULATORS')) {
            fs.mkdirSync('./src/EMULATORS');
        }
        progress.style.height = '4px';
        status.removeAttribute('hidden');
        status.innerHTML = `WAITING RESPONSE`;

        // TODO: ADD network validation
        http.get(url, function(response) {
            if(response.statusCode !== 200) {
                status.innerHTML = `EMULATOR NOT FOUND`;
                return;
            }
        fs.mkdirSync(`./src/EMULATORS/${emulators[localId].name}`);
        newEmulator = fs.createWriteStream(`./src/EMULATORS/${emulators[localId].name}/emulator.${extencion}`)
        
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
                module.exports.installEmul(os, emulators, extencion, data, platformList, sortyByList);
            }
            else {
                status.innerHTML += `<br>INSTALLING`;
            }
        });
        }).on('error',(e) => {
            console.log(e.message);
        });
    },
    // Unpackage new emulator
    installEmul: function(os, emulators, extencion, data, platformList, sortyByList) {
        switch(os) {
        case 'darwin':
            dmg.mount(`${globalPath}/src/EMULATORS/${emulators[localId].name}/emulator.dmg`, function(err, path) {    
                module.exports.cloneDir(path, emulators);
                //Create rooms folder
                fs.mkdirSync(`${globalPath}/src/EMULATORS/${emulators[localId].name}/roms`);
                module.exports.updateState(emulators, extencion, data, platformList, sortyByList);
                dmg.unmount(path, function(err) {});
            });
            break;
        }

        

        // // TODO: Add OS Validation to use the right unpackage method
        // fs.createReadStream(`./src/EMULATORS/${emulators[localId].name}/emulator.${extencion}`).pipe(unzip.Extract({ path: `./src/EMULATORS/${emulators[localId].name}`}));
    },
    // Clone emulator image content
    cloneDir: function(path, emulators) {
        ncp.limit = 16;
        ncp(path, `${globalPath}/src/EMULATORS/${emulators[localId].name}`, function(err) {
            if(err) {
            return;
            }
        });
    },
    // Update emulator state
    updateState: function(emulators, extencion, data, platformList, sortyByList) {
        status.innerHTML = `DONE`;
        // Delete emulator package
        fs.unlinkSync(`${globalPath}/src/EMULATORS/${emulators[localId].name}/emulator.${extencion}`);

        setTimeout(function() {
            progress.removeAttribute('style');
            progress.setAttribute('value', 0);
            status.setAttribute('hidden', true);
        },500);

        // Change emulator state to installed
        data.forEach(emul => {
            if(emul.id === globalId)
                emul.installed = true;
        });
        console.log(data);

        // Write change on file
        fs.writeFileSync(`${globalPath}/src/data/emulators-data.json`, JSON.stringify(data), {encoding: 'utf-8'});

        // Update list
        module.exports.setUp(data, platformList, sortyByList);

        //Update modal content
        if(data[localId++])
            emulSelected(9999, true);
        else
            emulSelected(9999, true);
        }
}