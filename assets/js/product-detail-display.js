import { getProductById, getProducts } from './user-api.js';
import { addToCart } from './cart-logic.js';
import { showNotification } from './notification.js';

export const initProductDetailPage = async () => {
    const productDetailContent = document.getElementById('productDetailContent');
    const relatedProductsGrid = document.getElementById('relatedProductsGrid');

    if (!productDetailContent || !relatedProductsGrid) {
        console.warn("Product detail page elements not found. Skipping initialization.");
        return;
    }

    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');

    console.log('Product Detail Page: Attempting to load product with ID:', productId);

    if (!productId) {
        productDetailContent.innerHTML = '<p class="no-items">Không tìm thấy ID sản phẩm trong URL.</p>';
        relatedProductsGrid.innerHTML = '<p class="no-items">Không có sản phẩm liên quan.</p>';
        console.error("Product ID is missing in URL parameter.");
        showNotification('Không tìm thấy ID sản phẩm trong URL.', 'error');
        return;
    }

    try {
        const product = await getProductById(productId);

        if (!product) {
            productDetailContent.innerHTML = '<p class="no-items">Sản phẩm không tồn tại hoặc đã bị xóa.</p>';
            relatedProductsGrid.innerHTML = '<p class="no-items">Không có sản phẩm liên quan.</p>';
            console.warn("Product not found for ID:", productId);
            showNotification('Sản phẩm không tồn tại hoặc đã bị xóa.', 'error');
            return;
        }

        console.log('Product loaded:', product.name);

        const imageUrl = product.imageUrl || 'assets/img/placeholder-product.jpg';
        const priceDisplay = product.price ? product.price.toLocaleString('vi-VN') + ' VNĐ' : 'Liên hệ';
        const unitDisplay = product.unit ? `/${product.unit}` : '';

        productDetailContent.innerHTML = `
            <div class="product-detail-image">
                <img src="${imageUrl}" alt="${product.name}" />
            </div>
            <div class="product-detail-info">
                <h1>${product.name}</h1>
                <p class="price">${priceDisplay}${unitDisplay}</p>
                <p class="short-description">${product.shortDescription || ''}</p>
                <div class="product-meta">
                    <p><strong>Danh mục:</strong> ${product.category || 'Chưa phân loại'}</p>
                    <p><strong>Nguồn gốc:</strong> ${product.origin || 'Không rõ'}</p>
                    <p><strong>Tình trạng:</strong> ${product.quantity > 0 ? 'Còn hàng' : 'Hết hàng'}</p>
                </div>
                <div class="quantity-control">
                    <button type="button" id="decreaseQuantity">-</button>
                    <input type="number" id="productQuantityInput" value="1" min="1" max="${product.quantity}" />
                    <button type="button" id="increaseQuantity">+</button>
                </div>
                <button type="button" id="addToCartDetailBtn" class="btn btn-primary add-to-cart-btn"
                    data-id="${product.id}"
                    data-name="${product.name}"
                    data-price="${product.price}"
                    data-image-url="${imageUrl}"
                    data-unit="${product.unit || ''}"
                    ${product.quantity <= 0 ? 'disabled' : ''}
                >
                    <i class="fas fa-cart-plus"></i> Thêm vào giỏ
                </button>

                <h3 class="full-description-title">Mô tả sản phẩm</h3>
                <p class="full-description">${product.description || 'Không có mô tả chi tiết.'}</p>
            </div>
        `;

        const productQuantityInput = document.getElementById('productQuantityInput');
        const decreaseQuantityBtn = document.getElementById('decreaseQuantity');
        const increaseQuantityBtn = document.getElementById('increaseQuantity');
        const addToCartDetailBtn = document.getElementById('addToCartDetailBtn');

        if (productQuantityInput && decreaseQuantityBtn && increaseQuantityBtn && addToCartDetailBtn) {
            decreaseQuantityBtn.addEventListener('click', (e) => {
                e.preventDefault(); // Ngăn chặn reload nếu button nằm trong form
                let currentVal = parseInt(productQuantityInput.value);
                if (currentVal > 1) {
                    productQuantityInput.value = currentVal - 1;
                }
            });

            increaseQuantityBtn.addEventListener('click', (e) => {
                e.preventDefault(); // Ngăn chặn reload nếu button nằm trong form
                let currentVal = parseInt(productQuantityInput.value);
                if (currentVal < product.quantity) {
                    productQuantityInput.value = currentVal + 1;
                }
            });

            addToCartDetailBtn.addEventListener('click', async (e) => {
                e.preventDefault(); 

                try {
                    const quantityToAdd = parseInt(productQuantityInput.value);
                    if (quantityToAdd > 0 && quantityToAdd <= product.quantity) {
                        await addToCart({
                            id: product.id,
                            name: product.name,
                            price: product.price,
                            imageUrl: product.imageUrl,
                            unit: product.unit || ''
                        }, quantityToAdd);
                    } else {
                        showNotification('Số lượng không hợp lệ hoặc vượt quá số lượng tồn kho.', 'error');
                    }
                } catch (error) {
                    console.error('Error adding product to cart from product detail page:', error);
                    showNotification('Không thể thêm sản phẩm vào giỏ hàng. Vui lòng thử lại.', 'error');
                }
            });
        }

        console.log('Attempting to load related products...');
        const allProducts = await getProducts();
        const relatedProducts = allProducts.filter(p =>
            p.category === product.category && p.id !== product.id && p.quantity > 0
        ).slice(0, 4);

        relatedProductsGrid.innerHTML = '';
        if (relatedProducts.length === 0) {
            relatedProductsGrid.innerHTML = '<p class="no-items">Không có sản phẩm liên quan.</p>';
            console.log('No related products found.');
        } else {
            relatedProducts.forEach(relatedProduct => {
                const relatedProductItem = document.createElement('div');
                relatedProductItem.className = 'product-item';
                const relatedImageUrl = relatedProduct.imageUrl || 'assets/img/placeholder-product.jpg';
                const relatedPriceDisplay = relatedProduct.price ? relatedProduct.price.toLocaleString('vi-VN') + ' VNĐ' : 'Liên hệ';
                const relatedUnitDisplay = relatedProduct.unit ? `/${relatedProduct.unit}` : '';

                relatedProductItem.innerHTML = `
                    <a href="product-detail.html?id=${relatedProduct.id}">
                        <img src="${relatedImageUrl}" alt="${relatedProduct.name}" />
                        <h3>${relatedProduct.name}</h3>
                    </a>
                    <p class="price">${relatedPriceDisplay}${relatedUnitDisplay}</p>
                    <button
                        type="button"
                        class="add-to-cart-btn"
                        data-id="${relatedProduct.id}"
                        data-name="${relatedProduct.name}"
                        data-price="${relatedProduct.price}"
                        data-image-url="${relatedImageUrl}"
                        data-unit="${relatedProduct.unit || ''}"
                    >
                        <i class="fas fa-cart-plus"></i> Thêm vào giỏ
                    </button>
                `;
                relatedProductsGrid.appendChild(relatedProductItem);
            });
            relatedProductsGrid.querySelectorAll('.add-to-cart-btn').forEach(button => {
                button.addEventListener('click', async (e) => {
                    e.preventDefault(); // QUAN TRỌNG: Ngăn chặn reload trang

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
                        console.error('Error adding related product to cart:', error);
                        showNotification('Không thể thêm sản phẩm liên quan vào giỏ hàng. Vui lòng thử lại.', 'error');
                    }
                });
            });
            console.log('Related products rendered.');
        }

    } catch (error) {
        console.error("Error loading product detail or related products:", error);
        productDetailContent.innerHTML = '<p class="no-items">Lỗi khi tải chi tiết sản phẩm. Vui lòng thử lại sau.</p>';
        relatedProductsGrid.innerHTML = '<p class="no-items">Lỗi khi tải sản phẩm liên quan.</p>';
        showNotification('Lỗi khi tải chi tiết sản phẩm. Vui lòng thử lại.', 'error');
    }
};