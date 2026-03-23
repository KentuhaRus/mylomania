import { CONFIG, categoryNames } from './config.js';
import { Cart } from './cart.js';
import { showMessengerChoice } from './utils.js';

export async function loadProductDetail() {
    const params = new URLSearchParams(window.location.search);
    const productId = parseInt(params.get('id'));
    const container = document.getElementById('product-detail');
    if (!container) return;

    if (!productId) {
        container.innerHTML = `<div class="error">Товар не указан. <a href="index.html">Вернуться в каталог</a></div>`;
        return;
    }

    try {
        const response = await fetch(CONFIG.jsonPath);
        if (!response.ok) throw new Error('Ошибка загрузки товаров');
        const products = await response.json();
        const product = products.find(p => p.id === productId);
        if (!product) throw new Error('Товар не найден');

        container.innerHTML = renderProductDetail(product);
        initLazyLoading();

        const addToCartBtn = document.getElementById('add-to-cart-detail');
        const quantityInput = document.getElementById('product-quantity');
        if (addToCartBtn && quantityInput) {
            addToCartBtn.addEventListener('click', () => {
                const qty = parseInt(quantityInput.value) || 1;
                Cart.add(product, qty);
            });
        }

        const buyNowBtn = document.getElementById('buy-now-detail');
        if (buyNowBtn && quantityInput) {
            buyNowBtn.addEventListener('click', () => {
                const qty = parseInt(quantityInput.value) || 1;
                const message = `Здравствуйте! Хочу заказать "${product.name}" (${qty} шт.) за ${product.price * qty} ₽.`;
                showMessengerChoice(message);
            });
        }
    } catch (error) {
        container.innerHTML = `<div class="error">${error.message}. <a href="index.html">Вернуться в каталог</a></div>`;
    }
}

function renderProductDetail(product) {
    const oldPriceHtml = product.oldPrice ? `<span class="old-price">${product.oldPrice} ₽</span>` : '';
    const ingredientsHtml = product.ingredients ? `<p><strong>Состав:</strong> ${product.ingredients}</p>` : '';
    const weightHtml = product.weight ? `<p><strong>Вес:</strong> ${product.weight}</p>` : '';
    const categoryText = categoryNames[product.category] || product.category;

    return `
        <div class="product-detail-card">
            <img class="lazy" data-src="${product.image}" alt="${product.name}">
            <h1>${product.name}</h1>
            <div class="price-block">
                ${product.price} ₽ ${oldPriceHtml}
            </div>
            <div class="description">
                <p>${product.description}</p>
                ${weightHtml}
                ${ingredientsHtml}
                <p><strong>Категория:</strong> ${categoryText}</p>
            </div>
            <div class="quantity-selector">
                <label for="product-quantity">Количество:</label>
                <input type="number" id="product-quantity" min="1" value="1">
            </div>
            <div class="buttons">
                <button class="btn-secondary" id="add-to-cart-detail">В корзину</button>
                <button class="btn-primary" id="buy-now-detail">Купить сейчас</button>
            </div>
            <div class="back-link">
                <a href="index.html" class="back-to-catalog"><i class="fas fa-arrow-left"></i> Назад в каталог</a>
            </div>
        </div>
    `;
}

function initLazyLoading() {
    const lazyImages = document.querySelectorAll('img.lazy');
    if (!lazyImages.length) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.remove('lazy');
                observer.unobserve(img);
            }
        });
    }, {
        rootMargin: '100px 0px',
        threshold: 0.01
    });

    lazyImages.forEach(img => observer.observe(img));
}