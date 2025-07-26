import { auth, db } from './firebase-init.js';
import { signOut } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";
import { doc, getDoc, collection } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";


(function () {
    function applyTheme(theme) {
        document.body.classList.remove('light-mode', 'dark-mode');
        document.body.classList.add(theme);
        localStorage.setItem('theme', theme);
    }
    const savedTheme = localStorage.getItem('theme') || 'light-mode';
    applyTheme(savedTheme);
})();


document.addEventListener('DOMContentLoaded', () => {
    const adminUserNameElement = document.getElementById('adminUserName');
    const themeToggleBtn = document.getElementById('themeToggleBtn');

    function toggleTheme() {
        const currentTheme = localStorage.getItem('theme') || 'light-mode';
        const newTheme = currentTheme === 'light-mode' ? 'dark-mode' : 'light-mode';
        document.body.classList.remove('light-mode', 'dark-mode');
        document.body.classList.add(newTheme);
        localStorage.setItem('theme', newTheme);
    }

    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', toggleTheme);
    }

    auth.onAuthStateChanged(async user => {
        if (!user) {
            window.location.href = 'auth.html';
        } else {
            try {
                const usersCollectionRef = collection(db, 'users');
                const userDocRef = doc(usersCollectionRef, user.uid);
                const docSnap = await getDoc(userDocRef);

                if (!docSnap.exists() || docSnap.data().role !== 'admin') {
                    console.warn("User is not an admin or role not found. Redirecting.");
                    await signOut(auth);
                    window.location.href = 'auth.html';
                } else {
                    const userData = docSnap.data();
                    const userName = userData.firstName || userData.lastName ? `${userData.firstName || ''} ${userData.lastName || ''}`.trim() : user.email;
                    if (adminUserNameElement) {
                        adminUserNameElement.textContent = `Hello, ${userName}!`;
                    }
                }
            } catch (error) {
                console.error("Error getting user role:", error);
                await signOut(auth);
                window.location.href = 'auth.html';
            }
        }
    });

    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            try {
                await signOut(auth);
                window.location.href = 'auth.html';
            } catch (error) {
                console.error("Logout Error:", error);
                alert("Error logging out. Please try again.");
            }
        });
    }
});