import { getFeaturedProducts } from './user-api.js';
import { addToCart } from './cart-logic.js';

export const initHomePage = async () => {
    const featuredProductsGrid = document.getElementById('featuredProductsGrid');

    if (!featuredProductsGrid) {
        return;
    }

    try {
        const products = await getFeaturedProducts();

        featuredProductsGrid.innerHTML = '';
        if (products.length === 0) {
            featuredProductsGrid.innerHTML = '<p class="no-items">Không có sản phẩm nổi bật nào.</p>';
            return;
        }

        products.forEach(product => {
            const productItem = document.createElement('div');
            productItem.className = 'product-item';
            const imageUrl = product.imageUrl || 'assets/img/placeholder-product.jpg';
            const priceDisplay = product.price ? product.price.toLocaleString('vi-VN') + ' VNĐ' : 'Liên hệ';
            const unitDisplay = product.unit ? `/${product.unit}` : '';

            productItem.innerHTML = `
                <a href="product-detail.html?id=${product.id}">
                    <img src="${imageUrl}" alt="${product.name}" />
                    <h3>${product.name}</h3>
                </a>
                <p class="price">${priceDisplay}${unitDisplay}</p>
                <button
                    class="add-to-cart-btn"
                    data-id="${product.id}"
                    data-name="${product.name}"
                    data-price="${product.price}"
                    data-image-url="${imageUrl}"
                    data-unit="${product.unit || ''}"
                >
                    <i class="fas fa-cart-plus"></i> Thêm vào giỏ
                </button>
            `;
            featuredProductsGrid.appendChild(productItem);
        });

        featuredProductsGrid.querySelectorAll('.add-to-cart-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const productData = {
                    id: e.currentTarget.dataset.id,
                    name: e.currentTarget.dataset.name,
                    price: parseFloat(e.currentTarget.dataset.price),
                    imageUrl: e.currentTarget.dataset.imageUrl,
                    unit: e.currentTarget.dataset.unit
                };
                addToCart(productData);
            });
        });

    } catch (error) {
        console.error("Error loading featured products for home page:", error);
        featuredProductsGrid.innerHTML = '<p class="no-items">Không thể tải sản phẩm nổi bật.</p>';
    }
};