/* ========================================
   Quasar Browser - Void Mode Docs JS
   ======================================== */

// --- Starfield Animation (same as main site) ---
(function starfield() {
    const canvas = document.getElementById('stars');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let stars = [];

    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        const count = Math.floor((canvas.width * canvas.height) / 16000);
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
            ctx.globalAlpha = 0.2 + Math.abs(Math.sin(star.a)) * 0.45;
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

    btn.addEventListener('click', () => menu.classList.toggle('hidden'));

    menu.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => menu.classList.add('hidden'));
    });
})();

// --- Smooth Scrolling ---
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (href === '#' || href.length < 2) return;
        const target = document.querySelector(href);
        if (!target) return;
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
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
    }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

    elements.forEach(el => {
        el.style.animationPlayState = 'paused';
        observer.observe(el);
    });

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

    if (!sections.length || !navLinks.length) return;

    window.addEventListener('scroll', () => {
        let current = '';
        sections.forEach(section => {
            if (window.scrollY >= section.offsetTop - 120) {
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

// --- Void Pipeline Simulator ---
(function simulator() {
    const btn = document.getElementById('sim-run');
    const log = document.getElementById('sim-log');
    const stops = Array.from(document.querySelectorAll('.sim-stop'));
    if (!btn || !log || !stops.length) return;

    const IDLE = 'Press “Run packet” to trace a request through the four sealed hops.';

    const STEPS = [
        {
            hop: 'you',
            lines: [
                ['dim', 'address bar: example.com'],
                ['dim', 'connecting through Void Mode...'],
            ],
        },
        {
            hop: 'Lobby',
            lines: [
                ['no', 'real IP observed'],
                ['ok', 'alias minted: 7f-4c-9a-2e (ephemeral, 1 request)'],
                ['ok', 'packet sealed + forwarded to corepoint'],
            ],
        },
        {
            hop: 'corepoint',
            lines: [
                ['no', 'sees your alias only, never your IP'],
                ['no', 'payload still sealed for Escape'],
                ['ok', 're-wrapped with hop key #2, forwarded to Escape'],
            ],
        },
        {
            hop: 'Escape',
            lines: [
                ['no', 'cannot open the bundle it carries'],
                ['ok', 'tamper check passed, re-wrapped (hop #3)'],
                ['ok', 'forwarded to Void4'],
            ],
        },
        {
            hop: 'Void4',
            lines: [
                ['no', 'sees the destination, not the person'],
                ['ok', 'final unwrap + signature verification'],
                ['dim', 'request leaves the void network'],
            ],
        },
        {
            hop: 'website',
            lines: [
                ['ok', 'page delivered to you'],
                ['no', 'website learns nothing about you'],
                ['dim', 'ad/tracker/fingerprint scripts dropped en route'],
            ],
        },
    ];

    let timers = [];
    let running = false;

    function clearAll() {
        timers.forEach(clearTimeout);
        timers = [];
    }

    function reset() {
        clearAll();
        running = false;
        btn.disabled = false;
        btn.textContent = 'Run packet';
        stops.forEach(s => s.classList.remove('on', 'done'));
        log.innerHTML = '<span class="idle">' + IDLE + '</span>';
        log.scrollTop = 0;
    }

    function write(text, cls, hop) {
        const el = document.createElement('span');
        el.className = 'l';
        const stamp = new Date().toLocaleTimeString('en-GB', { hour12: false });
        el.innerHTML = '<span class="t">' + stamp + '</span>' +
            (hop ? '<span class="hop">[' + hop + ']</span>' : '') +
            '<span class="' + (cls || 'dim') + '">' + text + '</span>';
        const idle = log.querySelector('.idle');
        if (idle) idle.remove();
        log.appendChild(el);
        log.scrollTop = log.scrollHeight;
    }

    function run() {
        clearAll();
        running = true;
        btn.disabled = true;
        btn.textContent = 'Tracing...';
        log.innerHTML = '';

        let t = 0;
        STEPS.forEach((step, i) => {
            timers.push(setTimeout(() => {
                stops.forEach((s, idx) => {
                    s.classList.remove('on', 'done');
                    if (idx < i) s.classList.add('done');
                });
                if (stops[i]) stops[i].classList.add('on');
                step.lines.forEach(line => write(line[1], line[0], step.hop));
            }, t));

            if (i === STEPS.length - 1) {
                t += 900;
                timers.push(setTimeout(() => {
                    stops.forEach(s => { s.classList.remove('on'); s.classList.add('done'); });
                    write('void pipeline complete — request and response discarded', 'ok');
                }, t));
            }

            t += 850;
        });

        timers.push(setTimeout(() => {
            running = false;
            btn.disabled = false;
            btn.textContent = 'Run again';
        }, t + 200));
    }

    btn.addEventListener('click', () => {
        if (running) reset();
        else run();
    });

    log.innerHTML = '<span class="idle">' + IDLE + '</span>';
})();

// --- FAQ Accordion ---
(function faq() {
    const items = Array.from(document.querySelectorAll('.faq-item'));
    if (!items.length) return;

    items.forEach(item => {
        const q = item.querySelector('.faq-q');
        const a = item.querySelector('.faq-a');
        if (!q || !a) return;

        q.addEventListener('click', () => {
            const isOpen = item.classList.contains('open');

            items.forEach(other => {
                other.classList.remove('open');
                const oa = other.querySelector('.faq-a');
                if (oa) oa.style.maxHeight = null;
            });

            if (!isOpen) {
                item.classList.add('open');
                a.style.maxHeight = a.scrollHeight + 'px';
            }
        });
    });
})();

// --- Copy Code Blocks ---
(function copyCode() {
    const blocks = Array.from(document.querySelectorAll('[data-copy]'));
    if (!blocks.length) return;

    blocks.forEach(block => {
        const btn = block.querySelector('.copy-btn');
        const body = block.querySelector('.code-body');
        if (!btn || !body) return;

        btn.addEventListener('click', async () => {
            const text = body.innerText;
            let done = false;
            try {
                await navigator.clipboard.writeText(text);
                done = true;
            } catch (e) {
                const ta = document.createElement('textarea');
                ta.value = text;
                ta.style.position = 'fixed';
                ta.style.opacity = '0';
                document.body.appendChild(ta);
                ta.select();
                try { done = document.execCommand('copy'); } catch (e2) { done = false; }
                document.body.removeChild(ta);
            }

            btn.textContent = done ? 'Copied' : 'Failed';
            btn.classList.add('done');
            setTimeout(() => {
                btn.textContent = 'Copy';
                btn.classList.remove('done');
            }, 1600);
        });
    });
})();

// --- Reading Progress Bar ---
(function progress() {
    const bar = document.getElementById('read-progress');
    if (!bar) return;

    window.addEventListener('scroll', () => {
        const h = document.documentElement.scrollHeight - window.innerHeight;
        const pct = h > 0 ? (window.scrollY / h) * 100 : 0;
        bar.style.width = pct + '%';
    }, { passive: true });
})();
