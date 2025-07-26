import { db } from './firebase-init.js';
import { collection, doc, getDoc, addDoc, updateDoc, Timestamp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";
import { addCoupon, getCouponById, updateCoupon } from './coupon-management.js';

const couponsCollectionRef = collection(db, 'coupons');

document.addEventListener('DOMContentLoaded', async () => {
    const couponForm = document.getElementById('couponForm');
    const couponIdInput = document.getElementById('couponId');
    const formTitle = document.getElementById('formTitle');
    const saveCouponBtn = document.getElementById('saveCouponBtn');

    const couponCodeInput = document.getElementById('couponCode');
    const couponTypeSelect = document.getElementById('couponType');
    const couponValueInput = document.getElementById('couponValue');
    const minimumOrderAmountInput = document.getElementById('minimumOrderAmount');
    const maxUsesInput = document.getElementById('maxUses');
    const validFromInput = document.getElementById('validFrom');
    const validUntilInput = document.getElementById('validUntil');
    const isActiveCheckbox = document.getElementById('isActive');

    const urlParams = new URLSearchParams(window.location.search);
    const couponId = urlParams.get('id');

    function formatDateForInput(date) {
        if (!date) return '';
        const d = new Date(date.seconds * 1000);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    if (couponId) {
        formTitle.textContent = 'Edit Coupon';
        saveCouponBtn.textContent = 'Update Coupon';
        try {
            const couponData = await getCouponById(couponId);
            if (couponData) {
                couponIdInput.value = couponId;
                couponCodeInput.value = couponData.code || '';
                couponTypeSelect.value = couponData.type || 'percentage';
                couponValueInput.value = couponData.value || 0;
                minimumOrderAmountInput.value = couponData.minimumOrderAmount || 0;
                maxUsesInput.value = couponData.maxUses || 0;
                validFromInput.value = formatDateForInput(couponData.validFrom);
                validUntilInput.value = formatDateForInput(couponData.validUntil);
                isActiveCheckbox.checked = couponData.isActive || false;
            } else {
                alert('Coupon not found!');
                window.location.href = 'coupons.html';
            }
        } catch (error) {
            console.error("Error loading coupon for edit:", error);
            alert("Could not load coupon for editing.");
            window.location.href = 'coupons.html';
        }
    }

    couponForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const couponData = {
            code: couponCodeInput.value,
            type: couponTypeSelect.value,
            value: parseFloat(couponValueInput.value),
            minimumOrderAmount: parseFloat(minimumOrderAmountInput.value || 0),
            maxUses: parseInt(maxUsesInput.value || 0),
            validFrom: validFromInput.value ? Timestamp.fromDate(new Date(validFromInput.value)) : null,
            validUntil: validUntilInput.value ? Timestamp.fromDate(new Date(validUntilInput.value + 'T23:59:59')) : null,
            isActive: isActiveCheckbox.checked,
        };

        try {
            if (couponId) {
                await updateCoupon(couponId, couponData);
                alert('Coupon updated successfully!');
            } else {
                await addCoupon(couponData);
                alert('Coupon added successfully!');
            }
            window.location.href = 'coupons.html';
        } catch (error) {
            alert(`Operation failed: ${error.message}`);
            console.error("Coupon form submission error:", error);
        }
    });
});