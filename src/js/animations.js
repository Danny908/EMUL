let showBtn = document.getElementById('show');
let collapseBtn = document.getElementById('collapse');

// Collapse Emulators List
collapseBtn.addEventListener('click', function() {
    let eList = document.getElementById('e-list');
    let tag = document.getElementById('list-tag');
    
    this.setAttribute('hidden', true);
    showBtn.removeAttribute('hidden');
    eList.classList.add('emul-list-collapesed');

    if (eList.classList.contains('emul-list-show')) {
        eList.classList.remove('emul-list-show');
    }
    setTimeout(function() {
        tag.setAttribute('style', 'width: 0; padding: 0; visibility: hidden;');
    }, 280);
});

// Show Emulators List
showBtn.addEventListener('click', function() {
    let eList = document.getElementById('e-list');
    let tag = document.getElementById('list-tag');
    
    this.setAttribute('hidden', true);
    collapseBtn.removeAttribute('hidden');
    eList.classList.remove('emul-list-collapesed');
    eList.classList.add('emul-list-show');

    setTimeout(function() {
        tag.removeAttribute('style');
    }, 160);
});

// Show dialog window
let showModal = document.getElementById('add-emul');
let addEmulModal = document.getElementById('add-emulator-modal');
let frameModal = document.getElementById('m-frame');
let hideModal = document.getElementById('close-modal');

showModal.addEventListener('click', function() {
    addEmulModal.removeAttribute('hidden');
    frameModal.classList.add('modal-in');
});

hideModal.addEventListener('click', function() {
    frameModal.classList.remove('modal-in');
    addEmulModal.setAttribute('hidden', true);
});

// Order by animation
let showBy = document.getElementById('orderBy');

showBy.addEventListener('click',function() {
    if(this.hasAttribute('style')) {
        this.removeAttribute('style');
        return;
    }
    this.setAttribute('style', 'transform: rotate(180deg)');
})

// Welcome Screen
function welcomeOut() {
    let element = document.getElementById('welcome');
    let content = document.getElementById('m-content');
    element.classList.remove('welcomeIn');
    element.classList.add('welcomeOut');

    setTimeout(function() {
        element.parentNode.removeChild(element);
        content.classList.add('main-in');
    },2000);
}

setTimeout(welcomeOut, 3000);