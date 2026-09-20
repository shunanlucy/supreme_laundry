/* ==========================================================
   THE SUPREME LAUNDRY — CART & ORDER BOOKING MODULE
   - Cart State & Unique Service Keying (item_id + serviceType)
   - Zomato-Style Service Customizer Modal (Wash, Soft Dry, Premium Dry)
   - Direct Add for Steam Iron Items
   - Floating Cart Bar & Desktop Sticky Cart
   - Order Summary Modal & Interactive Order Editing (+/-)
   - ₹300 Pickup Threshold Indicator & Deficit Logic
   - WhatsApp & Direct Call Order Submission (9007895400)
   ========================================================== */

let cart = {}; // Keyed by: `${itemId}_${serviceType}` => { key, itemId, item, serviceType, serviceLabel, price, qty }
const MIN_PICKUP_AMOUNT = 300;

// Customizer Modal State
let activeCustomizerItem = null;
let activeCustomizerType = 'dry';
let activeCustomizerPrice = 0;
let customizerQty = 1;

// Helper: Find item anywhere in PRICE_DATABASE
function findItemById(itemId) {
    if (!window.PRICE_DATABASE) return null;
    for (const cat in window.PRICE_DATABASE) {
        const it = window.PRICE_DATABASE[cat].find(x => x.id === itemId);
        if (it) return it;
    }
    return null;
}

// 1. ZOMATO-STYLE CUSTOMIZER MODAL
function openCustomizerModal(itemId) {
    const item = findItemById(itemId);
    if (!item) return;

    activeCustomizerItem = item;
    customizerQty = 1;

    // Header info
    const nameEl = document.getElementById('czItemName');
    const catEl = document.getElementById('czItemCat');
    const thumbWrap = document.getElementById('czThumbWrap');
    const qtyVal = document.getElementById('czQtyVal');

    if (nameEl) nameEl.textContent = item.name;
    if (catEl) catEl.textContent = item.cat || 'Fabric Care';
    if (qtyVal) qtyVal.textContent = '1';

    if (thumbWrap) {
        thumbWrap.innerHTML = item.img 
            ? `<img src="${item.img}" alt="${item.name}">`
            : `<i class="fas ${item.icon || 'fa-tshirt'}"></i>`;
    }

    // Build 3 standard fabric care options
    const options = [
        {
            type: 'wash',
            label: 'Soft Wash & Iron',
            tag: 'wash',
            desc: 'Antiseptic solvent wash + razor-sharp steam press',
            price: item.washPrice,
            available: !!item.washPrice
        },
        {
            type: 'dry',
            label: 'Soft Dry Clean',
            tag: 'dry',
            desc: 'Gentle zero-shrink delicate dry-cleaning & stain treatment',
            price: item.dryPrice,
            available: !!item.dryPrice
        },
        {
            type: 'prem',
            label: 'Premium Dry Clean',
            tag: 'prem',
            desc: 'Artisan fabric spa, hand press & dust-free hanger packing',
            price: item.premPrice,
            available: !!item.premPrice
        }
    ];

    // Auto-select preferred option: dry clean if available, else first available
    const preferred = options.find(o => o.available && o.type === 'dry') || options.find(o => o.available);
    if (preferred) {
        activeCustomizerType = preferred.type;
        activeCustomizerPrice = preferred.price;
    } else {
        activeCustomizerType = null;
        activeCustomizerPrice = 0;
    }

    renderCustomizerOptions(options);
    updateCustomizerTotal();

    // Show modal & backdrop
    const backdrop = document.getElementById('customizerBackdrop');
    const sheet = document.getElementById('customizerBottomSheet');
    if (backdrop && sheet) {
        backdrop.classList.add('show');
        sheet.classList.add('show');
    }
}

function renderCustomizerOptions(options) {
    const container = document.getElementById('czOptionsList');
    if (!container) return;

    container.innerHTML = options.map(opt => {
        if (!opt.available) {
            return `
                <div class="cz-option-card disabled" title="Not available for this fabric/garment">
                    <div class="cz-opt-left">
                        <div class="cz-radio-outer">
                            <span class="cz-radio-inner"></span>
                        </div>
                        <div class="cz-opt-details">
                            <div class="cz-opt-title">
                                <span>${opt.label}</span>
                                <span class="cz-opt-tag ${opt.tag}">${opt.tag}</span>
                            </div>
                            <span class="cz-opt-desc">Not recommended or available for this delicate fabric</span>
                        </div>
                    </div>
                    <div class="cz-opt-right">
                        <span class="cz-na-badge">N/A</span>
                    </div>
                </div>
            `;
        }

        const isSelected = opt.type === activeCustomizerType;
        return `
            <div class="cz-option-card ${isSelected ? 'active' : ''}" onclick="selectCustomizerOption('${opt.type}', ${opt.price})">
                <div class="cz-opt-left">
                    <div class="cz-radio-outer">
                        <span class="cz-radio-inner"></span>
                    </div>
                    <div class="cz-opt-details">
                        <div class="cz-opt-title">
                            <span>${opt.label}</span>
                            <span class="cz-opt-tag ${opt.tag}">${opt.tag}</span>
                        </div>
                        <span class="cz-opt-desc">${opt.desc}</span>
                    </div>
                </div>
                <div class="cz-opt-right">
                    <span class="cz-opt-price">₹${opt.price}${activeCustomizerItem && activeCustomizerItem.unit ? ' / ' + activeCustomizerItem.unit : ''}</span>
                </div>
            </div>
        `;
    }).join('');
}

function selectCustomizerOption(type, price) {
    if (!activeCustomizerItem) return;
    activeCustomizerType = type;
    activeCustomizerPrice = price;

    const options = [
        { type: 'wash', label: 'Soft Wash & Iron', tag: 'wash', desc: 'Antiseptic solvent wash + razor-sharp steam press', price: activeCustomizerItem.washPrice, available: !!activeCustomizerItem.washPrice },
        { type: 'dry', label: 'Soft Dry Clean', tag: 'dry', desc: 'Gentle zero-shrink delicate dry-cleaning & stain treatment', price: activeCustomizerItem.dryPrice, available: !!activeCustomizerItem.dryPrice },
        { type: 'prem', label: 'Premium Dry Clean', tag: 'prem', desc: 'Artisan fabric spa, hand press & dust-free hanger packing', price: activeCustomizerItem.premPrice, available: !!activeCustomizerItem.premPrice }
    ];

    renderCustomizerOptions(options);
    updateCustomizerTotal();
}

function changeCustomizerQty(delta) {
    customizerQty = Math.max(1, customizerQty + delta);
    const qtyVal = document.getElementById('czQtyVal');
    if (qtyVal) qtyVal.textContent = customizerQty;
    updateCustomizerTotal();
}

function updateCustomizerTotal() {
    const totalEl = document.getElementById('czTotalPrice');
    const submitBtn = document.getElementById('czSubmitBtn');
    const lineTotal = (activeCustomizerPrice || 0) * customizerQty;

    if (totalEl) totalEl.textContent = `₹${lineTotal}`;
    if (submitBtn) {
        submitBtn.innerHTML = `<span>Add to Cart • ₹${lineTotal}</span> <i class="fas fa-arrow-right"></i>`;
    }
}

function confirmCustomizerAdd() {
    if (!activeCustomizerItem || !activeCustomizerType || !activeCustomizerPrice) {
        alert("Please select an available fabric care service option.");
        return;
    }

    const labels = {
        wash: 'Soft Wash & Iron',
        dry: 'Soft Dry Clean',
        prem: 'Premium Dry Clean',
        iron: 'Steam Iron'
    };

    const cartKey = `${activeCustomizerItem.id}_${activeCustomizerType}`;

    if (!cart[cartKey]) {
        cart[cartKey] = {
            key: cartKey,
            itemId: activeCustomizerItem.id,
            item: activeCustomizerItem,
            serviceType: activeCustomizerType,
            serviceLabel: labels[activeCustomizerType] || 'Dry Clean',
            price: activeCustomizerPrice,
            qty: 0
        };
    }

    cart[cartKey].qty += customizerQty;

    closeCustomizerModal();
    updateCartUI();
    refreshItemCardsUI();
}

function closeCustomizerModal() {
    const backdrop = document.getElementById('customizerBackdrop');
    const sheet = document.getElementById('customizerBottomSheet');
    if (backdrop) backdrop.classList.remove('show');
    if (sheet) sheet.classList.remove('show');
    activeCustomizerItem = null;
}

// 2. UNIVERSAL CART QUANTITY CHANGE
function changeItemQty(cartKeyOrItemId, delta, price) {
    // Check if directly passed a cartKey (e.g. 'm1_dry' or 'i1_iron')
    if (cart[cartKeyOrItemId]) {
        cart[cartKeyOrItemId].qty += delta;
        if (cart[cartKeyOrItemId].qty <= 0) {
            delete cart[cartKeyOrItemId];
        }
        updateCartUI();
        refreshItemCardsUI();
        return;
    }

    // Otherwise it is an itemId
    const foundItem = findItemById(cartKeyOrItemId);
    if (!foundItem) return;

    // Steam Iron items (or items with only a single fixed price): directly add to cart
    const isSteamIron = foundItem.cat === 'Steam Iron' || (!foundItem.washPrice && !foundItem.dryPrice && !foundItem.premPrice);
    if (isSteamIron) {
        const key = `${foundItem.id}_iron`;
        if (!cart[key]) {
            cart[key] = {
                key: key,
                itemId: foundItem.id,
                item: foundItem,
                serviceType: 'iron',
                serviceLabel: 'Steam Press',
                price: foundItem.price || price || 15,
                qty: 0
            };
        }
        cart[key].qty += delta;
        if (cart[key].qty <= 0) {
            delete cart[key];
        }
        updateCartUI();
        refreshItemCardsUI();
        return;
    }

    // Multi-service items: open Zomato-style Customizer Modal
    if (delta > 0) {
        openCustomizerModal(foundItem.id);
    }
}

// Helper: refresh visible item cards
function refreshItemCardsUI() {
    document.querySelectorAll('.home-item-card, .catalog-item-card').forEach(card => {
        const rawId = card.id.replace('home-card-', '').replace('item-card-', '');
        const item = findItemById(rawId);
        if (item) {
            if (card.id.startsWith('home-card-') && typeof generateHomeItemCardHTML === 'function') {
                card.outerHTML = generateHomeItemCardHTML(item);
            } else if (card.id.startsWith('item-card-')) {
                if (typeof priceViewMode !== 'undefined' && priceViewMode === 'table' && typeof generateItemRowHTML === 'function') {
                    card.outerHTML = generateItemRowHTML(item);
                } else if (typeof generateCatalogCardHTML === 'function') {
                    card.outerHTML = generateCatalogCardHTML(item);
                }
            }
        }
    });
}

// 3. CART UI SYNC (Mobile Floating Bar, Desktop Sticky Cart, Order Modal)
function updateCartUI() {
    let totalItems = 0;
    let totalPrice = 0;
    let sidebarHTML = '';

    for (const key in cart) {
        const cItem = cart[key];
        totalItems += cItem.qty;
        const lineTotal = cItem.qty * cItem.price;
        totalPrice += lineTotal;
        sidebarHTML += `
            <div class="dcc-item-row">
                <div style="flex:1; min-width:0; margin-right:8px;">
                    <strong style="display:block; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${cItem.item.name}</strong>
                    <div style="font-size:0.72rem; color:#64748b; display:flex; align-items:center; gap:4px; margin-top:2px;">
                        <span style="background:#e0f2fe; color:#0284c7; padding:1px 6px; border-radius:4px; font-weight:700; font-size:0.65rem;">${cItem.serviceLabel}</span>
                        <span>₹${cItem.price}/${cItem.item.unit || 'pc'}</span>
                    </div>
                </div>
                <div style="display:flex; align-items:center; gap:8px;">
                    <div class="sheet-qty-ctrl" style="padding:1px 3px; gap:4px;">
                        <button type="button" class="sq-btn minus ${cItem.qty === 1 ? 'trash' : ''}" onclick="event.stopPropagation(); changeItemQty('${cItem.key}', -1)" title="${cItem.qty === 1 ? 'Remove' : 'Reduce'}" style="width:20px; height:20px; font-size:0.65rem;">
                            <i class="fas ${cItem.qty === 1 ? 'fa-trash' : 'fa-minus'}"></i>
                        </button>
                        <span class="sq-val" style="font-size:0.75rem; min-width:14px;">${cItem.qty}</span>
                        <button type="button" class="sq-btn plus" onclick="event.stopPropagation(); changeItemQty('${cItem.key}', 1)" title="Add" style="width:20px; height:20px; font-size:0.65rem;">
                            <i class="fas fa-plus"></i>
                        </button>
                    </div>
                    <strong style="min-width:48px; text-align:right;">₹${lineTotal}</strong>
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

    // 3. Sync Modal Summary
    renderModalSummary();
}

function clearCart() {
    cart = {};
    updateCartUI();
    refreshItemCardsUI();
}

// 4. ORDER & BOOKING MODAL SUMMARY
function renderModalSummary() {
    const summaryContainer = document.getElementById('orderItemsSummary');
    if (!summaryContainer) return;

    let totalItems = 0;
    let totalPrice = 0;
    let itemsHTML = '';

    for (const key in cart) {
        const cItem = cart[key];
        totalItems += cItem.qty;
        const lineTotal = cItem.qty * cItem.price;
        totalPrice += lineTotal;

        itemsHTML += `
            <div class="sheet-item-row" id="sheet-item-${cItem.key}">
                <div class="sheet-item-info">
                    <span class="sheet-item-name">${cItem.item.name}</span>
                    <span class="sheet-item-unit-price">
                        <strong style="color:var(--primary); font-size:0.75rem;">${cItem.serviceLabel}</strong> • ₹${cItem.price}/${cItem.item.unit || 'pc'}
                    </span>
                </div>
                <div class="sheet-item-actions">
                    <div class="sheet-qty-ctrl">
                        <button type="button" class="sq-btn minus ${cItem.qty === 1 ? 'trash' : ''}" onclick="event.stopPropagation(); changeItemQty('${cItem.key}', -1)" title="${cItem.qty === 1 ? 'Remove item' : 'Reduce quantity'}">
                            <i class="fas ${cItem.qty === 1 ? 'fa-trash' : 'fa-minus'}"></i>
                        </button>
                        <span class="sq-val">${cItem.qty}</span>
                        <button type="button" class="sq-btn plus" onclick="event.stopPropagation(); changeItemQty('${cItem.key}', 1)" title="Increase quantity">
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
    if (backdrop) backdrop.classList.add('show');
    if (sheet) sheet.classList.add('show');
}

function quickScheduleModal() {
    openOrderModal();
}

function closeOrderModal() {
    const backdrop = document.getElementById('orderModalBackdrop');
    const sheet = document.getElementById('orderBottomSheet');
    if (backdrop) backdrop.classList.remove('show');
    if (sheet) sheet.classList.remove('show');
}

// 5. WHATSAPP & PHONE SUBMISSION (9007895400)
let currentInvoiceNumber = '';

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

    for (const key in cart) {
        const entry = cart[key];
        totalItems += entry.qty;
        const lineTotal = entry.qty * entry.price;
        totalPrice += lineTotal;
        itemsText += `  • ${entry.qty}x ${entry.item.name} [${entry.serviceLabel}] @ ₹${entry.price} = ₹${lineTotal}\n`;
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
        message += `🧺 *Selected Garments (${totalItems} pcs):*\n${itemsText}`;
        message += `💰 *Total Estimated Bill:* ₹${totalPrice}\n`;
        if (totalPrice < MIN_PICKUP_AMOUNT) {
            message += `ℹ️ *Note:* Min order for doorstep pickup is ₹${MIN_PICKUP_AMOUNT} (Short by ₹${MIN_PICKUP_AMOUNT - totalPrice})\n`;
        } else {
            message += `✅ *Free Doorstep Pickup & Delivery Included*\n`;
        }
    } else {
        message += `🧺 *Items:* To be counted at doorstep\n`;
    }

    message += `--------------------------------\n`;
    message += `Sent via The Supreme Laundry App`;

    const waURL = `https://wa.me/919007895400?text=${encodeURIComponent(message)}`;
    window.open(waURL, '_blank');

    closeOrderModal();

    // Automatically generate and present invoice to customer
    setTimeout(() => {
        generateAndShowInvoice({ name, phone, address, date, slot, speed });
    }, 400);
}

// 6. BILL & INVOICE GENERATOR (PDF & PRINT)
function generateAndShowInvoice(customOrderData) {
    const name = customOrderData?.name || document.getElementById('custName')?.value?.trim() || 'Valued Customer';
    const phone = customOrderData?.phone || document.getElementById('custPhone')?.value?.trim() || '+91 9007895400';
    const address = customOrderData?.address || document.getElementById('custAddress')?.value?.trim() || 'New Town, Kolkata (Doorstep Pickup)';
    const dateVal = customOrderData?.date || document.getElementById('custDate')?.value || new Date().toISOString().split('T')[0];
    const slot = customOrderData?.slot || document.getElementById('custSlot')?.value || 'Morning (9 AM - 1 PM)';
    const speed = customOrderData?.speed || document.getElementById('custSpeed')?.value || 'standard';

    // Generate unique invoice number: e.g. TSL-20260921-7294
    const today = new Date();
    const dateCode = today.toISOString().slice(0,10).replace(/-/g, '');
    const randCode = Math.floor(1000 + Math.random() * 9000);
    currentInvoiceNumber = `TSL-${dateCode}-${randCode}`;

    // Format current date and time
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    const formattedNow = today.toLocaleDateString('en-IN', options);

    // Calculate Estimated Delivery Time
    let deliveryDays = speed === 'express' ? 1 : 2;
    const estDeliveryDate = new Date();
    estDeliveryDate.setDate(estDeliveryDate.getDate() + deliveryDays);
    const estDeliveryDateStr = estDeliveryDate.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });

    const deliveryEstimateHeading = speed === 'express'
        ? 'Express Delivery: Within 24 Hours'
        : 'Standard Delivery: Within 24 - 48 Hours';

    const deliveryEstimateSub = speed === 'express'
        ? `Guaranteed Express Delivery by ${estDeliveryDateStr} (Evening)`
        : `Estimated Doorstep Delivery by ${estDeliveryDateStr}`;

    // Build Items Rows & Totals
    let itemsRowsHTML = '';
    let itemSubtotal = 0;
    let totalPieces = 0;
    let rowIdx = 1;

    const cartKeys = Object.keys(cart);
    if (cartKeys.length > 0) {
        cartKeys.forEach(key => {
            const entry = cart[key];
            const lineTotal = entry.qty * entry.price;
            itemSubtotal += lineTotal;
            totalPieces += entry.qty;

            let badgeClass = 'inv-badge-dry';
            if (entry.serviceType === 'wash') badgeClass = 'inv-badge-wash';
            else if (entry.serviceType === 'prem') badgeClass = 'inv-badge-prem';
            else if (entry.serviceType === 'iron') badgeClass = 'inv-badge-iron';

            itemsRowsHTML += `
                <tr>
                    <td style="font-weight: 600; color: #64748b;">#${rowIdx++}</td>
                    <td>
                        <strong style="color: #0f172a;">${entry.item.name}</strong>
                        <div style="font-size: 0.7rem; color: #64748b;">${entry.item.cat || 'Garment Care'}</div>
                    </td>
                    <td>
                        <span class="inv-badge-service ${badgeClass}">${entry.serviceLabel}</span>
                    </td>
                    <td style="text-align: center; font-weight: 700;">${entry.qty}</td>
                    <td style="text-align: right;">₹${entry.price}</td>
                    <td style="text-align: right; font-weight: 700; color: #0f172a;">₹${lineTotal}</td>
                </tr>
            `;
        });
    } else {
        // Fallback row if generating bill without pre-selecting items
        itemsRowsHTML = `
            <tr>
                <td style="font-weight: 600; color: #64748b;">#1</td>
                <td>
                    <strong style="color: #0f172a;">Assorted Laundry / Dry Clean Lot</strong>
                    <div style="font-size: 0.7rem; color: #64748b;">Garments to be counted &amp; tagged at doorstep</div>
                </td>
                <td>
                    <span class="inv-badge-service inv-badge-dry">Doorstep Pickup Count</span>
                </td>
                <td style="text-align: center; font-weight: 700;">1 lot</td>
                <td style="text-align: right;">Min ₹300</td>
                <td style="text-align: right; font-weight: 700; color: #0f172a;">₹300</td>
            </tr>
        `;
        itemSubtotal = 300;
        totalPieces = 1;
    }

    // Calculations
    const deliveryFee = itemSubtotal >= MIN_PICKUP_AMOUNT ? 0 : 40;
    const expressFee = speed === 'express' ? Math.round(itemSubtotal * 0.5) : 0;
    const grandTotal = itemSubtotal + deliveryFee + expressFee;

    const deliveryRowHTML = deliveryFee === 0 
        ? `<div class="inv-calc-row free-delivery"><span>Doorstep Pickup &amp; Drop:</span><span>FREE (Orders above ₹300)</span></div>`
        : `<div class="inv-calc-row"><span>Pickup &amp; Delivery Fee:</span><span>₹${deliveryFee}</span></div>`;

    const expressRowHTML = expressFee > 0
        ? `<div class="inv-calc-row"><span>Express Speed Surcharge (+50%):</span><span>+₹${expressFee}</span></div>`
        : '';

    // Automatically sync / save order to localStorage for Admin Panel
    try {
        const storedOrders = JSON.parse(localStorage.getItem('tsl_orders') || '[]');
        if (!storedOrders.some(o => o.id === currentInvoiceNumber)) {
            const savedItems = cartKeys.length > 0 
                ? cartKeys.map(k => ({
                    name: cart[k].item.name,
                    category: cart[k].item.cat,
                    service: cart[k].serviceLabel,
                    qty: cart[k].qty,
                    price: cart[k].price,
                    total: cart[k].qty * cart[k].price
                }))
                : [{ name: 'Assorted Garments (Doorstep Count)', service: 'Standard Care', qty: 1, price: 300, total: 300 }];

            storedOrders.unshift({
                id: currentInvoiceNumber,
                timestamp: today.toISOString(),
                customer: { name, phone, address },
                pickup: { date: dateVal, slot, speed },
                items: savedItems,
                subtotal: itemSubtotal,
                deliveryFee: deliveryFee,
                expressFee: expressFee,
                total: grandTotal,
                status: 'Order Placed'
            });
            localStorage.setItem('tsl_orders', JSON.stringify(storedOrders));
        }
    } catch(e) {
        console.warn("Could not sync order to admin store:", e);
    }

    // Render Full Invoice Card
    const printableArea = document.getElementById('invoicePrintableArea');
    if (!printableArea) return;

    printableArea.innerHTML = `
        <!-- STORE HEADER (The Supreme Laundry, Phone, Location: Kalurmore Bus Stand) -->
        <div class="inv-store-header">
            <div class="inv-brand-box">
                <img src="assets/logo.png" alt="The Supreme Laundry" class="inv-store-logo" onerror="this.style.display='none'">
                <div class="inv-store-info">
                    <h2>The Supreme Laundry</h2>
                    <div class="inv-store-tagline">We take care of your premium clothes &bull; Dry Cleaning Specialist</div>
                    <div class="inv-store-address">
                        <i class="fas fa-map-marker-alt" style="color: #e11d48;"></i> <strong>Store Location:</strong> Near Kalurmore Bus Stand, Action Area 2, New Town, Kolkata - 700160<br>
                        <i class="fas fa-phone-alt" style="color: #16a34a;"></i> <strong>Phone:</strong> 9007895400 &bull; <i class="fab fa-whatsapp" style="color: #25d366;"></i> WhatsApp: 9007895400
                    </div>
                </div>
            </div>
            <div class="inv-meta-box">
                <span class="inv-type-badge"><i class="fas fa-file-invoice"></i> Official Invoice</span>
                <div class="inv-meta-row">Inv No: <strong>${currentInvoiceNumber}</strong></div>
                <div class="inv-meta-row">Date: <strong>${formattedNow}</strong></div>
                <div class="inv-meta-row">Status: <strong style="color: #16a34a;">Order Confirmed</strong></div>
            </div>
        </div>

        <!-- CUSTOMER DETAILS & PICKUP/DROP LOCATION -->
        <div class="inv-details-grid">
            <div class="inv-detail-col">
                <div class="inv-block-title"><i class="fas fa-user-circle"></i> Customer &amp; Contact Info</div>
                <div class="inv-detail-text">
                    <strong>Customer Name:</strong> ${name}<br>
                    <strong>Phone Number:</strong> ${phone}<br>
                    <strong>Pickup &amp; Drop Location:</strong> ${address}
                </div>
            </div>
            <div class="inv-detail-col">
                <div class="inv-block-title"><i class="fas fa-calendar-check"></i> Pickup &amp; Service Schedule</div>
                <div class="inv-detail-text">
                    <strong>Pickup Date:</strong> ${dateVal} (${slot})<br>
                    <strong>Service Speed:</strong> ${speed === 'express' ? 'Express (< 24 Hours)' : 'Standard (24-48 Hours)'}<br>
                    <strong>Payment Mode:</strong> Cash / UPI on Delivery
                </div>
            </div>
        </div>

        <!-- SELECTED SERVICES & ITEMS TABLE -->
        <div class="inv-table-wrapper">
            <table class="inv-table">
                <thead>
                    <tr>
                        <th style="width: 40px;">#</th>
                        <th>Garment / Item</th>
                        <th>Selected Care Service</th>
                        <th style="text-align: center; width: 60px;">Qty</th>
                        <th style="text-align: right; width: 80px;">Rate</th>
                        <th style="text-align: right; width: 90px;">Amount</th>
                    </tr>
                </thead>
                <tbody>
                    ${itemsRowsHTML}
                </tbody>
            </table>
        </div>

        <!-- PRICE BREAKDOWN SUMMARY -->
        <div class="inv-calc-section">
            <div class="inv-calc-box">
                <div class="inv-calc-row">
                    <span>Items Subtotal (${totalPieces} items):</span>
                    <strong>₹${itemSubtotal}</strong>
                </div>
                ${deliveryRowHTML}
                ${expressRowHTML}
                <div class="inv-calc-row total">
                    <span>Total Amount:</span>
                    <span>₹${grandTotal}</span>
                </div>
            </div>
        </div>

        <!-- ESTIMATED DELIVERY TIME SECTION -->
        <div class="inv-delivery-estimate-card">
            <i class="fas fa-shipping-fast"></i>
            <div class="inv-delivery-estimate-text">
                <h4>${deliveryEstimateHeading}</h4>
                <p>${deliveryEstimateSub} &bull; Free Doorstep Delivery across New Town &amp; Action Area 2</p>
            </div>
        </div>

        <!-- ENDING: THANK YOU PART & GUARANTEE -->
        <div class="inv-card-footer">
            <div class="inv-thankyou-title">
                <i class="fas fa-heart"></i>
                <span>Thank You for Choosing The Supreme Laundry!</span>
            </div>
            <div class="inv-thankyou-sub">
                Your garments are in expert hands. We guarantee gentle fabric handling, anti-bacterial hygiene wash, zero fabric shrinkage &amp; crisp steam finish.
            </div>
            <div class="inv-support-bar">
                <span><i class="fas fa-headset"></i> Order Help &amp; Support: <strong>9007895400</strong></span>
                <span>&bull;</span>
                <span><i class="fas fa-map-pin"></i> <strong>Kalurmore Bus Stand</strong>, Action Area 2, Kolkata</span>
            </div>
        </div>
    `;

    // Open Modal
    const backdrop = document.getElementById('invoiceModalBackdrop');
    const wrapper = document.getElementById('invoiceModalWrapper');
    if (backdrop) backdrop.classList.add('show');
    if (wrapper) wrapper.classList.add('show');
}

function closeInvoiceModal() {
    const backdrop = document.getElementById('invoiceModalBackdrop');
    const wrapper = document.getElementById('invoiceModalWrapper');
    if (backdrop) backdrop.classList.remove('show');
    if (wrapper) wrapper.classList.remove('show');
}

// Download PDF using html2pdf
function downloadInvoicePDF() {
    const element = document.getElementById('invoicePrintableArea');
    if (!element) {
        alert("Invoice content not found. Please try again.");
        return;
    }

    const filename = `The_Supreme_Laundry_Invoice_${currentInvoiceNumber || 'TSL'}.pdf`;

    const opt = {
        margin: [6, 6, 6, 6],
        filename: filename,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { 
            scale: 2, 
            useCORS: true, 
            letterRendering: true,
            logging: false,
            scrollX: 0,
            scrollY: 0
        },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    if (window.html2pdf) {
        // Provide user feedback
        const downloadBtn = document.querySelector('.btn-inv-download span');
        const origText = downloadBtn ? downloadBtn.textContent : '';
        if (downloadBtn) downloadBtn.textContent = 'Generating PDF...';

        html2pdf().set(opt).from(element).save().then(() => {
            if (downloadBtn) downloadBtn.textContent = origText;
        }).catch(err => {
            console.error("PDF generation error:", err);
            if (downloadBtn) downloadBtn.textContent = origText;
            window.print();
        });
    } else {
        // Fallback to browser print dialog
        window.print();
    }
}

// Print Bill
function printInvoice() {
    window.print();
}

