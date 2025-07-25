// static/js/order-management.js

// Đảm bảo rằng 'db' đã được định nghĩa toàn cục từ file HTML của bạn.
const ordersCollection = db.collection('orders');

/**
 * Lấy tất cả đơn hàng từ Firestore.
 * @returns {Promise<Array>} Promise giải quyết với một mảng các đối tượng đơn hàng.
 */
async function getAllOrders() {
    try {
        const snapshot = await ordersCollection.orderBy('orderDate', 'desc').get(); // Sắp xếp theo ngày đặt hàng mới nhất
        const orders = [];
        snapshot.forEach(doc => {
            orders.push({ id: doc.id, ...doc.data() });
        });
        console.log("Fetched orders:", orders);
        return orders;
    } catch (error) {
        console.error("Error getting orders: ", error);
        throw error;
    }
}

/**
 * Lấy một đơn hàng cụ thể bằng ID.
 * @param {string} orderId - ID của đơn hàng.
 * @returns {Promise<object|null>} Promise giải quyết với đối tượng đơn hàng hoặc null nếu không tìm thấy.
 */
async function getOrderById(orderId) {
    try {
        const doc = await ordersCollection.doc(orderId).get();
        if (doc.exists) {
            console.log("Order data:", doc.data());
            return { id: doc.id, ...doc.data() };
        } else {
            console.log("No such order!");
            return null;
        }
    } catch (error) {
        console.error("Error getting order by ID: ", error);
        throw error;
    }
}

/**
 * Cập nhật trạng thái hoặc thông tin khác của đơn hàng.
 * @param {string} orderId - ID của đơn hàng cần cập nhật.
 * @param {object} updatedData - Dữ liệu cần cập nhật (ví dụ: { status: 'Shipped' }).
 * @returns {Promise<void>}
 */
async function updateOrderStatus(orderId, updatedData) {
    try {
        const dataToUpdate = {
            ...updatedData,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp() // Thêm timestamp cập nhật
        };
        await ordersCollection.doc(orderId).update(dataToUpdate);
        console.log("Order status successfully updated!");
    } catch (error) {
        console.error("Error updating order status: ", error);
        throw error;
    }
}

/**
 * Xóa một đơn hàng.
 * @param {string} orderId - ID của đơn hàng cần xóa.
 * @returns {Promise<void>}
 */
async function deleteOrder(orderId) {
    try {
        await ordersCollection.doc(orderId).delete();
        console.log("Order successfully deleted!");
    } catch (error) {
        console.error("Error deleting order: ", error);
        throw error;
    }
}