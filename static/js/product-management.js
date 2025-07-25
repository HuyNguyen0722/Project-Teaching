const productsCollection = db.collection('products');
const productImagesRef = storage.ref('product_images');

/**
 * 
 * @param {object} productData 
 * @param {File} imageFile 
 * @returns {Promise<DocumentReference>} 
 */
async function addProduct(productData, imageFile) {
    try {
        let imageUrl = '';
        if (imageFile) {
            // Tải ảnh lên Firebase Storage
            const imageUploadTask = productImagesRef.child(imageFile.name).put(imageFile);
            await imageUploadTask;
            imageUrl = await productImagesRef.child(imageFile.name).getDownloadURL();
            console.log("Image uploaded. URL:", imageUrl);
        }

        const productWithTimestamp = {
            ...productData,
            imageUrl: imageUrl,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        };

        const docRef = await productsCollection.add(productWithTimestamp);
        console.log("Product added with ID: ", docRef.id);
        return docRef;
    } catch (error) {
        console.error("Error adding product: ", error);
        throw error;
    }
}

/**
 * Lấy tất cả sản phẩm từ Firestore.
 * @returns {Promise<Array>} Promise giải quyết với một mảng các đối tượng sản phẩm.
 */
async function getAllProducts() {
    try {
        const snapshot = await productsCollection.orderBy('createdAt', 'desc').get();
        const products = [];
        snapshot.forEach(doc => {
            products.push({ id: doc.id, ...doc.data() });
        });
        console.log("Fetched products:", products);
        return products;
    } catch (error) {
        console.error("Error getting products: ", error);
        throw error;
    }
}

/**
 * Lấy một sản phẩm cụ thể bằng ID.
 * @param {string} productId - ID của sản phẩm.
 * @returns {Promise<object|null>} Promise giải quyết với đối tượng sản phẩm hoặc null nếu không tìm thấy.
 */
async function getProductById(productId) {
    try {
        const doc = await productsCollection.doc(productId).get();
        if (doc.exists) {
            console.log("Product data:", doc.data());
            return { id: doc.id, ...doc.data() };
        } else {
            console.log("No such product!");
            return null;
        }
    } catch (error) {
        console.error("Error getting product by ID: ", error);
        throw error;
    }
}

/**
 * Cập nhật thông tin sản phẩm.
 * @param {string} productId 
 * @param {object} updatedData 
 * @param {File|null} newImageFile 
 * @returns {Promise<void>}
 */
async function updateProduct(productId, updatedData, newImageFile = null) {
    try {
        // Nếu có ảnh mới, tải ảnh lên và cập nhật imageUrl
        if (newImageFile) {
            // Xóa ảnh cũ nếu tồn tại (tùy chọn nhưng nên làm)
            const oldProduct = await getProductById(productId);
            if (oldProduct && oldProduct.imageUrl) {
                const oldImageName = oldProduct.imageUrl.split('/').pop().split('?')[0]; // Lấy tên file từ URL
                try {
                    await productImagesRef.child(decodeURIComponent(oldImageName)).delete(); // Giải mã URL trước khi xóa
                    console.log("Old image deleted.");
                } catch (deleteError) {
                    console.warn("Could not delete old image (might not exist or permission issue):", deleteError);
                }
            }

            const imageUploadTask = productImagesRef.child(newImageFile.name).put(newImageFile);
            await imageUploadTask;
            updatedData.imageUrl = await productImagesRef.child(newImageFile.name).getDownloadURL();
            console.log("New image uploaded. URL:", updatedData.imageUrl);
        }

        const dataToUpdate = {
            ...updatedData,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp() // Cập nhật timestamp
        };

        await productsCollection.doc(productId).update(dataToUpdate);
        console.log("Product successfully updated!");
    } catch (error) {
        console.error("Error updating product: ", error);
        throw error;
    }
}

/**
 * @param {string} productId 
 * @returns {Promise<void>}
 */
async function deleteProduct(productId) {
    try {
        // Lấy thông tin sản phẩm để lấy URL ảnh
        const productToDelete = await getProductById(productId);

        // Xóa tài liệu sản phẩm khỏi Firestore
        await productsCollection.doc(productId).delete();
        console.log("Product document successfully deleted!");

        // Xóa ảnh khỏi Firebase Storage nếu có
        if (productToDelete && productToDelete.imageUrl) {
            const imageName = productToDelete.imageUrl.split('/').pop().split('?')[0];
            await productImagesRef.child(decodeURIComponent(imageName)).delete(); 
            console.log("Product image successfully deleted from Storage!");
        }
    } catch (error) {
        console.error("Error deleting product: ", error);
        throw error;
    }
}