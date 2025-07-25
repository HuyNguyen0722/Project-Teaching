document.addEventListener('DOMContentLoaded', () => {
    if (typeof auth === 'undefined' || typeof db === 'undefined') {
        console.error("Firebase Auth or Firestore not initialized in HTML.");
        window.location.href = 'auth.html';
        return;
    }

    auth.onAuthStateChanged(user => {
        if (!user) {
            window.location.href = 'auth.html';
        } else {
            db.collection('users').doc(user.uid).get().then(doc => {
                if (!doc.exists || doc.data().role !== 'admin') {
                    console.warn("User is not an admin. Redirecting.");
                    auth.signOut();
                    window.location.href = 'auth.html';
                }
            }).catch(error => {
                console.error("Error getting user role:", error);
                auth.signOut();
                window.location.href = 'auth.html';
            });
        }
    });
});