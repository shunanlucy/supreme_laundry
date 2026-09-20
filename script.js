/* ==========================================================
   THE SUPREME LAUNDRY APP — JAVASCRIPT LOGIC
   Official Hotline: 9007895400
   ========================================================== */

// 1. DATA INITIALIZATION (Loaded from modular js/data.js)
var PRICE_DATABASE = window.PRICE_DATABASE || {};
var FEATURED_HOME_ITEMS = window.FEATURED_HOME_ITEMS || {};
var CATEGORY_META_LABELS = window.CATEGORY_META_LABELS || {};

// 2. USER CART & FILTER STATE (4 CORE CATEGORIES: IRON, MEN, WOMEN, HOME)
let cart = {}; // { itemId: { item, qty, price } }
let currentPriceCat = 'all'; // 'all', 'iron', 'men', 'women', 'home'
let currentPriceService = 'all'; // 'all', 'iron', 'wash', 'dry', 'prem'
let currentPriceQuery = '';
let currentHomeCat = 'iron';
let priceViewMode = 'grid'; // 'grid' (default uniform boxes) or 'table'

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

// 4. VIEW NAVIGATION
function switchView(viewId) {
    document.querySelectorAll('.app-view').forEach(view => {
        view.classList.remove('active');
    });

    const target = document.getElementById(viewId);
    if (target) target.classList.add('active');

    // Bottom nav
    document.querySelectorAll('.b-nav-item').forEach(btn => {
        btn.classList.remove('active');
    });

    // Top desktop nav
    document.querySelectorAll('.d-nav-link').forEach(link => {
        link.classList.remove('active');
    });

    const indexMap = {
        'view-home': 0,
        'view-pricing': 1,
        'view-track': 3,
        'view-tips': -1,
        'view-profile': 4
    };

    const activeIdx = indexMap[viewId];
    if (activeIdx !== undefined && activeIdx >= 0) {
        const mobileBtns = document.querySelectorAll('.app-bottom-nav .b-nav-item');
        if (mobileBtns[activeIdx]) mobileBtns[activeIdx].classList.add('active');
    }

    const desktopLinks = document.querySelectorAll('.d-nav-link');
    const desktopMap = {
        'view-home': 0,
        'view-pricing': 1,
        'view-track': 2,
        'view-tips': 3,
        'view-profile': 4
    };
    const dIdx = desktopMap[viewId];
    if (dIdx !== undefined && desktopLinks[dIdx]) {
        desktopLinks[dIdx].classList.add('active');
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// 5. PROPER RATE CHART FILTER SYSTEM
function filterByCat(catKey, btnElement) {
    currentPriceCat = catKey || 'all';
    document.querySelectorAll('#priceCategoryChips .filter-chip').forEach(btn => {
        btn.classList.remove('active');
    });
    if (btnElement) {
        btnElement.classList.add('active');
    } else {
        const target = document.querySelector(`#priceCategoryChips .filter-chip[data-cat="${catKey}"]`);
        if (target) target.classList.add('active');
    }
    applyPriceFilters();
}

function filterByService(serviceKey, btnElement) {
    currentPriceService = serviceKey || 'all';
    document.querySelectorAll('.service-type-bar .service-chip').forEach(btn => {
        btn.classList.remove('active');
    });
    if (btnElement) {
        btnElement.classList.add('active');
    } else {
        const target = document.querySelector(`.service-type-bar .service-chip[data-service="${serviceKey}"]`);
        if (target) target.classList.add('active');
    }
    applyPriceFilters();
}

function handlePriceSearch(query) {
    currentPriceQuery = (query || '').trim().toLowerCase();
    const clearBtn = document.getElementById('priceClearSearchBtn');
    if (clearBtn) {
        clearBtn.style.display = currentPriceQuery.length > 0 ? 'inline-flex' : 'none';
    }
    applyPriceFilters();
}

function clearPriceSearch() {
    const input = document.getElementById('priceFilterInput');
    if (input) input.value = '';
    currentPriceQuery = '';
    const clearBtn = document.getElementById('priceClearSearchBtn');
    if (clearBtn) clearBtn.style.display = 'none';
    applyPriceFilters();
}

function resetAllPriceFilters() {
    currentPriceCat = 'all';
    currentPriceService = 'all';
    currentPriceQuery = '';
    const input = document.getElementById('priceFilterInput');
    if (input) input.value = '';
    const clearBtn = document.getElementById('priceClearSearchBtn');
    if (clearBtn) clearBtn.style.display = 'none';

    document.querySelectorAll('#priceCategoryChips .filter-chip').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.cat === 'all');
    });
    document.querySelectorAll('.service-type-bar .service-chip').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.service === 'all');
    });

    applyPriceFilters();
}

function switchPriceTab(tabKey) {
    filterByCat(tabKey);
}

function setPriceViewMode(mode) {
    priceViewMode = mode || 'grid';
    const btnGrid = document.getElementById('btnViewGrid');
    const btnTable = document.getElementById('btnViewTable');
    const tableHeader = document.getElementById('rateTableHeader');
    const container = document.getElementById('priceListContainer');

    if (btnGrid) btnGrid.classList.toggle('active', priceViewMode === 'grid');
    if (btnTable) btnTable.classList.toggle('active', priceViewMode === 'table');

    if (tableHeader) {
        tableHeader.style.display = (priceViewMode === 'table') ? 'grid' : 'none';
    }

    if (container) {
        if (priceViewMode === 'grid') {
            container.classList.remove('rate-chart-list');
            container.classList.add('price-items-grid');
        } else {
            container.classList.remove('price-items-grid');
            container.classList.add('rate-chart-list');
        }
    }

    applyPriceFilters();
}

function generateCatalogCardHTML(item) {
    const qty = cart[item.id] ? cart[item.id].qty : 0;
    const defaultPrice = item.price || item.washPrice || item.dryPrice || 50;

    let badgeText = '';
    let priceText = '';

    if (item.price && item.dryPrice) {
        badgeText = `From ₹${item.price}`;
        priceText = `<span class="shp-label">Steam:</span> <strong>₹${item.price}</strong> • <span class="shp-label">Dry:</span> <strong>₹${item.dryPrice}</strong>`;
    } else if (item.price) {
        badgeText = `₹${item.price}${item.unit ? '/' + item.unit : '/pc'}`;
        priceText = `<span class="shp-label">Steam Press:</span> <strong>₹${item.price}</strong>`;
    } else if (item.washPrice && item.dryPrice) {
        badgeText = `From ₹${item.washPrice}`;
        priceText = `<span class="shp-label">Wash:</span> <strong>₹${item.washPrice}</strong> • <span class="shp-label">Dry:</span> <strong>₹${item.dryPrice}</strong>`;
    } else if (item.dryPrice) {
        badgeText = `From ₹${item.dryPrice}`;
        priceText = `<span class="shp-label">Dry Clean:</span> <strong>₹${item.dryPrice}</strong>`;
    }

    return `
        <div class="srv-box home-item-card catalog-item-card" id="item-card-${item.id}">
            <div class="srv-badge">${badgeText}</div>
            <div class="srv-icon-bg ${item.img ? 'with-img' : ''}">
                ${item.img 
                    ? `<img src="${item.img}" alt="${item.name}" class="srv-box-thumb">` 
                    : `<i class="fas ${item.icon || 'fa-tshirt'}"></i>`
                }
            </div>
            <h4>${item.name}</h4>
            <p class="srv-price-line">${priceText}</p>
            <div class="srv-card-action">
                ${qty > 0 ? `
                    <div class="srv-qty-counter">
                        <button class="srv-btn-minus" onclick="event.stopPropagation(); changeItemQty('${item.id}', -1, ${defaultPrice})" title="Reduce quantity"><i class="fas fa-minus"></i></button>
                        <span class="srv-qty-val">${qty}</span>
                        <button class="srv-btn-plus" onclick="event.stopPropagation(); changeItemQty('${item.id}', 1, ${defaultPrice})" title="Increase quantity"><i class="fas fa-plus"></i></button>
                    </div>
                ` : `
                    <button class="btn-add-srv" onclick="event.stopPropagation(); changeItemQty('${item.id}', 1, ${defaultPrice})" title="Add to Order">
                        <i class="fas fa-plus"></i> Add
                    </button>
                `}
            </div>
        </div>
    `;
}

function applyPriceFilters() {
    const container = document.getElementById('priceListContainer');
    const counterBadge = document.getElementById('rateItemsCount');
    if (!container) return;

    let items = [];
    if (currentPriceCat === 'all') {
        for (const cat in PRICE_DATABASE) {
            items = items.concat(PRICE_DATABASE[cat]);
        }
    } else {
        items = (PRICE_DATABASE[currentPriceCat] || []).slice();
    }

    // Filter by service type
    if (currentPriceService !== 'all') {
        if (currentPriceService === 'iron') {
            items = items.filter(x => !!x.price);
        } else if (currentPriceService === 'wash') {
            items = items.filter(x => !!x.washPrice);
        } else if (currentPriceService === 'dry') {
            items = items.filter(x => !!x.dryPrice);
        } else if (currentPriceService === 'prem') {
            items = items.filter(x => !!x.premPrice);
        }
    }

    // Filter by search query
    if (currentPriceQuery) {
        items = items.filter(x => {
            const nameMatch = x.name && x.name.toLowerCase().includes(currentPriceQuery);
            const catMatch = x.cat && x.cat.toLowerCase().includes(currentPriceQuery);
            return nameMatch || catMatch;
        });
    }

    if (counterBadge) {
        counterBadge.textContent = `Showing ${items.length} item${items.length === 1 ? '' : 's'}`;
    }

    if (items.length === 0) {
        container.innerHTML = `
            <div class="rate-chart-empty">
                <i class="fas fa-search"></i>
                <p>No garments match your current search / filter.</p>
                <button class="btn-reset-filters" onclick="resetAllPriceFilters()">Show All 92 Items</button>
            </div>
        `;
        return;
    }

    if (priceViewMode === 'grid') {
        container.innerHTML = items.map(item => generateCatalogCardHTML(item)).join('');
    } else {
        container.innerHTML = items.map(item => generateItemRowHTML(item)).join('');
    }
}

function generateItemRowHTML(item) {
    const qty = cart[item.id] ? cart[item.id].qty : 0;
    const defaultPrice = item.dryPrice || item.price || item.washPrice || 50;

    let ironCell = item.price 
        ? `<span class="rc-rate-val iron" title="Steam Press">₹${item.price}${item.unit ? '/' + item.unit : ''}</span>` 
        : `<span class="rc-rate-val na">—</span>`;

    let washCell = item.washPrice 
        ? `<span class="rc-rate-val wash" title="Wash & Iron">₹${item.washPrice}</span>` 
        : `<span class="rc-rate-val na">—</span>`;

    let dryCell = item.dryPrice 
        ? `<span class="rc-rate-val dry" title="Dry Clean">₹${item.dryPrice}${item.unit ? '/' + item.unit : ''}</span>` 
        : `<span class="rc-rate-val na">—</span>`;

    let premCell = item.premPrice 
        ? `<span class="rc-rate-val prem" title="Premium Care">₹${item.premPrice}</span>` 
        : `<span class="rc-rate-val na">—</span>`;

    return `
        <div class="rate-chart-row" id="item-card-${item.id}">
            <div class="rc-item-info">
                <div class="rc-thumb-wrap ${item.img ? 'with-img' : ''}">
                    ${item.img 
                        ? `<img src="${item.img}" alt="${item.name}" class="rc-thumb-img">` 
                        : `<i class="fas ${item.icon || 'fa-tshirt'}"></i>`
                    }
                </div>
                <div class="rc-text">
                    <h4>${item.name}</h4>
                    <span class="rc-cat-tag">${item.cat}</span>
                </div>
            </div>

            <!-- RATES GRID / CHART CELLS -->
            <div class="rc-rates-grid">
                <div class="rc-rate-col">
                    <span class="rc-mobile-lbl">Steam</span>
                    ${ironCell}
                </div>
                <div class="rc-rate-col">
                    <span class="rc-mobile-lbl">Wash</span>
                    ${washCell}
                </div>
                <div class="rc-rate-col">
                    <span class="rc-mobile-lbl">Dry Clean</span>
                    ${dryCell}
                </div>
                <div class="rc-rate-col">
                    <span class="rc-mobile-lbl">Premium</span>
                    ${premCell}
                </div>
            </div>

            <div class="rc-action-col">
                ${qty > 0 ? `
                    <div class="rc-counter">
                        <button class="rc-btn-minus" onclick="event.stopPropagation(); changeItemQty('${item.id}', -1, ${defaultPrice})" title="Reduce"><i class="fas fa-minus"></i></button>
                        <span class="rc-qty" id="qty-${item.id}">${qty}</span>
                        <button class="rc-btn-plus" onclick="event.stopPropagation(); changeItemQty('${item.id}', 1, ${defaultPrice})" title="Add"><i class="fas fa-plus"></i></button>
                    </div>
                ` : `
                    <button class="rc-add-btn" onclick="event.stopPropagation(); changeItemQty('${item.id}', 1, ${defaultPrice})" title="Add to Cart">
                        <i class="fas fa-plus"></i> Add
                    </button>
                `}
            </div>
        </div>
    `;
}

// 6. CART MANAGEMENT (Updates both mobile floating bar & desktop sticky sidebar)
function changeItemQty(itemId, delta, price) {
    // Find item across database
    let foundItem = null;
    for (const cat in PRICE_DATABASE) {
        const it = PRICE_DATABASE[cat].find(x => x.id === itemId);
        if (it) { foundItem = it; break; }
    }

    if (!foundItem) return;

    if (!cart[itemId]) {
        cart[itemId] = { item: foundItem, qty: 0, price: price || 50 };
    }

    cart[itemId].qty += delta;

    if (cart[itemId].qty <= 0) {
        delete cart[itemId];
    }

    updateCartUI();

    // Re-render single card counter in price catalog
    const card = document.getElementById(`item-card-${itemId}`);
    if (card) {
        if (priceViewMode === 'table') {
            card.outerHTML = generateItemRowHTML(foundItem);
        } else {
            card.outerHTML = generateCatalogCardHTML(foundItem);
        }
    }

    // Re-render home card counter if visible on Home screen
    const homeCard = document.getElementById(`home-card-${itemId}`);
    if (homeCard) {
        homeCard.outerHTML = generateHomeItemCardHTML(foundItem);
    }
}

const MIN_PICKUP_AMOUNT = 300;

function updateCartUI() {
    let totalItems = 0;
    let totalPrice = 0;
    let sidebarHTML = '';

    for (const id in cart) {
        const cItem = cart[id];
        totalItems += cItem.qty;
        const lineTotal = cItem.qty * cItem.price;
        totalPrice += lineTotal;
        sidebarHTML += `
            <div class="dcc-item-row">
                <div style="flex:1; min-width:0; margin-right:8px;">
                    <strong style="display:block; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${cItem.item.name}</strong>
                    <div style="font-size:0.72rem; color:#94a3b8;">₹${cItem.price}/pc</div>
                </div>
                <div style="display:flex; align-items:center; gap:8px;">
                    <div class="sheet-qty-ctrl" style="padding:1px 3px; gap:4px;">
                        <button type="button" class="sq-btn minus ${cItem.qty === 1 ? 'trash' : ''}" onclick="event.stopPropagation(); changeItemQty('${cItem.item.id}', -1, ${cItem.price})" title="${cItem.qty === 1 ? 'Remove' : 'Reduce'}" style="width:20px; height:20px; font-size:0.65rem;">
                            <i class="fas ${cItem.qty === 1 ? 'fa-trash' : 'fa-minus'}"></i>
                        </button>
                        <span class="sq-val" style="font-size:0.75rem; min-width:14px;">${cItem.qty}</span>
                        <button type="button" class="sq-btn plus" onclick="event.stopPropagation(); changeItemQty('${cItem.item.id}', 1, ${cItem.price})" title="Add" style="width:20px; height:20px; font-size:0.65rem;">
                            <i class="fas fa-plus"></i>
                        </button>
                    </div>
                    <strong style="min-width:44px; text-align:right;">₹${lineTotal}</strong>
                </div>
            </div>
        `;
    }

    // 1. Mobile Floating Bar
    const floatingBar = document.getElementById('cartFloatingBar');
    const countBubble = document.getElementById('cfbItemCount');
    const priceText = document.getElementById('cfbTotalPrice');
    const clearCartBtn = document.getElementById('clearCartBtn');

    if (floatingBar && countBubble && priceText) {
        if (totalItems > 0) {
            floatingBar.classList.add('show');
            countBubble.textContent = totalItems;
            priceText.textContent = `₹${totalPrice}`;
            if (clearCartBtn) clearCartBtn.style.display = 'block';
        } else {
            floatingBar.classList.remove('show');
            if (clearCartBtn) clearCartBtn.style.display = 'none';
        }
    }

    // 2. Desktop Sticky Sidebar Cart
    const dccCountBadge = document.getElementById('dccCountBadge');
    const dccItemsList = document.getElementById('dccItemsList');
    const dccTotalAmount = document.getElementById('dccTotalAmount');
    const dccFreePickup = document.querySelector('.dcc-free-pickup');

    if (dccCountBadge && dccItemsList && dccTotalAmount) {
        dccCountBadge.textContent = `${totalItems} Items`;
        dccTotalAmount.textContent = `₹${totalPrice}`;

        if (totalItems > 0) {
            dccItemsList.innerHTML = sidebarHTML;
        } else {
            dccItemsList.innerHTML = `
                <div class="dcc-empty">
                    <i class="fas fa-tshirt"></i>
                    <p>No garments selected yet.<br>Click <strong>+</strong> on any garment to add to your order.</p>
                </div>
            `;
        }
    }

    if (dccFreePickup) {
        if (totalPrice >= MIN_PICKUP_AMOUNT) {
            dccFreePickup.innerHTML = `<i class="fas fa-check-circle"></i> FREE Pickup &amp; Delivery Included`;
            dccFreePickup.style.color = '#16a34a';
        } else if (totalPrice > 0) {
            dccFreePickup.innerHTML = `<i class="fas fa-truck"></i> Pickup above ₹${MIN_PICKUP_AMOUNT} (Add ₹${MIN_PICKUP_AMOUNT - totalPrice} more)`;
            dccFreePickup.style.color = '#d97706';
        } else {
            dccFreePickup.innerHTML = `<i class="fas fa-truck"></i> FREE Pickup on orders above ₹${MIN_PICKUP_AMOUNT}`;
            dccFreePickup.style.color = '#64748b';
        }
    }

    // 3. Keep Modal Summary in sync whenever cart changes
    renderModalSummary();
}

function clearCart() {
    cart = {};
    updateCartUI();
    applyPriceFilters();
    renderHomeCategoryItems(currentHomeCat);
}

// 7. FILTER & SEARCH
function filterCurrentTabItems(query) {
    const container = document.getElementById('priceListContainer');
    const items = PRICE_DATABASE[currentPriceTab] || [];
    const filtered = items.filter(x => x.name.toLowerCase().includes(query));
    container.innerHTML = filtered.length > 0 
        ? filtered.map(item => generateItemRowHTML(item)).join('')
        : `<p style="text-align:center; color:#94a3b8; padding:20px; font-size:0.85rem;">No items matching "${query}"</p>`;
}

function filterAllItems(query) {
    const container = document.getElementById('priceListContainer');
    let allMatches = [];
    for (const cat in PRICE_DATABASE) {
        const matches = PRICE_DATABASE[cat].filter(x => x.name.toLowerCase().includes(query));
        allMatches = allMatches.concat(matches);
    }

    container.innerHTML = allMatches.length > 0
        ? allMatches.map(item => generateItemRowHTML(item)).join('')
        : `<p style="text-align:center; color:#94a3b8; padding:20px; font-size:0.85rem;">No garments found matching "${query}"</p>`;
}

function filterByCat(catKey, element) {
    currentPriceCat = catKey || 'all';

    document.querySelectorAll('#priceCategoryChips .filter-chip').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.cat === currentPriceCat);
    });

    applyPriceFilters();
}

function selectServiceCategory(cat) {
    filterByCat(cat);
}

// 7.1 HOME DYNAMIC CATEGORY ITEMS & VIEW ALL SPECIFIC PAGE
function selectHomeCategory(catKey, element) {
    currentHomeCat = catKey || 'iron';

    // Highlight circular active pill on Home (4 Categories)
    document.querySelectorAll('.four-cat-strip .cat-pill, .three-cat-strip .cat-pill, .category-scroll-strip .cat-pill').forEach(pill => {
        pill.classList.remove('active');
    });

    if (element) {
        element.classList.add('active');
    } else {
        const p = document.getElementById(`home-pill-${catKey}`);
        if (p) p.classList.add('active');
    }

    renderHomeCategoryItems(currentHomeCat);
}

function renderHomeCategoryItems(catKey) {
    const container = document.getElementById('homeCategoryItemsContainer');
    if (!container) return;

    const ids = FEATURED_HOME_ITEMS[catKey] || [];
    const catList = PRICE_DATABASE[catKey] || [];
    const items = ids.map(id => catList.find(x => x.id === id)).filter(Boolean);

    container.innerHTML = items.map(item => generateHomeItemCardHTML(item)).join('');

    // Update the small View More button below the 4 cards
    const btn = document.getElementById('btnHomeViewAll');
    if (btn && CATEGORY_META_LABELS[catKey]) {
        btn.innerHTML = `<span>View More in ${CATEGORY_META_LABELS[catKey].label}</span> <i class="fas fa-arrow-right"></i>`;
    }
}

function generateHomeItemCardHTML(item) {
    const qty = cart[item.id] ? cart[item.id].qty : 0;
    const defaultPrice = item.price || item.washPrice || item.dryPrice || 50;

    let badgeText = '';
    let priceText = '';

    if (item.price && item.dryPrice) {
        badgeText = `From ₹${item.price}`;
        priceText = `<span class="shp-label">Steam:</span> <strong>₹${item.price}</strong> • <span class="shp-label">Dry:</span> <strong>₹${item.dryPrice}</strong>`;
    } else if (item.price) {
        badgeText = `₹${item.price}/${item.unit || 'pc'}`;
        priceText = `<span class="shp-label">Steam Press:</span> <strong>₹${item.price}</strong>`;
    } else if (item.washPrice && item.dryPrice) {
        badgeText = `From ₹${item.washPrice}`;
        priceText = `<span class="shp-label">Wash:</span> <strong>₹${item.washPrice}</strong> • <span class="shp-label">Dry:</span> <strong>₹${item.dryPrice}</strong>`;
    } else if (item.dryPrice) {
        badgeText = `From ₹${item.dryPrice}`;
        priceText = `<span class="shp-label">Soft Dry Clean:</span> <strong>₹${item.dryPrice}</strong>`;
    }

    return `
        <div class="srv-box home-item-card" id="home-card-${item.id}">
            <div class="srv-badge">${badgeText}</div>
            ${item.img ? `
                <div class="srv-icon-bg with-img">
                    <img src="${item.img}" alt="${item.name}" class="srv-box-thumb">
                </div>
            ` : `
                <div class="srv-icon-bg"><i class="fas ${item.icon || 'fa-tshirt'}"></i></div>
            `}
            <h4>${item.name}</h4>
            <p class="srv-price-line">${priceText}</p>
            <div class="srv-card-action">
                ${qty > 0 ? `
                    <div class="srv-qty-counter">
                        <button class="srv-btn-minus" onclick="event.stopPropagation(); changeItemQty('${item.id}', -1, ${defaultPrice})" title="Reduce quantity"><i class="fas fa-minus"></i></button>
                        <span class="srv-qty-val">${qty}</span>
                        <button class="srv-btn-plus" onclick="event.stopPropagation(); changeItemQty('${item.id}', 1, ${defaultPrice})" title="Increase quantity"><i class="fas fa-plus"></i></button>
                    </div>
                ` : `
                    <button class="btn-add-srv" onclick="event.stopPropagation(); changeItemQty('${item.id}', 1, ${defaultPrice})" title="Add to Order">
                        <i class="fas fa-plus"></i> Add
                    </button>
                `}
            </div>
        </div>
    `;
}

function openCategoryFullPage(catKey) {
    switchView('view-pricing');
    filterByCat(catKey || 'men');
    window.scrollTo({ top: 100, behavior: 'smooth' });
}

// 8. ORDER & BOOKING BOTTOM SHEET MODAL (Interactive Order Editing & Pickup Threshold)
function renderModalSummary() {
    const summaryContainer = document.getElementById('orderItemsSummary');
    if (!summaryContainer) return;

    let totalItems = 0;
    let totalPrice = 0;
    let itemsHTML = '';

    for (const id in cart) {
        const cItem = cart[id];
        totalItems += cItem.qty;
        const lineTotal = cItem.qty * cItem.price;
        totalPrice += lineTotal;

        itemsHTML += `
            <div class="sheet-item-row" id="sheet-item-${cItem.item.id}">
                <div class="sheet-item-info">
                    <span class="sheet-item-name">${cItem.item.name}</span>
                    <span class="sheet-item-unit-price">₹${cItem.price}/pc</span>
                </div>
                <div class="sheet-item-actions">
                    <div class="sheet-qty-ctrl">
                        <button type="button" class="sq-btn minus ${cItem.qty === 1 ? 'trash' : ''}" onclick="event.stopPropagation(); changeItemQty('${cItem.item.id}', -1, ${cItem.price})" title="${cItem.qty === 1 ? 'Remove item' : 'Reduce quantity'}">
                            <i class="fas ${cItem.qty === 1 ? 'fa-trash' : 'fa-minus'}"></i>
                        </button>
                        <span class="sq-val">${cItem.qty}</span>
                        <button type="button" class="sq-btn plus" onclick="event.stopPropagation(); changeItemQty('${cItem.item.id}', 1, ${cItem.price})" title="Increase quantity">
                            <i class="fas fa-plus"></i>
                        </button>
                    </div>
                    <div class="sheet-item-total">₹${lineTotal}</div>
                </div>
            </div>
        `;
    }

    if (totalItems > 0) {
        let thresholdHTML = '';
        // 300 ke upar raha toh kuch nahi, 300 ke niche rahe toh show kare kitne ka aur add kiya toh pickup milega
        if (totalPrice < MIN_PICKUP_AMOUNT) {
            const deficit = MIN_PICKUP_AMOUNT - totalPrice;
            const progress = Math.min(100, Math.round((totalPrice / MIN_PICKUP_AMOUNT) * 100));
            thresholdHTML = `
                <div class="sheet-pickup-threshold-box">
                    <div class="stb-info-line">
                        <i class="fas fa-truck"></i>
                        <span>Doorstep Pickup &amp; Drop available above <strong>₹${MIN_PICKUP_AMOUNT}</strong></span>
                    </div>
                    <div class="stb-progress-track">
                        <div class="stb-progress-fill" style="width: ${progress}%"></div>
                    </div>
                    <div class="stb-add-more-hint">
                        Add garments worth <strong>₹${deficit}</strong> more to unlock Doorstep Pickup!
                    </div>
                </div>
            `;
        }

        summaryContainer.innerHTML = `
            <div class="sheet-summary-top">
                <div class="sheet-summary-title">
                    <i class="fas fa-shopping-bag"></i> Order Items (${totalItems} pcs)
                </div>
                <button type="button" class="sheet-summary-clear" onclick="clearCart()" title="Remove all items">
                    <i class="fas fa-trash-alt"></i> Clear All
                </button>
            </div>
            <div class="sheet-items-scroll">
                ${itemsHTML}
            </div>
            <div class="sheet-total-bar">
                <span>Estimated Total:</span>
                <strong class="stb-amount">₹${totalPrice}</strong>
            </div>
            ${thresholdHTML}
        `;
    } else {
        summaryContainer.innerHTML = `
            <div class="sheet-empty-state">
                <i class="fas fa-tshirt"></i>
                <p><strong>No garments pre-selected</strong><br><span style="font-size:0.75rem; color:#94a3b8;">Our rider can count &amp; weigh garments at your doorstep.</span></p>
                <div class="sheet-pickup-threshold-box" style="margin-bottom: 12px; text-align: left;">
                    <div class="stb-info-line">
                        <i class="fas fa-truck"></i>
                        <span>Doorstep Pickup &amp; Drop available on orders above <strong>₹${MIN_PICKUP_AMOUNT}</strong></span>
                    </div>
                </div>
                <button type="button" class="btn-sheet-browse" onclick="closeOrderModal(); switchView('view-pricing')">
                    <i class="fas fa-plus"></i> Browse Price List &amp; Add Items
                </button>
            </div>
        `;
    }
}

function openOrderModal() {
    renderModalSummary();
    const backdrop = document.getElementById('orderModalBackdrop');
    const sheet = document.getElementById('orderBottomSheet');
    backdrop.classList.add('show');
    sheet.classList.add('show');
}

function quickScheduleModal() {
    openOrderModal();
}

function closeOrderModal() {
    const backdrop = document.getElementById('orderModalBackdrop');
    const sheet = document.getElementById('orderBottomSheet');
    backdrop.classList.remove('show');
    sheet.classList.remove('show');
}

// 9. WHATSAPP & CALL SUBMISSION (9007895400)
function handleOrderSubmit(e) {
    e.preventDefault();

    const name = document.getElementById('custName').value.trim();
    const phone = document.getElementById('custPhone').value.trim();
    const address = document.getElementById('custAddress').value.trim();
    const date = document.getElementById('custDate').value;
    const slot = document.getElementById('custSlot').value;
    const speed = document.getElementById('custSpeed').value;

    let itemsText = '';
    let totalItems = 0;
    let totalPrice = 0;

    for (const id in cart) {
        const entry = cart[id];
        totalItems += entry.qty;
        totalPrice += entry.qty * entry.price;
        itemsText += `  • ${entry.item.name} (${entry.qty} pcs) - ₹${entry.qty * entry.price}\n`;
    }

    let message = `*NEW LAUNDRY PICKUP BOOKING*\n`;
    message += `--------------------------------\n`;
    message += `👤 *Customer:* ${name}\n`;
    message += `📞 *Phone:* ${phone}\n`;
    message += `📍 *Pickup Address:* ${address}\n`;
    message += `📅 *Date:* ${date} (${slot})\n`;
    message += `⚡ *Service Speed:* ${speed === 'express' ? 'Express (+50%)' : 'Standard 24-48h'}\n`;

    if (totalItems > 0) {
        message += `--------------------------------\n`;
        message += `🧺 *Estimated Items (${totalItems} pcs):*\n${itemsText}`;
        message += `💰 *Estimated Total:* ₹${totalPrice}\n`;
        if (totalPrice < MIN_PICKUP_AMOUNT) {
            message += `ℹ️ *Note:* Min order for doorstep pickup is ₹${MIN_PICKUP_AMOUNT} (Short by ₹${MIN_PICKUP_AMOUNT - totalPrice})\n`;
        } else {
            message += `✅ *Free Doorstep Pickup & Delivery Included*\n`;
        }
    } else {
        message += `🧺 *Items:* Count at doorstep\n`;
    }

    message += `--------------------------------\n`;
    message += `Sent via The Supreme Laundry App`;

    // WhatsApp official number: 9007895400
    const waURL = `https://wa.me/919007895400?text=${encodeURIComponent(message)}`;
    window.open(waURL, '_blank');

    closeOrderModal();
    alert(`Thank you ${name}! Your pickup request has been forwarded to The Supreme Laundry (9007895400) on WhatsApp.`);
}

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

// 11. ACCORDION TOGGLE
function toggleAcc(headerEl) {
    const group = headerEl.parentElement;
    const isActive = group.classList.contains('active');
    
    // Close other accordions in the same list
    group.parentElement.querySelectorAll('.acc-group').forEach(g => g.classList.remove('active'));

    if (!isActive) {
        group.classList.add('active');
    }
}

// 12. HERO PROMO 4-SLIDE CAROUSEL CONTROLLER
let heroSlideIndex = 0;
let heroCarouselTimer = null;

function getHeroSlides() {
    return document.querySelectorAll('.promo-banner-slide');
}

function getHeroDots() {
    return document.querySelectorAll('#heroCarouselDots .c-dot');
}

function updateHeroDots(index) {
    const dots = getHeroDots();
    dots.forEach((d, i) => {
        d.classList.toggle('active', i === index);
    });
}

function goToHeroSlide(index) {
    const track = document.getElementById('heroCarouselTrack');
    const slides = getHeroSlides();
    if (!track || slides.length === 0) return;
    
    heroSlideIndex = (index + slides.length) % slides.length;
    const targetSlide = slides[heroSlideIndex];
    if (targetSlide) {
        track.scrollTo({
            left: targetSlide.offsetLeft - track.offsetLeft,
            behavior: 'smooth'
        });
    }
    updateHeroDots(heroSlideIndex);
}

function scrollHeroCarousel(direction) {
    const slides = getHeroSlides();
    if (slides.length === 0) return;
    goToHeroSlide(heroSlideIndex + direction);
}

function initHeroCarousel() {
    const track = document.getElementById('heroCarouselTrack');
    const wrapper = document.getElementById('heroCarouselWrapper');
    if (!track) return;

    // Detect user swipe / scroll to update active dot
    track.addEventListener('scroll', () => {
        const slides = getHeroSlides();
        const scrollLeft = track.scrollLeft;
        let closestIndex = 0;
        let minDiff = Infinity;
        
        slides.forEach((slide, i) => {
            const diff = Math.abs((slide.offsetLeft - track.offsetLeft) - scrollLeft);
            if (diff < minDiff) {
                minDiff = diff;
                closestIndex = i;
            }
        });
        
        if (closestIndex !== heroSlideIndex) {
            heroSlideIndex = closestIndex;
            updateHeroDots(heroSlideIndex);
        }
    }, { passive: true });

    // Auto rotate every 4.5s
    function startAutoSlide() {
        stopAutoSlide();
        heroCarouselTimer = setInterval(() => {
            scrollHeroCarousel(1);
        }, 4500);
    }

    function stopAutoSlide() {
        if (heroCarouselTimer) {
            clearInterval(heroCarouselTimer);
            heroCarouselTimer = null;
        }
    }

    if (wrapper) {
        wrapper.addEventListener('mouseenter', stopAutoSlide);
        wrapper.addEventListener('mouseleave', startAutoSlide);
        wrapper.addEventListener('touchstart', stopAutoSlide, { passive: true });
        wrapper.addEventListener('touchend', startAutoSlide, { passive: true });
    }

    startAutoSlide();
}

// 12. LAUNDRY BEST PRACTICES & SPECIALTIES CAROUSEL CONTROLLER
let tipsSlideIndex = 0;

function getTipsSlides() {
    return document.querySelectorAll('.tips-carousel-card');
}

function getTipsDots() {
    return document.querySelectorAll('#tipsCarouselDots .c-dot');
}

function updateTipsDots(index) {
    const dots = getTipsDots();
    dots.forEach((d, i) => {
        d.classList.toggle('active', i === index);
    });
}

function goToTipsSlide(index) {
    const track = document.getElementById('tipsCarouselTrack');
    const slides = getTipsSlides();
    if (!track || slides.length === 0) return;

    tipsSlideIndex = (index + slides.length) % slides.length;
    const targetSlide = slides[tipsSlideIndex];
    if (targetSlide) {
        track.scrollTo({
            left: targetSlide.offsetLeft - track.offsetLeft,
            behavior: 'smooth'
        });
    }
    updateTipsDots(tipsSlideIndex);
}

function scrollTipsCarousel(direction) {
    const slides = getTipsSlides();
    if (slides.length === 0) return;
    goToTipsSlide(tipsSlideIndex + direction);
}

function initTipsCarousel() {
    const track = document.getElementById('tipsCarouselTrack');
    if (!track) return;

    track.addEventListener('scroll', () => {
        const slides = getTipsSlides();
        const scrollLeft = track.scrollLeft;
        let closestIndex = 0;
        let minDiff = Infinity;

        slides.forEach((slide, i) => {
            const diff = Math.abs((slide.offsetLeft - track.offsetLeft) - scrollLeft);
            if (diff < minDiff) {
                minDiff = diff;
                closestIndex = i;
            }
        });

        if (closestIndex !== tipsSlideIndex) {
            tipsSlideIndex = closestIndex;
            updateTipsDots(tipsSlideIndex);
        }
    }, { passive: true });
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    initHeroCarousel();
    initTipsCarousel();
    selectHomeCategory('iron');
});
