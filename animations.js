function welcomeOut() {
    let element = document.getElementById('welcome');
    element.classList.remove('welcomeIn');
    element.classList.add('welcomeOut');

    setTimeout(function() {
        element.parentNode.removeChild(element);
    },2000);
}