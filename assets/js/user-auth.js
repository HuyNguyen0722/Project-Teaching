import { getUsers, registerUser, getUserById } from './user-api.js';
import { loadInitialCart, clearCart } from './cart-logic.js'; // Đã đổi tên hàm import

const USER_TOKEN_KEY = 'mindxfarmUserToken';
const USER_EMAIL_KEY = 'mindxfarmUserEmail';
const USER_DISPLAY_NAME_KEY = 'mindxfarmUserDisplayName';
const USER_ID_KEY = 'mindxfarmUserId';

export const checkUserAuthStatus = () => {
    return localStorage.getItem(USER_TOKEN_KEY) === 'loggedIn';
};

export const getLoggedInUserData = () => {
    if (checkUserAuthStatus()) {
        return {
            id: localStorage.getItem(USER_ID_KEY),
            email: localStorage.getItem(USER_EMAIL_KEY),
            displayName: localStorage.getItem(USER_DISPLAY_NAME_KEY)
        };
    }
    return null;
};

export const userLogin = async (email, password) => {
    try {
        const users = await getUsers();
        const foundUser = users.find(user => user.email === email && user.password === password && user.role === 'customer' && !user.disabled);

        if (foundUser) {
            localStorage.setItem(USER_TOKEN_KEY, 'loggedIn');
            localStorage.setItem(USER_ID_KEY, foundUser.id);
            localStorage.setItem(USER_EMAIL_KEY, foundUser.email);
            localStorage.setItem(USER_DISPLAY_NAME_KEY, foundUser.displayName || foundUser.email.split('@')[0]);

            await loadInitialCart(); // Đã đổi tên hàm gọi

            return { success: true, user: foundUser };
        } else {
            return { success: false, message: 'Email hoặc mật khẩu không đúng hoặc tài khoản của bạn đã bị vô hiệu hóa.' };
        }
    } catch (error) {
        console.error('Login failed:', error);
        return { success: false, message: 'Lỗi hệ thống. Vui lòng thử lại.' };
    }
};

export const userRegister = async (email, password, displayName, phone, address) => {
    try {
        const users = await getUsers();
        const existingUser = users.find(user => user.email === email);
        if (existingUser) {
            return { success: false, message: 'Email này đã được đăng ký.' };
        }

        const newUser = {
            email: email,
            password: password,
            displayName: displayName || email.split('@')[0],
            phone: phone || '',
            address: address || '',
            role: 'customer',
            createdAt: Date.now(),
            lastSignInTime: Date.now(),
            disabled: false,
            cart: []
        };

        const registeredUser = await registerUser(newUser);
        return { success: true, user: registeredUser };
    } catch (error) {
        console.error('Registration failed:', error);
        return { success: false, message: 'Lỗi khi đăng ký. Vui lòng thử lại.' };
    }
};

export const userLogout = () => {
    localStorage.removeItem(USER_TOKEN_KEY);
    localStorage.removeItem(USER_ID_KEY);
    localStorage.removeItem(USER_EMAIL_KEY);
    localStorage.removeItem(USER_DISPLAY_NAME_KEY);
    clearCart();
};

export const initLoginPage = () => {
    const userLoginForm = document.getElementById('userLoginForm');
    if (userLoginForm) {
        userLoginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('userEmail').value;
            const password = document.getElementById('userPassword').value;
            const messageElement = document.getElementById('userLoginMessage');

            messageElement.textContent = '';
            messageElement.className = 'message';

            const result = await userLogin(email, password);
            if (result.success) {
                messageElement.classList.add('success');
                messageElement.textContent = 'Đăng nhập thành công! Đang chuyển hướng...';
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 1000);
            } else {
                messageElement.classList.add('error');
                messageElement.textContent = result.message || 'Đăng nhập thất bại.';
            }
        });
    }
};

export const initRegisterPage = () => {
    const userRegisterForm = document.getElementById('userRegisterForm');
    if (userRegisterForm) {
        userRegisterForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('regEmail').value;
            const displayName = document.getElementById('regDisplayName').value;
            const phone = document.getElementById('regPhone').value;
            const address = document.getElementById('regAddress').value;
            const password = document.getElementById('regPassword').value;
            const confirmPassword = document.getElementById('regConfirmPassword').value;
            const messageElement = document.getElementById('userRegisterMessage');

            messageElement.textContent = '';
            messageElement.className = 'message';

            if (password.length < 6) {
                messageElement.classList.add('error');
                messageElement.textContent = 'Mật khẩu phải có ít nhất 6 ký tự.';
                return;
            }
            if (password !== confirmPassword) {
                messageElement.classList.add('error');
                messageElement.textContent = 'Mật khẩu xác nhận không khớp.';
                return;
            }

            const result = await userRegister(email, password, displayName, phone, address);
            if (result.success) {
                messageElement.classList.add('success');
                messageElement.textContent = 'Đăng ký thành công! Đang chuyển hướng đến trang đăng nhập...';
                setTimeout(() => {
                    window.location.href = 'login.html';
                }, 1500);
            } else {
                messageElement.classList.add('error');
                messageElement.textContent = result.message || 'Đăng ký thất bại.';
            }
        });
    }
};