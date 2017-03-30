/* * * * *
* DOWNLOAD SECTION FUNCTIONS [MODAL WINDOWS]
* * * * */


// Load default data view
exports.setUp = function(emulData, platformList, sortyByList) {
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