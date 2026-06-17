/* ============================================
   Dr. Gastón Berbel — Main JS
   ============================================ */

(function () {
    'use strict';

    // ─── DOM References ─────────────────────────
    const headerEl = document.querySelector('header');
    const menuToggle = document.querySelector('.menu-toggle');
    const navMenu = document.querySelector('.nav-menu');

    // ─── FAQ Toggle ─────────────────────────────
    function toggleFAQ(element) {
        const faqItem = element.closest('.faq-item');
        if (!faqItem) return;
        const wasActive = faqItem.classList.contains('active');

        // Close all FAQs
        document.querySelectorAll('.faq-item').forEach(function (item) {
            item.classList.remove('active');
        });

        // Open clicked FAQ if it wasn't active
        if (!wasActive) {
            faqItem.classList.add('active');
        }
    }

    // Attach FAQ listeners via event delegation
    document.addEventListener('click', function (e) {
        var q = e.target.closest('.faq-question');
        if (q) {
            e.preventDefault();
            toggleFAQ(q);
        }
    });

    // ─── Modal Functions ────────────────────────
    function openModal(procedureName) {
        var modalId = procedureName + 'Modal';
        var modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    }

    function closeModal(procedureName) {
        var modalId = procedureName + 'Modal';
        var modal = document.getElementById(modalId);
        if (modal) {
            // Pause any playing video inside the modal
            var video = modal.querySelector('video');
            if (video) video.pause();
            modal.classList.remove('active');
            document.body.style.overflow = '';
        }
    }

    function closeAllModals() {
        document.querySelectorAll('.modal.active').forEach(function (modal) {
            // Pause any playing video inside each modal
            var video = modal.querySelector('video');
            if (video) video.pause();
            modal.classList.remove('active');
        });
        document.body.style.overflow = '';
    }

    // Expose to global for onclick handlers
    window.openModal = openModal;
    window.closeModal = closeModal;

    // Close modal when clicking outside content
    document.querySelectorAll('.modal').forEach(function (modal) {
        modal.addEventListener('click', function (e) {
            if (e.target === this) {
                this.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    });

    // ─── Mobile Menu Toggle ─────────────────────
    function closeMenu() {
        if (navMenu) navMenu.classList.remove('open');
        if (menuToggle) menuToggle.classList.remove('open');
    }

    function toggleMenu() {
        if (navMenu) navMenu.classList.toggle('open');
        if (menuToggle) menuToggle.classList.toggle('open');
    }

    if (menuToggle) {
        menuToggle.addEventListener('click', toggleMenu);
    }

    // Close mobile menu on scroll
    var scrollTimer;
    window.addEventListener('scroll', function () {
        if (navMenu && navMenu.classList.contains('open')) {
            clearTimeout(scrollTimer);
            scrollTimer = setTimeout(closeMenu, 100);
        }
    }, { passive: true });

    // ─── Keyboard ───────────────────────────────
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
            // Close modals first
            closeAllModals();
            // Close mobile menu
            closeMenu();
        }
    });

    // ─── Smooth Scroll (header-offset aware) ────
    document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
        anchor.addEventListener('click', function (e) {
            var href = this.getAttribute('href');
            if (href !== '#') {
                e.preventDefault();
                var target = document.querySelector(href);
                if (target) {
                    var headerHeight = headerEl ? headerEl.offsetHeight : 64;
                    var top = target.getBoundingClientRect().top + window.pageYOffset - headerHeight;
                    window.scrollTo({ top: top, behavior: 'smooth' });
                }
                // Close mobile menu after navigating
                closeMenu();
            }
        });
    });

    // ─── Header Scroll State ────────────────────
    function onHeaderScroll() {
        if (headerEl) {
            headerEl.classList.toggle('scrolled', window.scrollY > 24);
        }
    }
    window.addEventListener('scroll', onHeaderScroll, { passive: true });
    onHeaderScroll();

    // ─── Reveal on Scroll ───────────────────────
    if ('IntersectionObserver' in window) {
        var revealObserver = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    revealObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.12 });

        document.querySelectorAll(
            '.service-card, .about-text, .about-image, .faq-item, .contact-method, .credentials'
        ).forEach(function (el) {
            el.classList.add('reveal');
            revealObserver.observe(el);
        });
    }
})();
