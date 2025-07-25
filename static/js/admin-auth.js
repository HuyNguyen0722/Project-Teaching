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
            const userCredential = await auth.signInWithEmailAndPassword(email, password);
            const user = userCredential.user;

            await checkUserRoleAndRedirect(user);
        } catch (error) {
            console.error("Login Error:", error);
            handleLoginError(error);
        }
    });


    googleSignInBtn.addEventListener('click', async () => {
        errorMessage.textContent = ''; 
        const provider = new firebase.auth.GoogleAuthProvider();

        try {
            const userCredential = await auth.signInWithPopup(provider);
            const user = userCredential.user;


            const userDoc = await db.collection('users').doc(user.uid).get();
            if (!userDoc.exists) {
                await db.collection('users').doc(user.uid).set({
                    email: user.email,
                    role: 'customer',
                    createdAt: firebase.firestore.FieldValue.serverTimestamp()
                });
            }

            await checkUserRoleAndRedirect(user);

        } catch (error) {
            console.error("Google Sign-In Error:", error);
            handleLoginError(error);
        }
    });

    async function checkUserRoleAndRedirect(user) {
        const userDoc = await db.collection('users').doc(user.uid).get();
        if (userDoc.exists && userDoc.data().role === 'admin') {
            window.location.href = 'dashboard.html';
        } else {
            await auth.signOut();
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