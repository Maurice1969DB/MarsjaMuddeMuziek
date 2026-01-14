
const sidebar = document.querySelector('.sidebar');
const content = document.querySelector('.content');

sidebar.classList.add('sidebar_small');
    content.classList.add('sidebar_small');

document.querySelector('.toggle').onclick = function () {
    sidebar.classList.toggle('sidebar_small');
    content.classList.toggle('sidebar_small');
}

// Shrink header on scroll (mobile only)
// Only enable on pages with enough scrollable content
if (window.innerWidth <= 960) {
    const header = document.querySelector('.header');
    const pageHeight = document.documentElement.scrollHeight;
    const viewportHeight = window.innerHeight;

    // Only activate if page is at least 300px taller than viewport
    if (pageHeight > viewportHeight + 300) {
        let ticking = false;
        let isCompact = false;

        window.addEventListener('scroll', function() {
            if (!ticking) {
                requestAnimationFrame(function() {
                    const scrollY = window.pageYOffset;
                    // Large dead zone: shrink at 100px, only expand at very top
                    if (!isCompact && scrollY > 100) {
                        header.classList.add('header-compact');
                        isCompact = true;
                    } else if (isCompact && scrollY < 5) {
                        header.classList.remove('header-compact');
                        isCompact = false;
                    }
                    ticking = false;
                });
                ticking = true;
            }
        }, { passive: true });
    }
}
