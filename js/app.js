/* ==========================================================
   THE SUPREME LAUNDRY — MAIN APPLICATION ENTRYPOINT
   - DOMContentLoaded Initialization
   - Global Event Listeners & Header Search
   - Notification Alert & Order Timeline Simulator
   ========================================================== */


// 3. INITIALIZE APP
document.addEventListener('DOMContentLoaded', () => {
    setPriceViewMode('grid');
    selectHomeCategory('iron');

    // Date picker set to today by default
    const dateInput = document.getElementById('custDate');
    if (dateInput) {
        const today = new Date().toISOString().split('T')[0];
        dateInput.value = today;
        dateInput.min = today;
    }

    // Search filter in header
    const searchInput = document.getElementById('serviceSearch');
    const clearSearch = document.getElementById('clearSearch');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const val = e.target.value.trim().toLowerCase();
            if (val.length > 0) {
                clearSearch.style.display = 'block';
                switchView('view-pricing');
                handlePriceSearch(val);
                const priceInput = document.getElementById('priceFilterInput');
                if (priceInput) priceInput.value = val;
            } else {
                clearSearch.style.display = 'none';
                clearPriceSearch();
            }
        });

        clearSearch.addEventListener('click', () => {
            searchInput.value = '';
            clearSearch.style.display = 'none';
            clearPriceSearch();
        });
    }

    // Notification bell alert
    const notifBell = document.getElementById('notifBell');
    if (notifBell) {
        notifBell.addEventListener('click', () => {
            alert("🎉 The Supreme Laundry Offer:\n\n• Flat 20% OFF on your first booking!\n• FREE Doorstep Pickup & Delivery in Action Area 2 & New Town.\n• Call/WhatsApp: 9007895400");
        });
    }
});


// 10. TIMELINE SIMULATOR
function simulateTrack() {
    const inputVal = document.getElementById('trackInput').value.trim();
    if (!inputVal) {
        alert("Please enter your Order ID or phone number.");
        return;
    }
    document.getElementById('displayOrderId').textContent = `Order #${inputVal.toUpperCase()}`;
    alert(`Tracking order for ${inputVal}: Current status is 'In Process - Washing & Steam Ironing'. Scheduled delivery within 24-48 hrs.`);
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    if (typeof initHeroCarousel === 'function') initHeroCarousel();
    if (typeof initTipsCarousel === 'function') initTipsCarousel();
    if (typeof selectHomeCategory === 'function') selectHomeCategory('iron');
});
