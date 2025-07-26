import { auth, db } from './firebase-init.js';
import { GoogleAuthProvider, signInWithEmailAndPassword, signInWithPopup, signOut } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";
import { doc, setDoc, collection, getDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('adminLoginForm');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const errorMessage = document.getElementById('errorMessage');
    const googleSignInBtn = document.getElementById('googleSignInBtn');

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        errorMessage.textContent = '';

        const email = emailInput.value;
        const password = passwordInput.value;

        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            await checkUserRoleAndRedirect(user);
        } catch (error) {
            console.error("Login Error:", error);
            handleLoginError(error);
        }
    });

    googleSignInBtn.addEventListener('click', async () => {
        errorMessage.textContent = '';
        const provider = new GoogleAuthProvider();

        try {
            const userCredential = await signInWithPopup(auth, provider);
            const user = userCredential.user;

            const usersCollectionRef = collection(db, 'users');
            const userDocRef = doc(usersCollectionRef, user.uid);
            const userDocSnap = await getDoc(userDocRef);

            if (!userDocSnap.exists()) {
                await setDoc(userDocRef, {
                    email: user.email,
                    role: 'customer',
                    createdAt: serverTimestamp()
                });
            }
            await checkUserRoleAndRedirect(user);
        } catch (error) {
            console.error("Google Sign-In Error:", error);
            handleLoginError(error);
        }
    });

    async function checkUserRoleAndRedirect(user) {
        const usersCollectionRef = collection(db, 'users');
        const userDocRef = doc(usersCollectionRef, user.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists() && userDocSnap.data().role === 'admin') {
            window.location.href = 'dashboard.html';
        } else {
            await signOut(auth);
            errorMessage.textContent = 'Access Denied: You do not have admin privileges.';
        }
    }

    function handleLoginError(error) {
        switch (error.code) {
            case 'auth/user-not-found':
            case 'auth/wrong-password':
                errorMessage.textContent = 'Invalid email or password.';
                break;
            case 'auth/invalid-email':
                errorMessage.textContent = 'Please enter a valid email address.';
                break;
            case 'auth/popup-closed-by-user':
                errorMessage.textContent = 'Google sign-in window was closed.';
                break;
            case 'auth/cancelled-popup-request':
                errorMessage.textContent = 'Google sign-in was cancelled.';
                break;
            default:
                errorMessage.textContent = 'An error occurred during login. Please try again.';
        }
    }
});