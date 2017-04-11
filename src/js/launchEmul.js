// Template variables containers
let listContent = document.getElementById('listContent');

module.exports = {
    // Check for installed emulators
    setUp: function(data) {
        let emulInsalled = '';
        data.forEach(res => {
            if(!res.installed)
                return;
            emulInsalled +=
            `<div onclick="emulInstalled(${res.id})" class="installed-container">
                <p>${res.name}</p>
                <img src="${res.image}">
            </div>`;
        });
        listContent.innerHTML = emulInsalled;   
    },
    // Load rooms
    loadRoms: function(emulator) {
        console.log(emulator);
    }
}