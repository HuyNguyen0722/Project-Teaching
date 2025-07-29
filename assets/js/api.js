// assets/js/api.js

const BASE_URL = 'http://localhost:3000'; // Đảm bảo cổng này trùng với cổng bạn chạy json-server

// Hàm chung để gửi yêu cầu HTTP
async function request(url, method = 'GET', data = null) {
    const options = {
        method,
        headers: {
            'Content-Type': 'application/json',
        },
    };
    if (data) {
        options.body = JSON.stringify(data);
    }
    try {
        const response = await fetch(url, options);
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
        }
        // Trả về null nếu không có nội dung (ví dụ: DELETE)
        return response.status === 204 ? null : await response.json();
    } catch (error) {
        console.error(`API ${method} to ${url} failed:`, error);
        throw error;
    }
}

// --- API cho Products ---
export const getProducts = async () => request(`${BASE_URL}/products`);
export const getProductById = async (id) => request(`${BASE_URL}/products/${id}`);
export const addProduct = async (productData) => request(`${BASE_URL}/products`, 'POST', productData);
export const updateProduct = async (id, productData) => request(`${BASE_URL}/products/${id}`, 'PUT', productData); // Dùng PUT để ghi đè hoặc PATCH cho cập nhật từng phần
export const deleteProduct = async (id) => request(`${BASE_URL}/products/${id}`, 'DELETE');

// --- API cho Categories ---
export const getCategories = async () => request(`${BASE_URL}/categories`);
export const getCategoryById = async (id) => request(`${BASE_URL}/categories/${id}`);
export const addCategory = async (categoryData) => request(`${BASE_URL}/categories`, 'POST', categoryData);
export const updateCategory = async (id, categoryData) => request(`${BASE_URL}/categories/${id}`, 'PUT', categoryData);
export const deleteCategory = async (id) => request(`${BASE_URL}/categories/${id}`, 'DELETE');

// --- API cho Orders ---
export const getOrders = async () => request(`${BASE_URL}/orders`);
export const getOrderById = async (id) => request(`${BASE_URL}/orders/${id}`);
export const updateOrderStatus = async (id, status) => request(`${BASE_URL}/orders/${id}`, 'PATCH', { status });

// --- API cho Users (bao gồm cả admin và customer) ---
export const getUsers = async () => request(`${BASE_URL}/users`);
export const getUserById = async (id) => request(`${BASE_URL}/users/${id}`);
// Hàm addUser đã bị loại bỏ theo yêu cầu của bạn (người dùng tự đăng ký)
export const updateUser = async (id, userData) => request(`${BASE_URL}/users/${id}`, 'PATCH', userData); // Dùng PATCH để cập nhật từng phần