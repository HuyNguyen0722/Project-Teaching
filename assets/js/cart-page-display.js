import { getCart, removeFromCart, updateCartItemQuantity, getCartTotalPrice } from './cart-logic.js';
import { showNotification } from './notification.js';

export const initCartPage = () => {
    const cartTableBody = document.getElementById('cartTableBody');
    const cartTotalPriceElement = document.getElementById('cartTotalPrice');
    const checkoutBtn = document.getElementById('checkoutBtn');

    if (!cartTableBody || !cartTotalPriceElement || !checkoutBtn) {
        return;
    }

    const renderCartItems = () => {
        const cartItems = getCart();
        cartTableBody.innerHTML = '';

        if (cartItems.length === 0) {
            cartTableBody.innerHTML = `
                <tr>
                    <td colspan="5" class="no-items">Giỏ hàng của bạn đang trống.</td>
                </tr>
            `;
            checkoutBtn.disabled = true;
        } else {
            cartItems.forEach(item => {
                const row = document.createElement('tr');
                const itemTotalPrice = item.price * item.quantity;
                const unitDisplay = item.unit ? `/${item.unit}` : '';

                row.innerHTML = `
                    <td>
                        <div class="cart-item-info">
                            <img src="${item.imageUrl || 'assets/img/placeholder-product.jpg'}" alt="${item.name}">
                            <span>${item.name}</span>
                        </div>
                    </td>
                    <td data-label="Giá">${item.price.toLocaleString('vi-VN')} VNĐ${unitDisplay}</td>
                    <td data-label="Số Lượng">
                        <div class="quantity-control cart">
                            <button class="decrease-quantity-cart" data-id="${item.id}">-</button>
                            <input type="number" value="${item.quantity}" min="1" class="cart-item-quantity" data-id="${item.id}">
                            <button class="increase-quantity-cart" data-id="${item.id}">+</button>
                        </div>
                    </td>
                    <td data-label="Tổng">${itemTotalPrice.toLocaleString('vi-VN')} VNĐ</td>
                    <td data-label="Xóa">
                        <button class="remove-item-btn" data-id="${item.id}"><i class="fas fa-trash-alt"></i></button>
                    </td>
                `;
                cartTableBody.appendChild(row);
            });
            checkoutBtn.disabled = false;
        }

        cartTotalPriceElement.textContent = getCartTotalPrice().toLocaleString('vi-VN') + ' VNĐ';

        attachCartEventListeners();
    };

    const attachCartEventListeners = () => {

        cartTableBody.querySelectorAll('.remove-item-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                // e.preventDefault(); // Không cần thiết nếu button không có type="submit" và không nằm trong form
                const productId = e.currentTarget.dataset.id;
                if (confirm('Bạn có chắc chắn muốn xóa sản phẩm này khỏi giỏ hàng?')) {
                    removeFromCart(productId);
                    renderCartItems();
                    showNotification('Đã xóa sản phẩm khỏi giỏ hàng.', 'info');
                }
            });
        });

        cartTableBody.querySelectorAll('.decrease-quantity-cart').forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                const productId = e.currentTarget.dataset.id;
                const input = cartTableBody.querySelector(`.cart-item-quantity[data-id="${productId}"]`);
                let currentQuantity = parseInt(input.value);
                if (currentQuantity > 1) {
                    updateCartItemQuantity(productId, currentQuantity - 1);
                    renderCartItems();
                }
            });
        });

        cartTableBody.querySelectorAll('.increase-quantity-cart').forEach(button => {
            button.addEventListener('click', (e) => {
e.preventDefault();
                const productId = e.currentTarget.dataset.id;
                const input = cartTableBody.querySelector(`.cart-item-quantity[data-id="${productId}"]`);
                let currentQuantity = parseInt(input.value);
                updateCartItemQuantity(productId, currentQuantity + 1);
                renderCartItems();
            });
        });

        cartTableBody.querySelectorAll('.cart-item-quantity').forEach(input => {
            input.addEventListener('change', (e) => {
                e.preventDefault();
                const productId = e.target.dataset.id;
                let newQuantity = parseInt(e.target.value);
                if (isNaN(newQuantity) || newQuantity < 1) {
                    newQuantity = 1;
                }
                updateCartItemQuantity(productId, newQuantity);
                renderCartItems();
            });
        });
    };

    checkoutBtn.addEventListener('click', () => {
        if (getCart().length > 0) {
            window.location.href = 'checkout.html';
        } else {
            showNotification('Giỏ hàng của bạn đang trống. Vui lòng thêm sản phẩm vào giỏ.', 'info');
        }
    });

    renderCartItems();
};