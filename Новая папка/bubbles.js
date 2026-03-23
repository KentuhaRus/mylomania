(function() {
    // Создаём canvas и добавляем на страницу
    const canvas = document.createElement('canvas');
    canvas.id = 'bubbles-canvas';
    document.body.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    let width, height;
    let bubbles = [];
    const MAX_BUBBLES = 20; // максимум пузырей на экране
    const BUBBLE_COLORS = [
        'rgba(203, 17, 171, 0.15)',
        'rgba(31, 68, 107, 0.15)',
        'rgba(255, 255, 255, 0.3)'
    ];

    // Подстраиваем размер canvas под окно
    function resize() {
        width = window.innerWidth;
        height = window.innerHeight;
        canvas.width = width;
        canvas.height = height;
    }
    window.addEventListener('resize', resize);
    resize();

    // Случайное число
    function random(min, max) {
        return Math.random() * (max - min) + min;
    }

    // Создание нового пузыря
    function createBubble() {
        const radius = random(15, 50);
        return {
            x: random(radius, width - radius),
            y: random(radius, height - radius),
            radius: radius,
            vx: random(-0.5, 0.5),
            vy: random(-0.3, 0.3),
            color: BUBBLE_COLORS[Math.floor(Math.random() * BUBBLE_COLORS.length)]
        };
    }

    // Обновление позиций пузырей (движение + отскок от краёв)
    function updateBubbles() {
        for (let i = 0; i < bubbles.length; i++) {
            const b = bubbles[i];
            b.x += b.vx;
            b.y += b.vy;

            // Отскок от левой/правой границы
            if (b.x - b.radius < 0) {
                b.x = b.radius;
                b.vx *= -1;
            } else if (b.x + b.radius > width) {
                b.x = width - b.radius;
                b.vx *= -1;
            }

            // Отскок от верхней/нижней границы
            if (b.y - b.radius < 0) {
                b.y = b.radius;
                b.vy *= -1;
            } else if (b.y + b.radius > height) {
                b.y = height - b.radius;
                b.vy *= -1;
            }
        }
    }

    // Отрисовка пузырей
    function drawBubbles() {
        ctx.clearRect(0, 0, width, height);
        for (let b of bubbles) {
            ctx.beginPath();
            ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
            ctx.fillStyle = b.color;
            ctx.fill();
            ctx.strokeStyle = 'rgba(203, 17, 171, 0.3)';
            ctx.lineWidth = 1;
            ctx.stroke();
        }
    }

    // Анимационный цикл
    function animate() {
        updateBubbles();
        drawBubbles();
        requestAnimationFrame(animate);
    }
    animate();

    // Добавляем новые пузыри каждые 2 секунды (пока не достигнут лимит)
    setInterval(() => {
        if (bubbles.length < MAX_BUBBLES) {
            bubbles.push(createBubble());
        }
    }, 2000);

    // Обработка кликов по canvas
    canvas.addEventListener('click', function(e) {
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        const mouseX = (e.clientX - rect.left) * scaleX;
        const mouseY = (e.clientY - rect.top) * scaleY;

        // Проверяем, попал ли клик в какой-нибудь пузырь
        let hitIndex = -1;
        for (let i = bubbles.length - 1; i >= 0; i--) {
            const b = bubbles[i];
            const dx = mouseX - b.x;
            const dy = mouseY - b.y;
            if (dx * dx + dy * dy <= b.radius * b.radius) {
                hitIndex = i;
                break;
            }
        }

        if (hitIndex !== -1) {
            // Лопаем пузырь (удаляем из массива)
            bubbles.splice(hitIndex, 1);
            e.preventDefault();
            e.stopPropagation();
            return;
        }

        // Если клик был не по пузырю, передаём его элементу под canvas
        canvas.style.pointerEvents = 'none';
        const target = document.elementFromPoint(e.clientX, e.clientY);
        canvas.style.pointerEvents = 'auto';

        if (target && target !== canvas) {
            const clickEvent = new MouseEvent('click', {
                bubbles: true,
                cancelable: true,
                clientX: e.clientX,
                clientY: e.clientY
            });
            target.dispatchEvent(clickEvent);
        }
    });

    // Чтобы скролл мышью и другие события тоже передавались под canvas
    canvas.addEventListener('wheel', function(e) {
        canvas.style.pointerEvents = 'none';
        const target = document.elementFromPoint(e.clientX, e.clientY);
        canvas.style.pointerEvents = 'auto';
        if (target && target !== canvas) {
            const wheelEvent = new WheelEvent('wheel', {
                deltaX: e.deltaX,
                deltaY: e.deltaY,
                deltaZ: e.deltaZ,
                clientX: e.clientX,
                clientY: e.clientY,
                bubbles: true,
                cancelable: true
            });
            target.dispatchEvent(wheelEvent);
            e.preventDefault();
        }
    });

    // Блокируем контекстное меню на canvas (чтобы не мешало)
    canvas.addEventListener('contextmenu', (e) => e.preventDefault());
})();