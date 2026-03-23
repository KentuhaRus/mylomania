import { CONFIG, categoryNames } from './config.js';
import { Cart } from './cart.js';
import { showMessengerChoice } from './utils.js';

let allProducts = [];

export async function loadCatalog() {
    const catalogContainer = document.getElementById('catalogContainer');
    if (!catalogContainer) return;

    try {
        const response = await fetch(CONFIG.jsonPath);
        if (!response.ok) throw new Error('Ошибка загрузки товаров');
        allProducts = await response.json();
        renderCategoryNav();
        renderProducts(allProducts);
        initLazyLoading();
        attachAddToCartButtons();
    } catch (error) {
        catalogContainer.innerHTML = `<div class="error">Не удалось загрузить товары. Попробуйте позже.</div>`;
        console.error(error);
    }
}

function renderCategoryNav() {
    const nav = document.getElementById('categoryNav');
    if (!nav) return;

    const categories = new Set(allProducts.map(p => p.category));
    const sortedCategories = Array.from(categories).sort();

    let html = `<button class="category-btn active" data-category="all">${categoryNames['all']}</button>`;
    sortedCategories.forEach(cat => {
        const label = categoryNames[cat] || cat;
        html += `<button class="category-btn" data-category="${cat}">${label}</button>`;
    });

    nav.innerHTML = html;

    nav.querySelectorAll('.category-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            nav.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const cat = btn.dataset.category;
            const filtered = cat === 'all' ? allProducts : allProducts.filter(p => p.category === cat);
            renderProducts(filtered);
            initLazyLoading();
            attachAddToCartButtons();
        });
    });
}

function renderProducts(products) {
    const container = document.getElementById('catalogContainer');
    if (!container) return;

    if (!products.length) {
        container.innerHTML = '<p>В этой категории пока нет товаров.</p>';
        return;
    }

    let html = '';
    products.forEach(product => {
        const oldPriceHtml = product.oldPrice ? `<span class="old-price">${product.oldPrice} ₽</span>` : '';
        html += `
            <div class="product-card">
                <a href="product.html?id=${product.id}" style="text-decoration: none; color: inherit;">
                    <img class="lazy" data-src="${product.image}" alt="${product.name}" width="300" height="300">
                    <h3>${product.name}</h3>
                    <div class="price">
                        ${product.price} ₽ ${oldPriceHtml}
                    </div>
                </a>
                <div class="buttons">
                    <button class="btn-secondary add-to-cart" data-product='${JSON.stringify(product)}'>В корзину</button>
                    <button class="btn-primary buy-now" data-product='${JSON.stringify(product)}'>Купить сейчас</button>
                </div>
            </div>
        `;
    });

    container.innerHTML = html;
}

function attachAddToCartButtons() {
    document.querySelectorAll('.add-to-cart').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const product = JSON.parse(btn.dataset.product);
            Cart.add(product, 1);
        });
    });

    document.querySelectorAll('.buy-now').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const product = JSON.parse(btn.dataset.product);
            const message = `Здравствуйте! Хочу заказать "${product.name}" за ${product.price} ₽.`;
            showMessengerChoice(message);
        });
    });
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