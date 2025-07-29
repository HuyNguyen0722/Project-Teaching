import { getUsers } from './api.js';

const ADMIN_TOKEN_KEY = 'mindxfarmAdminToken';
const ADMIN_EMAIL_KEY = 'adminEmail';
const ADMIN_DISPLAY_NAME_KEY = 'adminDisplayName';
const ADMIN_ROLE_KEY = 'adminRole';

export const checkAuthStatus = () => {
    return localStorage.getItem(ADMIN_TOKEN_KEY) === 'loggedIn';
};

export const adminLogin = async (email, password) => {
    try {
        const allUsers = await getUsers();
        const foundAdmin = allUsers.find(
            (user) => user.email === email && user.password === password && user.role === 'admin' && !user.disabled);

        if (foundAdmin) {
            localStorage.setItem(ADMIN_TOKEN_KEY, 'loggedIn');
            localStorage.setItem(ADMIN_EMAIL_KEY, foundAdmin.email);
            localStorage.setItem(ADMIN_DISPLAY_NAME_KEY, foundAdmin.displayName || foundAdmin.email);
            localStorage.setItem(ADMIN_ROLE_KEY, foundAdmin.role);
            return { success: true, email: foundAdmin.email, displayName: foundAdmin.displayName, role: foundAdmin.role };
        } else {
            return { success: false, message: 'Email hoặc mật khẩu không đúng, tài khoản không có quyền truy cập, hoặc đã bị vô hiệu hóa.' };
        }
    } catch (error) {
        console.error('Login simulation failed:', error);
        return { success: false, message: 'Lỗi hệ thống. Vui lòng thử lại.' };
    }
};

export const adminLogout = () => {
    localStorage.removeItem(ADMIN_TOKEN_KEY);
    localStorage.removeItem(ADMIN_EMAIL_KEY);
    localStorage.removeItem(ADMIN_DISPLAY_NAME_KEY);
    localStorage.removeItem(ADMIN_ROLE_KEY);
};

export const getLoggedInAdminDisplayName = () => {
    return localStorage.getItem(ADMIN_DISPLAY_NAME_KEY) || 'Admin';
};

export const getLoggedInAdminEmail = () => {
    return localStorage.getItem(ADMIN_EMAIL_KEY) || 'admin@example.com';
};

export const getLoggedInUserRole = () => {
    return localStorage.getItem(ADMIN_ROLE_KEY);
};