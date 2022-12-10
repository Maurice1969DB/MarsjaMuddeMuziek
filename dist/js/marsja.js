const sidebar = document.querySelector('.sidebar');
const content = document.querySelector('.content');

document.querySelector('.toggle').onclick = function () {
    sidebar.classList.toggle('sidebar_small');
    content.classList.toggle('sidebar_small');
}


