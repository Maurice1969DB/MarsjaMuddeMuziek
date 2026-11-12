
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

    // Hide entire Datum form-group if no future dates remain
    const visibleCheckboxes = checkboxGroup.querySelectorAll('.checkbox-label:not([style*="display: none"])');
    if (visibleCheckboxes.length === 0) {
        const datumFormGroup = checkboxGroup.closest('.form-group');
        if (datumFormGroup) {
            datumFormGroup.style.display = 'none';
        }
    }

    // Only show the "multiple possible" hint when there is more than one date to choose
    if (visibleCheckboxes.length <= 1) {
        document.querySelectorAll('.multi-hint').forEach(function(hint) {
            hint.style.display = 'none';
        });
    }

    // With only one date left, tick it and keep it ticked. Not via `disabled`,
    // because a disabled checkbox is left out of the form submission.
    if (visibleCheckboxes.length === 1) {
        const onlyCheckbox = visibleCheckboxes[0].querySelector('input[type="checkbox"]');
        if (onlyCheckbox) {
            onlyCheckbox.checked = true;
            onlyCheckbox.setAttribute('aria-readonly', 'true');
            onlyCheckbox.addEventListener('click', function(e) { e.preventDefault(); });
            visibleCheckboxes[0].style.cursor = 'default';
        }
    }
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
// Only list items that start with a date count as dated entries, optionally
// after a weekday ("14 oktober 2026 – Track A", "Friday 2 October 2026, 8 PM").
// A date further on in the text, such as "75 Euro (from 1 October 2026)", is
// not the date of the entry itself and leaves the item alone.
(function() {
    const months = {
        'januari': 0, 'februari': 1, 'maart': 2, 'april': 3, 'mei': 4, 'juni': 5,
        'juli': 6, 'augustus': 7, 'september': 8, 'oktober': 9, 'november': 10, 'december': 11,
        'january': 0, 'february': 1, 'march': 2, 'may': 4, 'june': 5,
        'july': 6, 'august': 7, 'october': 9
    };
    const month = '(' + Object.keys(months).join('|') + ')';
    const weekday = '(?:(?:maandag|dinsdag|woensdag|donderdag|vrijdag|zaterdag|zondag|' +
        'monday|tuesday|wednesday|thursday|friday|saturday|sunday),?\\s+)?';

    // "31 januari 2026", "31 January 2026", "31 januari"
    const dayFirst = new RegExp('^' + weekday + '(\\d{1,2})\\s+' + month + '(?:\\s+(\\d{4}))?\\b');
    // "January 31, 2026", "January 31"; never "February 2027", which has no day
    const monthFirst = new RegExp('^' + weekday + month + '\\s+(\\d{1,2})(?:,?\\s+(\\d{4}))?(?!\\d)');

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    document.querySelectorAll('.content li').forEach(function(li) {
        const text = li.textContent.trim().toLowerCase();
        let day, monthName, year;

        let match = text.match(dayFirst);
        if (match) {
            [, day, monthName, year] = match;
        } else if ((match = text.match(monthFirst))) {
            [, monthName, day, year] = match;
        } else {
            return;
        }

        // Without a year, assume the current year
        const eventDate = new Date(
            year ? parseInt(year) : today.getFullYear(),
            months[monthName],
            parseInt(day)
        );

        if (eventDate < today) {
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
