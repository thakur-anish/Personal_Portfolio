/* 0. THEME TOGGLE */
(function initTheme() {
    const root = document.documentElement;
    const btn = document.getElementById('themeToggle');
    const stored = localStorage.getItem('theme') || 'light';
    function applyTheme(t) { root.setAttribute('data-theme', t); localStorage.setItem('theme', t); }
    if (btn) {
        btn.addEventListener('click', () => {
            const current = root.getAttribute('data-theme') || 'light';
            applyTheme(current === 'dark' ? 'light' : 'dark');
        });
    }
    applyTheme(stored);
})();

'use strict';

/* 1. LOADER */
document.body.style.overflow = 'hidden';
const loaderFill = document.getElementById('loaderFill');
setTimeout(() => { if (loaderFill) loaderFill.style.width = '100%'; }, 80);
window.addEventListener('load', () => {
    const loader = document.getElementById('loader');
    setTimeout(() => {
        loader.classList.add('hidden');
        document.body.style.overflow = '';
        initAll();
    }, 1000);
});
/* Fallback in case load event is delayed */
setTimeout(() => {
    const loader = document.getElementById('loader');
    if (loader && !loader.classList.contains('hidden')) {
        loader.classList.add('hidden');
        document.body.style.overflow = '';
        initAll();
    }
}, 3500);

/* 2. CUSTOM CURSOR */
function initCursor() {
    const dot = document.getElementById('cursorDot');
    const ring = document.getElementById('cursorRing');
    if (!dot || !ring || window.innerWidth < 768) return;
    let mx = 0, my = 0, rx = 0, ry = 0;
    window.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; dot.style.left = mx + 'px'; dot.style.top = my + 'px'; });
    function loop() { rx += (mx - rx) * 0.18; ry += (my - ry) * 0.18; ring.style.left = rx + 'px'; ring.style.top = ry + 'px'; requestAnimationFrame(loop); }
    loop();
    document.querySelectorAll('a, button, .tilt-card').forEach(el => {
        el.addEventListener('mouseenter', () => ring.style.transform = 'translate(-50%,-50%) scale(1.6)');
        el.addEventListener('mouseleave', () => ring.style.transform = 'translate(-50%,-50%) scale(1)');
    });
}

/* 3. NAV: hamburger, overlay, scroll style, active link */
function initNav() {
    const navbar = document.getElementById('navbar');
    const hamburger = document.getElementById('hamburger');
    const navLinks = document.getElementById('navLinks');
    const overlay = document.getElementById('navOverlay');

    function closeMenu() { navLinks.classList.remove('active'); overlay.classList.remove('active'); hamburger.setAttribute('aria-expanded', 'false'); }
    function openMenu() { navLinks.classList.add('active'); overlay.classList.add('active'); hamburger.setAttribute('aria-expanded', 'true'); }

    hamburger.addEventListener('click', () => navLinks.classList.contains('active') ? closeMenu() : openMenu());
    overlay.addEventListener('click', closeMenu);
    navLinks.querySelectorAll('.nav-link').forEach(l => l.addEventListener('click', closeMenu));

    window.addEventListener('scroll', () => {
        navbar.classList.toggle('scrolled', window.scrollY > 40);
        document.getElementById('scrollTop').classList.toggle('visible', window.scrollY > 500);

        const sections = document.querySelectorAll('.section, .hero');
        let current = 'home';
        sections.forEach(sec => {
            const top = sec.offsetTop - 140;
            if (window.scrollY >= top) current = sec.id;
        });
        document.querySelectorAll('.nav-link').forEach(l => {
            l.classList.toggle('active', l.getAttribute('href') === '#' + current);
        });
    });

    document.getElementById('scrollTop').addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

/* 4. TYPING EFFECT */
function initTyping() {
    const el = document.getElementById('heroType');
    if (!el) return;
    const phrases = [
        'BSc (Hons) Computer Systems Engineering Graduate',
        'Cybersecurity & Network Security Enthusiast',
        'Aspiring MSc Cybersecurity Student (Abroad)',
        'Ethical Hacker in Training'
    ];
    let pIdx = 0, cIdx = 0, deleting = false;
    function tick() {
        const phrase = phrases[pIdx];
        if (!deleting) {
            cIdx++;
            el.textContent = phrase.slice(0, cIdx);
            if (cIdx === phrase.length) { deleting = true; setTimeout(tick, 1600); return; }
        } else {
            cIdx--;
            el.textContent = phrase.slice(0, cIdx);
            if (cIdx === 0) { deleting = false; pIdx = (pIdx + 1) % phrases.length; }
        }
        setTimeout(tick, deleting ? 35 : 65);
    }
    tick();
}

/* 5. SCROLL REVEAL */
function initReveal() {
    const items = document.querySelectorAll('.reveal');
    const io = new IntersectionObserver((entries) => {
        entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); } });
    }, { threshold: 0.15 });
    items.forEach(i => io.observe(i));
}

/* 6. SKILL BARS + SOFT RINGS */
function initSkillFills() {
    const bars = document.querySelectorAll('.skill-fill');
    const rings = document.querySelectorAll('.soft-ring .fg');
    const io = new IntersectionObserver((entries) => {
        entries.forEach(e => {
            if (!e.isIntersecting) return;
            if (e.target.classList.contains('skill-fill')) {
                e.target.style.width = e.target.dataset.width + '%';
            } else {
                const pct = parseFloat(e.target.dataset.pct);
                const circumference = 2 * Math.PI * 34;
                e.target.style.strokeDashoffset = circumference - (pct / 100) * circumference;
            }
            io.unobserve(e.target);
        });
    }, { threshold: 0.4 });
    bars.forEach(b => io.observe(b));
    rings.forEach(r => io.observe(r));
}

/* 7. TILT CARDS (3D pointer-follow tilt + glow, smoothed with lerp) */
function initTiltCards() {
    const cards = document.querySelectorAll('.tilt-card');
    const isTouch = window.matchMedia('(hover: none)').matches;
    if (isTouch) return;
    cards.forEach(card => {
        let raf = null;
        let targetRX = 0, targetRY = 0, curRX = 0, curRY = 0;
        let hovering = false;

        function loop() {
            curRX += (targetRX - curRX) * 0.15;
            curRY += (targetRY - curRY) * 0.15;
            card.style.transform = `perspective(1000px) rotateX(${curRX.toFixed(2)}deg) rotateY(${curRY.toFixed(2)}deg) translateY(${hovering ? -6 : 0}px) scale(${hovering ? 1.015 : 1})`;
            if (hovering || Math.abs(curRX) > 0.05 || Math.abs(curRY) > 0.05) {
                raf = requestAnimationFrame(loop);
            } else {
                card.style.transform = '';
                raf = null;
            }
        }

        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const cx = x / rect.width - 0.5;
            const cy = y / rect.height - 0.5;
            targetRX = (-cy * 6).toFixed(2);
            targetRY = (cx * 8).toFixed(2);
            card.style.setProperty('--mx', x + 'px');
            card.style.setProperty('--my', y + 'px');
            hovering = true;
            if (!raf) raf = requestAnimationFrame(loop);
        });
        card.addEventListener('mouseleave', () => {
            hovering = false;
            targetRX = 0; targetRY = 0;
            if (!raf) raf = requestAnimationFrame(loop);
        });
    });
}

/* 7b. FULL-PAGE FLOATING PARTICLE BACKGROUND */
function initBgParticles() {
    const canvas = document.getElementById('bgParticles');
    if (!canvas) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const ctx = canvas.getContext('2d');
    let w, h, particles;
    const isMobile = window.innerWidth < 700;
    const COUNT = isMobile ? 45 : 100;

    function resize() {
        w = canvas.width = window.innerWidth;
        h = canvas.height = window.innerHeight;
    }

    function makeParticles() {
        particles = Array.from({ length: COUNT }, () => ({
            x: Math.random() * w,
            y: Math.random() * h,
            r: Math.random() * 1.6 + 0.5,
            vy: -(Math.random() * 0.25 + 0.05),
            vx: (Math.random() - 0.5) * 0.15,
            alpha: Math.random() * 0.5 + 0.2,
            hue: Math.random() > 0.6 ? '45,212,191' : '196,181,253'
        }));
    }

    resize();
    makeParticles();
    window.addEventListener('resize', () => { resize(); });

    function draw() {
        ctx.clearRect(0, 0, w, h);
        particles.forEach(p => {
            p.x += p.vx;
            p.y += p.vy;
            if (p.y < -10) { p.y = h + 10; p.x = Math.random() * w; }
            if (p.x < -10) p.x = w + 10;
            if (p.x > w + 10) p.x = -10;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${p.hue},${p.alpha})`;
            ctx.fill();
        });
        requestAnimationFrame(draw);
    }
    draw();
}


/* 8. THREE.JS HERO — Cyber Security Core (icosahedron wireframe + orbiting particles) */
function initHeroScene() {
    const canvas = document.getElementById('heroCanvas');
    if (!canvas || typeof THREE === 'undefined') return;
    const heroSection = document.querySelector('.hero');
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let width = heroSection.clientWidth, height = heroSection.clientHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(52, width / height, 0.1, 1000);
    camera.position.set(0, 0, 15);

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);

    const group = new THREE.Group();
    scene.add(group);

    // Core wireframe icosahedron
    const coreGeo = new THREE.IcosahedronGeometry(4.1, 1);
    const coreMat = new THREE.MeshBasicMaterial({ color: 0xC4B5FD, wireframe: true, transparent: true, opacity: 0.55 });
    const core = new THREE.Mesh(coreGeo, coreMat);
    group.add(core);

    // Inner solid faint shell
    const innerGeo = new THREE.IcosahedronGeometry(3.85, 1);
    const innerMat = new THREE.MeshBasicMaterial({ color: 0x2dd4bf, transparent: true, opacity: 0.05 });
    const inner = new THREE.Mesh(innerGeo, innerMat);
    group.add(inner);

    // Outer rotating ring (cyan)
    const ringGeo = new THREE.TorusGeometry(6.4, 0.02, 8, 100);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0x2dd4bf, transparent: true, opacity: 0.45 });
    const ring1 = new THREE.Mesh(ringGeo, ringMat);
    ring1.rotation.x = Math.PI / 2.4;
    group.add(ring1);
    const ring2 = new THREE.Mesh(ringGeo, ringMat.clone());
    ring2.rotation.x = Math.PI / 1.6;
    ring2.rotation.y = Math.PI / 3;
    ring2.scale.setScalar(0.82);
    group.add(ring2);

    // Orbiting particle field
    const particleCount = 260;
    const positions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
        const r = 5.6 + Math.random() * 3.6;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
        positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
        positions[i * 3 + 2] = r * Math.cos(phi);
    }
    const particleGeo = new THREE.BufferGeometry();
    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const particleMat = new THREE.PointsMaterial({ color: 0xDDD6FE, size: 0.045, transparent: true, opacity: 0.75 });
    const particles = new THREE.Points(particleGeo, particleMat);
    group.add(particles);

    // Mouse parallax
    let targetRotX = 0, targetRotY = 0;
    window.addEventListener('mousemove', (e) => {
        const nx = (e.clientX / window.innerWidth) * 2 - 1;
        const ny = (e.clientY / window.innerHeight) * 2 - 1;
        targetRotY = nx * 0.35;
        targetRotX = ny * 0.2;
    });

    function positionGroup() {
        // Place the core roughly under the profile orb on desktop, centered on mobile
        if (window.innerWidth > 1024) {
            group.position.x = 4.6;
        } else {
            group.position.x = 0;
        }
    }
    positionGroup();

    const clock = new THREE.Clock();
    function animate() {
        const t = clock.getElapsedTime();
        core.rotation.y = t * 0.18;
        core.rotation.x = t * 0.09;
        inner.rotation.y = -t * 0.12;
        ring1.rotation.z = t * 0.15;
        ring2.rotation.z = -t * 0.1;
        particles.rotation.y = t * 0.05;

        group.rotation.y += (targetRotY - group.rotation.y) * 0.04;
        group.rotation.x += (targetRotX - group.rotation.x) * 0.04;

        renderer.render(scene, camera);
        requestAnimationFrame(animate);
    }
    animate();

    window.addEventListener('resize', () => {
        width = heroSection.clientWidth; height = heroSection.clientHeight;
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
        positionGroup();
    });
}

/* 10. RESUME MODAL */
function initResumeModal() {
    const trigger = document.getElementById('resumeTrigger');
    const overlay = document.getElementById('resumeModalOverlay');
    const closeBtn = document.getElementById('resumeModalClose');
    if (!trigger || !overlay) return;
    function open(e) { if (e) e.preventDefault(); overlay.classList.add('active'); document.body.style.overflow = 'hidden'; }
    function close() { overlay.classList.remove('active'); document.body.style.overflow = ''; }
    trigger.addEventListener('click', open);
    closeBtn.addEventListener('click', close);
    overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
}

/* 11. INJECT EMBEDDED PROFILE IMAGE (guarantees the photo always renders,
       even if the site is shared/opened without the separate image file) */
function initProfileImages() {
    if (typeof window.PROFILE_IMG_SRC !== 'string') return;
    document.querySelectorAll('img[data-embed="profile"]').forEach(img => {
        img.src = window.PROFILE_IMG_SRC;
        img.parentElement.classList.remove('no-img');
    });
}

/* INIT ALL */
function initAll() {
    initCursor();
    initNav();
    initTyping();
    initReveal();
    initSkillFills();
    initTiltCards();
    initHeroScene();
    initBgParticles();
    initResumeModal();
    initProfileImages();
}
