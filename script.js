document.addEventListener('DOMContentLoaded', () => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // ============ 1. Scroll Progress Bar ============
    let progressBar = document.querySelector('.scroll-progress');
    if (!progressBar) {
        progressBar = document.createElement('div');
        progressBar.classList.add('scroll-progress');
        progressBar.innerHTML = '<span></span>';
        document.body.appendChild(progressBar);
    }
    const progressSpan = progressBar.querySelector('span');

    window.addEventListener('scroll', () => {
        const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
        const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrolled = height > 0 ? (winScroll / height) * 100 : 0;
        progressSpan.style.width = scrolled + '%';
    }, { passive: true });

    // ============ 2. Active Nav Link Updates + navbar shrink ============
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.navbar-nav .nav-link');
    const navbar = document.querySelector('.navbar');

    window.addEventListener('scroll', () => {
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            if (scrollY >= sectionTop - 150) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href').includes(current)) {
                link.classList.add('active');
            }
        });

        if (navbar) {
            navbar.classList.toggle('is-scrolled', scrollY > 40);
        }
    }, { passive: true });

    // ============ 3. Scroll-reveal via IntersectionObserver ============
    const revealTargets = document.querySelectorAll('.reveal, .reveal-item, .section-kicker, .timeline-item');
    if ('IntersectionObserver' in window && revealTargets.length) {
        const revealObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    revealObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });

        revealTargets.forEach(el => revealObserver.observe(el));
    } else {
        revealTargets.forEach(el => el.classList.add('is-visible'));
    }

    // ============ 4. Timeline fill line that grows as you scroll ============
    const timelineFill = document.querySelector('.timeline-fill');
    const timelineEl = document.querySelector('.timeline');
    if (timelineFill && timelineEl) {
        const updateTimelineFill = () => {
            const rect = timelineEl.getBoundingClientRect();
            const viewportH = window.innerHeight;
            const total = rect.height;
            const visible = Math.min(Math.max(viewportH * 0.75 - rect.top, 0), total);
            const pct = total > 0 ? (visible / total) * 100 : 0;
            timelineFill.style.height = pct + '%';
        };
        window.addEventListener('scroll', updateTimelineFill, { passive: true });
        window.addEventListener('resize', updateTimelineFill);
        updateTimelineFill();
    }

    if (prefersReducedMotion) return; // Skip cursor-follow / tilt / magnetic effects for reduced motion

    // ============ 5. Custom cursor ============
    const cursorDot = document.querySelector('.cursor-dot');
    const cursorRing = document.querySelector('.cursor-ring');
    const isTouch = window.matchMedia('(hover: none), (pointer: coarse)').matches;

    if (cursorDot && cursorRing && !isTouch) {
        let mouseX = 0, mouseY = 0, ringX = 0, ringY = 0;

        window.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
            document.body.classList.add('cursor-active');
            cursorDot.style.transform = `translate(${mouseX}px, ${mouseY}px) translate(-50%, -50%)`;
        });

        const animateRing = () => {
            ringX += (mouseX - ringX) * 0.16;
            ringY += (mouseY - ringY) * 0.16;
            cursorRing.style.transform = `translate(${ringX}px, ${ringY}px) translate(-50%, -50%)`;
            requestAnimationFrame(animateRing);
        };
        requestAnimationFrame(animateRing);

        const growTargets = document.querySelectorAll('a, button, .skill-card, .project-card, .magnetic');
        growTargets.forEach(el => {
            el.addEventListener('mouseenter', () => document.body.classList.add('cursor-grow'));
            el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-grow'));
        });
    }

    // ============ 6. Magnetic buttons ============
    const magneticEls = document.querySelectorAll('.magnetic');
    magneticEls.forEach(el => {
        el.addEventListener('mousemove', (e) => {
            const rect = el.getBoundingClientRect();
            const relX = e.clientX - rect.left - rect.width / 2;
            const relY = e.clientY - rect.top - rect.height / 2;
            el.style.setProperty('--mx', (relX * 0.25).toFixed(2));
            el.style.setProperty('--my', (relY * 0.25).toFixed(2));
        });
        el.addEventListener('mouseleave', () => {
            el.style.setProperty('--mx', 0);
            el.style.setProperty('--my', 0);
        });
    });

    // ============ 7. Portrait tilt on mouse move ============
    const tiltTarget = document.querySelector('.tilt-target');
    const portraitWrapper = document.querySelector('.hero-portrait-wrapper');
    if (tiltTarget && portraitWrapper) {
        portraitWrapper.addEventListener('mousemove', (e) => {
            const rect = tiltTarget.getBoundingClientRect();
            const px = (e.clientX - rect.left) / rect.width - 0.5;
            const py = (e.clientY - rect.top) / rect.height - 0.5;
            const rotateY = px * 14;
            const rotateX = -py * 14;
            tiltTarget.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
        });
        portraitWrapper.addEventListener('mouseleave', () => {
            tiltTarget.style.transform = 'rotateX(0deg) rotateY(0deg) scale(1)';
        });
    }

    // ============ 8. Subtle card tilt (skills / projects) ============
    const tiltCards = document.querySelectorAll('.tilt-card');
    tiltCards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const px = (e.clientX - rect.left) / rect.width - 0.5;
            const py = (e.clientY - rect.top) / rect.height - 0.5;
            card.style.transform = `translateY(-8px) rotateX(${(-py * 4).toFixed(2)}deg) rotateY(${(px * 4).toFixed(2)}deg)`;
        });
        card.addEventListener('mouseleave', () => {
            card.style.transform = '';
        });
    });
});
