import { db } from './firebase-init.js';
import { collection, doc, getDoc, updateDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

const ordersCollectionRef = collection(db, 'orders');

function formatVND(amount) {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
}

document.addEventListener('DOMContentLoaded', async () => {
    const orderIdDisplay = document.getElementById('orderIdDisplay');
    const customerNameInput = document.getElementById('customerName');
    const customerEmailInput = document.getElementById('customerEmail');
    const customerPhoneInput = document.getElementById('customerPhone');
    const customerAddressInput = document.getElementById('customerAddress');
    const totalAmountInput = document.getElementById('totalAmount');
    const orderDateInput = document.getElementById('orderDate');
    const orderStatusSelect = document.getElementById('orderStatus');
    const orderItemsList = document.getElementById('orderItemsList');
    const saveOrderBtn = document.getElementById('saveOrderBtn');

    const urlParams = new URLSearchParams(window.location.search);
    const orderId = urlParams.get('id');

    if (orderId) {
        try {
            const orderDocRef = doc(ordersCollectionRef, orderId);
            const docSnap = await getDoc(orderDocRef);
            if (docSnap.exists()) {
                const orderData = docSnap.data();
                orderIdDisplay.textContent = orderId;
                customerNameInput.value = orderData.customerInfo?.name || 'N/A';
                customerEmailInput.value = orderData.customerInfo?.email || 'N/A';
                customerPhoneInput.value = orderData.customerInfo?.phone || 'N/A';
                customerAddressInput.value = orderData.customerInfo?.address || 'N/A';
                totalAmountInput.value = formatVND(orderData.totalAmount || 0);
                orderDateInput.value = orderData.orderDate ? new Date(orderData.orderDate.seconds * 1000).toLocaleString() : 'N/A';
                orderStatusSelect.value = orderData.status || 'Pending';

                orderItemsList.innerHTML = '';
                if (orderData.items && orderData.items.length > 0) {
                    orderData.items.forEach(item => {
                        orderItemsList.innerHTML += `
                            <div class="order-item-detail">
                                <img src="${item.imageUrl || 'https://via.placeholder.com/40x40?text=No+Image'}" alt="${item.name}" class="order-item-image">
                                <span>${item.name} (x${item.quantity}) - ${formatVND(item.price || 0)} each</span>
                            </div>
                        `;
                    });
                } else {
                    orderItemsList.innerHTML = '<p>No items in this order.</p>';
                }

            } else {
                alert('Order not found!');
                window.location.href = 'orders.html';
            }
        } catch (error) {
            console.error("Error loading order details:", error);
            alert("Could not load order details.");
            window.location.href = 'orders.html';
        }
    } else {
        alert('No Order ID provided!');
        window.location.href = 'orders.html';
    }

    saveOrderBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        if (!orderId) return;

        const newStatus = orderStatusSelect.value;
        try {
            const orderDocRef = doc(ordersCollectionRef, orderId);
            await updateDoc(orderDocRef, { status: newStatus, updatedAt: serverTimestamp() });
            alert('Order status updated successfully!');
            window.location.href = 'orders.html';
        } catch (error) {
            alert(`Failed to update order status: ${error.message}`);
            console.error("Order status update error:", error);
        }
    });
});