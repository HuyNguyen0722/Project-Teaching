import { initializeApp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-storage.js";

const firebaseConfig = {
    apiKey: "AIzaSyDhRhLAvh22RAYh_6rELSYHMd2AaY51Ruw",
    authDomain: "project-teaching-89801.firebaseapp.com",
    projectId: "project-teaching-89801",
    storageBucket: "project-teaching-89801.firebasestorage.app",
    messagingSenderId: "441282021443",
    appId: "1:441282021443:web:223ef629568b9b6e39acf6",
    measurementId: "G-KB0ZT3GR3K"
};
const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { auth, db, storage };