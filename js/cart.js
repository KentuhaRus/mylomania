import { showMessengerChoice } from './utils.js';

const STORAGE_KEY = 'soapCart';

export const Cart = {
    get() {
        const cart = localStorage.getItem(STORAGE_KEY);
        return cart ? JSON.parse(cart) : [];
    },

    save(cart) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
        this.updateCount();
    },

    add(product, quantity = 1) {
        const cart = this.get();
        const existing = cart.find(item => item.id === product.id);
        if (existing) {
            existing.quantity += quantity;
        } else {
            cart.push({
                id: product.id,
                name: product.name,
                price: product.price,
                image: product.image,
                quantity: quantity
            });
        }
        this.save(cart);
    },

    remove(productId) {
        let cart = this.get();
        cart = cart.filter(item => item.id !== productId);
        this.save(cart);
    },

    updateQuantity(productId, quantity) {
        const cart = this.get();
        const item = cart.find(item => item.id === productId);
        if (item) {
            if (quantity <= 0) {
                this.remove(productId);
            } else {
                item.quantity = quantity;
                this.save(cart);
            }
        }
    },

    clear() {
        localStorage.removeItem(STORAGE_KEY);
        this.updateCount();
    },

    getTotalCount() {
        const cart = this.get();
        return cart.reduce((sum, item) => sum + item.quantity, 0);
    },

    getTotalSum() {
        const cart = this.get();
        return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    },

    updateCount() {
        const count = this.getTotalCount();
        document.querySelectorAll('.cart-count').forEach(el => {
            el.textContent = count;
            if (count === 0) {
                el.style.display = 'none';
            } else {
                el.style.display = 'flex';
            }
        });
    },

    formatOrderMessage() {
        const cart = this.get();
        if (cart.length === 0) return '';

        let message = 'Здравствуйте! Хочу заказать:\n';
        cart.forEach(item => {
            message += `- ${item.name} (${item.quantity} шт.) — ${item.price * item.quantity} ₽\n`;
        });
        message += `\nИтого: ${this.getTotalSum()} ₽`;
        return message;
    },

    checkout() {
        const message = this.formatOrderMessage();
        if (!message) {
            alert('Корзина пуста');
            return;
        }
        showMessengerChoice(message);
    }
};