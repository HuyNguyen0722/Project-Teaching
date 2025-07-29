import { getOrders, updateOrderStatus } from './api.js';

export const initOrderManagement = () => {
    const orderList = document.getElementById('orderList');
    const orderStatusFilter = document.getElementById('orderStatusFilter');
    const orderSearchInput = document.getElementById('orderSearchInput');
    const orderSearchBtn = document.getElementById('orderSearchBtn');

    if (orderList && orderStatusFilter && orderSearchInput && orderSearchBtn) {

        async function fetchOrders(filterStatus = 'all', searchTerm = '') {
            orderList.innerHTML = '';
            try {
                const allOrders = await getOrders();
                let filteredOrders = allOrders;

                if (filterStatus !== 'all' && filterStatus !== 'Lọc theo trạng thái') {
                    filteredOrders = filteredOrders.filter(order => order.status === filterStatus);
                }

                if (searchTerm) {
                    const lowerCaseSearchTerm = searchTerm.toLowerCase();
                    filteredOrders = filteredOrders.filter(order =>
                        order.id.toLowerCase().includes(lowerCaseSearchTerm) ||
                        (order.customerName && order.customerName.toLowerCase().includes(lowerCaseSearchTerm))
                    );
                }

                if (filteredOrders.length === 0) {
                    orderList.innerHTML = '<tr><td colspan="6" class="no-data">Không tìm thấy đơn hàng nào.</td></tr>';
                    return;
                }

                filteredOrders.forEach(order => {
                    const row = document.createElement('tr');

                    let statusClass = '';
                    let statusText = '';
                    let actionDropdownOptions = '';
                    let dropdownDisabled = false;

                    switch (order.status) {
                        case 'pending':
                            statusClass = 'status-pending'; statusText = 'Đang chờ';
                            actionDropdownOptions = `
                                <option value="">Cập nhật trạng thái</option>
                                <option value="confirmed">Xác nhận</option>
                                <option value="shipping">Giao hàng</option>
                                <option value="cancelled">Hủy</option>
                            `;
                            break;
                        case 'confirmed':
                            statusClass = 'status-confirmed'; statusText = 'Đã xác nhận';
                            actionDropdownOptions = `
                                <option value="">Cập nhật trạng thái</option>
                                <option value="shipping">Giao hàng</option>
                                <option value="cancelled">Hủy</option>
                            `;
                            break;
                        case 'shipping':
                            statusClass = 'status-shipping'; statusText = 'Đang giao';
                            actionDropdownOptions = `
                                <option value="">Cập nhật trạng thái</option>
                                <option value="delivered">Đã giao</option>
                                <option value="cancelled">Hủy</option>
                            `;
                            break;
                        case 'delivered':
                            statusClass = 'status-delivered'; statusText = 'Đã giao';
                            actionDropdownOptions = `<option value="">Đã hoàn thành</option>`;
                            dropdownDisabled = true;
                            break;
                        case 'cancelled':
                            statusClass = 'status-cancelled'; statusText = 'Đã hủy';
                            actionDropdownOptions = `<option value="">Đã hủy</option>`;
                            dropdownDisabled = true;
                            break;
                        default:
                            statusClass = ''; statusText = 'Không xác định';
                            actionDropdownOptions = `<option value="">Không khả dụng</option>`;
                            dropdownDisabled = true;
                            break;
                    }

                    const orderDate = order.orderDate ? new Date(order.orderDate).toLocaleDateString('vi-VN') : 'N/A';
                    const displayOrderId = order.id.slice(-6);

                    row.innerHTML = `
                        <td>#${displayOrderId}</td>
                        <td>${order.customerName || 'Khách hàng ẩn danh'}</td>
                        <td>${order.totalPrice ? order.totalPrice.toLocaleString('vi-VN') : '0'} VNĐ</td>
                        <td>${orderDate}</td>
                        <td><span class="${statusClass}">${statusText}</span></td>
                        <td>
                            <button class="btn btn-detail" data-id="${order.id}"><i class="fas fa-eye"></i> Xem</button>
                            <div class="action-dropdown-wrapper">
                                <select class="order-action-dropdown" data-id="${order.id}" ${dropdownDisabled ? 'disabled' : ''}>
                                    ${actionDropdownOptions}
                                </select>
                            </div>
                        </td>
                    `;
                    orderList.appendChild(row);
                });
                attachOrderEventListeners();
            } catch (error) {
                console.error("Error fetching orders:", error);
            }
        }

        function attachOrderEventListeners() {
            orderList.querySelectorAll('.btn-detail').forEach(button => {
                button.addEventListener('click', (e) => {
                    const orderId = e.currentTarget.dataset.id;
                    alert(`Xem chi tiết đơn hàng ID: ${orderId}`);
                });
            });

            orderList.querySelectorAll('.order-action-dropdown').forEach(dropdown => {
                dropdown.addEventListener('change', async (e) => {
                    const orderId = e.target.dataset.id;
                    const newStatus = e.target.value;

                    if (newStatus) {
                        if (confirm(`Bạn có chắc chắn muốn cập nhật trạng thái đơn hàng #${orderId.substring(0, 6)} thành "${newStatus}" không?`)) {
                            try {
                                await updateOrderStatus(orderId, newStatus);
                                alert('Trạng thái đơn hàng đã được cập nhật!');
                                fetchOrders(orderStatusFilter.value, orderSearchInput.value);
                            } catch (error) {
                                console.error('Error updating order status:', error);
                                alert('Không thể cập nhật trạng thái đơn hàng. Vui lòng thử lại.');
                            }
                        } else {
                            e.target.value = '';
                        }
                    }
                });
            });
        }

        orderStatusFilter.addEventListener('change', () => {
            fetchOrders(orderStatusFilter.value, orderSearchInput.value);
        });

        orderSearchBtn.addEventListener('click', () => {
            fetchOrders(orderStatusFilter.value, orderSearchInput.value);
        });

        orderSearchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                fetchOrders(orderStatusFilter.value, orderSearchInput.value);
            }
        });

        fetchOrders();

    } else {
        console.warn("Order management elements missing. Check orders.html IDs.");
    }
};