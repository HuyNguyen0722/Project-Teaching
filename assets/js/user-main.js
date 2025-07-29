import { updateCartCountDisplay, loadInitialCart } from './cart-logic.js'; // Thêm loadInitialCart
import { initHomePage } from './home-page-display.js';
import { initStorePage } from './store-display.js';
import { initProductDetailPage } from './product-detail-display.js';
import { initCartPage } from './cart-page-display.js';
import { initLoginPage, initRegisterPage, checkUserAuthStatus, userLogout, getLoggedInUserData } from './user-auth.js';
import { initCheckoutPage } from './checkout-logic.js';

const getCurrentPageFileName = () => {
    const path = window.location.pathname;
    const parts = path.split('/');
    return parts[parts.length - 1];
};

document.addEventListener('DOMContentLoaded', async () => { // Thêm async ở đây
    await loadInitialCart(); // QUAN TRỌNG: Đảm bảo giỏ hàng được tải trước tiên

    const userActionsDiv = document.querySelector('header .user-actions');
    if (userActionsDiv) {
        if (checkUserAuthStatus()) {
            const userData = getLoggedInUserData();
            userActionsDiv.innerHTML = `
                <span>Xin chào, ${userData.displayName || 'Bạn'}!</span>
                <a href="#" id="userLogoutBtn"><i class="fas fa-sign-out-alt"></i> Đăng Xuất</a>
                <a href="cart.html"><i class="fas fa-shopping-cart"></i> Giỏ Hàng (<span id="cartItemCount">0</span>)</a>
            `;
            document.getElementById('userLogoutBtn').addEventListener('click', (e) => {
                e.preventDefault();
                userLogout();
                window.location.reload();
            });
        } else {
            userActionsDiv.innerHTML = `
                <a href="login.html">Đăng Nhập</a>
                <a href="cart.html"><i class="fas fa-shopping-cart"></i> Giỏ Hàng (<span id="cartItemCount">0</span>)</a>
            `;
        }
        updateCartCountDisplay();
    }


    const currentPage = getCurrentPageFileName();

    switch (currentPage) {
        case 'index.html':
            initHomePage();
            break;
        case 'store.html':
            initStorePage();
            break;
        case 'product-detail.html':
            initProductDetailPage();
            break;
        case 'cart.html':
            initCartPage(); // Hàm này sẽ được gọi sau khi giỏ hàng đã được tải đầy đủ
            break;
        case 'login.html':
            if (checkUserAuthStatus()) {
                window.location.href = 'index.html';
                return;
            }
            initLoginPage();
            break;
        case 'register.html':
            if (checkUserAuthStatus()) {
                window.location.href = 'index.html';
                return;
            }
            initRegisterPage();
            break;
        case 'checkout.html':
            initCheckoutPage();
            break;
        default:
            console.log('Unknown user-facing page.');
            break;
    }
});