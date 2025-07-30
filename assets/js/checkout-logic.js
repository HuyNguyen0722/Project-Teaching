import { getCart, getCartTotalPrice, clearCart } from './cart-logic.js';
import { placeOrder } from './user-api.js';
import { getLoggedInUserData } from './user-auth.js';
import { showNotification } from './notification.js';

export const initCheckoutPage = () => {
    const checkoutForm = document.getElementById('checkoutForm');
    const placeOrderBtn = document.getElementById('placeOrderBtn'); 
    const checkoutOrderItems = document.getElementById('checkoutOrderItems');
    const checkoutSubtotalElement = document.getElementById('checkoutSubtotal');
    const shippingFeeElement = document.getElementById('shippingFee');
    const checkoutFinalTotalElement = document.getElementById('checkoutFinalTotal');
    const checkoutMessageElement = document.getElementById('checkoutMessage');

    const SHIPPING_FEE = 30000;

    if (!checkoutForm || !checkoutOrderItems || !checkoutSubtotalElement || !shippingFeeElement || !checkoutFinalTotalElement || !checkoutMessageElement || !placeOrderBtn) {
        return;
    }

    const renderOrderSummary = () => {
        const cartItems = getCart();
        let subtotal = 0;

        checkoutOrderItems.innerHTML = '';
        if (cartItems.length === 0) {
            checkoutOrderItems.innerHTML = '<p class="no-items">Giỏ hàng trống.</p>';
            checkoutSubtotalElement.textContent = '0 VNĐ';
            checkoutFinalTotalElement.textContent = '0 VNĐ';
            checkoutForm.querySelector('#placeOrderBtn').disabled = true;
            return;
        }

        cartItems.forEach(item => {
            const itemTotal = item.price * item.quantity;
            subtotal += itemTotal;
            const itemDiv = document.createElement('div');
            itemDiv.classList.add('order-item-checkout');
            itemDiv.innerHTML = `
                <span class="item-name">${item.name}</span>
                <span class="item-quantity">x${item.quantity}</span>
                <span class="item-price">${itemTotal.toLocaleString('vi-VN')} VNĐ</span>
            `;
            checkoutOrderItems.appendChild(itemDiv);
        });

        checkoutSubtotalElement.textContent = subtotal.toLocaleString('vi-VN') + ' VNĐ';
        shippingFeeElement.textContent = SHIPPING_FEE.toLocaleString('vi-VN') + ' VNĐ';
        const finalTotal = subtotal + SHIPPING_FEE;
        checkoutFinalTotalElement.textContent = finalTotal.toLocaleString('vi-VN') + ' VNĐ';
        checkoutForm.querySelector('#placeOrderBtn').disabled = false;
    };

    const populateUserInfo = () => {
        const loggedInUser = getLoggedInUserData();
        if (loggedInUser) {
            document.getElementById('email').value = loggedInUser.email || '';
        }
    };

    checkoutForm.addEventListener('submit', async (e) => {
        e.preventDefault(); 

        checkoutMessageElement.textContent = '';
        checkoutMessageElement.className = 'message';

        const cartItems = getCart();
        if (cartItems.length === 0) {
            checkoutMessageElement.classList.add('error');
            checkoutMessageElement.textContent = 'Giỏ hàng của bạn đang trống. Không thể đặt hàng.';
            return;
        }

        const fullName = document.getElementById('fullName').value;
        const phone = document.getElementById('phone').value;
        const email = document.getElementById('email').value;
        const address = document.getElementById('address').value;
        const notes = document.getElementById('notes').value;
        const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked').value;

        if (!fullName || !phone || !address) {
            checkoutMessageElement.classList.add('error');
            checkoutMessageElement.textContent = 'Vui lòng điền đầy đủ thông tin bắt buộc (Họ và tên, Số điện thoại, Địa chỉ).';
            showNotification('Vui lòng điền đầy đủ thông tin bắt buộc.', 'error');
            return;
        }

        const subtotal = getCartTotalPrice();
        const finalTotal = subtotal + SHIPPING_FEE;

        const orderData = {
            customerName: fullName,
            customerPhone: phone,
            customerEmail: email,
            deliveryAddress: address,
            notes: notes,
            paymentMethod: paymentMethod,
            items: cartItems.map(item => ({
                productId: item.id,
                name: item.name,
                price: item.price,
                quantity: item.quantity,
                imageUrl: item.imageUrl,
                unit: item.unit || ''
            })),
            subtotalPrice: subtotal,
            shippingFee: SHIPPING_FEE,
            totalPrice: finalTotal,
            orderDate: Date.now(),
            status: 'pending'
        };

        const loggedInUser = getLoggedInUserData();
        if (loggedInUser) {
            orderData.userId = loggedInUser.id;
            orderData.userEmail = loggedInUser.email;
        }

        try {
            await placeOrder(orderData);
            checkoutMessageElement.classList.add('success');
            checkoutMessageElement.textContent = 'Đơn hàng của bạn đã được đặt thành công! Cảm ơn bạn.';
            clearCart();
            renderOrderSummary();

            showNotification('Đơn hàng của bạn đã được đặt thành công!', 'success');
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 3000);

        } catch (error) {
            console.error('Error placing order:', error);
            checkoutMessageElement.classList.add('error');
            checkoutMessageElement.textContent = 'Có lỗi xảy ra khi đặt hàng. Vui lòng thử lại.';
            showNotification('Có lỗi xảy ra khi đặt hàng. Vui lòng thử lại.', 'error');
        }
    });

    placeOrderBtn.addEventListener('click', (e) => {
        if (placeOrderBtn.type === 'submit') {
            e.preventDefault();
            checkoutForm.requestSubmit();
        }
    });

    renderOrderSummary();
    populateUserInfo();
};