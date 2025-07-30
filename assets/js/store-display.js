import { getProducts, getCategories } from './user-api.js';
import { addToCart } from './cart-logic.js';
import { showNotification } from './notification.js';

export const initStorePage = async () => {
    const allProductsGrid = document.getElementById('allProductsGrid');
    const categoryListStore = document.getElementById('categoryListStore');
    const productSearchInput = document.getElementById('productSearchInput');
    const productSortBy = document.getElementById('productSortBy');
    const productPagination = document.getElementById('productPagination');

    let allProducts = [];
    let filteredAndSortedProducts = [];
    let currentFilter = 'all';
    let currentSearchTerm = '';
    let currentSortBy = 'default';

    const PRODUCTS_PER_PAGE = 12;
    let currentPage = 1;

    if (!allProductsGrid || !categoryListStore || !productSearchInput || !productSortBy || !productPagination) {
        console.warn("Store page elements not found. Skipping store initialization.");
        return;
    }

    const renderProducts = (productsToRender) => {
        allProductsGrid.innerHTML = '';
        if (productsToRender.length === 0) {
            allProductsGrid.innerHTML = '<p class="no-items">Không tìm thấy sản phẩm nào.</p>';
            return;
        }

        const startIndex = (currentPage - 1) * PRODUCTS_PER_PAGE;
        const endIndex = startIndex + PRODUCTS_PER_PAGE;
        const productsOnPage = productsToRender.slice(startIndex, endIndex);

        productsOnPage.forEach(product => {
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
            allProductsGrid.appendChild(productItem);
        });

        allProductsGrid.querySelectorAll('.add-to-cart-btn').forEach(button => {
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
                    // Không có setTimeout ở đây vì trang không nên reload
                } catch (error) {
                    console.error('Error adding product to cart from store page:', error);
                    showNotification('Không thể thêm sản phẩm vào giỏ hàng. Vui lòng thử lại.', 'error');
                }
            });
        });
    };

    const renderPagination = (totalProducts) => {
        productPagination.innerHTML = '';
        const totalPages = Math.ceil(totalProducts / PRODUCTS_PER_PAGE);

        if (totalPages <= 1) {
            return;
        }

        const prevButton = document.createElement('button');
        prevButton.textContent = 'Trước';
        prevButton.classList.add('prev-next');
        prevButton.disabled = currentPage === 1;
        prevButton.addEventListener('click', (e) => {
            e.preventDefault(); // Ngăn chặn reload trang
            if (currentPage > 1) {
                currentPage--;
                applyFiltersAndSort();
                window.scrollTo(0, 0);
            }
        });
        productPagination.appendChild(prevButton);

        for (let i = 1; i <= totalPages; i++) {
            const pageButton = document.createElement('button');
            pageButton.textContent = i;
            if (i === currentPage) {
                pageButton.classList.add('active');
            }
            pageButton.addEventListener('click', (e) => {
                e.preventDefault();
                currentPage = i;
                applyFiltersAndSort();
                window.scrollTo(0, 0);
            });
            productPagination.appendChild(pageButton);
        }

        const nextButton = document.createElement('button');
        nextButton.textContent = 'Sau';
        nextButton.classList.add('prev-next');
        nextButton.disabled = currentPage === totalPages;
        nextButton.addEventListener('click', (e) => {
            e.preventDefault(); 
            if (currentPage < totalPages) {
                currentPage++;
                applyFiltersAndSort();
                window.scrollTo(0, 0);
            }
        });
        productPagination.appendChild(nextButton);
    };

    const applyFiltersAndSort = () => {
        let tempProducts = allProducts;

        if (currentFilter !== 'all') {
            tempProducts = tempProducts.filter(p => p.category === currentFilter);
        }

        if (currentSearchTerm) {
            const searchTermLower = currentSearchTerm.toLowerCase();
            tempProducts = tempProducts.filter(p =>
                p.name.toLowerCase().includes(searchTermLower) ||
                (p.description && p.description.toLowerCase().includes(searchTermLower)) ||
                (p.category && p.category.toLowerCase().includes(searchTermLower))
            );
        }

        tempProducts.sort((a, b) => {
            if (currentSortBy === 'price-asc') return a.price - b.price;
            if (currentSortBy === 'price-desc') return b.price - a.price;
            if (currentSortBy === 'name-asc') return a.name.localeCompare(b.name);
            if (currentSortBy === 'name-desc') return b.name.localeCompare(a.name);
            return 0;
        });

        filteredAndSortedProducts = tempProducts;
        renderProducts(filteredAndSortedProducts);
        renderPagination(filteredAndSortedProducts.length);
    };

    const loadCategories = async () => {
        categoryListStore.innerHTML = `
            <li><a href="#" data-category="all" class="category-item active">Tất cả sản phẩm</a></li>
        `;
        try {
            const categories = await getCategories();
            categories.forEach(category => {
                const li = document.createElement('li');
                const a = document.createElement('a');
                a.href = '#';
                a.dataset.category = category.name;
                a.className = 'category-item';
                a.textContent = category.name;
                li.appendChild(a);
                categoryListStore.appendChild(li);
            });

            categoryListStore.querySelectorAll('.category-item').forEach(item => {
                item.addEventListener('click', (e) => {
                    e.preventDefault();
                    categoryListStore.querySelectorAll('.category-item').forEach(li => li.classList.remove('active'));
                    e.target.classList.add('active');
                    currentFilter = e.target.dataset.category;
                    currentPage = 1;
                    applyFiltersAndSort();
                });
            });

        } catch (error) {
            console.error("Error loading categories:", error);
            categoryListStore.innerHTML = `
                <li><a href="#" data-category="all" class="category-item active">Tất cả sản phẩm</a></li>
                <li><p class="no-items" style="padding-left:15px;">Không tải được danh mục.</p></li>
            `;
            showNotification('Không thể tải danh mục sản phẩm.', 'error');
        }
    };

    const loadAllProducts = async () => {
        try {
            allProducts = await getProducts();
            applyFiltersAndSort();
        }
        catch (error) {
            console.error("Error loading products:", error);
            allProductsGrid.innerHTML = '<p class="no-items">Không thể tải sản phẩm. Vui lòng thử lại sau.</p>';
            showNotification('Không thể tải sản phẩm. Vui lòng thử lại.', 'error');
        }
    };

    productSearchInput.addEventListener('input', (e) => {
        currentSearchTerm = e.target.value;
        currentPage = 1;
        applyFiltersAndSort();
    });

    productSortBy.addEventListener('change', (e) => {
        currentSortBy = e.target.value;
        currentPage = 1;
        applyFiltersAndSort();
    });

    await loadCategories();
    await loadAllProducts();
};