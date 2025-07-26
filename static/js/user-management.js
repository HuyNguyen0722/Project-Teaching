import { db } from './firebase-init.js';
import { collection, doc, getDocs, getDoc, deleteDoc, query, orderBy } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

const usersCollectionRef = collection(db, 'users');

async function getAllUsers() {
    try {
        const q = query(usersCollectionRef, orderBy('createdAt', 'desc'));
        const snapshot = await getDocs(q);
        const users = [];
        snapshot.forEach(doc => {
            users.push({ id: doc.id, ...doc.data() });
        });
        return users;
    } catch (error) {
        console.error("Error getting users: ", error);
        throw error;
    }
}

async function getUserById(userId) {
    try {
        const userDocRef = doc(usersCollectionRef, userId);
        const docSnap = await getDoc(userDocRef);
        if (docSnap.exists()) {
            return { id: docSnap.id, ...docSnap.data() };
        } else {
            return null;
        }
    } catch (error) {
        console.error("Error getting user by ID: ", error);
        throw error;
    }
}

async function deleteUser(userId) {
    try {
        const userDocRef = doc(usersCollectionRef, userId);
        await deleteDoc(userDocRef);
        alert('User deleted successfully!');
    } catch (error) {
        console.error("Error deleting user: ", error);
        throw error;
    }
}

export { getAllUsers, getUserById, deleteUser };