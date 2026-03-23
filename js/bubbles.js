(function() {
    let canvas = null;
    let ctx = null;
    let w = 0, h = 0;
    let bubbles = [];
    let particles = [];
    let animationId = null;
    let isEnabled = false;
    let resizeListener = null;

    const MAX_BUBBLES = 40;
    const colors = [
        { start: 'rgba(255, 220, 150, 0.3)', end: 'rgba(255, 100, 150, 0.2)' },
        { start: 'rgba(200, 230, 255, 0.3)', end: 'rgba(100, 150, 255, 0.2)' },
        { start: 'rgba(210, 180, 255, 0.3)', end: 'rgba(140, 80, 200, 0.2)' },
        { start: 'rgba(255, 200, 200, 0.3)', end: 'rgba(255, 80, 120, 0.2)' }
    ];

    function random(min, max) {
        return Math.random() * (max - min) + min;
    }

    class Particle {
        constructor(x, y, vx, vy, color, size) {
            this.x = x;
            this.y = y;
            this.vx = vx;
            this.vy = vy;
            this.color = color;
            this.size = size;
            this.life = 1.0;
            this.decay = random(0.02, 0.05);
            this.gravity = 0.15;
        }
        update() {
            this.x += this.vx;
            this.y += this.vy;
            this.vy += this.gravity;
            this.life -= this.decay;
            return this.life > 0;
        }
        draw() {
            ctx.save();
            ctx.globalAlpha = this.life * 0.8;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = this.color;
            ctx.fill();
            ctx.restore();
        }
    }

    class Bubble {
        constructor(x, y, radius) {
            this.x = x;
            this.y = y;
            this.radius = radius;
            this.vx = random(-0.3, 0.3);
            this.vy = random(-0.2, 0.2);
            this.colorSet = colors[Math.floor(Math.random() * colors.length)];
            this.wobble = random(0, Math.PI * 2);
            this.wobbleSpeed = random(0.01, 0.03);
        }
        update() {
            this.x += this.vx;
            this.y += this.vy;
            this.wobble += this.wobbleSpeed;
            this.vx += Math.sin(this.wobble) * 0.01;
            this.vy += Math.cos(this.wobble) * 0.01;
            this.vx = Math.min(Math.max(this.vx, -0.6), 0.6);
            this.vy = Math.min(Math.max(this.vy, -0.6), 0.6);

            if (this.x - this.radius < 0 || this.x + this.radius > w ||
                this.y - this.radius < 0 || this.y + this.radius > h) {
                this.pop();
                return false;
            }
            return true;
        }
        pop() {
            const particleCount = Math.floor(random(12, 24));
            for (let i = 0; i < particleCount; i++) {
                const angle = random(0, Math.PI * 2);
                const speed = random(1, 4);
                const vx = Math.cos(angle) * speed + this.vx;
                const vy = Math.sin(angle) * speed + this.vy;
                const size = random(2, 6);
                const color = `rgba(${Math.floor(random(180, 255))}, ${Math.floor(random(100, 220))}, ${Math.floor(random(150, 255))}, 0.8)`;
                particles.push(new Particle(this.x, this.y, vx, vy, color, size));
            }
            for (let i = 0; i < 5; i++) {
                const angle = random(0, Math.PI * 2);
                const speed = random(1, 3);
                const vx = Math.cos(angle) * speed + this.vx;
                const vy = Math.sin(angle) * speed + this.vy;
                const size = random(1, 3);
                particles.push(new Particle(this.x, this.y, vx, vy, 'rgba(255, 255, 255, 0.9)', size));
            }
        }
        draw() {
            ctx.save();
            ctx.shadowBlur = this.radius * 0.2;
            ctx.shadowColor = 'rgba(0,0,0,0.1)';
            const gradient = ctx.createRadialGradient(
                this.x - this.radius * 0.2, this.y - this.radius * 0.2, this.radius * 0.1,
                this.x, this.y, this.radius
            );
            gradient.addColorStop(0, `rgba(255, 255, 255, 0.8)`);
            gradient.addColorStop(0.5, this.colorSet.start);
            gradient.addColorStop(1, this.colorSet.end);
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fillStyle = gradient;
            ctx.fill();
            // блики...
            ctx.beginPath();
            ctx.arc(this.x - this.radius * 0.35, this.y - this.radius * 0.35, this.radius * 0.25, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
            ctx.fill();
            ctx.beginPath();
            ctx.arc(this.x + this.radius * 0.2, this.y + this.radius * 0.2, this.radius * 0.12, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
            ctx.fill();
            ctx.beginPath();
            ctx.arc(this.x + this.radius * 0.1, this.y + this.radius * 0.45, this.radius * 0.08, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
            ctx.fill();
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(255, 255, 255, 0.5)`;
            ctx.lineWidth = 1.5;
            ctx.stroke();
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius - 1, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(203, 17, 171, 0.3)`;
            ctx.lineWidth = 1;
            ctx.stroke();
            ctx.restore();
        }
    }

    function addBubble() {
        if (bubbles.length >= MAX_BUBBLES) return;
        const radius = random(25, 80);
        bubbles.push(new Bubble(
            random(radius, w - radius),
            random(radius, h - radius),
            radius
        ));
    }

    function initBubbles() {
        if (canvas) return;
        canvas = document.createElement('canvas');
        canvas.id = 'bubble-canvas';
        canvas.style.position = 'fixed';
        canvas.style.top = '0';
        canvas.style.left = '0';
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        canvas.style.pointerEvents = 'auto';
        canvas.style.zIndex = '9999';
        document.body.appendChild(canvas);
        ctx = canvas.getContext('2d');

        function resizeCanvas() {
            w = window.innerWidth;
            h = window.innerHeight;
            canvas.width = w;
            canvas.height = h;
        }
        resizeCanvas();
        resizeListener = resizeCanvas;
        window.addEventListener('resize', resizeListener);

        // Создаём несколько пузырей
        for (let i = 0; i < 8; i++) setTimeout(() => addBubble(), i * 400);
        setInterval(() => { if (bubbles.length < MAX_BUBBLES) addBubble(); }, 6000);

        canvas.addEventListener('click', function(e) {
            const rect = canvas.getBoundingClientRect();
            const scaleX = canvas.width / rect.width;
            const scaleY = canvas.height / rect.height;
            const mouseX = (e.clientX - rect.left) * scaleX;
            const mouseY = (e.clientY - rect.top) * scaleY;
            for (let i = bubbles.length - 1; i >= 0; i--) {
                const b = bubbles[i];
                const dx = mouseX - b.x;
                const dy = mouseY - b.y;
                if (dx * dx + dy * dy <= b.radius * b.radius) {
                    b.pop();
                    bubbles.splice(i, 1);
                    e.stopPropagation();
                    e.preventDefault();
                    return;
                }
            }
            canvas.style.pointerEvents = 'none';
            const elem = document.elementFromPoint(e.clientX, e.clientY);
            canvas.style.pointerEvents = 'auto';
            if (elem && elem !== canvas) elem.click();
        });

        function animate() {
            if (!canvas) return;
            ctx.clearRect(0, 0, w, h);
            for (let i = bubbles.length - 1; i >= 0; i--) {
                const alive = bubbles[i].update();
                if (!alive) bubbles.splice(i, 1);
                else bubbles[i].draw();
            }
            for (let i = particles.length - 1; i >= 0; i--) {
                if (particles[i].update()) particles[i].draw();
                else particles.splice(i, 1);
            }
            animationId = requestAnimationFrame(animate);
        }
        animate();
    }

    function destroyBubbles() {
        if (animationId) {
            cancelAnimationFrame(animationId);
            animationId = null;
        }
        if (canvas) {
            canvas.remove();
            canvas = null;
        }
        if (resizeListener) {
            window.removeEventListener('resize', resizeListener);
            resizeListener = null;
        }
        ctx = null;
        bubbles = [];
        particles = [];
    }

    window.Bubbles = {
        enable: () => {
            if (isEnabled) return;
            isEnabled = true;
            initBubbles();
        },
        disable: () => {
            if (!isEnabled) return;
            isEnabled = false;
            destroyBubbles();
        },
        toggle: () => {
            if (isEnabled) window.Bubbles.disable();
            else window.Bubbles.enable();
        }
    };

    // Инициализация по состоянию из localStorage
    document.addEventListener('DOMContentLoaded', () => {
        const toggle = document.getElementById('bubbleToggle');
        if (!toggle) return;
        const saved = localStorage.getItem('bubblesEnabled');
        const enabled = saved === 'true';
        toggle.checked = enabled;
        if (enabled) {
            window.Bubbles.enable();
        }
        toggle.addEventListener('change', (e) => {
            const state = e.target.checked;
            localStorage.setItem('bubblesEnabled', state);
            window.Bubbles.toggle();
        });
    });
})();