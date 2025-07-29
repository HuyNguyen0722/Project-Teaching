const BASE_URL = 'http://localhost:3000';

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
        return response.status === 204 ? null : await response.json();
    } catch (error) {
        console.error(`API ${method} to ${url} failed:`, error);
        throw error;
    }
}

export const getProducts = async () => request(`${BASE_URL}/products`);
export const getProductById = async (id) => request(`${BASE_URL}/products/${id}`);
export const getFeaturedProducts = async () => request(`${BASE_URL}/products?isFeatured=true`);

export const getCategories = async () => request(`${BASE_URL}/categories`);

export const registerUser = async (userData) => request(`${BASE_URL}/users`, 'POST', userData);
export const getUsers = async () => request(`${BASE_URL}/users`);
export const getUserById = async (id) => request(`${BASE_URL}/users/${id}`); 
export const updateUser = async (id, userData) => request(`${BASE_URL}/users/${id}`, 'PATCH', userData); 

export const placeOrder = async (orderData) => request(`${BASE_URL}/orders`, 'POST', orderData);