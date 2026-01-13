
const sidebar = document.querySelector('.sidebar');
const content = document.querySelector('.content');

sidebar.classList.add('sidebar_small');
    content.classList.add('sidebar_small');

document.querySelector('.toggle').onclick = function () {
    sidebar.classList.toggle('sidebar_small');
    content.classList.toggle('sidebar_small');
}

// Shrink header on scroll (mobile only)
if (window.innerWidth <= 960) {
    const header = document.querySelector('.header');
    let ticking = false;

    window.addEventListener('scroll', function() {
        if (!ticking) {
            requestAnimationFrame(function() {
                if (window.pageYOffset > 50) {
                    header.classList.add('header-compact');
                } else {
                    header.classList.remove('header-compact');
                }
                ticking = false;
            });
            ticking = true;
        }
    }, { passive: true });
}
