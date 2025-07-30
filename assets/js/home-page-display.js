// assets/js/home-page-display.js

import { getFeaturedProducts } from './user-api.js';
import { addToCart } from './cart-logic.js';
import { showNotification } from './notification.js';

export const initHomePage = async () => {
    const featuredProductsGrid = document.getElementById('featuredProductsGrid');

    // Logic cho Hero Slider
    const heroSlider = document.querySelector('.hero-slider');
    const prevSlideBtn = document.querySelector('.prev-slide');
    const nextSlideBtn = document.querySelector('.next-slide');
    const dotsContainer = document.querySelector('.dots-container');
    const sliderItems = document.querySelectorAll('.slider-item');

    let currentSlide = 0;
    const totalSlides = sliderItems.length;

    const updateSlider = () => {
        if (!heroSlider) return;
        heroSlider.style.transform = `translateX(-${currentSlide * 100}%)`;
        document.querySelectorAll('.dot').forEach((dot, index) => {
            if (index === currentSlide) {
                dot.classList.add('active');
            } else {
                dot.classList.remove('active');
            }
        });
    };

    const nextSlide = () => {
        currentSlide = (currentSlide + 1) % totalSlides;
        updateSlider();
    };

    const prevSlide = () => {
        currentSlide = (currentSlide - 1 + totalSlides) % totalSlides;
        updateSlider();
    };

    // Tạo các chấm (dots) điều hướng
    if (dotsContainer) {
        for (let i = 0; i < totalSlides; i++) {
            const dot = document.createElement('div');
            dot.classList.add('dot');
            dot.addEventListener('click', () => {
                currentSlide = i;
                updateSlider();
            });
            dotsContainer.appendChild(dot);
        }
    }

    if (prevSlideBtn && nextSlideBtn) {
        prevSlideBtn.addEventListener('click', prevSlide);
        nextSlideBtn.addEventListener('click', nextSlide);
    }

    // Tự động trượt slide
    let slideInterval; // Khai báo ngoài để có thể truy cập từ clearInterval/setInterval
    const startAutoSlide = () => {
        clearInterval(slideInterval); // Xóa interval cũ nếu có
        slideInterval = setInterval(nextSlide, 5000); // Tự động chuyển slide sau 5 giây
    };

    if (heroSlider) {
        heroSlider.addEventListener('mouseenter', () => clearInterval(slideInterval));
        heroSlider.addEventListener('mouseleave', startAutoSlide);
    }

    updateSlider(); // Hiển thị slide đầu tiên khi tải trang
    startAutoSlide(); // Bắt đầu tự động trượt

    // Logic cho Featured Products Grid
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
                    type="button"
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
            button.addEventListener('click', async (e) => {
                e.preventDefault();

                try {
                    const productData = {
                        id: e.currentTarget.dataset.id,
                        name: e.currentTarget.dataset.name,
                        price: parseFloat(e.currentTarget.dataset.price),
                        imageUrl: e.currentTarget.dataset.imageUrl,
                        unit: e.currentTarget.dataset.unit
                    };
                    await addToCart(productData);
                } catch (error) {
                    console.error('Error adding product to cart from homepage:', error);
                    showNotification('Không thể thêm sản phẩm vào giỏ hàng. Vui lòng thử lại.', 'error');
                }
            });
        });

    } catch (error) {
        console.error("Error loading featured products for home page:", error);
        featuredProductsGrid.innerHTML = '<p class="no-items">Không thể tải sản phẩm nổi bật.</p>';
        showNotification('Không thể tải sản phẩm nổi bật.', 'error');
    }
};