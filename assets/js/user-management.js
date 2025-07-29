
import { getUsers, getUserById, updateUser } from './api.js';

export const initUserManagement = () => {
    const userList = document.getElementById('userList');
    const userSearchInput = document.getElementById('userSearchInput');
    const userSearchBtn = document.getElementById('userSearchBtn');

    const userModal = document.getElementById('userModal');
    const closeButtonUserModal = userModal ? userModal.querySelector('.close-button') : null;
    const userForm = document.getElementById('userForm');
    const userModalTitle = userModal ? userModal.querySelector('#userModalTitle') : null;
    const userIdInput = document.getElementById('userId');
    const userEmailDisplay = document.getElementById('userEmailDisplay');
    const userDisplayNameInput = document.getElementById('userDisplayName');
    const userRoleSelect = document.getElementById('userRole');

    let editingUserId = null;

    if (userList && userSearchInput && userSearchBtn && userModal && userForm && userModalTitle && userIdInput && userEmailDisplay && userDisplayNameInput && userRoleSelect) {

        function showUserModal(user = null) {
            userForm.reset();
            editingUserId = null;

            if (user) {
                userModalTitle.textContent = 'Sửa Thông Tin Người Dùng';
                userIdInput.value = user.id;
                userEmailDisplay.value = user.email;
                userEmailDisplay.disabled = true;
                userDisplayNameInput.value = user.displayName || '';
                userRoleSelect.value = user.role || 'customer';
                editingUserId = user.id;
            } else {

                console.warn("Attempted to open user modal for adding, which is not supported in this version.");
                hideUserModal();
                return;
            }
            userModal.style.display = 'block';
        }


        function hideUserModal() {
            userModal.style.display = 'none';
            editingUserId = null;
        }

        if (closeButtonUserModal) {
            closeButtonUserModal.addEventListener('click', hideUserModal);
        }
        window.addEventListener('click', (event) => {
            if (event.target === userModal) {
                hideUserModal();
            }
        });


        async function fetchUsers(searchTerm = '') {
            userList.innerHTML = '';
            try {
                const allUsers = await getUsers();
                let filteredUsers = allUsers;

                if (searchTerm) {
                    const lowerCaseSearchTerm = searchTerm.toLowerCase();
                    filteredUsers = filteredUsers.filter(user =>
                        user.email.toLowerCase().includes(lowerCaseSearchTerm) ||
                        (user.displayName && user.displayName.toLowerCase().includes(lowerCaseSearchTerm))
                    );
                }

                if (filteredUsers.length === 0) {
                    userList.innerHTML = '<tr><td colspan="7" class="no-data">Chưa có người dùng nào.</td></tr>';
                    return;
                }

                filteredUsers.forEach(userData => {
                    const row = document.createElement('tr');

                    const statusClass = userData.disabled ? 'status-inactive' : 'status-active';
                    const statusText = userData.disabled ? 'Vô hiệu hóa' : 'Hoạt động';

                    const createdAt = userData.createdAt ? new Date(userData.createdAt * 1000).toLocaleDateString('vi-VN') : 'N/A';
                    const lastSignInTime = userData.lastSignInTime ? new Date(userData.lastSignInTime * 1000).toLocaleDateString('vi-VN') : 'N/A';

                    row.innerHTML = `
                        <td data-label="Email">${userData.email}</td>
                        <td data-label="Tên hiển thị">${userData.displayName || 'N/A'}</td>
                        <td data-label="ID người dùng">${userData.id.substring(0, 10)}...</td>
                        <td data-label="Vai trò">${userData.role || 'N/A'}</td>
                        <td data-label="Ngày tạo">${createdAt}</td>
                        <td data-label="Đăng nhập gần nhất">${lastSignInTime}</td>
                        <td data-label="Trạng thái"><span class="${statusClass}">${statusText}</span></td>
                        <td data-label="Hành Động">
                            <button class="btn btn-edit" data-id="${userData.id}"><i class="fas fa-edit"></i> Sửa</button>
                            <button class="btn ${userData.disabled ? 'btn-primary' : 'btn-delete'}" data-id="${userData.id}" data-action="${userData.disabled ? 'enable' : 'disable'}">
                                <i class="fas ${userData.disabled ? 'fa-check' : 'fa-ban'}"></i> ${userData.disabled ? 'Kích hoạt' : 'Vô hiệu hóa'}
                            </button>
                        </td>
                    `;
                    userList.appendChild(row);
                });
                attachUserEventListeners();
            } catch (error) {
                console.error("Error fetching users:", error);
                userList.innerHTML = '<tr><td colspan="7" class="no-data">Không thể tải danh sách người dùng. Vui lòng kiểm tra API.</td></tr>';
            }
        }

        function attachUserEventListeners() {
            userList.querySelectorAll('.btn-edit').forEach(button => {
                button.addEventListener('click', async (e) => {
                    const id = e.currentTarget.dataset.id;
                    try {
                        const user = await getUserById(id);
                        if (user) {
                            showUserModal(user);
                        } else {
                            alert('Không tìm thấy người dùng này!');
                        }
                    } catch (error) {
                        console.error('Error fetching user for edit:', error);
                        alert('Không thể tải thông tin người dùng. Vui lòng thử lại.');
                    }
                });
            });

            userList.querySelectorAll('[data-action="enable"], [data-action="disable"]').forEach(button => {
                button.addEventListener('click', async (e) => {
                    const userId = e.currentTarget.dataset.id;
                    const action = e.currentTarget.dataset.action;
                    const confirmAction = action === 'enable' ? 'kích hoạt' : 'vô hiệu hóa';
                    if (confirm(`Bạn có chắc chắn muốn ${confirmAction} người dùng ID: ${userId} này không?`)) {
                        try {
                            await updateUser(userId, { disabled: (action === 'disable') });
                            alert(`Người dùng đã được ${confirmAction} thành công!`);
                            fetchUsers(userSearchInput.value);
                        } catch (error) {
                            console.error(`Error ${action}ing user:`, error);
                            alert(`Không thể ${confirmAction} người dùng. Vui lòng thử lại.`);
                        }
                    }
                });
            });
        }

        if (userForm) {
            userForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const userIdToUpdate = userIdInput.value;
                const newDisplayName = userDisplayNameInput.value;
                const newRole = userRoleSelect.value;

                if (!userIdToUpdate) {
                    alert('Không tìm thấy ID người dùng để cập nhật.');
                    return;
                }

                try {
                    const userDataToUpdate = {
                        displayName: newDisplayName,
                        role: newRole,
                    };

                    await updateUser(userIdToUpdate, userDataToUpdate);
                    alert('Thông tin người dùng đã được cập nhật thành công!');
                    hideUserModal();
                    fetchUsers(userSearchInput.value);
                } catch (error) {
                    console.error('Error updating user:', error);
                    alert('Không thể cập nhật thông tin người dùng. Vui lòng thử lại.');
                }
            });
        }

        userSearchBtn.addEventListener('click', () => {
            fetchUsers(userSearchInput.value);
        });

        userSearchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                fetchUsers(userSearchInput.value);
            }
        });

        fetchUsers();
    } else {
        console.warn("User management elements missing or invalid. Check users.html IDs and ensure all elements are present.");
    }
};