import { db } from './firebase-init.js';
import { collection, doc, getDoc, updateDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";
import { auth } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

const usersCollectionRef = collection(db, 'users');

document.addEventListener('DOMContentLoaded', async () => {
    const userForm = document.getElementById('userForm');
    const formTitle = document.getElementById('formTitle');
    const saveUserBtn = document.getElementById('saveUserBtn');

    const userIdDisplay = document.getElementById('userIdDisplay');
    const userEmailInput = document.getElementById('userEmail');
    const firstNameInput = document.getElementById('firstName');
    const lastNameInput = document.getElementById('lastName');
    const phoneInput = document.getElementById('phone');
    const addressInput = document.getElementById('address');
    const createdAtInput = document.getElementById('createdAt');
    const lastLoginInput = document.getElementById('lastLogin');
    const userRoleSelect = document.getElementById('userRole');

    const urlParams = new URLSearchParams(window.location.search);
    const userId = urlParams.get('id');

    if (userId) {
        formTitle.textContent = 'Edit User Details';
        saveUserBtn.textContent = 'Save Changes';
        try {
            const userDocRef = doc(usersCollectionRef, userId);
            const docSnap = await getDoc(userDocRef);
            if (docSnap.exists()) {
                const userData = docSnap.data();
                userIdDisplay.value = userId;
                userEmailInput.value = userData.email || '';
                firstNameInput.value = userData.firstName || '';
                lastNameInput.value = userData.lastName || '';
                phoneInput.value = userData.phone || '';
                addressInput.value = userData.address || '';
                createdAtInput.value = userData.createdAt ? new Date(userData.createdAt.seconds * 1000).toLocaleString() : 'N/A';
                lastLoginInput.value = userData.lastLogin ? new Date(userData.lastLogin.seconds * 1000).toLocaleString() : 'N/A';
                userRoleSelect.value = userData.role || 'customer';

                if (userId === auth.currentUser?.uid) {
                    userRoleSelect.disabled = true;
                }
            } else {
                alert('User not found!');
                window.location.href = 'users.html';
            }
        } catch (error) {
            console.error("Error loading user for edit:", error);
            alert("Could not load user details.");
            window.location.href = 'users.html';
        }
    } else {
        alert('No User ID provided!');
        window.location.href = 'users.html';
    }

    userForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const updatedData = {
            firstName: firstNameInput.value,
            lastName: lastNameInput.value,
            phone: phoneInput.value,
            address: addressInput.value,
            role: userRoleSelect.value,
        };

        try {
            if (userId === auth.currentUser?.uid && updatedData.role !== 'admin') {
                 alert('You cannot change your own role to non-admin.');
                 return;
            }

            const userDocRef = doc(usersCollectionRef, userId);
            await updateDoc(userDocRef, { ...updatedData, updatedAt: serverTimestamp() });
            alert('User details updated successfully!');
            window.location.href = 'users.html';
        } catch (error) {
            alert(`Operation failed: ${error.message}`);
            console.error("User form submission error:", error);
        }
    });
});