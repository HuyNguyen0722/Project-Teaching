import { db } from './firebase-init.js';
import { collection, doc, getDoc, addDoc, updateDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

const productsCollectionRef = collection(db, 'products');

document.addEventListener('DOMContentLoaded', async () => {
    const productForm = document.getElementById('productForm');
    const productIdInput = document.getElementById('productId');
    const formTitle = document.getElementById('formTitle');
    const saveProductBtn = document.getElementById('saveProductBtn');

    const productNameInput = document.getElementById('productName');
    const productDescriptionInput = document.getElementById('productDescription');
    const productPriceInput = document.getElementById('productPrice');
    const productStockInput = document.getElementById('productStock');
    const productCategoryInput = document.getElementById('productCategory');
    const productImageUrlInput = document.getElementById('productImageUrl');

    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');

    if (productId) {
        formTitle.textContent = 'Edit Product';
        saveProductBtn.textContent = 'Update Product';
        try {
            const productDocRef = doc(productsCollectionRef, productId);
            const docSnap = await getDoc(productDocRef);
            if (docSnap.exists()) {
                const productData = docSnap.data();
                productIdInput.value = productId;
                productNameInput.value = productData.name || '';
                productDescriptionInput.value = productData.description || '';
                productPriceInput.value = productData.price || 0;
                productStockInput.value = productData.stock || 0;
                productCategoryInput.value = productData.category || '';
                productImageUrlInput.value = productData.imageUrl || '';
            } else {
                alert('Product not found!');
                window.location.href = 'products.html';
            }
        } catch (error) {
            console.error("Error loading product for edit:", error);
            alert("Could not load product for editing.");
            window.location.href = 'products.html';
        }
    }

    productForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const productData = {
            name: productNameInput.value,
            description: productDescriptionInput.value,
            price: parseFloat(productPriceInput.value),
            stock: parseInt(productStockInput.value),
            category: productCategoryInput.value,
            imageUrl: productImageUrlInput.value,
        };

        try {
            if (productId) {
                const productDocRef = doc(productsCollectionRef, productId);
                await updateDoc(productDocRef, { ...productData, updatedAt: serverTimestamp() });
                alert('Product updated successfully!');
            } else {
                await addDoc(productsCollectionRef, { ...productData, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
                alert('Product added successfully!');
            }
            window.location.href = 'products.html';
        } catch (error) {
            alert(`Operation failed: ${error.message}`);
            console.error("Product form submission error:", error);
        }
    });
});