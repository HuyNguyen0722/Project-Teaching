import { getProducts, getCategories, addProduct, updateProduct, deleteProduct, getProductById } from './api.js';

export const initProductManagement = () => {
    const productList = document.getElementById('productList');
    const addProductBtn = document.getElementById('addProductBtn');
    const productModal = document.getElementById('productModal');
    const closeButton = productModal ? productModal.querySelector('.close-button') : null;
    const productForm = document.getElementById('productForm');
    const modalTitle = document.getElementById('modalTitle');
    const productIdInput = document.getElementById('productId');
    const productNameInput = document.getElementById('productName');
    const productPriceInput = document.getElementById('productPrice');
    const productQuantityInput = document.getElementById('productQuantity');
    const productCategorySelect = document.getElementById('productCategory');
    const productShortDescriptionInput = document.getElementById('productShortDescription');
    const productOriginInput = document.getElementById('productOrigin');
    const productIsFeaturedInput = document.getElementById('productIsFeatured');
    const productImageUrlInput = document.getElementById('productImageUrlInput'); 
    const currentProductImage = document.getElementById('currentProductImage');
    const productDescriptionInput = document.getElementById('productDescription');

    let editingProductId = null;
    let currentImageUrl = null;

    if (productList && addProductBtn && productModal && productForm && modalTitle && productNameInput && productPriceInput && productQuantityInput && productCategorySelect && productImageUrlInput && currentProductImage && productDescriptionInput) {

        function showModal(isEdit = false, product = null) {
            productForm.reset();
            productImageUrlInput.value = '';
            currentProductImage.style.display = 'none';

            editingProductId = null;
            currentImageUrl = null;

            if (isEdit && product) {
                modalTitle.textContent = 'Sửa Thông Tin Sản Phẩm';
                productIdInput.value = product.id;
                productNameInput.value = product.name;
                productPriceInput.value = product.price;
                productQuantityInput.value = product.quantity;
                productCategorySelect.value = product.category || '';
                productShortDescriptionInput.value = product.shortDescription || '';
                productOriginInput.value = product.origin || '';
                productIsFeaturedInput.checked = product.isFeatured || false;
                productDescriptionInput.value = product.description;
                if (product.imageUrl) {
                    currentProductImage.src = product.imageUrl;
                    currentProductImage.style.display = 'block';
                    currentImageUrl = product.imageUrl; 
                }
            } else {
                modalTitle.textContent = 'Thêm Sản Phẩm Mới';
                productIdInput.value = '';
            }
            productModal.style.display = 'block';
        }

        function hideModal() {
            productModal.style.display = 'none';
            editingProductId = null;
            currentImageUrl = null;
        }

        addProductBtn.addEventListener('click', () => showModal(false));
        if (closeButton) {
            closeButton.addEventListener('click', hideModal);
        }
        window.addEventListener('click', (event) => {
            if (event.target === productModal) {
                hideModal();
            }
        });

        async function loadCategoriesIntoSelect() {
            productCategorySelect.innerHTML = '<option value="">Chọn danh mục</option>';
            try {
                const categories = await getCategories();
                categories.forEach(category => {
                    const option = document.createElement('option');
                    option.value = category.name; 
                    option.textContent = category.name;
                    productCategorySelect.appendChild(option);
                });
            } catch (error) {
                console.error("Error loading categories:", error);
            }
        }

        async function fetchProducts() {
            productList.innerHTML = '';
            try {
                const products = await getProducts();

                if (products.length === 0) {
                    productList.innerHTML = '<tr><td colspan="7" class="no-data">Chưa có sản phẩm nào.</td></tr>';
                    return;
                }

                products.forEach(product => {
                    const row = document.createElement('tr');

                    const statusClass = product.quantity > 0 ? 'status-active' : 'status-inactive';
                    const statusText = product.quantity > 0 ? 'Còn Hàng' : 'Hết Hàng';
                    const imageUrl = product.imageUrl || '../assets/img/placeholder-product.jpg';

                    row.innerHTML = `
                        <td><img src="${imageUrl}" alt="${product.name}" class="product-thumb"></td>
                        <td>${product.name}</td>
                        <td>${product.price ? product.price.toLocaleString('vi-VN') : 'N/A'} VNĐ</td>
                        <td>${product.quantity || 0}</td>
                        <td>${product.category || 'Chưa phân loại'}</td>
                        <td><span class="${statusClass}">${statusText}</span></td>
                        <td>
                            <button class="btn btn-edit" data-id="${product.id}"><i class="fas fa-edit"></i> Sửa</button>
                            <button class="btn btn-delete" data-id="${product.id}"><i class="fas fa-trash-alt"></i> Xóa</button>
                        </td>
                    `;
                    productList.appendChild(row);
                });

                attachProductEventListeners();
            } catch (error) {
                console.error("Error fetching products:", error);
            }
        }

        function attachProductEventListeners() {
            productList.querySelectorAll('.btn-edit').forEach(button => {
                button.addEventListener('click', async (e) => {
                    const id = e.currentTarget.dataset.id;
                    try {
                        const product = await getProductById(id);
                        if (product) {
                            showModal(true, product);
                        } else {
                            alert('Không tìm thấy sản phẩm này!');
                        }
                    } catch (error) {
                        console.error('Error fetching product for edit:', error);
                        alert('Không thể tải thông tin sản phẩm. Vui lòng thử lại.');
                    }
                });
            });

            productList.querySelectorAll('.btn-delete').forEach(button => {
                button.addEventListener('click', async (e) => {
                    const id = e.currentTarget.dataset.id;
                    if (confirm(`Bạn có chắc chắn muốn xóa sản phẩm ID: ${id} này không?`)) {
                        try {
                            await deleteProduct(id);
                            alert('Sản phẩm đã được xóa thành công!');
                            fetchProducts();
                        } catch (error) {
                            console.error('Error deleting product:', error);
                            alert('Không thể xóa sản phẩm. Vui lòng thử lại.');
                        }
                    }
                });
            });
        }

        if (productForm) {
            productForm.addEventListener('submit', async (e) => {
                e.preventDefault();

                const name = productNameInput.value;
                const price = parseFloat(productPriceInput.value);
                const quantity = parseInt(productQuantityInput.value);
                const category = productCategorySelect.value;
                const shortDescription = productShortDescriptionInput.value;
                const origin = productOriginInput.value;
                const isFeatured = productIsFeaturedInput.checked;
                const imageUrl = productImageUrlInput.value; 
                const description = productDescriptionInput.value;

                try {
                    const productData = {
                        name,
                        price,
                        quantity,
                        category,
                        shortDescription,
                        origin,
                        isFeatured,
                        imageUrl: imageUrl || '', 
                        description
                    };

                    if (editingProductId) {
                        await updateProduct(editingProductId, productData);
                        alert('Sản phẩm đã được cập nhật thành công!');
                    } else {
                        await addProduct(productData);
                        alert('Sản phẩm đã được thêm thành công!');
                    }

                    hideModal();
                    fetchProducts();

                } catch (error) {
                    console.error('Error saving product:', error);
                    alert('Không thể lưu sản phẩm. Vui lòng thử lại.');
                }
            });
        }

        loadCategoriesIntoSelect();
        fetchProducts();
    } else {
        console.warn("Product management elements missing. Check products.html IDs.");
    }
};