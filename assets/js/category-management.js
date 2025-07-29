// assets/js/category-management.js

import { getCategories, addCategory, updateCategory, deleteCategory, getCategoryById } from './api.js';

export const initCategoryManagement = () => {
    const categoryList = document.getElementById('categoryList');
    const addCategoryBtn = document.getElementById('addCategoryBtn');
    const categorySearchInput = document.getElementById('categorySearchInput');
    const categorySearchBtn = document.getElementById('categorySearchBtn');

    // Category Modal Elements
    const categoryModal = document.getElementById('categoryModal');
    const closeButton = categoryModal ? categoryModal.querySelector('.close-button') : null;
    const categoryForm = document.getElementById('categoryForm');
    const modalTitle = categoryModal ? categoryModal.querySelector('#modalTitle') : null;
    const categoryIdInput = document.getElementById('categoryId');
    const categoryNameInput = document.getElementById('categoryName');
    const categoryDescriptionInput = document.getElementById('categoryDescription');

    let editingCategoryId = null;

    if (categoryList && addCategoryBtn && categoryModal && categoryForm && modalTitle && categoryIdInput && categoryNameInput && categoryDescriptionInput) {

        function showCategoryModal(isEdit = false, category = null) {
            categoryForm.reset();
            editingCategoryId = null;

            if (isEdit && category) {
                modalTitle.textContent = 'Sửa Thông Tin Danh Mục';
                categoryIdInput.value = category.id;
                categoryNameInput.value = category.name;
                categoryDescriptionInput.value = category.description;
                editingCategoryId = category.id;
            } else {
                modalTitle.textContent = 'Thêm Danh Mục Mới';
                categoryIdInput.value = '';
            }
            categoryModal.style.display = 'block';
        }

        function hideCategoryModal() {
            categoryModal.style.display = 'none';
            editingCategoryId = null;
        }

        addCategoryBtn.addEventListener('click', () => showCategoryModal(false));
        if (closeButton) {
            closeButton.addEventListener('click', hideCategoryModal);
        }
        window.addEventListener('click', (event) => {
            if (event.target === categoryModal) {
                hideCategoryModal();
            }
        });

        async function fetchCategories(searchTerm = '') {
            categoryList.innerHTML = '';
            try {
                const allCategories = await getCategories();
                let filteredCategories = allCategories;

                if (searchTerm) {
                    const lowerCaseSearchTerm = searchTerm.toLowerCase();
                    filteredCategories = filteredCategories.filter(cat =>
                        cat.name.toLowerCase().includes(lowerCaseSearchTerm) ||
                        (cat.description && cat.description.toLowerCase().includes(lowerCaseSearchTerm))
                    );
                }

                if (filteredCategories.length === 0) {
                    categoryList.innerHTML = '<tr><td colspan="5" class="no-data">Chưa có danh mục nào.</td></tr>';
                    return;
                }

                filteredCategories.forEach(category => {
                    const row = document.createElement('tr');

                    row.innerHTML = `
                        <td>${category.id}</td>
                        <td>${category.name || 'Chưa đặt tên'}</td>
                        <td>${category.description || 'Không có mô tả'}</td>
                        <td>${category.productCount || 0}</td>
                        <td>
                            <button class="btn btn-edit" data-id="${category.id}"><i class="fas fa-edit"></i> Sửa</button>
                            <button class="btn btn-delete" data-id="${category.id}"><i class="fas fa-trash-alt"></i> Xóa</button>
                        </td>
                    `;
                    categoryList.appendChild(row);
                });
                attachCategoryEventListeners();
            } catch (error) {
                console.error("Error fetching categories:", error);
            }
        }

        function attachCategoryEventListeners() {
            categoryList.querySelectorAll('.btn-edit').forEach(button => {
                button.addEventListener('click', async (e) => {
                    const id = e.currentTarget.dataset.id;
                    try {
                        const category = await getCategoryById(id);
                        if (category) {
                            showCategoryModal(true, category);
                        } else {
                            alert('Không tìm thấy danh mục này!');
                        }
                    } catch (error) {
                        console.error('Error fetching category for edit:', error);
                        alert('Không thể tải thông tin danh mục. Vui lòng thử lại.');
                    }
                });
            });

            categoryList.querySelectorAll('.btn-delete').forEach(button => {
                button.addEventListener('click', async (e) => {
                    const id = e.currentTarget.dataset.id;
                    if (confirm(`Bạn có chắc chắn muốn xóa danh mục ID: ${id} này không?`)) {
                        try {
                            await deleteCategory(id);
                            alert('Danh mục đã được xóa thành công!');
                            fetchCategories(categorySearchInput.value);
                        } catch (error) {
                            console.error('Error deleting category:', error);
                            alert('Không thể xóa danh mục. Vui lòng thử lại.');
                        }
                    }
                });
            });
        }

        if (categoryForm) {
            categoryForm.addEventListener('submit', async (e) => {
                e.preventDefault();

                const name = categoryNameInput.value;
                const description = categoryDescriptionInput.value;

                try {
                    const categoryData = {
                        name,
                        description,
                        productCount: 0 // Có thể cập nhật sau này khi thêm sản phẩm
                    };

                    if (editingCategoryId) {
                        await updateCategory(editingCategoryId, categoryData);
                        alert('Danh mục đã được cập nhật thành công!');
                    } else {
                        await addCategory(categoryData);
                        alert('Danh mục đã được thêm thành công!');
                    }

                    hideCategoryModal();
                    fetchCategories(categorySearchInput.value);

                } catch (error) {
                    console.error('Error saving category:', error);
                    alert('Không thể lưu danh mục. Vui lòng thử lại.');
                }
            });
        }

        categorySearchBtn.addEventListener('click', () => {
            fetchCategories(categorySearchInput.value);
        });

        categorySearchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                fetchCategories(categorySearchInput.value);
            }
        });

        fetchCategories(); // Initial load

    } else {
        console.warn("Category management elements missing. Check categories.html IDs.");
    }
};