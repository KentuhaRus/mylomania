import { Cart } from './cart.js';
import { loadCatalog } from './catalog.js';
import { loadProductDetail } from './product.js';
import { renderCart } from './cartPage.js';

const currentPage = window.location.pathname.split('/').pop() || 'index.html';

document.addEventListener('DOMContentLoaded', () => {
    // Подсветка активного пункта меню
    const navItems = document.querySelectorAll('.bottom-nav .nav-item');
    navItems.forEach(item => {
        const href = item.getAttribute('href');
        if (href === currentPage) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });

    // Обновление счётчика корзины
    Cart.updateCount();

    // Загрузка контента в зависимости от страницы
    if (currentPage === 'index.html' || currentPage === '') {
        loadCatalog();
    } else if (currentPage === 'product.html') {
        loadProductDetail();
    } else if (currentPage === 'cart.html') {
        renderCart();
    }
});