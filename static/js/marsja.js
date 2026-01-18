
const sidebar = document.querySelector('.sidebar');
const content = document.querySelector('.content');

sidebar.classList.add('sidebar_small');
    content.classList.add('sidebar_small');

document.querySelector('.toggle').onclick = function () {
    sidebar.classList.toggle('sidebar_small');
    content.classList.toggle('sidebar_small');
};

// Hide past dates in workshop forms
(function() {
    const checkboxGroup = document.getElementById('datum-checkboxes');
    if (!checkboxGroup) return;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const checkboxes = checkboxGroup.querySelectorAll('.checkbox-label[data-date]');
    checkboxes.forEach(function(label) {
        const dateStr = label.getAttribute('data-date');
        const eventDate = new Date(dateStr);
        if (eventDate < today) {
            label.style.display = 'none';
        }
    });
})();

// Workshop popup for new visitors
(function() {
    const popup = document.getElementById('workshop-popup');
    if (!popup) return;

    const POPUP_KEY = 'minne-popup-shown';
    const POPUP_DELAY = 3000; // Show after 3 seconds

    // Check if popup was already shown
    if (localStorage.getItem(POPUP_KEY)) {
        popup.remove();
        return;
    }

    // Show popup after delay
    setTimeout(function() {
        popup.style.display = 'flex';
    }, POPUP_DELAY);

    // Close popup function
    function closePopup() {
        popup.style.display = 'none';
        localStorage.setItem(POPUP_KEY, 'true');
    }

    // Close on X button
    const closeBtn = popup.querySelector('.popup-close');
    if (closeBtn) {
        closeBtn.addEventListener('click', closePopup);
    }

    // Close on overlay click (outside popup content)
    popup.addEventListener('click', function(e) {
        if (e.target === popup) {
            closePopup();
        }
    });

    // Close on Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && popup.style.display === 'flex') {
            closePopup();
        }
    });

    // Also close when clicking the button (after navigation)
    const button = popup.querySelector('.popup-button');
    if (button) {
        button.addEventListener('click', function() {
            localStorage.setItem(POPUP_KEY, 'true');
        });
    }
})();

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
