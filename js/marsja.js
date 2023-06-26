
const sidebar = document.querySelector('.sidebar');
const content = document.querySelector('.content');

sidebar.classList.add('sidebar_small');
    content.classList.add('sidebar_small');

document.querySelector('.toggle').onclick = function () {
    sidebar.classList.toggle('sidebar_small');
    content.classList.toggle('sidebar_small');
}


