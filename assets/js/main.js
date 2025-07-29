
import { setupDarkModeToggle } from './dark-mode.js';
import { checkAuthStatus, adminLogin, adminLogout, getLoggedInAdminDisplayName, getLoggedInUserRole } from './auth.js';
import { initDashboard } from './dashboard.js';
import { initProductManagement } from './product-management.js';
import { initOrderManagement } from './order-management.js';
import { initCategoryManagement } from './category-management.js';
import { initUserManagement } from './user-management.js';

const getCurrentPageName = () => {
    const currentPath = window.location.pathname;
    const pathSegments = currentPath.split('/');
    return pathSegments[pathSegments.length - 1];
};
const currentPage = getCurrentPageName();

document.addEventListener('DOMContentLoaded', () => {
    const adminNameDisplay = document.getElementById('adminNameDisplay');
    if (adminNameDisplay) {
        adminNameDisplay.textContent = getLoggedInAdminDisplayName();
    }

    const adminLogoutBtn = document.getElementById('adminLogoutBtn');
    if (adminLogoutBtn) {
        adminLogoutBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            adminLogout();
            window.location.href = 'login.html';
        });
    }

    if (currentPage === 'login.html' || currentPage === '') {
        if (checkAuthStatus()) {
            window.location.href = 'index.html';
        }

        const adminLoginForm = document.getElementById('adminLoginForm');
        if (adminLoginForm) {
            adminLoginForm.addEventListener('submit', async (e) => {
                e.preventDefault();

                const adminEmailInput = document.getElementById('adminEmail');
                const adminPasswordInput = document.getElementById('adminPassword');
                const adminLoginMessage = document.getElementById('adminLoginMessage');

                const email = adminEmailInput.value;
                const password = adminPasswordInput.value;

                adminLoginMessage.textContent = '';
                adminLoginMessage.className = 'message';

                const result = await adminLogin(email, password);

                if (result.success) {
                    adminLoginMessage.classList.add('success');
                    adminLoginMessage.textContent = 'Đăng nhập thành công! Đang chuyển hướng...';

                    setTimeout(() => {
                        window.location.href = 'index.html';
                    }, 1500);
                } else {
                    adminLoginMessage.classList.add('error');
                    adminLoginMessage.textContent = result.message || 'Đăng nhập thất bại. Vui lòng thử lại.';
                    console.error('Login Error:', result.message);
                }
            });
        }

    } else {
        if (!checkAuthStatus()) {
            window.location.href = 'login.html';
            return;
        }

        setupDarkModeToggle();

        switch (currentPage) {
            case 'index.html':
                initDashboard();
                break;
            case 'products.html':
                initProductManagement();
                break;
            case 'orders.html':
                initOrderManagement();
                break;
            case 'categories.html':
                initCategoryManagement();
                break;
            case 'users.html':
                initUserManagement();
                break;
            default:
                console.log('Unknown admin page.');
                break;
        }
    }
});