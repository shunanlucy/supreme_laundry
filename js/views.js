/* ==========================================================
   THE SUPREME LAUNDRY — VIEW NAVIGATION & CATALOGUE EXPLORER
   - View Navigation (switchView)
   - Rate Chart Category & Service Filters
   - Live Search Filtering
   - Grid View & Table View Toggles
   - Home Category Selection & Featured Items Grid
   ========================================================== */

let currentPriceCat = 'all';
let currentPriceService = 'all';
let currentPriceQuery = '';
let currentHomeCat = 'iron';
let priceViewMode = 'grid';


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
    const isSteamIron = item.cat === 'Steam Iron' || (!item.washPrice && !item.dryPrice && !item.premPrice);
    const ironKey = `${item.id}_iron`;
    const ironQty = cart[ironKey] ? cart[ironKey].qty : 0;
    const totalInCart = Object.values(cart).filter(c => c.itemId === item.id).reduce((sum, c) => sum + c.qty, 0);

    let badgeText = '';
    let priceText = '';

    if (item.price && item.dryPrice) {
        badgeText = `From ₹${item.price}`;
        priceText = `<span class="shp-label">Steam:</span> <strong>₹${item.price}</strong> • <span class="shp-label">Dry:</span> <strong>₹${item.dryPrice}</strong>`;
    } else if (item.price) {
        badgeText = `₹${item.price}${item.plus ? '+' : ''}${item.unit ? '/' + item.unit : '/pc'}`;
        priceText = `<span class="shp-label">Steam Press:</span> <strong>₹${item.price}${item.plus ? '+' : ''}</strong>`;
    } else if (item.washPrice && item.dryPrice) {
        badgeText = `From ₹${item.washPrice}`;
        priceText = `<span class="shp-label">Wash:</span> <strong>₹${item.washPrice}</strong> • <span class="shp-label">Dry:</span> <strong>₹${item.dryPrice}</strong>`;
    } else if (item.dryPrice) {
        badgeText = item.unit ? `₹${item.dryPrice}/${item.unit}` : `From ₹${item.dryPrice}`;
        priceText = `<span class="shp-label">Dry Clean:</span> <strong>₹${item.dryPrice}${item.unit ? ' / ' + item.unit : ''}</strong>`;
    }

    let actionButtonHTML = '';
    if (isSteamIron) {
        if (ironQty > 0) {
            actionButtonHTML = `
                <div class="srv-qty-counter">
                    <button class="srv-btn-minus" onclick="event.stopPropagation(); changeItemQty('${ironKey}', -1)" title="Reduce quantity"><i class="fas fa-minus"></i></button>
                    <span class="srv-qty-val">${ironQty}</span>
                    <button class="srv-btn-plus" onclick="event.stopPropagation(); changeItemQty('${ironKey}', 1)" title="Increase quantity"><i class="fas fa-plus"></i></button>
                </div>
            `;
        } else {
            actionButtonHTML = `
                <button class="btn-add-srv" onclick="event.stopPropagation(); changeItemQty('${item.id}', 1, ${item.price})" title="Add Steam Iron">
                    <i class="fas fa-plus"></i> Add
                </button>
            `;
        }
    } else {
        if (totalInCart > 0) {
            actionButtonHTML = `
                <button class="btn-add-srv added-custom" onclick="event.stopPropagation(); openCustomizerModal('${item.id}')" title="Choose Care Service / Add More">
                    <i class="fas fa-check"></i> Added (${totalInCart}) <span class="custom-hint">• Add</span>
                </button>
            `;
        } else {
            actionButtonHTML = `
                <button class="btn-add-srv" onclick="event.stopPropagation(); openCustomizerModal('${item.id}')" title="Choose Care Service">
                    <i class="fas fa-plus"></i> Add
                </button>
            `;
        }
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
                ${actionButtonHTML}
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
                <button class="btn-reset-filters" onclick="resetAllPriceFilters()">Show All Items</button>
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
    const isSteamIron = item.cat === 'Steam Iron' || (!item.washPrice && !item.dryPrice && !item.premPrice);
    const ironKey = `${item.id}_iron`;
    const ironQty = cart[ironKey] ? cart[ironKey].qty : 0;
    const totalInCart = Object.values(cart).filter(c => c.itemId === item.id).reduce((sum, c) => sum + c.qty, 0);

    let ironCell = item.price 
        ? `<span class="rc-rate-val iron" title="Steam Press">₹${item.price}${item.plus ? '+' : ''}${item.unit ? '/' + item.unit : ''}</span>` 
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

    let actionHTML = '';
    if (isSteamIron) {
        if (ironQty > 0) {
            actionHTML = `
                <div class="rc-counter">
                    <button class="rc-btn-minus" onclick="event.stopPropagation(); changeItemQty('${ironKey}', -1)" title="Reduce"><i class="fas fa-minus"></i></button>
                    <span class="rc-qty" id="qty-${item.id}">${ironQty}</span>
                    <button class="rc-btn-plus" onclick="event.stopPropagation(); changeItemQty('${ironKey}', 1)" title="Add"><i class="fas fa-plus"></i></button>
                </div>
            `;
        } else {
            actionHTML = `
                <button class="rc-add-btn" onclick="event.stopPropagation(); changeItemQty('${item.id}', 1, ${item.price})" title="Add to Cart">
                    <i class="fas fa-plus"></i> Add
                </button>
            `;
        }
    } else {
        if (totalInCart > 0) {
            actionHTML = `
                <button class="rc-add-btn added" onclick="event.stopPropagation(); openCustomizerModal('${item.id}')" title="Choose Care Service">
                    <i class="fas fa-check"></i> (${totalInCart}) Add
                </button>
            `;
        } else {
            actionHTML = `
                <button class="rc-add-btn" onclick="event.stopPropagation(); openCustomizerModal('${item.id}')" title="Choose Care Service">
                    <i class="fas fa-plus"></i> Add
                </button>
            `;
        }
    }

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
                ${actionHTML}
            </div>
        </div>
    `;
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
    const isSteamIron = item.cat === 'Steam Iron' || (!item.washPrice && !item.dryPrice && !item.premPrice);
    const ironKey = `${item.id}_iron`;
    const ironQty = cart[ironKey] ? cart[ironKey].qty : 0;
    const totalInCart = Object.values(cart).filter(c => c.itemId === item.id).reduce((sum, c) => sum + c.qty, 0);

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
        priceText = `<span class="shp-label">Soft Dry Clean:</span> <strong>₹${item.dryPrice}${item.unit ? '/' + item.unit : ''}</strong>`;
    }

    let actionButtonHTML = '';
    if (isSteamIron) {
        if (ironQty > 0) {
            actionButtonHTML = `
                <div class="srv-qty-counter">
                    <button class="srv-btn-minus" onclick="event.stopPropagation(); changeItemQty('${ironKey}', -1)" title="Reduce quantity"><i class="fas fa-minus"></i></button>
                    <span class="srv-qty-val">${ironQty}</span>
                    <button class="srv-btn-plus" onclick="event.stopPropagation(); changeItemQty('${ironKey}', 1)" title="Increase quantity"><i class="fas fa-plus"></i></button>
                </div>
            `;
        } else {
            actionButtonHTML = `
                <button class="btn-add-srv" onclick="event.stopPropagation(); changeItemQty('${item.id}', 1, ${item.price})" title="Add Steam Iron">
                    <i class="fas fa-plus"></i> Add
                </button>
            `;
        }
    } else {
        if (totalInCart > 0) {
            actionButtonHTML = `
                <button class="btn-add-srv added-custom" onclick="event.stopPropagation(); openCustomizerModal('${item.id}')" title="Choose Care Service / Add More">
                    <i class="fas fa-check"></i> Added (${totalInCart}) <span class="custom-hint">• Add</span>
                </button>
            `;
        } else {
            actionButtonHTML = `
                <button class="btn-add-srv" onclick="event.stopPropagation(); openCustomizerModal('${item.id}')" title="Choose Care Service">
                    <i class="fas fa-plus"></i> Add
                </button>
            `;
        }
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
                ${actionButtonHTML}
            </div>
        </div>
    `;
}

function openCategoryFullPage(catKey) {
    switchView('view-pricing');
    filterByCat(catKey || 'men');
    window.scrollTo({ top: 100, behavior: 'smooth' });
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
