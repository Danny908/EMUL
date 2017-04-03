let emulInsalled = '';

module.exports = {
    setUp: function(data) {
        data.forEach(res => {
            if(!res.installed)
                return;
            emulInsalled +=
            `<<div>
                <p>${res.name}<img src="${res.image}"></p>
            </div>`;
        });
        console.log(emulInsalled);
        
    }
}