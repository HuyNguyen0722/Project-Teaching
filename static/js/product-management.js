import { db } from './firebase-init.js';
import { collection, doc, getDocs, getDoc, deleteDoc, query, orderBy } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

const productsCollectionRef = collection(db, 'products');

async function getAllProducts() {
    try {
        const q = query(productsCollectionRef, orderBy('createdAt', 'desc'));
        const snapshot = await getDocs(q);
        const products = [];
        snapshot.forEach(doc => {
            products.push({ id: doc.id, ...doc.data() });
        });
        return products;
    } catch (error) {
        console.error("Error getting products: ", error);
        throw error;
    }
}

async function getProductById(productId) {
    try {
        const productDocRef = doc(productsCollectionRef, productId);
        const docSnap = await getDoc(productDocRef);
        if (docSnap.exists()) {
            return { id: docSnap.id, ...docSnap.data() };
        } else {
            return null;
        }
    } catch (error) {
        console.error("Error getting product by ID: ", error);
        throw error;
    }
}

async function deleteProduct(productId) {
    try {
        const productDocRef = doc(productsCollectionRef, productId);
        await deleteDoc(productDocRef);
        alert('Product deleted successfully!');
    } catch (error) {
        console.error("Error deleting product: ", error);
        throw error;
    }
}

export { getAllProducts, getProductById, deleteProduct };