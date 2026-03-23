import { CONFIG } from './config.js';

// Синхронное копирование текста в буфер (fallback)
export function copyTextSync(text) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    textarea.setSelectionRange(0, 99999);
    let success = false;
    try {
        success = document.execCommand('copy');
    } catch (err) {
        console.warn('execCommand error:', err);
    }
    document.body.removeChild(textarea);
    return success;
}

// Диалог копирования для MAX
export function showMaxCopyDialog(message) {
    const existing = document.getElementById('max-copy-dialog');
    if (existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.id = 'max-copy-dialog';
    overlay.className = 'modal-overlay';

    const content = document.createElement('div');
    content.className = 'modal-content copy-dialog';
    content.innerHTML = `
        <h3>Ваш заказ</h3>
        <div class="order-message">${message.replace(/\n/g, '<br>')}</div>
        <p class="copy-hint">Нажмите кнопку ниже, чтобы скопировать текст и открыть чат MAX. Если автоматическое копирование не сработает, скопируйте текст вручную.</p>
        <div class="modal-actions">
            <button class="btn-primary" id="copy-and-open-max">Скопировать и открыть MAX</button>
        </div>
        <button class="close-modal" id="close-copy-dialog">Закрыть</button>
    `;

    overlay.appendChild(content);
    document.body.appendChild(overlay);

    document.getElementById('copy-and-open-max').addEventListener('click', () => {
        const copied = copyTextSync(message);
        if (!copied) {
            alert('Не удалось скопировать автоматически. Пожалуйста, скопируйте текст вручную.');
        }
        window.location.href = CONFIG.maxLink;
        overlay.remove();
    });

    document.getElementById('close-copy-dialog').addEventListener('click', () => {
        overlay.remove();
    });

    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) overlay.remove();
    });
}

// Открытие мессенджера
export function openMessenger(choice, message) {
    if (choice === 'telegram') {
        const encoded = encodeURIComponent(message);
        window.open(`https://t.me/${CONFIG.telegramUsername}?text=${encoded}`, '_blank');
    } else if (choice === 'max') {
        showMaxCopyDialog(message);
    }
}

// Модальное окно выбора мессенджера
export function showMessengerChoice(message) {
    const existing = document.getElementById('messenger-choice-modal');
    if (existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.id = 'messenger-choice-modal';
    overlay.className = 'modal-overlay';

    const content = document.createElement('div');
    content.className = 'modal-content messenger-choice';

    content.innerHTML = `
        <h3>Оформить заказ</h3>
        <div class="messenger-options">
            <div class="messenger-option" id="option-telegram">
                <div class="option-icon">
                     <img src="images/telegram-logo.svg" alt="Telegram" class="telegram-logo-image">
                </div>
                <div class="option-info">
                    <div class="option-title">Telegram</div>
                    <div class="option-description">Мгновенный переход в чат с готовым сообщением. Отправьте одним нажатием.</div>
                </div>
                <button class="option-btn" id="choice-telegram">Выбрать</button>
            </div>
            <div class="messenger-option" id="option-max">
                <div class="option-icon">
                    <img src="images/max-logo.svg" alt="MAX" class="max-logo-image">
                </div>
                <div class="option-info">
                    <div class="option-title">MAX</div>
                    <div class="option-description">Скопируйте текст заказа и вставьте его в открывшемся чате MAX.</div>
                </div>
                <button class="option-btn" id="choice-max">Выбрать</button>
            </div>
        </div>
        <button class="close-modal" id="close-modal">Отмена</button>
    `;

    overlay.appendChild(content);
    document.body.appendChild(overlay);

    document.getElementById('choice-telegram').addEventListener('click', () => {
        openMessenger('telegram', message);
        overlay.remove();
    });
    document.getElementById('choice-max').addEventListener('click', () => {
        openMessenger('max', message);
        overlay.remove();
    });
    document.getElementById('close-modal').addEventListener('click', () => {
        overlay.remove();
    });
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) overlay.remove();
    });
}