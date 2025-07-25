document.addEventListener('DOMContentLoaded', () => {
    const logoutBtn = document.getElementById('logoutBtn');
    const totalSalesSpan = document.getElementById('totalSales');
    const totalOrdersSpan = document.getElementById('totalOrders');
    const newUsersTodaySpan = document.getElementById('newUsersToday');
    const recentOrdersList = document.getElementById('recentOrdersList');

    logoutBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        try {
            await auth.signOut();
            window.location.href = 'auth.html';
        } catch (error) {
            console.error("Logout Error:", error);
            alert("Error logging out. Please try again.");
        }
    });

    async function loadDashboardStats() {

        try {
            const ordersSnapshot = await db.collection('orders').get();
            let totalSales = 0;
            let totalOrders = ordersSnapshot.size;
            let recentOrdersHtml = ordersSnapshot.empty ? '<p>No recent orders.</p>' : '';

            ordersSnapshot.forEach(doc => {
                const order = doc.data();
                totalSales += order.totalAmount || 0;
                recentOrdersHtml += `
                    <div class="order-item">
                        Order ID: ${doc.id} - Customer: ${order.customerEmail || 'N/A'} - Total: $${order.totalAmount ? order.totalAmount.toFixed(2) : '0.00'} - Status: ${order.status || 'Pending'}
                    </div>
                `;
            });

            totalSalesSpan.textContent = totalSales.toFixed(2);
            totalOrdersSpan.textContent = totalOrders;
            recentOrdersList.innerHTML = recentOrdersHtml;


            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const usersSnapshot = await db.collection('users')
                .where('createdAt', '>=', firebase.firestore.Timestamp.fromDate(today))
                .get();
            newUsersTodaySpan.textContent = usersSnapshot.size;

        } catch (error) {
            console.error("Error loading dashboard stats:", error);
            totalSalesSpan.textContent = 'Error';
            totalOrdersSpan.textContent = 'Error';
            newUsersTodaySpan.textContent = 'Error';
            recentOrdersList.innerHTML = '<p>Error loading recent orders.</p>';
        }
    }

    loadDashboardStats();
});