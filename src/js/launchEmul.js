// Template variables containers
let listContent = document.getElementById('listContent');
// Template variables
let emulInsalled = '';

module.exports = {
    setUp: function(data) {
        // Check for installed emulators
        data.forEach(res => {
            if(!res.installed)
                return;
            emulInsalled +=
            `<div>
                <p>${res.name}<img src="${res.image}"></p>
            </div>`;
        });
        listContent.innerHTML = emulInsalled;
        
    }
}