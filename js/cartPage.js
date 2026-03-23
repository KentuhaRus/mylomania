import { Cart } from './cart.js';

export function renderCart() {
    const container = document.getElementById('cart-container');
    if (!container) return;

    const cart = Cart.get();
    if (cart.length === 0) {
        container.innerHTML = `
            <div class="empty-cart">
                <p>Ваша корзина пуста.</p>
                <a href="index.html" class="btn-primary small">Перейти в каталог</a>
            </div>
        `;
        return;
    }

    let itemsHtml = '';
    cart.forEach(item => {
        itemsHtml += `
            <div class="cart-item" data-id="${item.id}">
                <img src="${item.image}" alt="${item.name}">
                <div class="cart-item-info">
                    <h4>${item.name}</h4>
                    <div class="cart-item-price">${item.price} ₽</div>
                </div>
                <div class="cart-item-actions">
                    <div class="cart-item-quantity">
                        <button class="qty-minus">−</button>
                        <span class="qty-value">${item.quantity}</span>
                        <button class="qty-plus">+</button>
                    </div>
                    <button class="remove-item" title="Удалить"><i class="fas fa-trash-alt"></i></button>
                </div>
            </div>
        `;
    });

    const total = Cart.getTotalSum();

    container.innerHTML = `
        <div class="cart-header">
            <h2>Корзина</h2>
            <button class="clear-cart-btn">Очистить корзину</button>
        </div>
        ${itemsHtml}
        <div class="cart-total">
            Итого: <span>${total} ₽</span>
        </div>
        <div class="cart-actions">
            <button class="btn-secondary" id="continue-shopping">Продолжить покупки</button>
            <button class="btn-primary" id="checkout-btn">Оформить заказ</button>
        </div>
    `;

    attachCartEventHandlers();
}

function attachCartEventHandlers() {
    document.querySelectorAll('.qty-plus').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const cartItem = e.target.closest('.cart-item');
            const id = parseInt(cartItem.dataset.id);
            const span = cartItem.querySelector('.qty-value');
            let qty = parseInt(span.textContent);
            qty++;
            Cart.updateQuantity(id, qty);
            renderCart();
        });
    });

    document.querySelectorAll('.qty-minus').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const cartItem = e.target.closest('.cart-item');
            const id = parseInt(cartItem.dataset.id);
            const span = cartItem.querySelector('.qty-value');
            let qty = parseInt(span.textContent);
            if (qty > 1) {
                qty--;
                Cart.updateQuantity(id, qty);
                renderCart();
            }
        });
    });

    document.querySelectorAll('.remove-item').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const cartItem = e.target.closest('.cart-item');
            const id = parseInt(cartItem.dataset.id);
            Cart.remove(id);
            renderCart();
        });
    });

    const clearBtn = document.querySelector('.clear-cart-btn');
    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            Cart.clear();
            renderCart();
        });
    }

    const continueBtn = document.getElementById('continue-shopping');
    if (continueBtn) {
        continueBtn.addEventListener('click', () => {
            window.location.href = 'index.html';
        });
    }

    const checkoutBtn = document.getElementById('checkout-btn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', () => {
            Cart.checkout();
        });
    }
}