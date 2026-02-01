
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

// Handle form submissions with redirect to thank you page
(function() {
    const forms = document.querySelectorAll('form.contact-form');
    forms.forEach(function(form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();

            const submitBtn = form.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.disabled = true;
            submitBtn.textContent = 'Verzenden...';

            fetch(form.action, {
                method: 'POST',
                body: new FormData(form),
                headers: {
                    'Accept': 'application/json'
                }
            })
            .then(function(response) {
                if (response.ok) {
                    // Redirect to thank you page based on language
                    const isEnglish = window.location.pathname.startsWith('/en/');
                    window.location.href = isEnglish ? '/en/bedankt/' : '/bedankt/';
                } else {
                    throw new Error('Form submission failed');
                }
            })
            .catch(function(error) {
                submitBtn.disabled = false;
                submitBtn.textContent = originalText;
                alert('Er ging iets mis bij het verzenden. Probeer het opnieuw of neem contact op via email.');
            });
        });
    });
})();

// Auto-strikethrough past dates in lists
(function() {
    const months = {
        'januari': 0, 'februari': 1, 'maart': 2, 'april': 3, 'mei': 4, 'juni': 5,
        'juli': 6, 'augustus': 7, 'september': 8, 'oktober': 9, 'november': 10, 'december': 11,
        'january': 0, 'february': 1, 'march': 2, 'april': 3, 'may': 4, 'june': 5,
        'july': 6, 'august': 7, 'september': 8, 'october': 9, 'november': 10, 'december': 11
    };

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const currentYear = today.getFullYear();

    // Find all list items in content
    document.querySelectorAll('.content li').forEach(function(li) {
        const text = li.textContent.toLowerCase();

        // Match patterns like "31 januari 2026" or "January 31, 2026" (with year)
        const nlMatchYear = text.match(/(\d{1,2})\s+(januari|februari|maart|april|mei|juni|juli|augustus|september|oktober|november|december)\s+(\d{4})/);
        const enMatchYear = text.match(/(january|february|march|april|may|june|july|august|september|october|november|december)\s+(\d{1,2}),?\s+(\d{4})/);

        // Match patterns like "31 januari" or "January 31" (without year - assume current year)
        const nlMatch = text.match(/(\d{1,2})\s+(januari|februari|maart|april|mei|juni|juli|augustus|september|oktober|november|december)(?!\s+\d{4})/);
        const enMatch = text.match(/(january|february|march|april|may|june|july|august|september|october|november|december)\s+(\d{1,2})(?!,?\s+\d{4})/);

        let eventDate = null;

        if (nlMatchYear) {
            eventDate = new Date(parseInt(nlMatchYear[3]), months[nlMatchYear[2]], parseInt(nlMatchYear[1]));
        } else if (enMatchYear) {
            eventDate = new Date(parseInt(enMatchYear[3]), months[enMatchYear[1]], parseInt(enMatchYear[2]));
        } else if (nlMatch) {
            eventDate = new Date(currentYear, months[nlMatch[2]], parseInt(nlMatch[1]));
        } else if (enMatch) {
            eventDate = new Date(currentYear, months[enMatch[1]], parseInt(enMatch[2]));
        }

        if (eventDate && eventDate < today) {
            li.style.textDecoration = 'line-through';
            li.style.opacity = '0.6';
        }
    });
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
