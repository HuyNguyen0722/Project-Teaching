export const showNotification = (message, type = 'info', duration = 1000) => {
    const container = document.getElementById('notificationContainer');
    if (!container) {
        console.error('Notification container not found!');
        return;
    }

    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    let iconClass = '';
    if (type === 'success') {
        iconClass = 'fas fa-check-circle';
    } else if (type === 'error') {
        iconClass = 'fas fa-exclamation-circle';
    } else {
        iconClass = 'fas fa-info-circle';
    }

    notification.innerHTML = `<i class="${iconClass}"></i> ${message}`;
    container.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'fadeOut 0.5s forwards';
        notification.addEventListener('animationend', () => {
            notification.remove();
        });
    }, duration);
};