import { db } from './firebase-init.js';
import { collection, doc, getDocs, getDoc, deleteDoc, query, orderBy } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

const ordersCollectionRef = collection(db, 'orders');

async function getAllOrders() {
    try {
        const q = query(ordersCollectionRef, orderBy('orderDate', 'desc'));
        const snapshot = await getDocs(q);
        const orders = [];
        snapshot.forEach(doc => {
            orders.push({ id: doc.id, ...doc.data() });
        });
        return orders;
    } catch (error) {
        console.error("Error getting orders: ", error);
        throw error;
    }
}

async function getOrderById(orderId) {
    try {
        const orderDocRef = doc(ordersCollectionRef, orderId);
        const docSnap = await getDoc(orderDocRef);
        if (docSnap.exists()) {
            return { id: docSnap.id, ...docSnap.data() };
        } else {
            return null;
        }
    } catch (error) {
        console.error("Error getting order by ID: ", error);
        throw error;
    }
}

async function deleteOrder(orderId) {
    try {
        const orderDocRef = doc(ordersCollectionRef, orderId);
        await deleteDoc(orderDocRef);
        alert('Order deleted successfully!');
    } catch (error) {
        console.error("Error deleting order: ", error);
        throw error;
    }
}

export { getAllOrders, getOrderById, deleteOrder };