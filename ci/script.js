/* ============================================
   PriSincera — The Star Prism
   CI Guide v4.0 Interactions
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
    initNav();
    initMobileMenu();
    initRevealAnimations();
    initAmbientCanvas();
    initStarParticles();
    initStarInteraction();
    initServiceCards();
});

/* --- Navigation Scroll --- */
function initNav() {
    const nav = document.getElementById('nav');
    if (!nav) return;

    window.addEventListener('scroll', () => {
        if (window.scrollY > 60) {
            nav.classList.add('scrolled');
        } else {
            nav.classList.remove('scrolled');
        }
    }, { passive: true });
}

/* --- Mobile Menu --- */
function initMobileMenu() {
    const btn = document.getElementById('navMenuBtn');
    const menu = document.getElementById('mobileMenu');
    if (!btn || !menu) return;

    btn.addEventListener('click', () => {
        btn.classList.toggle('active');
        menu.classList.toggle('active');
        document.body.style.overflow = menu.classList.contains('active') ? 'hidden' : '';
    });

    menu.querySelectorAll('.mobile-link').forEach(link => {
        link.addEventListener('click', () => {
            btn.classList.remove('active');
            menu.classList.remove('active');
            document.body.style.overflow = '';
        });
    });
}

/* --- Intersection Observer for Reveals --- */
function initRevealAnimations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

    document.querySelectorAll('.reveal-up').forEach(el => {
        observer.observe(el);
    });
}

/* --- Ambient Canvas (Stars + Soft Orbs) --- */
function initAmbientCanvas() {
    const canvas = document.getElementById('ambientCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let w, h;
    let orbs = [];
    let stars = [];

    function resize() {
        w = canvas.width = window.innerWidth;
        h = canvas.height = window.innerHeight;
        initOrbs();
        initStars();
    }

    function initOrbs() {
        orbs = [];
        const colors = [
            { r: 124, g: 58, b: 237 },
            { r: 196, g: 181, b: 253 },
            { r: 167, g: 139, b: 250 },
            { r: 253, g: 230, b: 138 },
            { r: 240, g: 171, b: 252 },
        ];

        for (let i = 0; i < 5; i++) {
            const color = colors[i % colors.length];
            orbs.push({
                x: Math.random() * w,
                y: Math.random() * h,
                r: Math.random() * 200 + 100,
                color,
                speedX: (Math.random() - 0.5) * 0.25,
                speedY: (Math.random() - 0.5) * 0.18,
                opacity: Math.random() * 0.025 + 0.008,
                phase: Math.random() * Math.PI * 2,
            });
        }
    }

    function initStars() {
        stars = [];
        const numStars = Math.floor((w * h) / 5000);
        for (let i = 0; i < numStars; i++) {
            stars.push({
                x: Math.random() * w,
                y: Math.random() * h,
                r: Math.random() * 1.2 + 0.3,
                opacity: Math.random() * 0.4 + 0.05,
                speed: Math.random() * 0.015 + 0.003,
                angle: Math.random() * Math.PI * 2,
                color: Math.random() > 0.85 ? '#C4B5FD' : (Math.random() > 0.6 ? '#E9D5FF' : '#FFFFFF')
            });
        }
    }

    function draw() {
        ctx.clearRect(0, 0, w, h);

        // Draw stars
        for (const star of stars) {
            star.angle += star.speed;
            const alpha = star.opacity + Math.sin(star.angle) * 0.2;

            ctx.beginPath();
            ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
            ctx.fillStyle = star.color;
            ctx.globalAlpha = Math.max(0, Math.min(1, alpha));
            ctx.fill();
        }

        // Draw soft orbs
        for (const orb of orbs) {
            orb.x += orb.speedX;
            orb.y += orb.speedY;
            orb.phase += 0.005;

            if (orb.x < -orb.r) orb.x = w + orb.r;
            if (orb.x > w + orb.r) orb.x = -orb.r;
            if (orb.y < -orb.r) orb.y = h + orb.r;
            if (orb.y > h + orb.r) orb.y = -orb.r;

            const dynamicOpacity = orb.opacity + Math.sin(orb.phase) * 0.008;

            const gradient = ctx.createRadialGradient(orb.x, orb.y, 0, orb.x, orb.y, orb.r);
            gradient.addColorStop(0, `rgba(${orb.color.r}, ${orb.color.g}, ${orb.color.b}, ${dynamicOpacity})`);
            gradient.addColorStop(1, `rgba(${orb.color.r}, ${orb.color.g}, ${orb.color.b}, 0)`);

            ctx.globalAlpha = 1;
            ctx.beginPath();
            ctx.arc(orb.x, orb.y, orb.r, 0, Math.PI * 2);
            ctx.fillStyle = gradient;
            ctx.fill();
        }

        ctx.globalAlpha = 1;
        requestAnimationFrame(draw);
    }

    window.addEventListener('resize', resize);
    resize();
    draw();
}

/* --- Star Floating Particles --- */
function initStarParticles() {
    const container = document.getElementById('starParticles');
    if (!container) return;

    const colors = ['#C4B5FD', '#A78BFA', '#FDE68A', '#F0ABFC', '#E9D5FF'];

    for (let i = 0; i < 14; i++) {
        const particle = document.createElement('div');
        particle.className = 'star-particle';
        particle.style.background = colors[i % colors.length];
        particle.style.left = `${25 + Math.random() * 50}%`;
        particle.style.top = `${15 + Math.random() * 60}%`;
        particle.style.setProperty('--dx', `${(Math.random() - 0.5) * 35}px`);
        particle.style.setProperty('--dy', `${(Math.random() - 0.5) * 35}px`);
        particle.style.animationDelay = `${Math.random() * 4}s`;
        particle.style.animationDuration = `${3 + Math.random() * 3}s`;
        const size = 2 + Math.random() * 3;
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        container.appendChild(particle);
    }
}

/* --- Star Interaction (hover parallax) --- */
function initStarInteraction() {
    const stage = document.getElementById('starStage');
    const starBody = document.getElementById('starBody');
    if (!stage || !starBody) return;

    // Subtle parallax on mouse move
    stage.addEventListener('mousemove', (e) => {
        const rect = stage.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;

        starBody.style.transform = `translate(${x * 8}px, ${y * 6}px)`;
    });

    stage.addEventListener('mouseleave', () => {
        starBody.style.transform = '';
    });
}

/* --- Service Card hover effects --- */
function initServiceCards() {
    const cards = document.querySelectorAll('.service-card');

    cards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            card.style.setProperty('--mouse-x', `${x}px`);
            card.style.setProperty('--mouse-y', `${y}px`);
        });
    });
}
