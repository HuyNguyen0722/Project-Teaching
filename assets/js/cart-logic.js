import { getLoggedInUserData, checkUserAuthStatus } from './user-auth.js'; // Import checkUserAuthStatus
import { getUserById, updateUser } from './user-api.js';

const CART_STORAGE_KEY_LOCAL = 'mindxfarmCartLocal';

let currentCart = [];
let isUserLoggedIn = false;
let loggedInUser = null;

export const updateCartCountDisplay = () => {
    const cartItemCountElement = document.getElementById('cartItemCount');
    if (cartItemCountElement) {
        const totalItems = currentCart.reduce((sum, item) => sum + item.quantity, 0);
        cartItemCountElement.textContent = totalItems;
        console.log('Header Cart Count Updated:', totalItems);
    }
};

const saveCart = async () => {
    console.log('Saving cart. Current cart state before saving:', JSON.stringify(currentCart));
    if (isUserLoggedIn && loggedInUser) {
        try {
            console.log('Saving to DB for user:', loggedInUser.id, 'Cart data:', JSON.stringify(currentCart));
            await updateUser(loggedInUser.id, { cart: currentCart });
            console.log('Cart saved to DB successfully.');
        } catch (error) {
            console.error('Error saving cart to user data:', error);
            alert('Lỗi: Không thể lưu giỏ hàng của bạn.');
        }
    } else {
        console.log('Saving to LocalStorage. Cart data:', JSON.stringify(currentCart));
        localStorage.setItem(CART_STORAGE_KEY_LOCAL, JSON.stringify(currentCart));
        console.log('Cart saved to LocalStorage successfully.');
    }
    updateCartCountDisplay();
};

export const getCart = () => {
    return currentCart;
};

export const addToCart = async (product, quantity = 1) => {
    // Kiểm tra trạng thái đăng nhập
    if (!checkUserAuthStatus()) {
        alert('Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng.');
        window.location.href = 'login.html'; // Chuyển hướng đến trang đăng nhập
        return; // Dừng hàm tại đây
    }

    console.log('Attempting to add product:', product.name, 'Quantity:', quantity);
    const existingItemIndex = currentCart.findIndex(item => item.id === product.id);

    if (existingItemIndex > -1) {
        currentCart[existingItemIndex].quantity += quantity;
        console.log('Product already in cart, updated quantity. New item state:', JSON.stringify(currentCart[existingItemIndex]));
    } else {
        currentCart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            imageUrl: product.imageUrl,
            unit: product.unit || '',
            quantity: quantity
        });
        console.log('New product added to cart. Current cart length:', currentCart.length);
    }
    await saveCart();
    alert(`Đã thêm ${quantity} ${product.name} vào giỏ hàng!`);
    console.log('Cart after adding product (currentCart):', JSON.stringify(currentCart));
};

export const removeFromCart = (productId) => {
    console.log('Attempting to remove product with ID:', productId);
    currentCart = currentCart.filter(item => item.id !== productId);
    saveCart();
    console.log('Cart after removing product (currentCart):', JSON.stringify(currentCart));
};

export const updateCartItemQuantity = (productId, newQuantity) => {
    console.log('Attempting to update quantity for product ID:', productId, 'New Quantity:', newQuantity);
    const item = currentCart.find(item => item.id === productId);
    if (item) {
        item.quantity = Math.max(1, newQuantity);
        console.log('Quantity updated for product ID:', productId, 'New quantity:', item.quantity);
    }
    saveCart();
    console.log('Cart after quantity update (currentCart):', JSON.stringify(currentCart));
};

export const clearCart = () => {
    console.log('Clearing cart. Before clear:', JSON.stringify(currentCart));
    currentCart = [];
    saveCart();
    console.log('Cart cleared. After clear:', JSON.stringify(currentCart));
};

export const getCartTotalPrice = () => {
    return currentCart.reduce((total, item) => total + (item.price * item.quantity), 0);
};

export const loadInitialCart = async () => {
    console.log('--- Starting loadInitialCart ---');
    const localCart = JSON.parse(localStorage.getItem(CART_STORAGE_KEY_LOCAL) || '[]');
    console.log('Local Cart found in localStorage (before processing):', JSON.stringify(localCart));

    loggedInUser = getLoggedInUserData();
    isUserLoggedIn = !!loggedInUser;
    console.log('User logged in status:', isUserLoggedIn, 'User Data:', loggedInUser ? loggedInUser.email : 'N/A');

    if (localCart.length > 0 && loggedInUser) {
        console.log('Scenario: Local cart exists and user is logged in. Merging local cart to user DB cart...');
        const userDbData = await getUserById(loggedInUser.id);
        let userCart = userDbData.cart || [];
        console.log('User DB Cart before merge:', JSON.stringify(userCart));

        localCart.forEach(localItem => {
            const existingItemIndex = userCart.findIndex(dbItem => dbItem.id === localItem.id);
            if (existingItemIndex > -1) {
                userCart[existingItemIndex].quantity += localItem.quantity;
                console.log(`Merged existing item ID ${localItem.id}, new quantity: ${userCart[existingItemIndex].quantity}`);
            } else {
                userCart.push(localItem);
                console.log(`Added new item ID ${localItem.id} from local cart to user cart.`);
            }
        });
        currentCart = userCart;
        console.log('Current cart after merge (before saving to DB):', JSON.stringify(currentCart));
        localStorage.removeItem(CART_STORAGE_KEY_LOCAL);
        console.log('Local Storage cart cleared after merge.');
        await saveCart(); // Save the merged cart to DB
    } else if (loggedInUser) {
        console.log('Scenario: User is logged in, no local cart. Loading cart from DB...');
        const userDbData = await getUserById(loggedInUser.id);
        currentCart = userDbData.cart || [];
        console.log('Current cart loaded from DB:', JSON.stringify(currentCart));
    } else {
        console.log('Scenario: User is NOT logged in. Loading cart from LocalStorage...');
        currentCart = JSON.parse(localStorage.getItem(CART_STORAGE_KEY_LOCAL) || '[]');
        console.log('Current cart loaded from LocalStorage:', JSON.stringify(currentCart));
    }
    updateCartCountDisplay();
    console.log('--- Finished loadInitialCart ---');
};