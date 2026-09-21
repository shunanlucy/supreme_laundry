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
                status: 'Order Placed',
                payment: {
                    status: 'Unpaid',
                    mode: 'Cash / UPI on Delivery',
                    paidAmount: 0,
                    dueAmount: grandTotal,
                    transactionId: '',
                    paidAt: null,
                    notes: 'Pay on Doorstep Delivery'
                }
            });
            localStorage.setItem('tsl_orders', JSON.stringify(storedOrders));
            try {
                window.dispatchEvent(new Event('tsl_orders_updated'));
            } catch(ev) {}
        }
    } catch(e) {
        console.warn("Could not sync order to admin store:", e);
    }

    // Build Thermal Items Rows (80mm POS Slip Style)
    let thermalItemsRowsHTML = '';
    if (cartKeys.length > 0) {
        cartKeys.forEach(key => {
            const entry = cart[key];
            const lineTotal = entry.qty * entry.price;
            thermalItemsRowsHTML += `
                <tr>
                    <td class="tr-col-item">
                        <div class="tr-item-name">${entry.item.name}</div>
                        <div class="tr-item-srv">[${entry.serviceLabel}]</div>
                    </td>
                    <td class="tr-col-qty">${entry.qty}</td>
                    <td class="tr-col-rate">₹${entry.price}</td>
                    <td class="tr-col-amt">₹${lineTotal}</td>
                </tr>
            `;
        });
    } else {
        thermalItemsRowsHTML = `
            <tr>
                <td class="tr-col-item">
                    <div class="tr-item-name">Assorted Garments Lot</div>
                    <div class="tr-item-srv">[Doorstep Count &amp; Tag]</div>
                </td>
                <td class="tr-col-qty">1 lot</td>
                <td class="tr-col-rate">Min ₹300</td>
                <td class="tr-col-amt">₹300</td>
            </tr>
        `;
    }

    // Render Full Authentic 80mm Thermal Receipt Card
    const printableArea = document.getElementById('invoicePrintableArea');
    if (!printableArea) return;

    printableArea.innerHTML = `
        <div class="thermal-receipt-card" id="thermalReceiptCard">
            <!-- Header -->
            <div class="tr-header">
                <img src="assets/logo.png" alt="TSL" class="tr-logo" onerror="this.style.display='none'">
                <h2 class="tr-store-name">THE SUPREME LAUNDRY</h2>
                <div class="tr-sub-text">PREMIUM GARMENT CARE &amp; DRY CLEANING</div>
                <div class="tr-sub-text">Near Kalurmore Bus Stand, Action Area 2,<br>New Town, Kolkata - 700160</div>
                <div class="tr-sub-text"><strong>Helpline / WhatsApp:</strong> 9007895400</div>
            </div>

            <div class="tr-line-double"></div>
            <div class="tr-title-center">*** TAX INVOICE &amp; PICKUP SLIP ***</div>
            <div class="tr-line-dashed"></div>

            <!-- Order Metadata -->
            <div class="tr-kv-grid">
                <div class="tr-kv"><span>INVOICE NO:</span><strong>${currentInvoiceNumber}</strong></div>
                <div class="tr-kv"><span>DATE &amp; TIME:</span><span>${formattedNow}</span></div>
                <div class="tr-kv"><span>PICKUP DATE:</span><span>${dateVal}</span></div>
                <div class="tr-kv"><span>TIME SLOT:</span><span>${slot}</span></div>
                <div class="tr-kv"><span>DELIVERY SPEED:</span><span>${speed === 'express' ? 'EXPRESS (<24H)' : 'STANDARD (24-48H)'}</span></div>
                <div class="tr-kv"><span>STATUS:</span><strong style="color:#059669;">CONFIRMED (ADMIN NOTIFIED)</strong></div>
            </div>

            <div class="tr-line-dashed"></div>

            <!-- Customer Details -->
            <div class="tr-customer-box">
                <div class="tr-kv"><span>CUSTOMER:</span><strong>${name}</strong></div>
                <div class="tr-kv"><span>PHONE:</span><strong>${phone}</strong></div>
                <div class="tr-kv tr-addr"><span>ADDRESS:</span><span>${address}</span></div>
            </div>

            <div class="tr-line-double"></div>

            <!-- Items Table (POS Thermal Style) -->
            <table class="tr-items-table">
                <thead>
                    <tr>
                        <th class="tr-col-item">ITEM / SERVICE</th>
                        <th class="tr-col-qty">QTY</th>
                        <th class="tr-col-rate">RATE</th>
                        <th class="tr-col-amt">AMT</th>
                    </tr>
                </thead>
                <tbody>
                    ${thermalItemsRowsHTML}
                </tbody>
            </table>

            <div class="tr-line-dashed"></div>

            <!-- Price Breakdown -->
            <div class="tr-calc-block">
                <div class="tr-calc-row">
                    <span>Subtotal (${totalPieces} pcs):</span>
                    <span>₹${itemSubtotal}</span>
                </div>
                <div class="tr-calc-row">
                    <span>Doorstep Pickup &amp; Drop:</span>
                    <span>${deliveryFee === 0 ? 'FREE' : '₹' + deliveryFee}</span>
                </div>
                ${expressFee > 0 ? `
                <div class="tr-calc-row">
                    <span>Express Speed (+50%):</span>
                    <span>+₹${expressFee}</span>
                </div>` : ''}

                <div class="tr-line-double"></div>

                <div class="tr-calc-row tr-net-total">
                    <span>NET PAYABLE:</span>
                    <span>₹${grandTotal}</span>
                </div>

                <div class="tr-line-double"></div>

                <div class="tr-calc-row">
                    <span>Payment Mode:</span>
                    <span>Cash / UPI on Delivery</span>
                </div>
                <div class="tr-calc-row">
                    <span>Payment Status:</span>
                    <strong>UNPAID (Pay at Doorstep)</strong>
                </div>
            </div>

            <div class="tr-line-dashed"></div>

            <!-- Barcode Token -->
            <div class="tr-barcode-wrapper">
                <div class="tr-barcode-bars">||| | |||| | || |||||| | ||| |||| | || |||</div>
                <div class="tr-barcode-code">* ${currentInvoiceNumber} *</div>
            </div>

            <!-- Thermal Receipt Footer -->
            <div class="tr-footer-box">
                <div class="tr-line-dashed"></div>
                <div class="tr-f-bold">THANK YOU FOR CHOOSING TSL!</div>
                <div class="tr-f-text">We take care of your premium clothes</div>
                <div class="tr-f-text">Zero Shrinkage &bull; Anti-Bacterial Hygiene Wash</div>
                <div class="tr-f-text">Helpline: +91 9007895400</div>
                <div class="tr-f-text">Near Kalurmore Bus Stand, Action Area 2, New Town</div>
                <div class="tr-f-legal">*** Computer Generated Thermal POS Slip ***</div>
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

// Download PDF using html2pdf with authentic 80mm thermal roll format
function downloadInvoicePDF() {
    const element = document.getElementById('thermalReceiptCard') || document.getElementById('invoicePrintableArea');
    if (!element) {
        alert("Invoice content not found. Please try again.");
        return;
    }

    const filename = `TSL_Thermal_Bill_${currentInvoiceNumber || 'Bill'}.pdf`;

    // Dynamic 80mm roll length calculation
    const contentHeightPx = element.scrollHeight || element.offsetHeight || 620;
    const contentWidthPx = element.scrollWidth || element.offsetWidth || 320;
    const calculatedMmHeight = Math.ceil((contentHeightPx / contentWidthPx) * 80) + 12;
    const finalMmHeight = Math.max(140, calculatedMmHeight);

    const opt = {
        margin: [3, 2, 3, 2],
        filename: filename,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { 
            scale: 2.5, 
            useCORS: true, 
            letterRendering: true,
            logging: false,
            scrollX: 0,
            scrollY: 0,
            windowWidth: 320
        },
        jsPDF: { 
            unit: 'mm', 
            format: [80, finalMmHeight], 
            orientation: 'portrait' 
        }
    };

    if (window.html2pdf) {
        const downloadBtn = document.querySelector('.btn-inv-download span');
        const origText = downloadBtn ? downloadBtn.textContent : '';
        if (downloadBtn) downloadBtn.textContent = 'Downloading Bill...';

        html2pdf().set(opt).from(element).save().then(() => {
            if (downloadBtn) downloadBtn.textContent = origText;
        }).catch(err => {
            console.error("PDF generation error:", err);
            if (downloadBtn) downloadBtn.textContent = origText;
            window.print();
        });
    } else {
        window.print();
    }
}

// Handler for Black Button ("Generate & Download Bill (PDF)")
function handleGenerateBillDownload(e) {
    if (e && e.preventDefault) e.preventDefault();

    const nameInput = document.getElementById('custName');
    const phoneInput = document.getElementById('custPhone');
    const addrInput = document.getElementById('custAddress');

    const name = nameInput ? nameInput.value.trim() : '';
    const phone = phoneInput ? phoneInput.value.trim() : '';
    const address = addrInput ? addrInput.value.trim() : '';

    const sheet = document.getElementById('orderBottomSheet');
    const isSheetOpen = sheet && sheet.classList.contains('show');

    if (!isSheetOpen && (!name || !phone || !address)) {
        openOrderModal();
        setTimeout(() => {
            if (!name && nameInput) nameInput.focus();
            else if (!phone && phoneInput) phoneInput.focus();
            else if (!address && addrInput) addrInput.focus();
        }, 300);
        return;
    }

    if (!name) {
        if (nameInput) {
            nameInput.focus();
            nameInput.style.borderColor = '#ef4444';
        }
        alert("Please enter Full Name to generate your bill.");
        return;
    }
    if (!phone || phone.replace(/\D/g, '').length < 10) {
        if (phoneInput) {
            phoneInput.focus();
            phoneInput.style.borderColor = '#ef4444';
        }
        alert("Please enter a valid 10-digit Phone Number.");
        return;
    }
    if (!address) {
        if (addrInput) {
            addrInput.focus();
            addrInput.style.borderColor = '#ef4444';
        }
        alert("Please enter your Pickup Address in New Town.");
        return;
    }

    if (nameInput) nameInput.style.borderColor = '';
    if (phoneInput) phoneInput.style.borderColor = '';
    if (addrInput) addrInput.style.borderColor = '';

    const dateVal = document.getElementById('custDate')?.value || new Date().toISOString().split('T')[0];
    const slot = document.getElementById('custSlot')?.value || 'Morning (9 AM - 1 PM)';
    const speed = document.getElementById('custSpeed')?.value || 'standard';

    // 1. Generate thermal invoice and record in admin localStorage
    generateAndShowInvoice({ name, phone, address, date: dateVal, slot, speed });

    // 2. Close booking sheet
    closeOrderModal();

    // 3. Automatically download PDF directly to phone
    setTimeout(() => {
        downloadInvoicePDF();
    }, 450);
}

// Print Bill
function printInvoice() {
    window.print();
}

