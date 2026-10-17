/* ========================================
   Quasar Browser - JavaScript
   ======================================== */

// --- Starfield Animation ---
(function starfield() {
    const canvas = document.getElementById('stars');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let stars = [];

    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        const count = Math.floor((canvas.width * canvas.height) / 15000);
        stars = Array.from({ length: count }, () => ({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            r: Math.random() * 1.3 + 0.3,
            a: Math.random() * Math.PI * 2,
            s: Math.random() * 0.3 + 0.04,
        }));
    }

    resize();
    window.addEventListener('resize', resize);

    function frame() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for (const star of stars) {
            star.y += star.s;
            if (star.y > canvas.height) {
                star.y = -2;
                star.x = Math.random() * canvas.width;
            }
            star.a += 0.02;
            ctx.globalAlpha = 0.22 + Math.abs(Math.sin(star.a)) * 0.5;
            ctx.fillStyle = '#cff5ea';
            ctx.beginPath();
            ctx.arc(star.x, star.y, star.r, 0, 6.283);
            ctx.fill();
        }
        ctx.globalAlpha = 1;
        requestAnimationFrame(frame);
    }

    frame();
})();

// --- Mobile Menu Toggle ---
(function mobileMenu() {
    const btn = document.getElementById('mobile-menu-btn');
    const menu = document.getElementById('mobile-menu');
    if (!btn || !menu) return;

    btn.addEventListener('click', () => {
        menu.classList.toggle('hidden');
    });

    // Close menu on link click
    menu.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            menu.classList.add('hidden');
        });
    });
})();

// --- Smooth Scrolling ---
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start',
            });
        }
    });
});

// --- Navbar Background on Scroll ---
(function navScroll() {
    const nav = document.querySelector('nav');
    if (!nav) return;

    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            nav.style.background = 'rgba(6, 7, 13, 0.92)';
            nav.style.borderBottomColor = 'rgba(30, 36, 54, 0.8)';
        } else {
            nav.style.background = 'rgba(6, 7, 13, 0.7)';
            nav.style.borderBottomColor = 'rgba(30, 36, 54, 0.5)';
        }
    });
})();

// --- Intersection Observer for Fade-In ---
(function fadeObserver() {
    const elements = document.querySelectorAll('.fade-in-up');
    if (!elements.length) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.animationPlayState = 'running';
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -40px 0px',
    });

    elements.forEach(el => {
        el.style.animationPlayState = 'paused';
        observer.observe(el);
    });

    // Immediately show elements that are already in viewport
    setTimeout(() => {
        elements.forEach(el => {
            const rect = el.getBoundingClientRect();
            if (rect.top < window.innerHeight && rect.bottom > 0) {
                el.style.animationPlayState = 'running';
            }
        });
    }, 100);
})();

// --- Active Nav Link Highlight ---
(function activeNav() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');

    window.addEventListener('scroll', () => {
        let current = '';
        sections.forEach(section => {
            const top = section.offsetTop - 100;
            if (window.scrollY >= top) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.style.color = '';
            if (link.getAttribute('href') === '#' + current) {
                link.style.color = '#EAEAF2';
            }
        });
    });
})();

// --- GitHub Release Loader -------------------------------------------------
// Buttons are driven by the repo's latest GitHub Release: version, date and
// size come straight from the API. The default hrefs in download.html already
// target /releases/latest/download/<asset>, so downloads keep working even if
// the API is unreachable or rate-limited (the API pass only enriches the meta
// lines and is cached for 10 minutes). While no release exists the buttons
// honestly say "coming soon".
(function releaseCheck() {
    const REPO = 'quasarbrowser/quasarbrowser.github.io';
    const API = 'https://api.github.com/repos/' + REPO + '/releases/latest';
    // Full Package zip lives on archive.org (stable, no size limit) until the
    // first GitHub release is published - the button is a live 1-click download.
    const ARCHIVE = 'https://archive.org/download/quasar-browser/Quasar%20Browser%20.zip';
    const CACHE_KEY = 'quasar-release-meta';
    const CACHE_MS = 10 * 60 * 1000;
    const assets = [
        { file: 'Quasar Browser Setup.exe', link: 'installer-link', meta: 'installer-meta', verb: 'Download Installer' },
        { file: 'Quasar Browser.void',      link: 'void-link',      meta: 'void-meta',      verb: 'Download Portable' },
        { file: 'Quasar Browser.zip',       link: 'package-link',   meta: 'package-meta',   verb: 'Download Full Package' },
    ];

    const fmtMB = b => (b / 1048576).toFixed(b >= 100 * 1048576 ? 0 : 1) + ' MB';

    function setLabel(a, text) {
        const el = document.getElementById(a.link);
        if (!el) return;
        const span = el.querySelector('.btn-label');
        if (span) span.textContent = text; else el.textContent = text;
    }

    function comingSoon(a) {
        const el = document.getElementById(a.link);
        if (el) el.classList.add('opacity-50', 'pointer-events-none');
        setLabel(a, 'Build coming soon');
        const m = document.getElementById(a.meta);
        if (m) m.textContent = a.file + ' - coming soon';
    }

    function keepLive(a) {
        const m = document.getElementById(a.meta);
        if (m) m.textContent = a.file + ' - via GitHub Releases';
    }

    function apply(rel) {
        const list = rel.assets || [];
        const ver = (rel.tag_name || '').replace(/^v/, '');
        const when = rel.published_at ? new Date(rel.published_at).toLocaleDateString() : '';
        if (ver) {
            const v = document.getElementById('release-version');
            if (v) v.textContent = 'v' + ver;
        }
        assets.forEach(a => {
            const asset = list.find(x => x.name === a.file);
            if (!asset) { comingSoon(a); return; }
            const el = document.getElementById(a.link);
            if (el) {
                el.href = asset.browser_download_url;
                el.classList.remove('opacity-50', 'pointer-events-none');
            }
            setLabel(a, a.verb);
            const m = document.getElementById(a.meta);
            if (m) m.textContent = a.file + ' - ' + fmtMB(asset.size) +
                (ver ? ' - v' + ver : '') + (when ? ' - ' + when : '');
        });
    }

    // cached meta first (keeps the API rate limit far away)
    try {
        const c = JSON.parse(localStorage.getItem(CACHE_KEY) || 'null');
        if (c && Date.now() - c.t < CACHE_MS && c.rel) { apply(c.rel); return; }
    } catch (e) { /* fall through to network */ }

    fetch(API, { headers: { Accept: 'application/vnd.github+json' } })
        .then(r => {
            if (r.status === 404) return { __none: true };   // no release published yet
            if (!r.ok) throw new Error('api ' + r.status);
            return r.json();
        })
        .then(rel => {
            if (rel.__none) {
                comingSoon(assets[0]);
                comingSoon(assets[1]);
                // No GitHub release yet -> the full package is live on archive.org
                // (stable, no file-size limit), so that button stays a real
                // 1-click download instead of "coming soon".
                const el = document.getElementById('package-link');
                if (el) {
                    el.href = ARCHIVE;
                    el.classList.remove('opacity-50', 'pointer-events-none');
                }
                setLabel(assets[2], 'Download Full Package');
                const m = document.getElementById('package-meta');
                if (m) m.textContent = 'Quasar Browser.zip - 919 MB - via archive.org';
                return;
            }
            apply(rel);
            try { localStorage.setItem(CACHE_KEY, JSON.stringify({ t: Date.now(), rel: rel })); } catch (e) {}
        })
        .catch(() => { assets.forEach(keepLive); });
})();
