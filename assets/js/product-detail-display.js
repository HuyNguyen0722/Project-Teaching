import { getProductById, getProducts } from './user-api.js';
import { addToCart } from './cart-logic.js';

export const initProductDetailPage = async () => {
    const productDetailContent = document.getElementById('productDetailContent');
    const relatedProductsGrid = document.getElementById('relatedProductsGrid');

    if (!productDetailContent || !relatedProductsGrid) {
        return;
    }

    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');

    if (!productId) {
        productDetailContent.innerHTML = '<p class="no-items">Không tìm thấy ID sản phẩm.</p>';
        relatedProductsGrid.innerHTML = '<p class="no-items">Không có sản phẩm liên quan.</p>';
        return;
    }

    try {
        const product = await getProductById(productId);

        if (!product) {
            productDetailContent.innerHTML = '<p class="no-items">Sản phẩm không tồn tại hoặc đã bị xóa.</p>';
            relatedProductsGrid.innerHTML = '<p class="no-items">Không có sản phẩm liên quan.</p>';
            return;
        }

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
                    <button id="decreaseQuantity">-</button>
                    <input type="number" id="productQuantityInput" value="1" min="1" max="${product.quantity}" />
                    <button id="increaseQuantity">+</button>
                </div>
                <button id="addToCartDetailBtn" class="btn btn-primary add-to-cart-btn"
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
            decreaseQuantityBtn.addEventListener('click', () => {
                let currentVal = parseInt(productQuantityInput.value);
                if (currentVal > 1) {
                    productQuantityInput.value = currentVal - 1;
                }
            });

            increaseQuantityBtn.addEventListener('click', () => {
                let currentVal = parseInt(productQuantityInput.value);
                if (currentVal < product.quantity) {
                    productQuantityInput.value = currentVal + 1;
                }
            });

            addToCartDetailBtn.addEventListener('click', () => {
                const quantityToAdd = parseInt(productQuantityInput.value);
                if (quantityToAdd > 0 && quantityToAdd <= product.quantity) {
                    addToCart({
                        id: product.id,
                        name: product.name,
                        price: product.price,
                        imageUrl: product.imageUrl,
                        unit: product.unit || ''
                    }, quantityToAdd);
                } else {
                    alert('Số lượng không hợp lệ hoặc vượt quá số lượng tồn kho.');
                }
            });
        }

        const allProducts = await getProducts();
        const relatedProducts = allProducts.filter(p =>
            p.category === product.category && p.id !== product.id && p.quantity > 0
        ).slice(0, 4);

        relatedProductsGrid.innerHTML = '';
        if (relatedProducts.length === 0) {
            relatedProductsGrid.innerHTML = '<p class="no-items">Không có sản phẩm liên quan.</p>';
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
        }

    } catch (error) {
        console.error("Error loading product detail:", error);
        productDetailContent.innerHTML = '<p class="no-items">Lỗi khi tải chi tiết sản phẩm. Vui lòng thử lại sau.</p>';
        relatedProductsGrid.innerHTML = '<p class="no-items">Lỗi khi tải sản phẩm liên quan.</p>';
    }
};