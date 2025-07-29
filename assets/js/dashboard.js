import { getOrders, getProducts } from './api.js';

const OPENWEATHER_API_KEY = '2312ce5e7d0f1ea2f80b2903d6035601';
const CITY_NAME = 'Haiphong';
const COUNTRY_CODE = 'vn';

export const initDashboard = () => {
    const currentDateTimeElement = document.getElementById('currentDateTime');
    const weatherInfoElement = document.getElementById('weatherInfo');
    const totalRevenueElement = document.getElementById('totalRevenue');
    const newOrdersCountElement = document.getElementById('newOrdersCount');
    const outOfStockCountElement = document.getElementById('outOfStockCount');
    const latestOrderList = document.getElementById('latestOrderList');

    let revenueChartInstance = null;
    let orderStatusChartInstance = null;

    function updateDateTime() {
        const now = new Date();
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
        currentDateTimeElement.textContent = now.toLocaleDateString('vi-VN', options);
    }

    async function fetchWeather() {
        try {
            const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${CITY_NAME},${COUNTRY_CODE}&appid=${OPENWEATHER_API_KEY}&units=metric&lang=vi`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();

            const weatherDescription = data.weather[0].description;
            const temperature = Math.round(data.main.temp);
            const iconCode = data.weather[0].icon;
            const iconUrl = `http://openweathermap.org/img/wn/${iconCode}.png`;

            weatherInfoElement.innerHTML = `
                <img src="${iconUrl}" alt="${weatherDescription}">
                ${temperature}°C, ${weatherDescription.charAt(0).toUpperCase() + weatherDescription.slice(1)}
            `;
        }
        catch (error) {
            console.error("Error fetching weather:", error);
            weatherInfoElement.innerHTML = `Không thể tải thời tiết. <i class="fas fa-exclamation-circle"></i>`;
        }
    }

    async function fetchDashboardStats() {
        if (!totalRevenueElement || !newOrdersCountElement || !outOfStockCountElement || !latestOrderList) {
            console.warn("Dashboard stat or latest order list elements missing. Check index.html IDs.");
            return;
        }

        try {
            const orders = await getOrders();
            const products = await getProducts();

            let totalRevenue = 0;
            orders.forEach(order => {
                if (order.status === 'delivered' && typeof order.totalPrice === 'number') {
                    totalRevenue += order.totalPrice;
                }
            });
            totalRevenueElement.textContent = totalRevenue.toLocaleString('vi-VN') + ' VNĐ';

            let newOrdersCount = 0;
            orders.forEach(order => {
                if (order.status === 'pending') {
                    newOrdersCount++;
                }
            });
            newOrdersCountElement.textContent = newOrdersCount;

            let outOfStockCount = 0;
            products.forEach(product => {
                if (typeof product.quantity === 'number' && product.quantity <= 0) {
                    outOfStockCount++;
                }
            });
            outOfStockCountElement.textContent = outOfStockCount;

            renderRevenueChart(orders);

            renderOrderStatusChart(orders);

            renderLatestOrders(orders);

        } catch (error) {
            console.error("Error fetching dashboard stats:", error);
            totalRevenueElement.textContent = 'Lỗi!';
            newOrdersCountElement.textContent = 'Lỗi!';
            outOfStockCountElement.textContent = 'Lỗi!';
            latestOrderList.innerHTML = '<tr><td colspan="5" class="no-data">Không thể tải đơn hàng.</td></tr>';
        }
    }

    function renderRevenueChart(orders) {
        const ctx = document.getElementById('revenueChart');
        if (!ctx) return;

        const monthlyRevenue = {};

        orders.forEach(order => {
            if (order.status === 'delivered' && order.orderDate && typeof order.totalPrice === 'number') {
                const date = new Date(order.orderDate);
                const yearMonth = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
                monthlyRevenue[yearMonth] = (monthlyRevenue[yearMonth] || 0) + order.totalPrice;
            }
        });

        const sortedMonths = Object.keys(monthlyRevenue).sort();
        const revenues = sortedMonths.map(month => monthlyRevenue[month]);

        const labels = sortedMonths.map(month => {
            const [year, monthNum] = month.split('-');
            return `T${parseInt(monthNum)}/${year.slice(2)}`;
        });

        if (revenueChartInstance) {
            revenueChartInstance.destroy();
        }

        revenueChartInstance = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Doanh thu (VNĐ)',
                    data: revenues,
                    borderColor: 'rgb(75, 192, 192)',
                    tension: 0.1,
                    fill: false
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                aspectRatio: 2,
                plugins: {
                    legend: {
                        position: 'top',
                        labels: {
                            color: getComputedStyle(document.body).getPropertyValue('--text-color-primary')
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function (context) {
                                let label = context.dataset.label || '';
                                if (label) {
                                    label += ': ';
                                }
                                if (context.parsed.y !== null) {
                                    label += context.parsed.y.toLocaleString('vi-VN') + ' VNĐ';
                                }
                                return label;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        ticks: {
                            color: getComputedStyle(document.body).getPropertyValue('--text-color-secondary')
                        },
                        grid: {
                            color: getComputedStyle(document.body).getPropertyValue('--chart-grid-color')
                        }
                    },
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function (value, index, values) {
                                return value.toLocaleString('vi-VN') + ' VNĐ';
                            },
                            color: getComputedStyle(document.body).getPropertyValue('--text-color-secondary')
                        },
                        grid: {
                            color: getComputedStyle(document.body).getPropertyValue('--chart-grid-color')
                        }
                    }
                }
            }
        });
    }

    function renderOrderStatusChart(orders) {
        const ctx = document.getElementById('orderStatusChart');
        if (!ctx) return;

        const statusCounts = {
            'pending': 0,
            'confirmed': 0,
            'shipping': 0,
            'delivered': 0,
            'cancelled': 0
        };

        orders.forEach(order => {
            if (statusCounts.hasOwnProperty(order.status)) {
                statusCounts[order.status]++;
            }
        });

        const data = Object.values(statusCounts);
        const labels = ['Đang chờ', 'Đã xác nhận', 'Đang giao', 'Đã giao', 'Đã hủy'];
        const backgroundColors = [
            'rgb(255, 205, 86)',
            'rgb(54, 162, 235)',
            'rgb(255, 159, 64)',
            'rgb(75, 192, 192)',
            'rgb(255, 99, 132)'
        ];
        const borderColors = [
            'rgb(255, 205, 86, 0.8)',
            'rgb(54, 162, 235, 0.8)',
            'rgb(255, 159, 64, 0.8)',
            'rgb(75, 192, 192, 0.8)',
            'rgb(255, 99, 132, 0.8)'
        ];

        const totalDataPoints = data.reduce((sum, val) => sum + val, 0);
        if (totalDataPoints === 0) {
            if (orderStatusChartInstance) {
                orderStatusChartInstance.destroy();
            }
            ctx.getContext('2d').clearRect(0, 0, ctx.width, ctx.height);
            const parent = ctx.parentElement;
            let noDataMsg = parent.querySelector('.no-chart-data');
            if (!noDataMsg) {
                noDataMsg = document.createElement('div');
                noDataMsg.className = 'no-chart-data';
                noDataMsg.textContent = 'Không có dữ liệu đơn hàng để hiển thị.';
                parent.appendChild(noDataMsg);
            }
            return;
        } else {
            const parent = ctx.parentElement;
            let noDataMsg = parent.querySelector('.no-chart-data');
            if (noDataMsg) {
                noDataMsg.remove();
            }
        }

        if (orderStatusChartInstance) {
            orderStatusChartInstance.destroy();
        }

        orderStatusChartInstance = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: backgroundColors,
                    borderColor: borderColors,
                    borderWidth: 1,
                    hoverOffset: 8
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                aspectRatio: 1,
                plugins: {
                    legend: {
                        position: 'top',
                        labels: {
                            color: getComputedStyle(document.body).getPropertyValue('--text-color-primary')
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function (context) {
                                const label = context.label || '';
                                const value = context.parsed;
                                const total = context.dataset.data.reduce((sum, val) => sum + val, 0);
                                const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                                return `${label}: ${value} (${percentage}%)`;
                            }
                        }
                    }
                }
            }
        });
    }

    function renderLatestOrders(orders) {
        if (!latestOrderList) return;

        const sortedOrders = [...orders].sort((a, b) => (b.orderDate || 0) - (a.orderDate || 0));
        const latest5Orders = sortedOrders.slice(0, 5);

        latestOrderList.innerHTML = '';
        if (latest5Orders.length === 0) {
            latestOrderList.innerHTML = '<tr><td colspan="5" class="no-data">Không có đơn hàng mới nào.</td></tr>';
            return;
        }

        latest5Orders.forEach(order => {
            const row = document.createElement('tr');
            let statusClass = '';
            let statusText = '';

            switch (order.status) {
                case 'pending': statusClass = 'status-pending'; statusText = 'Đang chờ'; break;
                case 'confirmed': statusClass = 'status-confirmed'; statusText = 'Đã xác nhận'; break;
                case 'shipping': statusClass = 'status-shipping'; statusText = 'Đang giao'; break;
                case 'delivered': statusClass = 'status-delivered'; statusText = 'Đã giao'; break;
                case 'cancelled': statusClass = 'status-cancelled'; statusText = 'Đã hủy'; break;
                default: statusClass = ''; statusText = 'Không xác định'; break;
            }

            const orderDate = order.orderDate ? new Date(order.orderDate).toLocaleDateString('vi-VN') : 'N/A';
            const displayOrderId = order.id.slice(-6);

            row.innerHTML = `
                <td>#${displayOrderId}</td>
                <td>${order.customerName || 'Khách hàng ẩn danh'}</td>
                <td>${order.totalPrice ? order.totalPrice.toLocaleString('vi-VN') : '0'} VNĐ</td>
                <td>${orderDate}</td>
                <td><span class="${statusClass}">${statusText}</span></td>
            `;
            latestOrderList.appendChild(row);
        });
    }


    // Gọi các hàm khi Dashboard được tải
    if (currentDateTimeElement && weatherInfoElement) {
        updateDateTime();
        setInterval(updateDateTime, 1000);
        fetchWeather();
        setInterval(fetchWeather, 300000);
    }

    fetchDashboardStats();
    setInterval(fetchDashboardStats, 60000);
};