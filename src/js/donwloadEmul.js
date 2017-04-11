const fs = require('fs');
const http = require('http');
const unzip = require('unzip');
const dmg = require('dmg');
const ncp = require ('ncp');
const path = require('path');
const launch = require('./launchEmul');

// Elements where templates goin to be inserted
let platform = document.getElementById('platform');
let filter = document.getElementById('sortBy');
let latList = document.getElementById('latList');

let currentFilter;
let currentOrder;
let currentPlatform;
let localTemplates;

module.exports = {
    // Setup download emulators view
    setUp: function(emulatorsData, appPath, platforms, filters) {
        let dataSorted = module.exports.sort('release', 'desc', emulatorsData);
        module.exports.populateDropdown(platforms, filters);
    },
    // Populate dropdowns
    populateDropdown: function(platforms, filters) {
        platforms.forEach(p => {
            platform.innerHTML += `<option value="${p}">${p}</option>`;
        });

        filters.forEach(f => {
            filter.innerHTML += `<option value="${f.value}">${f.field}</option>`;
        });
    },
    // Order emulators list
    sort: function(filter, order, emulatorsData, platform = null) {
        let dataSorted;
        currentFilter = filter;
        currentOrder = order;
        currentPlatform = platform ? platform : 'All';

        switch(order) {
            case 'desc':
                if(typeof(emulatorsData[0][filter]) === 'number')
                    dataSorted = emulatorsData.sort(function(x, y) {
                        return x[filter] - y[filter];
                    });
                else
                    dataSorted = emulatorsData.sort(function(x, y) {
                        return(x[filter] > y[filter]) - (x[filter] < y[filter]);
                    });
                break;
            case 'asc':
                if(typeof(emulatorsData[0][filter]) === 'number')
                    dataSorted = emulatorsData.sort(function(x, y) {
                        return y[filter] - x[filter];
                    });
                else
                    dataSorted = emulatorsData.sort(function(x, y) {
                        return (y[filter] > x[filter]) - (y[filter] < x[filter]);
                    });
                break;
            default:
                break;
        }
        module.exports.listTemplate(dataSorted, platform ? platform : 'All');
    },
    // Populate emulators list
    listTemplate: function(emulatorsData, platform) {
        let checkAnim = document.getElementsByClassName('select-emul');
        latList.innerHTML = '';
        switch(platform) {
            case 'All':
                emulatorsData.forEach(emulator => {
                    if(emulator.installed)
                        return;
                    
                    latList.innerHTML +=
                        `<div onclick="emulSelected(${emulator.id})" value="${emulator.id}" class="select-emul" title="${emulator.name}">
                            <img src="${emulator.image}">
                         </div>`;
                });
                break;
            default:
                emulatorsData.forEach(emulator => {
                    if(emulator.installed || emulator.platform !== platform)
                        return;
                        
                latList.innerHTML +=
                    `<div onclick="emulSelected(${emulator.id})" value="${emulator.id}" class="select-emul" title="${emulator.name}">
                        <img src="${emulator.image}">
                    </div>`;
                });
                break;
        }
    },
    // Show emulator details
    detailsTemplate: function(emulatorID, osEmulators, templates, reset = null) {
        let emulatorSelected = document.getElementsByClassName('select-emul');
        let localID;
        localTemplates = templates;

        switch(reset) {
            case null:
                osEmulators.forEach((emulator, i) => {
                    if (emulatorID === emulator.id) {
                        localID = i;
                    }
                });
                [].forEach.call(emulatorSelected, function(emulator) {
                    if(Number(emulator.getAttribute('value')) === emulatorID)
                        emulator.style.animation = 'emulSelected 0.7s infinite';
                    else
                        emulator.removeAttribute('style');
                });
                module.exports.setAttributes(templates, localID, osEmulators);
                break;
            default:
                module.exports.removeAttributes(templates, localID, osEmulators);
                break;
        }
        return [emulatorID, localID];
    },
    // Set emulators details
    setAttributes: function(templates, localID, osEmulators) {
        templates[0].style.cssText = `
            background: linear-gradient(rgba(32, 85, 167, 0.5) -23%, rgba(0, 0, 0, 0.83) 60%) -30px,
            url(${osEmulators[localID].image}) no-repeat;
            background-size: auto, cover;`;
        templates[1].innerHTML = osEmulators[localID].name;
        templates[2].innerHTML = osEmulators[localID].description;
        templates[3].innerHTML =
            `<ul><label>Autor : </label>${osEmulators[localID].autor}</ul>
             <ul><label>Size : </label>${osEmulators[localID].size}</ul>
             <ul><label>OS Supported : </label>${osEmulators[localID].os}</ul>`;
        templates[4].setAttribute('value', osEmulators[localID].homepage);
        templates[4].removeAttribute('disabled');
        templates[5].removeAttribute('hidden');
        templates[5].src = osEmulators[localID].logo;
        templates[6].setAttribute('value', osEmulators[localID].link);
        templates[6].removeAttribute('disabled');
    },
    // Remove emulators details
    removeAttributes: function(templates, localID, osEmulators) {
        templates[0].removeAttribute('style');
        templates[1].innerHTML = '';
        templates[2].innerHTML = '';
        templates[3].innerHTML = '';
        templates[4].removeAttribute('value');
        templates[4].setAttribute('disabled', true);
        templates[5].setAttribute('hidden', true);
        templates[5].removeAttribute('src');
        templates[6].removeAttribute('value');
        templates[6].setAttribute('disabled', true);
    },
    // Download emulator
    download: function(url, emulatorsData, osEmulators, progressBar, status, IDs, extencion, appPath) {
        let downloaded = 0; 
        
        if(!fs.existsSync(`${appPath}/src/EMULATORS`))
            fs.mkdirSync(`${appPath}/src/EMULATORS`);
        
        status.removeAttribute('hidden');
        status.innerHTML = `WAITING RESPONSE`;

        http.get(url, response => {    
            progressBar.max = response.headers[ 'content-length' ];
            progress.style.height = '4px';
            fs.mkdirSync(`${appPath}/src/EMULATORS/${osEmulators[IDs[1]].name}`);
            fs.mkdirSync(`${appPath}/src/EMULATORS/${osEmulators[IDs[1]].name}/roms`);

            let newEmulator = fs.createWriteStream(`${appPath}/src/EMULATORS/${osEmulators[IDs[1]].name}/emulator.${extencion}`)
            response.pipe(newEmulator);
            status.innerHTML = 'DOWNLOADING';

            response.on('data', chunk => {
                downloaded += chunk.length;
                progressBar.value = downloaded;
            });
            response.on('end', end => {
                status.innerHTML = 'INSTALLING';
                module.exports.install(emulatorsData, appPath, osEmulators, IDs, progressBar, status);
            });
            response.on('error', err => {
                status.innerHTML = `ERROR: ${err}`;
            });
        });
    },
    // Install emulator
    install: function(emulatorsData ,appPath, osEmulators, IDs, progressBar, status) {
        switch(process.platform) {
            case 'darwin':
                dmg.mount(`${appPath}/src/EMULATORS/${osEmulators[IDs[1]].name}/emulator.dmg`, function(err, filePath) { 
                    let files = fs.readdirSync(filePath);
                    let exeFile;

                    ncp.limit = 16;
                    ncp(filePath, `${appPath}/src/EMULATORS/${osEmulators[IDs[1]].name}`, function(err) {
                        if(err) {
                        return;
                        }
                    });
                    files.forEach(exe => {
                        if(path.extname(exe) === '.app')
                             exeFile = exe;
                    });
                    fs.unlinkSync(`${appPath}/src/EMULATORS/${osEmulators[IDs[1]].name}/emulator.dmg`);
                    module.exports.update(emulatorsData, osEmulators, appPath, IDs, progressBar, status, exeFile);
                    
                });
                break;
            default:
                break;
        }
    },
    // Update emulators status
    update: function(emulatorsData, osEmulators, appPath, IDs, progressBar, status, exeFile) {
        status.innerHTML = `DONE`;

        setTimeout(function() {
            progressBar.removeAttribute('style');
            progressBar.setAttribute('value', 0);
            status.setAttribute('hidden', true);
        },500);

        emulatorsData.forEach(emul => {
            if(emul.id === IDs[0]) {
                emul.installed = true;
                emul.roms = `${appPath}/src/EMULATORS/${osEmulators[IDs[1]].name}/roms`;
                emul.exe = `${appPath}/src/EMULATORS/${osEmulators[IDs[1]].name}/${exeFile}`;
            }
        });

        fs.writeFileSync(`${appPath}/src/data/emulators-data.json`, JSON.stringify(emulatorsData), {encoding: 'utf-8'});
        module.exports.listTemplate(emulatorsData, currentPlatform);
        module.exports.removeAttributes(localTemplates, IDs[1], osEmulators);
        launch.setUp(emulatorsData);

    }
}