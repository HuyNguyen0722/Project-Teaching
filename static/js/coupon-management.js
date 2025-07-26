import { db } from './firebase-init.js';
import { collection, doc, getDocs, getDoc, addDoc, updateDoc, deleteDoc, query, orderBy, Timestamp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

const couponsCollectionRef = collection(db, 'coupons');

async function getAllCoupons() {
    try {
        const q = query(couponsCollectionRef, orderBy('createdAt', 'desc'));
        const snapshot = await getDocs(q);
        const coupons = [];
        snapshot.forEach(doc => {
            coupons.push({ id: doc.id, ...doc.data() });
        });
        return coupons;
    } catch (error) {
        console.error("Error getting coupons: ", error);
        throw error;
    }
}

async function getCouponById(couponId) {
    try {
        const couponDocRef = doc(couponsCollectionRef, couponId);
        const docSnap = await getDoc(couponDocRef);
        if (docSnap.exists()) {
            return { id: docSnap.id, ...docSnap.data() };
        } else {
            return null;
        }
    } catch (error) {
        console.error("Error getting coupon by ID: ", error);
        throw error;
    }
}

async function addCoupon(couponData) {
    try {
        const docRef = await addDoc(couponsCollectionRef, {
            ...couponData,
            usesCount: 0,
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now()
        });
        return docRef;
    } catch (error) {
        console.error("Error adding coupon: ", error);
        throw error;
    }
}

async function updateCoupon(couponId, updatedData) {
    try {
        const couponDocRef = doc(couponsCollectionRef, couponId);
        await updateDoc(couponDocRef, { ...updatedData, updatedAt: Timestamp.now() });
    } catch (error) {
        console.error("Error updating coupon: ", error);
        throw error;
    }
}

async function deleteCoupon(couponId) {
    try {
        const couponDocRef = doc(couponsCollectionRef, couponId);
        await deleteDoc(couponDocRef);
    } catch (error) {
        console.error("Error deleting coupon: ", error);
        throw error;
    }
}

export { getAllCoupons, getCouponById, addCoupon, updateCoupon, deleteCoupon };