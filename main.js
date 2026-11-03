/* ==========================================================================
   Dr. Gastón Berbel — Main JS (Navegación, Accesibilidad, Formularios y Tracking)
   ========================================================================== */

(function () {
    'use strict';

    const headerEl = document.querySelector('.site-header') || document.querySelector('header');
    const menuToggle = document.querySelector('.menu-toggle');
    const navMenu = document.querySelector('.nav-menu');
    const dropdownItems = document.querySelectorAll('.nav-item.has-dropdown, .nav-item.has-mega');

    // ─── 1. Utilidad Centralizada de Tracking (GTM / GA4 / Meta Pixel / Google Ads) ───
    const firedViewEvents = new Set();

    function trackConversionEvent(eventName, params) {
        const payload = Object.assign({
            page_path: window.location.pathname,
            page_title: document.title
        }, params || {});

        // 1. Google Tag Manager (dataLayer)
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push(Object.assign({ event: eventName }, payload));

        // 2. Google Analytics 4 / Google Ads (gtag)
        if (typeof window.gtag === 'function') {
            window.gtag('event', eventName, payload);
        }

        // 3. Meta Pixel (fbq)
        if (typeof window.fbq === 'function') {
            if (eventName === 'click_whatsapp' || eventName === 'click_phone') {
                window.fbq('track', 'Contact', payload);
            } else if (eventName === 'form_submit') {
                window.fbq('track', 'Lead', payload);
            }
            window.fbq('trackCustom', eventName, payload);
        }
    }

    function trackOnce(eventName, params) {
        if (firedViewEvents.has(eventName)) return;
        firedViewEvents.add(eventName);
        trackConversionEvent(eventName, params);
    }

    // ─── 2. Detección de Vistas de Procedimientos Prioritarios (view_mela / view_liposuccion_vaser) ───
    const currentPath = window.location.pathname.toLowerCase();
    if (currentPath.indexOf('mela-buenos-aires') !== -1) {
        trackOnce('view_mela', { procedure: 'MELA', view_type: 'landing_page' });
    }
    if (currentPath.indexOf('liposuccion-vaser-buenos-aires') !== -1) {
        trackOnce('view_liposuccion_vaser', { procedure: 'Liposucción VASER', view_type: 'landing_page' });
    }

    if ('IntersectionObserver' in window) {
        const sectionObserver = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (!entry.isIntersecting) return;
                const id = entry.target.id;
                if (id === 'tecnologia-mela' || id === 'mela-video-main' || id === 'card-mela') {
                    trackOnce('view_mela', { procedure: 'MELA', view_type: 'section_impression' });
                } else if (id === 'tecnologia-vaser' || id === 'card-vaser') {
                    trackOnce('view_liposuccion_vaser', { procedure: 'Liposucción VASER', view_type: 'section_impression' });
                }
            });
        }, { threshold: 0.35 });

        ['tecnologia-mela', 'mela-video-main', 'card-mela', 'tecnologia-vaser', 'card-vaser'].forEach(function (id) {
            const el = document.getElementById(id);
            if (el) sectionObserver.observe(el);
        });
    }

    // ─── 3. Eventos de Clic en WhatsApp, Instagram y Teléfono ───
    document.addEventListener('click', function (e) {
        const link = e.target.closest('a[href]');
        if (!link) return;

        const href = link.getAttribute('href') || '';

        // Clic en WhatsApp
        if (href.indexOf('wa.me') !== -1 || href.indexOf('api.whatsapp.com') !== -1) {
            let campaign = 'direct';
            let content = link.id || 'whatsapp_cta';
            try {
                const parsedUrl = new URL(href, window.location.href);
                campaign = parsedUrl.searchParams.get('utm_campaign') || campaign;
                content = parsedUrl.searchParams.get('utm_content') || content;
            } catch (err) {
                // ignore URL parse error
            }

            trackConversionEvent('click_whatsapp', {
                event_category: 'WhatsApp',
                event_label: campaign + ' / ' + content,
                cta_location: content
            });

            // Preservar compatibilidad con evento generate_lead existente en GA4
            if (typeof window.gtag === 'function') {
                window.gtag('event', 'generate_lead', {
                    event_category: 'WhatsApp',
                    event_label: campaign + ' / ' + content
                });
            }
            return;
        }

        // Clic en Instagram
        if (href.indexOf('instagram.com') !== -1) {
            trackConversionEvent('click_instagram', {
                event_category: 'Social',
                event_label: link.id || 'instagram_link'
            });
            return;
        }

        // Clic en Teléfono (tel:)
        if (href.indexOf('tel:') === 0) {
            trackConversionEvent('click_phone', {
                event_category: 'Phone',
                event_label: href.replace('tel:', '')
            });
        }
    });

    // ─── 4. Menú Mobile y Acordeones Accesibles (Mega Menú + Submenús) ───
    function closeAllDropdowns(exceptItem) {
        dropdownItems.forEach(function (item) {
            if (item !== exceptItem) {
                item.classList.remove('open');
                const btn = item.querySelector('.nav-link[aria-expanded]');
                if (btn) btn.setAttribute('aria-expanded', 'false');
            }
        });
    }

    function closeMobileMenu() {
        if (navMenu) navMenu.classList.remove('open');
        if (menuToggle) {
            menuToggle.classList.remove('open');
            menuToggle.setAttribute('aria-expanded', 'false');
        }
        document.body.style.overflow = '';
        closeAllDropdowns(null);
    }

    if (menuToggle && navMenu) {
        menuToggle.addEventListener('click', function () {
            const isOpen = navMenu.classList.toggle('open');
            menuToggle.classList.toggle('open', isOpen);
            menuToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
            document.body.style.overflow = isOpen ? 'hidden' : '';
            if (!isOpen) closeAllDropdowns(null);
        });
    }

    dropdownItems.forEach(function (item) {
        const trigger = item.querySelector('.nav-link[aria-expanded]');
        if (!trigger) return;

        // Soporte táctil y acordeón mobile + teclado
        trigger.addEventListener('click', function (e) {
            const isMobile = window.matchMedia('(max-width: 960px)').matches;
            const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

            if (isMobile || isTouch) {
                e.preventDefault();
                const willOpen = !item.classList.contains('open');
                closeAllDropdowns(item);
                item.classList.toggle('open', willOpen);
                trigger.setAttribute('aria-expanded', willOpen ? 'true' : 'false');
            } else {
                const willOpen = !item.classList.contains('open');
                closeAllDropdowns(item);
                item.classList.toggle('open', willOpen);
                trigger.setAttribute('aria-expanded', willOpen ? 'true' : 'false');
            }
        });

        // Sincronizar aria-expanded en hover desktop
        item.addEventListener('mouseenter', function () {
            if (!window.matchMedia('(max-width: 960px)').matches) {
                trigger.setAttribute('aria-expanded', 'true');
            }
        });

        item.addEventListener('mouseleave', function () {
            if (!window.matchMedia('(max-width: 960px)').matches) {
                item.classList.remove('open');
                trigger.setAttribute('aria-expanded', 'false');
            }
        });
    });

    // Cerrar menú mobile al hacer clic en un enlace interno
    document.querySelectorAll('.nav-menu a[href]').forEach(function (link) {
        link.addEventListener('click', function () {
            if (window.matchMedia('(max-width: 960px)').matches) {
                closeMobileMenu();
            } else {
                closeAllDropdowns(null);
            }
        });
    });

    // Cerrar al hacer clic fuera del header
    document.addEventListener('click', function (e) {
        if (headerEl && !headerEl.contains(e.target)) {
            closeAllDropdowns(null);
        }
    });

    // Navegación por teclado (Escape cierra menús)
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
            closeAllDropdowns(null);
            if (navMenu && navMenu.classList.contains('open')) {
                closeMobileMenu();
                if (menuToggle) menuToggle.focus();
            }
        }
    });

    // ─── 5. Acordeón de Preguntas Frecuentes (FAQ) ───
    document.addEventListener('click', function (e) {
        const questionBtn = e.target.closest('.faq-question');
        if (!questionBtn) return;

        e.preventDefault();
        const faqItem = questionBtn.closest('.faq-item');
        if (!faqItem) return;

        const isActive = faqItem.classList.contains('active');
        const container = faqItem.closest('.faq-container') || document;

        container.querySelectorAll('.faq-item').forEach(function (item) {
            item.classList.remove('active');
            const btn = item.querySelector('.faq-question');
            if (btn) btn.setAttribute('aria-expanded', 'false');
        });

        if (!isActive) {
            faqItem.classList.add('active');
            questionBtn.setAttribute('aria-expanded', 'true');
        }
    });

    // ─── 6. Estado Scroll del Header ───
    function updateHeaderScroll() {
        if (headerEl) {
            headerEl.classList.toggle('scrolled', window.scrollY > 20);
        }
    }
    window.addEventListener('scroll', updateHeaderScroll, { passive: true });
    updateHeaderScroll();

    // ─── 7. Formulario de Consulta Médica (form_submit + derivación WhatsApp) ───
    const consultForms = document.querySelectorAll('.medical-consult-form');
    consultForms.forEach(function (form) {
        form.addEventListener('submit', function (e) {
            e.preventDefault();

            const nameInput = form.querySelector('[name="nombre"]');
            const phoneInput = form.querySelector('[name="telefono"]');
            const procInput = form.querySelector('[name="procedimiento"]');
            const msgInput = form.querySelector('[name="mensaje"]');
            const feedback = form.querySelector('.form-feedback');

            const nombre = nameInput ? nameInput.value.trim() : '';
            const telefono = phoneInput ? phoneInput.value.trim() : '';
            const procedimiento = procInput ? procInput.value.trim() : 'Consulta general';
            const mensaje = msgInput ? msgInput.value.trim() : '';

            // Disparar evento de conversión form_submit
            trackConversionEvent('form_submit', {
                event_category: 'Form',
                event_label: procedimiento,
                procedure_interest: procedimiento
            });

            const waText = [
                'Hola Dr. Berbel, envío mi consulta desde el sitio web:',
                '• Nombre: ' + nombre,
                '• Teléfono: ' + telefono,
                '• Procedimiento de interés: ' + procedimiento,
                mensaje ? '• Consulta: ' + mensaje : ''
            ].filter(Boolean).join('\n');

            const waUrl = 'https://wa.me/5491136186160?text=' + encodeURIComponent(waText) +
                '&utm_source=website&utm_medium=organic&utm_campaign=form-submit&utm_content=' +
                encodeURIComponent(procedimiento.toLowerCase().replace(/\s+/g, '-'));

            if (feedback) {
                feedback.textContent = 'Su consulta fue registrada. Abriendo WhatsApp para atención directa con el equipo del Dr. Berbel...';
                feedback.classList.add('success');
            }

            window.open(waUrl, '_blank', 'noopener');
        });
    });

})();
