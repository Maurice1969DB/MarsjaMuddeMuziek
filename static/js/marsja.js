
const sidebar = document.querySelector('.sidebar');
const content = document.querySelector('.content');

// Check if we should keep menu open (submenu is expanded - indicated by .indent items)
const hasExpandedSubmenu = document.querySelector('.sidebar-nav .indent') !== null;

if (hasExpandedSubmenu && window.innerWidth <= 960) {
    // Keep menu open when submenu is visible on mobile
} else {
    sidebar.classList.add('sidebar_small');
    content.classList.add('sidebar_small');
}

const toggleBtn = document.querySelector('.toggle');
toggleBtn.onclick = function () {
    sidebar.classList.toggle('sidebar_small');
    content.classList.toggle('sidebar_small');
    toggleBtn.setAttribute('aria-expanded', !sidebar.classList.contains('sidebar_small'));
};

// Close menu when clicking outside sidebar (on content) on mobile
if (window.innerWidth <= 960) {
    content.addEventListener('click', function() {
        if (!sidebar.classList.contains('sidebar_small')) {
            sidebar.classList.add('sidebar_small');
            content.classList.add('sidebar_small');
        }
    });
}

// Close menu when clicking on menu items without children (leaf items)
document.querySelectorAll('.sidebar-nav .indent a').forEach(function(link) {
    link.addEventListener('click', function() {
        sessionStorage.setItem('closeMenu', 'true');
    });
});

// Close menu when clicking on active root item (that has expanded submenu)
document.querySelectorAll('.sidebar-nav > li > a.active').forEach(function(link) {
    if (document.querySelector('.sidebar-nav .indent')) {
        link.addEventListener('click', function(e) {
            // If clicking on the same page, just close the menu
            if (window.location.pathname === link.getAttribute('href') ||
                window.location.pathname === link.getAttribute('href') + '/') {
                e.preventDefault();
                sidebar.classList.add('sidebar_small');
                content.classList.add('sidebar_small');
            } else {
                sessionStorage.setItem('closeMenu', 'true');
            }
        });
    }
});

// Check if we should close menu after navigation
if (sessionStorage.getItem('closeMenu') === 'true') {
    sessionStorage.removeItem('closeMenu');
    sidebar.classList.add('sidebar_small');
    content.classList.add('sidebar_small');
}

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

// Handle form validation and submissions
(function() {
    var isEnglish = window.location.pathname.startsWith('/en/');

    var messages = {
        required: isEnglish ? 'This field is required.' : 'Dit veld is verplicht.',
        email: isEnglish ? 'Please enter a valid email address.' : 'Vul een geldig e-mailadres in.',
        datum: isEnglish ? 'Please select at least one date.' : 'Selecteer minstens één datum.',
        sending: isEnglish ? 'Sending...' : 'Verzenden...',
        submitError: isEnglish
            ? 'Something went wrong. Please try again or contact us by email.'
            : 'Er ging iets mis bij het verzenden. Probeer het opnieuw of neem contact op via email.'
    };

    function showError(field, errorEl, message) {
        field.classList.add('invalid');
        field.setAttribute('aria-invalid', 'true');
        if (errorEl) {
            errorEl.textContent = message;
            errorEl.classList.add('visible');
        }
    }

    function clearError(field, errorEl) {
        field.classList.remove('invalid');
        field.removeAttribute('aria-invalid');
        if (errorEl) {
            errorEl.textContent = '';
            errorEl.classList.remove('visible');
        }
    }

    function validateForm(form) {
        var valid = true;

        // Validate required text/email inputs
        form.querySelectorAll('input[required], textarea[required]').forEach(function(input) {
            var errorEl = input.getAttribute('aria-describedby')
                ? document.getElementById(input.getAttribute('aria-describedby'))
                : null;

            if (!input.value.trim()) {
                showError(input, errorEl, messages.required);
                valid = false;
            } else if (input.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value)) {
                showError(input, errorEl, messages.email);
                valid = false;
            } else {
                clearError(input, errorEl);
            }
        });

        // Validate checkbox group (at least one checked)
        var checkboxGroup = form.querySelector('.checkbox-group');
        if (checkboxGroup) {
            var errorEl = checkboxGroup.getAttribute('aria-describedby')
                ? document.getElementById(checkboxGroup.getAttribute('aria-describedby'))
                : null;
            var checked = checkboxGroup.querySelectorAll('input[type="checkbox"]:checked');
            // Only count visible checkboxes (past dates are hidden)
            var visibleCheckboxes = checkboxGroup.querySelectorAll('.checkbox-label:not([style*="display: none"]) input[type="checkbox"]');
            if (visibleCheckboxes.length > 0 && checked.length === 0) {
                showError(checkboxGroup, errorEl, messages.datum);
                valid = false;
            } else {
                clearError(checkboxGroup, errorEl);
            }
        }

        return valid;
    }

    // Clear errors on input
    document.querySelectorAll('.contact-form input, .contact-form textarea').forEach(function(input) {
        input.addEventListener('input', function() {
            var errorEl = input.getAttribute('aria-describedby')
                ? document.getElementById(input.getAttribute('aria-describedby'))
                : null;
            clearError(input, errorEl);
        });
    });

    // Clear checkbox group error on change
    document.querySelectorAll('.contact-form .checkbox-group input[type="checkbox"]').forEach(function(cb) {
        cb.addEventListener('change', function() {
            var group = cb.closest('.checkbox-group');
            if (group) {
                var errorEl = group.getAttribute('aria-describedby')
                    ? document.getElementById(group.getAttribute('aria-describedby'))
                    : null;
                clearError(group, errorEl);
            }
        });
    });

    // Handle form submissions
    var forms = document.querySelectorAll('form.contact-form');
    forms.forEach(function(form) {
        form.setAttribute('novalidate', '');
        form.addEventListener('submit', function(e) {
            e.preventDefault();

            if (!validateForm(form)) return;

            var submitBtn = form.querySelector('button[type="submit"]');
            var originalText = submitBtn.textContent;
            submitBtn.disabled = true;
            submitBtn.textContent = messages.sending;

            fetch(form.action, {
                method: 'POST',
                body: new FormData(form),
                headers: { 'Accept': 'application/json' }
            })
            .then(function(response) {
                if (response.ok) {
                    window.location.href = isEnglish ? '/en/bedankt/' : '/bedankt/';
                } else {
                    throw new Error('Form submission failed');
                }
            })
            .catch(function() {
                submitBtn.disabled = false;
                submitBtn.textContent = originalText;
                alert(messages.submitError);
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
