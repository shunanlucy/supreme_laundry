/**
 * The Supreme Laundry — Admin Panel Operations Controller
 * Full-featured Mobile-First Dashboard with Live Orders, Payment Ledger,
 * Dynamic Rate Card Editor, Customer CRM & Store Settings.
 */

const STORAGE_KEY_ORDERS = 'tsl_orders';
const STORAGE_KEY_CUSTOM_PRICES = 'tsl_custom_prices';
const STORAGE_KEY_STORE_CONFIG = 'tsl_store_config';

// Default Store Configuration
const defaultStoreConfig = {
    phone: '9007895400',
    storeName: 'The Supreme Laundry',
    address: 'Near Kalurmore Bus Stand, Action Area 2, New Town, Kolkata - 700160',
    minOrderFreeDelivery: 300,
    isOpen: true
};

// Seed realistic demo orders with payment details if empty
function seedDemoOrdersIfEmpty() {
    const existing = localStorage.getItem(STORAGE_KEY_ORDERS);
    if (!existing || JSON.parse(existing).length === 0) {
        const demoOrders = [
            {
                id: 'TSL-20260921-1024',
                timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
                customer: {
                    name: 'Rahul Sharma',
                    phone: '9876543210',
                    address: 'Flat 402, Block B, Greenfield Heights, Action Area 2, New Town'
                },
                pickup: {
                    date: new Date().toISOString().slice(0, 10),
                    slot: 'Morning (9 AM - 1 PM)',
                    speed: 'standard'
                },
                items: [
                    { name: "Men's Formal Shirt", service: "Soft Wash & Iron", qty: 2, price: 60, total: 120 },
                    { name: "2-Piece Premium Suit", service: "Premium Dry Clean", qty: 1, price: 350, total: 350 }
                ],
                subtotal: 470,
                deliveryFee: 0,
                expressFee: 0,
                total: 470,
                status: 'Order Placed',
                payment: {
                    status: 'Unpaid',
                    mode: 'Cash',
                    paidAmount: 0,
                    dueAmount: 470,
                    transactionId: '',
                    paidAt: null,
                    notes: 'Pay on delivery'
                }
            },
            {
                id: 'TSL-20260920-8492',
                timestamp: new Date(Date.now() - 3600000 * 18).toISOString(),
                customer: {
                    name: 'Pooja Sen',
                    phone: '9830112233',
                    address: 'Tower 4, Flat 12A, Rosedale Garden, Action Area 3, New Town'
                },
                pickup: {
                    date: new Date(Date.now() - 86400000).toISOString().slice(0, 10),
                    slot: 'Evening (5 PM - 8 PM)',
                    speed: 'express'
                },
                items: [
                    { name: "Silk Designer Saree", service: "Premium Dry Clean", qty: 1, price: 300, total: 300 },
                    { name: "Heavy Winter Blanket (Double)", service: "Soft Dry Clean", qty: 1, price: 350, total: 350 }
                ],
                subtotal: 650,
                deliveryFee: 0,
                expressFee: 325,
                total: 975,
                status: 'In Wash / Dry Clean',
                payment: {
                    status: 'Partial',
                    mode: 'UPI',
                    paidAmount: 500,
                    dueAmount: 475,
                    transactionId: 'UPI-REF-938210',
                    paidAt: new Date(Date.now() - 3600000 * 17).toISOString(),
                    notes: 'Advance paid via GPay'
                }
            },
            {
                id: 'TSL-20260919-6120',
                timestamp: new Date(Date.now() - 3600000 * 40).toISOString(),
                customer: {
                    name: 'Amit Mukherjee',
                    phone: '9123456780',
                    address: 'Near City Centre 2, Chinar Park, Rajarhat'
                },
                pickup: {
                    date: new Date(Date.now() - 86400000 * 2).toISOString().slice(0, 10),
                    slot: 'Morning (9 AM - 1 PM)',
                    speed: 'standard'
                },
                items: [
                    { name: "Sofa (3 Seater Cotton Synthetic)", service: "On-Site Sofa Spa", qty: 1, price: 250, total: 250 },
                    { name: "Cotton Kurta Pajama", service: "Soft Wash & Iron", qty: 2, price: 80, total: 160 }
                ],
                subtotal: 410,
                deliveryFee: 0,
                expressFee: 0,
                total: 410,
                status: 'Delivered',
                payment: {
                    status: 'Paid',
                    mode: 'UPI',
                    paidAmount: 410,
                    dueAmount: 0,
                    transactionId: 'UPI-PHONEPE-748291',
                    paidAt: new Date(Date.now() - 3600000 * 38).toISOString(),
                    notes: 'Paid in full on delivery'
                }
            }
        ];
        localStorage.setItem(STORAGE_KEY_ORDERS, JSON.stringify(demoOrders));
    }
}

// Get Orders from Storage
function getAdminOrders() {
    try {
        return JSON.parse(localStorage.getItem(STORAGE_KEY_ORDERS)) || [];
    } catch (e) {
        return [];
    }
}

// Save Orders
function saveAdminOrders(orders) {
    localStorage.setItem(STORAGE_KEY_ORDERS, JSON.stringify(orders));
    renderAdminDashboard();
}

// Helper: Ensure order has payment object
function getOrderPayment(order) {
    if (order.payment) return order.payment;
    const isDelivered = order.status === 'Delivered';
    return {
        status: isDelivered ? 'Paid' : 'Unpaid',
        mode: isDelivered ? 'UPI' : 'Cash',
        paidAmount: isDelivered ? (order.total || 0) : 0,
        dueAmount: isDelivered ? 0 : (order.total || 0),
        transactionId: '',
        paidAt: isDelivered ? order.timestamp : null,
        notes: ''
    };
}

// Switch Active View Tab (Supports both desktop sidebar & mobile bottom nav)
function switchAdminTab(tabId) {
    document.querySelectorAll('.admin-tab-pane').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.m-nav-item').forEach(el => el.classList.remove('active'));

    const targetPane = document.getElementById(tabId);
    if (targetPane) targetPane.classList.add('active');

    const navLink = document.querySelector(`.nav-item[data-tab="${tabId}"]`);
    if (navLink) navLink.classList.add('active');

    const mNavLink = document.querySelector(`.m-nav-item[data-tab="${tabId}"]`);
    if (mNavLink) mNavLink.classList.add('active');

    // Close mobile menu if open
    const sidebar = document.querySelector('.admin-sidebar');
    if (sidebar) sidebar.classList.remove('show');

    // Re-render data for current tab
    if (tabId === 'tab-dashboard') renderOverviewStats();
    if (tabId === 'tab-orders') renderOrdersTable();
    if (tabId === 'tab-rates') renderRateCardEditor();
    if (tabId === 'tab-customers') renderCustomerDirectory();
    if (tabId === 'tab-settings') loadSettingsForm();

    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function toggleMobileSidebar() {
    const sidebar = document.querySelector('.admin-sidebar');
    if (sidebar) sidebar.classList.toggle('show');
}

// 1. DASHBOARD OVERVIEW & PAYMENT LEDGER STATS
function renderOverviewStats() {
    const orders = getAdminOrders();

    const totalOrdersCount = orders.length;
    let totalRevenue = 0;
    let totalPaidCollected = 0;
    let totalDuePayments = 0;
    let pendingPickupsCount = 0;
    let inProgressCount = 0;
    let deliveredCount = 0;

    orders.forEach(o => {
        totalRevenue += (o.total || 0);
        const pay = getOrderPayment(o);
        totalPaidCollected += (pay.paidAmount || 0);
        totalDuePayments += (pay.dueAmount !== undefined ? pay.dueAmount : 0);

        if (o.status === 'Order Placed') pendingPickupsCount++;
        else if (o.status === 'In Wash / Dry Clean' || o.status === 'Picked Up' || o.status === 'Out for Delivery') inProgressCount++;
        else if (o.status === 'Delivered') deliveredCount++;
    });

    const elTotalOrders = document.getElementById('statTotalOrders');
    const elRevenue = document.getElementById('statTotalRevenue');
    const elPaid = document.getElementById('statPaidCollected');
    const elDue = document.getElementById('statDuePayments');
    const elPending = document.getElementById('statPendingPickups');
    const elInProgress = document.getElementById('statInProgress');
    const badgePending = document.getElementById('badgePendingCount');
    const mNavBadge = document.getElementById('mNavBadgeCount');

    if (elTotalOrders) elTotalOrders.textContent = totalOrdersCount;
    if (elRevenue) elRevenue.textContent = `₹${totalRevenue.toLocaleString('en-IN')}`;
    if (elPaid) elPaid.textContent = `₹${totalPaidCollected.toLocaleString('en-IN')}`;
    if (elDue) elDue.textContent = `₹${totalDuePayments.toLocaleString('en-IN')}`;
    if (elPending) elPending.textContent = pendingPickupsCount;
    if (elInProgress) elInProgress.textContent = inProgressCount;
    if (badgePending) badgePending.textContent = pendingPickupsCount;
    if (mNavBadge) mNavBadge.textContent = pendingPickupsCount;

    // Render Recent 5 Orders on Dashboard
    const recent = orders.slice(0, 5);
    const recentOrdersContainer = document.getElementById('recentOrdersTableBody');
    const recentOrdersMobile = document.getElementById('recentOrdersCardsMobile');

    if (recent.length === 0) {
        if (recentOrdersContainer) recentOrdersContainer.innerHTML = `<tr><td colspan="8" style="text-align:center; padding: 24px; color: #94a3b8;">No orders recorded yet.</td></tr>`;
        if (recentOrdersMobile) recentOrdersMobile.innerHTML = `<div style="text-align:center; padding: 24px; color: #94a3b8;">No orders recorded yet.</div>`;
        return;
    }

    // Desktop Table
    if (recentOrdersContainer) {
        recentOrdersContainer.innerHTML = recent.map(o => {
            const timeStr = new Date(o.timestamp).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
            const pay = getOrderPayment(o);
            return `
                <tr>
                    <td><strong>${o.id}</strong><br><span style="font-size:0.7rem; color:#64748b;">${timeStr}</span></td>
                    <td><strong>${o.customer.name}</strong><br><span style="font-size:0.75rem; color:#64748b;">${o.customer.phone}</span></td>
                    <td style="max-width: 200px; font-size:0.75rem; color:#475569;">${o.customer.address}</td>
                    <td>${formatItemsSummary(o.items)}</td>
                    <td><strong style="color:#0f172a;">₹${o.total}</strong></td>
                    <td>${renderPaymentBadge(pay, o.id)}</td>
                    <td>${renderStatusBadge(o.status)}</td>
                    <td>
                        <div class="row-actions">
                            <button class="btn-row-action pay" title="Record / View Payment" onclick="openRecordPaymentModal('${o.id}')">
                                <i class="fas fa-wallet"></i> Pay
                            </button>
                            <button class="btn-row-action wa" title="WhatsApp Customer" onclick="sendWhatsAppUpdate('${o.id}')">
                                <i class="fab fa-whatsapp"></i>
                            </button>
                            <button class="btn-row-action inv" title="View Bill" onclick="viewOrderInvoice('${o.id}')">
                                <i class="fas fa-file-invoice"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
    }

    // Mobile Cards
    if (recentOrdersMobile) {
        recentOrdersMobile.innerHTML = recent.map(o => renderSingleMobileOrderCard(o)).join('');
    }
}

// 2. LIVE ORDERS TABLE & MOBILE CARDS
function renderOrdersTable() {
    const orders = getAdminOrders();
    const tbody = document.getElementById('allOrdersTableBody');
    const mobileContainer = document.getElementById('allOrdersCardsMobile');

    const searchTerm = (document.getElementById('orderSearchInput')?.value || '').toLowerCase().trim();
    const filterStatus = document.getElementById('orderStatusFilter')?.value || 'all';
    const filterPayment = document.getElementById('orderPaymentFilter')?.value || 'all';

    let filtered = orders.filter(o => {
        const matchesSearch = !searchTerm || 
            o.id.toLowerCase().includes(searchTerm) || 
            o.customer.name.toLowerCase().includes(searchTerm) || 
            o.customer.phone.includes(searchTerm) ||
            o.customer.address.toLowerCase().includes(searchTerm);

        const matchesStatus = filterStatus === 'all' || o.status === filterStatus;
        
        const pay = getOrderPayment(o);
        const matchesPayment = filterPayment === 'all' || pay.status === filterPayment;

        return matchesSearch && matchesStatus && matchesPayment;
    });

    if (filtered.length === 0) {
        if (tbody) tbody.innerHTML = `<tr><td colspan="8" style="text-align:center; padding: 32px; color: #94a3b8;">No matching orders found.</td></tr>`;
        if (mobileContainer) mobileContainer.innerHTML = `<div style="text-align:center; padding: 32px; color: #94a3b8;">No matching orders found.</div>`;
        return;
    }

    // Desktop Table
    if (tbody) {
        tbody.innerHTML = filtered.map(o => {
            const timeStr = new Date(o.timestamp).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
            const pay = getOrderPayment(o);
            return `
                <tr>
                    <td>
                        <strong>${o.id}</strong><br>
                        <span style="font-size:0.7rem; color:#64748b;">${timeStr}</span>
                    </td>
                    <td>
                        <strong>${o.customer.name}</strong><br>
                        <a href="tel:${o.customer.phone}" style="font-size:0.75rem; color:#1a73e8; text-decoration:none;">
                            <i class="fas fa-phone-alt" style="font-size:0.65rem;"></i> ${o.customer.phone}
                        </a>
                    </td>
                    <td style="max-width: 190px; font-size: 0.75rem; color: #334155; line-height: 1.35;">
                        ${o.customer.address}
                    </td>
                    <td style="font-size: 0.78rem;">
                        ${formatItemsSummary(o.items)}
                        <div style="font-size: 0.7rem; color: #64748b; margin-top: 2px;">
                            Pickup: <strong>${o.pickup?.date || 'N/A'}</strong> (${o.pickup?.slot || ''})
                        </div>
                    </td>
                    <td>
                        <strong style="color:#0f172a; font-size:0.95rem;">₹${o.total}</strong>
                        ${o.pickup?.speed === 'express' ? '<br><span style="font-size:0.68rem; color:#c2410c; font-weight:700;">Express</span>' : ''}
                    </td>
                    <td>
                        ${renderPaymentBadge(pay, o.id)}
                    </td>
                    <td>
                        <select class="status-select" onchange="changeOrderStatus('${o.id}', this.value)">
                            <option value="Order Placed" ${o.status === 'Order Placed' ? 'selected' : ''}>Order Placed</option>
                            <option value="Picked Up" ${o.status === 'Picked Up' ? 'selected' : ''}>Picked Up</option>
                            <option value="In Wash / Dry Clean" ${o.status === 'In Wash / Dry Clean' ? 'selected' : ''}>In Wash / Dry Clean</option>
                            <option value="Out for Delivery" ${o.status === 'Out for Delivery' ? 'selected' : ''}>Out for Delivery</option>
                            <option value="Delivered" ${o.status === 'Delivered' ? 'selected' : ''}>Delivered</option>
                            <option value="Cancelled" ${o.status === 'Cancelled' ? 'selected' : ''}>Cancelled</option>
                        </select>
                    </td>
                    <td>
                        <div class="row-actions">
                            <button class="btn-row-action pay" title="Record Payment" onclick="openRecordPaymentModal('${o.id}')">
                                <i class="fas fa-wallet"></i> Pay
                            </button>
                            <button class="btn-row-action wa" title="Notify on WhatsApp" onclick="sendWhatsAppUpdate('${o.id}')">
                                <i class="fab fa-whatsapp"></i>
                            </button>
                            <button class="btn-row-action inv" title="Print / Download Invoice" onclick="viewOrderInvoice('${o.id}')">
                                <i class="fas fa-file-invoice"></i>
                            </button>
                            <button class="btn-row-action" style="color:#ef4444;" title="Delete Order" onclick="deleteOrder('${o.id}')">
                                <i class="fas fa-trash-alt"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
    }

    // Mobile Cards View
    if (mobileContainer) {
        mobileContainer.innerHTML = filtered.map(o => renderSingleMobileOrderCard(o)).join('');
    }
}

// Native App-like Mobile Order Card Generator
function renderSingleMobileOrderCard(o) {
    const timeStr = new Date(o.timestamp).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    const pay = getOrderPayment(o);
    const phoneClean = o.customer.phone.replace(/[^0-9]/g, '');

    const itemsChipsHTML = (o.items || []).map(it => 
        `<span class="moc-chip"><strong>${it.qty}x</strong> ${it.name} [${it.service || 'Clean'}]</span>`
    ).join('');

    return `
        <div class="adm-mobile-order-card">
            <!-- Header -->
            <div class="moc-header">
                <div class="moc-id-group">
                    <span class="moc-id">#${o.id}</span>
                    <span class="moc-time"><i class="fas fa-clock"></i> ${timeStr}</span>
                </div>
                ${renderStatusBadge(o.status)}
            </div>

            <!-- Customer Details & Quick Contact -->
            <div class="moc-customer">
                <div class="moc-cust-top">
                    <span class="moc-cust-name"><i class="fas fa-user-circle" style="color:#1a73e8;"></i> ${o.customer.name}</span>
                </div>
                <div class="moc-cust-address">
                    <i class="fas fa-map-marker-alt"></i>
                    <span>${o.customer.address}</span>
                </div>
                <div class="moc-quick-contacts">
                    <a href="tel:${o.customer.phone}" class="moc-btn-contact call">
                        <i class="fas fa-phone-alt"></i> Call (${o.customer.phone})
                    </a>
                    <a href="https://wa.me/91${phoneClean}?text=Hello%20${encodeURIComponent(o.customer.name)},%20Greetings%20from%20The%20Supreme%20Laundry!" target="_blank" class="moc-btn-contact wa">
                        <i class="fab fa-whatsapp"></i> Chat
                    </a>
                </div>
            </div>

            <!-- Items & Care Chips -->
            <div class="moc-items-box">
                <div class="moc-items-title"><i class="fas fa-tshirt"></i> Garments &amp; Treatment:</div>
                <div class="moc-items-chips">
                    ${itemsChipsHTML || '<span class="moc-chip">Assorted Lot</span>'}
                </div>
                <div class="moc-pickup-slot">
                    <i class="fas fa-calendar-alt" style="color:#1a73e8;"></i> Pickup: <strong>${o.pickup?.date || 'Today'}</strong> (${o.pickup?.slot || ''})
                </div>
            </div>

            <!-- Payment Row (With 1-tap Pay button) -->
            <div class="moc-payment-bar">
                <div class="moc-pay-info">
                    <span style="font-size:0.75rem; color:#64748b;">Payment:</span>
                    ${renderPaymentBadge(pay, o.id)}
                </div>
                <button type="button" class="moc-btn-record-pay" onclick="openRecordPaymentModal('${o.id}')">
                    <i class="fas fa-wallet"></i> ${pay.status === 'Paid' ? 'Edit Pay' : 'Collect Pay'}
                </button>
            </div>

            <!-- Footer: Total, Status Selector, and Actions -->
            <div class="moc-footer">
                <div class="moc-total-group">
                    <span class="moc-total-label">Total Bill</span>
                    <span class="moc-total-val">₹${o.total}</span>
                </div>
                <div class="moc-actions-group">
                    <select class="moc-status-select" onchange="changeOrderStatus('${o.id}', this.value)">
                        <option value="Order Placed" ${o.status === 'Order Placed' ? 'selected' : ''}>Order Placed</option>
                        <option value="Picked Up" ${o.status === 'Picked Up' ? 'selected' : ''}>Picked Up</option>
                        <option value="In Wash / Dry Clean" ${o.status === 'In Wash / Dry Clean' ? 'selected' : ''}>In Wash</option>
                        <option value="Out for Delivery" ${o.status === 'Out for Delivery' ? 'selected' : ''}>Out for Delivery</option>
                        <option value="Delivered" ${o.status === 'Delivered' ? 'selected' : ''}>Delivered</option>
                        <option value="Cancelled" ${o.status === 'Cancelled' ? 'selected' : ''}>Cancelled</option>
                    </select>
                    <button class="btn-row-action inv" title="Print Bill" onclick="viewOrderInvoice('${o.id}')">
                        <i class="fas fa-file-invoice"></i>
                    </button>
                    <button class="btn-row-action wa" title="WhatsApp Update" onclick="sendWhatsAppUpdate('${o.id}')">
                        <i class="fab fa-whatsapp"></i>
                    </button>
                </div>
            </div>
        </div>
    `;
}

function formatItemsSummary(items) {
    if (!items || items.length === 0) return '<span style="color:#94a3b8;">Doorstep Lot</span>';
    return items.map(it => `<div><strong>${it.qty}x</strong> ${it.name} <span style="font-size:0.7rem; color:#64748b;">[${it.service || 'Clean'}]</span></div>`).join('');
}

function renderStatusBadge(status) {
    let cls = 'status-placed';
    if (status === 'Picked Up') cls = 'status-pickup';
    else if (status === 'In Wash / Dry Clean') cls = 'status-washing';
    else if (status === 'Out for Delivery') cls = 'status-out';
    else if (status === 'Delivered') cls = 'status-delivered';
    else if (status === 'Cancelled') cls = 'status-cancelled';

    return `<span class="status-badge ${cls}"><span class="dot"></span> ${status}</span>`;
}

function renderPaymentBadge(pay, orderId) {
    if (!pay || pay.status === 'Unpaid') {
        return `<span class="pay-badge pay-unpaid" onclick="openRecordPaymentModal('${orderId}')" style="cursor:pointer;" title="Click to Record Payment"><i class="fas fa-exclamation-circle"></i> Due: ₹${pay ? pay.dueAmount : ''}</span>`;
    } else if (pay.status === 'Partial') {
        return `<span class="pay-badge pay-partial" onclick="openRecordPaymentModal('${orderId}')" style="cursor:pointer;" title="Click to Collect Remaining Balance"><i class="fas fa-adjust"></i> Partial (Due: ₹${pay.dueAmount})</span>`;
    } else {
        return `<span class="pay-badge pay-paid" onclick="openRecordPaymentModal('${orderId}')" style="cursor:pointer;" title="Paid in Full"><i class="fas fa-check-circle"></i> Paid (${pay.mode || 'UPI'})</span>`;
    }
}

// 3. PAYMENT ENTRY & MANAGEMENT CONTROLLER
let currentPaymentOrderId = null;

function openRecordPaymentModal(orderId) {
    const orders = getAdminOrders();
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    currentPaymentOrderId = orderId;
    const pay = getOrderPayment(order);

    const elDisplay = document.getElementById('payModalOrderDisplay');
    const elCust = document.getElementById('payModalCustName');
    const elTotal = document.getElementById('payModalTotalAmount');
    const elDue = document.getElementById('payModalDueAmount');
    const elAmount = document.getElementById('payAmountInput');
    const elMethod = document.getElementById('payMethodSelect');
    const elRef = document.getElementById('payRefInput');
    const elNotes = document.getElementById('payNotesInput');

    if (elDisplay) elDisplay.textContent = '#' + order.id;
    if (elCust) elCust.textContent = `${order.customer.name} (${order.customer.phone})`;
    if (elTotal) elTotal.textContent = `₹${order.total}`;
    if (elDue) elDue.textContent = `₹${pay.dueAmount !== undefined ? pay.dueAmount : order.total}`;
    
    // Default collection amount: remaining balance (or total if due is 0)
    if (elAmount) elAmount.value = pay.dueAmount > 0 ? pay.dueAmount : order.total;
    if (elMethod) elMethod.value = pay.mode || 'UPI';
    if (elRef) elRef.value = pay.transactionId || '';
    if (elNotes) elNotes.value = pay.notes || '';

    openAdminModal('admPaymentModal');
}

function markFullPaidShortcut() {
    const orders = getAdminOrders();
    const order = orders.find(o => o.id === currentPaymentOrderId);
    if (!order) return;
    const pay = getOrderPayment(order);
    const elAmount = document.getElementById('payAmountInput');
    if (elAmount) elAmount.value = pay.dueAmount > 0 ? pay.dueAmount : order.total;
}

function handleRecordPaymentSubmit(e) {
    e.preventDefault();
    if (!currentPaymentOrderId) return;

    const orders = getAdminOrders();
    const order = orders.find(o => o.id === currentPaymentOrderId);
    if (!order) return;

    const method = document.getElementById('payMethodSelect').value;
    const enteredAmount = parseFloat(document.getElementById('payAmountInput').value) || 0;
    const ref = document.getElementById('payRefInput').value.trim();
    const notes = document.getElementById('payNotesInput').value.trim();

    const existingPay = getOrderPayment(order);
    const newPaidAmount = (existingPay.paidAmount || 0) + enteredAmount;
    const newDueAmount = Math.max(0, order.total - newPaidAmount);

    let newStatus = 'Unpaid';
    if (newDueAmount === 0) {
        newStatus = 'Paid';
    } else if (newPaidAmount > 0) {
        newStatus = 'Partial';
    }

    order.payment = {
        status: newStatus,
        mode: method,
        paidAmount: newPaidAmount,
        dueAmount: newDueAmount,
        transactionId: ref,
        paidAt: new Date().toISOString(),
        notes: notes
    };

    saveAdminOrders(orders);
    closeAdminModal('admPaymentModal');
    alert(`Payment of ₹${enteredAmount} recorded successfully via ${method}! New status: ${newStatus}`);
}

// Change Order Status
function changeOrderStatus(orderId, newStatus) {
    const orders = getAdminOrders();
    const idx = orders.findIndex(o => o.id === orderId);
    if (idx !== -1) {
        orders[idx].status = newStatus;
        saveAdminOrders(orders);
        renderOrdersTable();
    }
}

// Delete Order
function deleteOrder(orderId) {
    if (!confirm(`Are you sure you want to delete order ${orderId}?`)) return;
    let orders = getAdminOrders();
    orders = orders.filter(o => o.id !== orderId);
    saveAdminOrders(orders);
    renderOrdersTable();
}

// WhatsApp Dispatch to Customer (Includes payment status & balance)
function sendWhatsAppUpdate(orderId) {
    const orders = getAdminOrders();
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    let phoneClean = order.customer.phone.replace(/[^0-9]/g, '');
    if (phoneClean.length === 10) phoneClean = '91' + phoneClean;

    const pay = getOrderPayment(order);
    const paymentLine = pay.status === 'Paid'
        ? `✅ *Payment:* PAID in Full (₹${pay.paidAmount} via ${pay.mode})`
        : `⚠️ *Payment Status:* ${pay.status} (Balance Due: ₹${pay.dueAmount})`;

    const message = `*THE SUPREME LAUNDRY UPDATE*\n` +
        `--------------------------------\n` +
        `Hello ${order.customer.name},\n` +
        `Your laundry order *#${order.id}* status is: *${order.status}*\n\n` +
        `📍 *Pickup / Drop:* ${order.customer.address}\n` +
        `💰 *Total Bill:* ₹${order.total}\n` +
        `${paymentLine}\n\n` +
        `For any questions, call our store helpline: 9007895400.\n` +
        `Store: Near Kalurmore Bus Stand, Action Area 2, New Town.`;

    window.open(`https://wa.me/${phoneClean}?text=${encodeURIComponent(message)}`, '_blank');
}

// View & Print Order Invoice (With accurate payment status)
function viewOrderInvoice(orderId) {
    const orders = getAdminOrders();
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    const modalBody = document.getElementById('admInvoiceModalContent');
    if (!modalBody) return;

    const pay = getOrderPayment(order);

    let rowsHTML = '';
    (order.items || []).forEach((it, idx) => {
        rowsHTML += `
            <tr>
                <td>#${idx + 1}</td>
                <td><strong>${it.name}</strong></td>
                <td>${it.service || 'Care'}</td>
                <td style="text-align:center;">${it.qty}</td>
                <td style="text-align:right;">₹${it.price}</td>
                <td style="text-align:right;"><strong>₹${it.total}</strong></td>
            </tr>
        `;
    });

    modalBody.innerHTML = `
        <div style="font-family: 'Plus Jakarta Sans', sans-serif; color:#1e293b; padding:10px;">
            <div style="display:flex; justify-content:space-between; align-items:flex-start; border-bottom:2px solid #0f172a; padding-bottom:12px; margin-bottom:12px;">
                <div>
                    <h2 style="font-family:'Outfit',sans-serif; margin:0; font-size:1.3rem; color:#0f172a;">The Supreme Laundry</h2>
                    <div style="font-size:0.75rem; color:#64748b;">Dry Cleaning &amp; Premium Garment Care Specialist</div>
                    <div style="font-size:0.74rem; margin-top:4px;"><strong>Location:</strong> Near Kalurmore Bus Stand, Action Area 2, New Town</div>
                    <div style="font-size:0.74rem;"><strong>Helpline:</strong> 9007895400</div>
                </div>
                <div style="text-align:right;">
                    <div style="background:#eff6ff; color:#1d4ed8; font-weight:800; padding:2px 8px; border-radius:4px; font-size:0.72rem; display:inline-block; margin-bottom:4px;">INVOICE</div>
                    <div style="font-size:0.75rem;">Inv #: <strong>${order.id}</strong></div>
                    <div style="font-size:0.75rem;">Status: <strong>${order.status}</strong></div>
                    <div style="font-size:0.75rem; margin-top:3px;">
                        Payment: <strong>${pay.status === 'Paid' ? 'PAID (' + pay.mode + ')' : 'DUE ₹' + pay.dueAmount}</strong>
                    </div>
                </div>
            </div>

            <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; padding:10px; margin-bottom:14px; font-size:0.8rem; line-height:1.4;">
                <strong>Customer:</strong> ${order.customer.name} | <strong>Phone:</strong> ${order.customer.phone}<br>
                <strong>Address:</strong> ${order.customer.address}<br>
                <strong>Pickup Date:</strong> ${order.pickup?.date || 'N/A'} (${order.pickup?.slot || ''})
            </div>

            <table style="width:100%; border-collapse:collapse; font-size:0.8rem; margin-bottom:14px;">
                <thead>
                    <tr style="background:#f1f5f9; text-align:left;">
                        <th style="padding:6px;">#</th>
                        <th style="padding:6px;">Item</th>
                        <th style="padding:6px;">Service</th>
                        <th style="padding:6px; text-align:center;">Qty</th>
                        <th style="padding:6px; text-align:right;">Rate</th>
                        <th style="padding:6px; text-align:right;">Amount</th>
                    </tr>
                </thead>
                <tbody>
                    ${rowsHTML}
                </tbody>
            </table>

            <div style="display:flex; justify-content:flex-end;">
                <div style="width:260px; background:#f8fafc; border:1px solid #e2e8f0; border-radius:6px; padding:8px 12px; font-size:0.8rem;">
                    <div style="display:flex; justify-content:space-between; margin-bottom:3px;">
                        <span>Subtotal:</span>
                        <strong>₹${order.subtotal || order.total}</strong>
                    </div>
                    <div style="display:flex; justify-content:space-between; margin-bottom:3px; color:#16a34a;">
                        <span>Pickup &amp; Drop:</span>
                        <strong>${order.deliveryFee === 0 ? 'FREE' : '₹' + order.deliveryFee}</strong>
                    </div>
                    <div style="display:flex; justify-content:space-between; border-top:1.5px solid #0f172a; padding-top:6px; margin-top:4px; font-size:0.95rem; font-weight:800;">
                        <span>Total Bill:</span>
                        <span style="color:#1a73e8;">₹${order.total}</span>
                    </div>
                    <div style="display:flex; justify-content:space-between; margin-top:4px; font-size:0.75rem; color:${pay.dueAmount > 0 ? '#dc2626' : '#16a34a'};">
                        <span>${pay.dueAmount > 0 ? 'Balance Due:' : 'Paid via ' + (pay.mode || 'Cash') + ':'}</span>
                        <strong>${pay.dueAmount > 0 ? '₹' + pay.dueAmount : 'PAID IN FULL'}</strong>
                    </div>
                </div>
            </div>

            <div style="text-align:center; margin-top:18px; border-top:1px dashed #cbd5e1; padding-top:10px; font-size:0.72rem; color:#64748b;">
                Thank you for choosing The Supreme Laundry! Care Helpline: 9007895400
            </div>
        </div>
    `;

    openAdminModal('admInvoiceModal');
}

// State for Dynamic Rate Card Filtering
let currentRateCategory = 'all';
let currentRateSearch = '';

// Fast Non-Blocking Admin Toast Notification
function showAdminToast(message, type = 'success') {
    let toast = document.getElementById('adminToast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'adminToast';
        toast.className = 'admin-toast';
        document.body.appendChild(toast);
    }
    toast.innerHTML = `<i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-info-circle'}"></i> <span>${message}</span>`;
    toast.className = `admin-toast show ${type}`;
    if (window.adminToastTimeout) clearTimeout(window.adminToastTimeout);
    window.adminToastTimeout = setTimeout(() => {
        toast.className = 'admin-toast';
    }, 2200);
}

// Category filter handler for rate cards
function filterRateCategory(catKey) {
    currentRateCategory = catKey;
    document.querySelectorAll('.rate-cat-pill').forEach(btn => {
        if (btn.getAttribute('data-cat') === catKey) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
    renderRateCardEditor();
}

// Live search handler for rate cards
function handleRateSearch(query) {
    currentRateSearch = (query || '').trim().toLowerCase();
    const clearBtn = document.getElementById('rateClearSearchBtn');
    if (clearBtn) {
        clearBtn.style.display = currentRateSearch.length > 0 ? 'block' : 'none';
    }
    renderRateCardEditor();
}

// Clear search handler
function clearRateSearch() {
    currentRateSearch = '';
    const input = document.getElementById('rateSearchInput');
    if (input) input.value = '';
    const clearBtn = document.getElementById('rateClearSearchBtn');
    if (clearBtn) clearBtn.style.display = 'none';
    renderRateCardEditor();
}

// Mark mobile card as modified when user types
function markRateCardModified(itemId) {
    const card = document.getElementById(`mrc_${itemId}`);
    if (card && !card.classList.contains('modified')) {
        card.classList.add('modified');
    }
}

// Quick Stepper Adjustment (+₹10 / -₹10)
function adjustItemRates(itemId, delta) {
    const washInput = document.getElementById(`mprice_${itemId}_wash`);
    const dryInput = document.getElementById(`mprice_${itemId}_dry`);
    const premInput = document.getElementById(`mprice_${itemId}_prem`);
    const ironInput = document.getElementById(`mprice_${itemId}_price`);

    if (washInput && !washInput.disabled) washInput.value = Math.max(0, (parseFloat(washInput.value) || 0) + delta);
    if (dryInput && !dryInput.disabled) dryInput.value = Math.max(0, (parseFloat(dryInput.value) || 0) + delta);
    if (premInput && !premInput.disabled) premInput.value = Math.max(0, (parseFloat(premInput.value) || 0) + delta);
    if (ironInput && !ironInput.disabled) ironInput.value = Math.max(0, (parseFloat(ironInput.value) || 0) + delta);

    saveMobileItemPrice(itemId, true);
}

// Auto-save on input blur or change
function autoSaveMobileItemRate(itemId) {
    saveMobileItemPrice(itemId, false);
}

// 4. DYNAMIC RATE CARD & PRICE EDITOR (Desktop Table + Mobile Cards with Search & Pills)
function renderRateCardEditor() {
    const tableBody = document.getElementById('rateCardTableBody');
    const mobileContainer = document.getElementById('rateCardsMobileList');
    const countBadge = document.getElementById('rateCountBadge');

    if (typeof PRICING_DATA === 'undefined') {
        if (tableBody) tableBody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:24px;">Price database not loaded.</td></tr>`;
        if (mobileContainer) mobileContainer.innerHTML = `<div style="text-align:center; padding:24px;">Price database not loaded.</div>`;
        return;
    }

    const customPrices = JSON.parse(localStorage.getItem(STORAGE_KEY_CUSTOM_PRICES) || '{}');

    // Update Category Pills Counts
    let totalAllItems = 0;
    PRICING_DATA.forEach(cat => {
        totalAllItems += cat.items.length;
        const pillId = cat.categoryKey === 'men' ? 'pillCountMen'
            : cat.categoryKey === 'women' ? 'pillCountWomen'
            : cat.categoryKey === 'home' ? 'pillCountHome'
            : cat.categoryKey === 'sofa' ? 'pillCountSofa'
            : cat.categoryKey === 'iron' ? 'pillCountIron' : null;
        if (pillId) {
            const el = document.getElementById(pillId);
            if (el) el.textContent = cat.items.length;
        }
    });
    const pillAll = document.getElementById('pillCountAll');
    if (pillAll) pillAll.textContent = totalAllItems;

    let rowsHTML = '';
    let cardsHTML = '';
    let visibleItemsCount = 0;

    PRICING_DATA.forEach(category => {
        // Filter by category pill if not 'all'
        if (currentRateCategory !== 'all' && category.categoryKey !== currentRateCategory) {
            return;
        }

        // Filter items by search query
        const matchingItems = category.items.filter(item => {
            if (!currentRateSearch) return true;
            return item.name.toLowerCase().includes(currentRateSearch) ||
                   category.categoryName.toLowerCase().includes(currentRateSearch);
        });

        if (matchingItems.length === 0) return;

        visibleItemsCount += matchingItems.length;

        // Category section header for desktop
        rowsHTML += `
            <tr style="background:#f1f5f9; font-weight:800; color:#0f172a;">
                <td colspan="6" style="padding:10px 14px; text-transform:uppercase; font-size:0.75rem; letter-spacing:0.05em;">
                    <i class="fas fa-tag" style="color:#10b981;"></i> ${category.categoryName} (${matchingItems.length} items)
                </td>
            </tr>
        `;

        // Category separator on mobile when showing all
        if (currentRateCategory === 'all') {
            cardsHTML += `
                <div style="font-weight:800; font-size:0.78rem; color:#64748b; text-transform:uppercase; margin-top:10px; margin-bottom:4px; display:flex; align-items:center; gap:6px;">
                    <i class="fas fa-folder-open" style="color:#10b981;"></i> ${category.categoryName} (${matchingItems.length})
                </div>
            `;
        }

        matchingItems.forEach(item => {
            const savedWash = customPrices[`${item.id}_wash`] !== undefined ? customPrices[`${item.id}_wash`] : item.washPrice;
            const savedDry = customPrices[`${item.id}_dry`] !== undefined ? customPrices[`${item.id}_dry`] : item.dryPrice;
            const savedPrem = customPrices[`${item.id}_prem`] !== undefined ? customPrices[`${item.id}_prem`] : item.premPrice;
            const savedPrice = customPrices[`${item.id}_price`] !== undefined ? customPrices[`${item.id}_price`] : item.price;

            const isIronOnly = category.categoryKey === 'iron' || (item.washPrice === undefined && item.dryPrice === undefined);
            const isSofaOrCarpet = category.categoryKey === 'sofa' || (item.washPrice === null && item.premPrice === null && item.dryPrice !== null);

            // Desktop Table Row
            if (isIronOnly) {
                rowsHTML += `
                    <tr>
                        <td><strong>${item.name}</strong></td>
                        <td><span style="font-size:0.72rem; color:#64748b;">${category.categoryName}</span></td>
                        <td colspan="3">
                            <span style="font-size:0.75rem; font-weight:700; color:#10b981; margin-right:8px;">Steam Iron / Flat:</span>
                            ₹ <input type="number" id="price_${item.id}_price" value="${savedPrice || 0}" style="width:85px; padding:4px 8px; border:1px solid #cbd5e1; border-radius:6px; font-weight:800;" onchange="saveSingleItemPrice('${item.id}')">
                            <span style="font-size:0.72rem; color:#94a3b8;">/ ${item.unit || 'pc'}${item.plus ? '+' : ''}</span>
                        </td>
                        <td>
                            <button class="btn-save-rates" onclick="saveSingleItemPrice('${item.id}')" title="Save this item rate" style="padding:6px 14px; font-size:0.75rem;">
                                <i class="fas fa-check"></i> Save
                            </button>
                        </td>
                    </tr>
                `;
            } else if (isSofaOrCarpet) {
                rowsHTML += `
                    <tr>
                        <td><strong>${item.name}</strong></td>
                        <td><span style="font-size:0.72rem; color:#64748b;">${category.categoryName}</span></td>
                        <td><span style="color:#cbd5e1; font-weight:600;">N/A</span></td>
                        <td>
                            ₹ <input type="number" id="price_${item.id}_dry" value="${savedDry || 0}" style="width:75px; padding:4px 8px; border:1px solid #cbd5e1; border-radius:6px; font-weight:800;" onchange="saveSingleItemPrice('${item.id}')">
                            <span style="font-size:0.72rem; color:#64748b; font-weight:600;">/ ${item.unit || 'seat'}</span>
                        </td>
                        <td><span style="color:#cbd5e1; font-weight:600;">N/A</span></td>
                        <td>
                            <button class="btn-save-rates" onclick="saveSingleItemPrice('${item.id}')" title="Save this item rate" style="padding:6px 14px; font-size:0.75rem;">
                                <i class="fas fa-check"></i> Save
                            </button>
                        </td>
                    </tr>
                `;
            } else {
                rowsHTML += `
                    <tr>
                        <td><strong>${item.name}</strong></td>
                        <td><span style="font-size:0.72rem; color:#64748b;">${category.categoryName}</span></td>
                        <td>
                            ${item.washPrice !== undefined && item.washPrice !== null ? `₹ <input type="number" id="price_${item.id}_wash" value="${savedWash || 0}" style="width:75px; padding:4px 8px; border:1px solid #cbd5e1; border-radius:6px; font-weight:800;" onchange="saveSingleItemPrice('${item.id}')">` : '<span style="color:#cbd5e1;">—</span>'}
                        </td>
                        <td>
                            ${item.dryPrice !== undefined && item.dryPrice !== null ? `₹ <input type="number" id="price_${item.id}_dry" value="${savedDry || 0}" style="width:75px; padding:4px 8px; border:1px solid #cbd5e1; border-radius:6px; font-weight:800;" onchange="saveSingleItemPrice('${item.id}')">` : '<span style="color:#cbd5e1;">—</span>'}
                        </td>
                        <td>
                            ${item.premPrice !== undefined && item.premPrice !== null ? `₹ <input type="number" id="price_${item.id}_prem" value="${savedPrem || 0}" style="width:75px; padding:4px 8px; border:1px solid #cbd5e1; border-radius:6px; font-weight:800;" onchange="saveSingleItemPrice('${item.id}')">` : '<span style="color:#cbd5e1;">—</span>'}
                        </td>
                        <td>
                            <button class="btn-save-rates" onclick="saveSingleItemPrice('${item.id}')" title="Save this item rate" style="padding:6px 14px; font-size:0.75rem;">
                                <i class="fas fa-check"></i> Save
                            </button>
                        </td>
                    </tr>
                `;
            }

            // Mobile Compact Card (< 768px)
            if (isIronOnly) {
                cardsHTML += `
                    <div class="adm-mobile-rate-card" id="mrc_${item.id}">
                        <div class="mrc-header">
                            <div class="mrc-title-group">
                                <span class="mrc-name">${item.name}</span>
                                <span class="mrc-cat"><i class="fas fa-bolt"></i> Steam Iron (${item.unit || 'pc'})${item.plus ? ' • Base+' : ''}</span>
                            </div>
                            <button type="button" class="mrc-save-icon-btn" id="mrc_btn_${item.id}" onclick="saveMobileItemPrice('${item.id}')">
                                <i class="fas fa-check"></i> <span>Save</span>
                            </button>
                        </div>
                        <div class="mrc-inputs-grid single-input">
                            <div class="mrc-input-box">
                                <label>Steam Iron Price (₹ per ${item.unit || 'pc'})</label>
                                <div class="mrc-input-wrap">
                                    <span>₹</span>
                                    <input type="number" id="mprice_${item.id}_price" value="${savedPrice || 0}" oninput="markRateCardModified('${item.id}')" onblur="autoSaveMobileItemRate('${item.id}')">
                                </div>
                            </div>
                        </div>
                        <div class="mrc-quick-stepper-row">
                            <span class="mrc-quick-tip"><i class="fas fa-shield-alt"></i> Auto-saves on change</span>
                            <div class="mrc-quick-btns">
                                <button type="button" class="mrc-quick-btn" onclick="adjustItemRates('${item.id}', 10)">+₹10</button>
                                <button type="button" class="mrc-quick-btn" onclick="adjustItemRates('${item.id}', 50)">+₹50</button>
                                <button type="button" class="mrc-quick-btn" onclick="adjustItemRates('${item.id}', -10)">-₹10</button>
                            </div>
                        </div>
                    </div>
                `;
            } else if (isSofaOrCarpet) {
                cardsHTML += `
                    <div class="adm-mobile-rate-card" id="mrc_${item.id}">
                        <div class="mrc-header">
                            <div class="mrc-title-group">
                                <span class="mrc-name">${item.name}</span>
                                <span class="mrc-cat"><i class="fas fa-couch"></i> ${item.cat || 'Sofa Cleaning'} (${item.unit || 'seat'})</span>
                            </div>
                            <button type="button" class="mrc-save-icon-btn" id="mrc_btn_${item.id}" onclick="saveMobileItemPrice('${item.id}')">
                                <i class="fas fa-check"></i> <span>Save</span>
                            </button>
                        </div>
                        <div class="mrc-inputs-grid single-input">
                            <div class="mrc-input-box">
                                <label>Soft Dry Clean (₹ per ${item.unit || 'seat'})</label>
                                <div class="mrc-input-wrap">
                                    <span>₹</span>
                                    <input type="number" id="mprice_${item.id}_dry" value="${savedDry || 0}" oninput="markRateCardModified('${item.id}')" onblur="autoSaveMobileItemRate('${item.id}')">
                                </div>
                            </div>
                        </div>
                        <div class="mrc-quick-stepper-row">
                            <span class="mrc-quick-tip"><i class="fas fa-shield-alt"></i> Auto-saves on change</span>
                            <div class="mrc-quick-btns">
                                <button type="button" class="mrc-quick-btn" onclick="adjustItemRates('${item.id}', 10)">+₹10</button>
                                <button type="button" class="mrc-quick-btn" onclick="adjustItemRates('${item.id}', 50)">+₹50</button>
                                <button type="button" class="mrc-quick-btn" onclick="adjustItemRates('${item.id}', -10)">-₹10</button>
                            </div>
                        </div>
                    </div>
                `;
            } else {
                cardsHTML += `
                    <div class="adm-mobile-rate-card" id="mrc_${item.id}">
                        <div class="mrc-header">
                            <div class="mrc-title-group">
                                <span class="mrc-name">${item.name}</span>
                                <span class="mrc-cat">${category.categoryName}</span>
                            </div>
                            <button type="button" class="mrc-save-icon-btn" id="mrc_btn_${item.id}" onclick="saveMobileItemPrice('${item.id}')">
                                <i class="fas fa-check"></i> <span>Save</span>
                            </button>
                        </div>
                        <div class="mrc-inputs-grid">
                            <div class="mrc-input-box">
                                <label>Wash &amp; Iron</label>
                                <div class="mrc-input-wrap">
                                    <span>₹</span>
                                    <input type="number" id="mprice_${item.id}_wash" value="${savedWash || 0}" ${item.washPrice === null || item.washPrice === undefined ? 'disabled placeholder="—"' : ''} oninput="markRateCardModified('${item.id}')" onblur="autoSaveMobileItemRate('${item.id}')">
                                </div>
                            </div>
                            <div class="mrc-input-box">
                                <label>Soft Dry Clean</label>
                                <div class="mrc-input-wrap">
                                    <span>₹</span>
                                    <input type="number" id="mprice_${item.id}_dry" value="${savedDry || 0}" ${item.dryPrice === null || item.dryPrice === undefined ? 'disabled placeholder="—"' : ''} oninput="markRateCardModified('${item.id}')" onblur="autoSaveMobileItemRate('${item.id}')">
                                </div>
                            </div>
                            <div class="mrc-input-box">
                                <label>Prem. Clean</label>
                                <div class="mrc-input-wrap">
                                    <span>₹</span>
                                    <input type="number" id="mprice_${item.id}_prem" value="${savedPrem || 0}" ${item.premPrice === null || item.premPrice === undefined ? 'disabled placeholder="—"' : ''} oninput="markRateCardModified('${item.id}')" onblur="autoSaveMobileItemRate('${item.id}')">
                                </div>
                            </div>
                        </div>
                        <div class="mrc-quick-stepper-row">
                            <span class="mrc-quick-tip"><i class="fas fa-shield-alt"></i> Auto-saves on change</span>
                            <div class="mrc-quick-btns">
                                <button type="button" class="mrc-quick-btn" onclick="adjustItemRates('${item.id}', 10)">+₹10</button>
                                <button type="button" class="mrc-quick-btn" onclick="adjustItemRates('${item.id}', 50)">+₹50</button>
                                <button type="button" class="mrc-quick-btn" onclick="adjustItemRates('${item.id}', -10)">-₹10</button>
                            </div>
                        </div>
                    </div>
                `;
            }
        });
    });

    // Handle Empty Search Results
    if (visibleItemsCount === 0) {
        const emptyMsg = `
            <div class="rate-empty-state">
                <i class="fas fa-search"></i>
                <p>No garments found matching "<strong>${currentRateSearch}</strong>"</p>
                <button type="button" onclick="clearRateSearch()"><i class="fas fa-times-circle"></i> Clear Search Filter</button>
            </div>
        `;
        rowsHTML = `<tr><td colspan="6">${emptyMsg}</td></tr>`;
        cardsHTML = emptyMsg;
    }

    // Update count indicator
    if (countBadge) {
        countBadge.textContent = currentRateSearch 
            ? `Found ${visibleItemsCount} of ${totalAllItems} items`
            : currentRateCategory !== 'all'
                ? `Showing ${visibleItemsCount} items`
                : `Showing all ${totalAllItems} items`;
    }

    if (tableBody) tableBody.innerHTML = rowsHTML;
    if (mobileContainer) mobileContainer.innerHTML = cardsHTML;
}

// Save single price from desktop table
function saveSingleItemPrice(itemId) {
    const customPrices = JSON.parse(localStorage.getItem(STORAGE_KEY_CUSTOM_PRICES) || '{}');

    const washInput = document.getElementById(`price_${itemId}_wash`);
    const dryInput = document.getElementById(`price_${itemId}_dry`);
    const premInput = document.getElementById(`price_${itemId}_prem`);
    const priceInput = document.getElementById(`price_${itemId}_price`);

    if (washInput) customPrices[`${itemId}_wash`] = parseFloat(washInput.value) || 0;
    if (dryInput) customPrices[`${itemId}_dry`] = parseFloat(dryInput.value) || 0;
    if (premInput) customPrices[`${itemId}_prem`] = parseFloat(premInput.value) || 0;
    if (priceInput) customPrices[`${itemId}_price`] = parseFloat(priceInput.value) || 0;

    localStorage.setItem(STORAGE_KEY_CUSTOM_PRICES, JSON.stringify(customPrices));
    showAdminToast(`Rate saved for item! Synced to customer booking portal.`, 'success');
}

// Save single price from mobile card (with visual feedback)
function saveMobileItemPrice(itemId, fromStepper = false) {
    const customPrices = JSON.parse(localStorage.getItem(STORAGE_KEY_CUSTOM_PRICES) || '{}');

    const washInput = document.getElementById(`mprice_${itemId}_wash`);
    const dryInput = document.getElementById(`mprice_${itemId}_dry`);
    const premInput = document.getElementById(`mprice_${itemId}_prem`);
    const priceInput = document.getElementById(`mprice_${itemId}_price`);

    let anySaved = false;
    if (washInput && !washInput.disabled) { customPrices[`${itemId}_wash`] = parseFloat(washInput.value) || 0; anySaved = true; }
    if (dryInput && !dryInput.disabled) { customPrices[`${itemId}_dry`] = parseFloat(dryInput.value) || 0; anySaved = true; }
    if (premInput && !premInput.disabled) { customPrices[`${itemId}_prem`] = parseFloat(premInput.value) || 0; anySaved = true; }
    if (priceInput && !priceInput.disabled) { customPrices[`${itemId}_price`] = parseFloat(priceInput.value) || 0; anySaved = true; }

    if (anySaved) {
        localStorage.setItem(STORAGE_KEY_CUSTOM_PRICES, JSON.stringify(customPrices));

        const card = document.getElementById(`mrc_${itemId}`);
        const btn = document.getElementById(`mrc_btn_${itemId}`);

        if (card) {
            card.classList.remove('modified');
            card.classList.add('saved-flash');
            setTimeout(() => card.classList.remove('saved-flash'), 1200);
        }

        if (btn) {
            btn.innerHTML = `<i class="fas fa-check-double"></i> <span>Saved!</span>`;
            btn.classList.add('saved');
            setTimeout(() => {
                btn.innerHTML = `<i class="fas fa-check"></i> <span>Save</span>`;
                btn.classList.remove('saved');
            }, 1400);
        }

        showAdminToast(fromStepper ? `Price adjusted & saved!` : `Rate saved & synced to portal!`, 'success');
    }
}

// Save All Prices Bulk Action
function saveAllPrices() {
    if (typeof PRICING_DATA === 'undefined') return;
    const customPrices = JSON.parse(localStorage.getItem(STORAGE_KEY_CUSTOM_PRICES) || '{}');

    PRICING_DATA.forEach(cat => {
        cat.items.forEach(item => {
            const washInput = document.getElementById(`price_${item.id}_wash`) || document.getElementById(`mprice_${item.id}_wash`);
            const dryInput = document.getElementById(`price_${item.id}_dry`) || document.getElementById(`mprice_${item.id}_dry`);
            const premInput = document.getElementById(`price_${item.id}_prem`) || document.getElementById(`mprice_${item.id}_prem`);
            const priceInput = document.getElementById(`price_${item.id}_price`) || document.getElementById(`mprice_${item.id}_price`);

            if (washInput && !washInput.disabled) customPrices[`${item.id}_wash`] = parseFloat(washInput.value) || 0;
            if (dryInput && !dryInput.disabled) customPrices[`${item.id}_dry`] = parseFloat(dryInput.value) || 0;
            if (premInput && !premInput.disabled) customPrices[`${item.id}_prem`] = parseFloat(premInput.value) || 0;
            if (priceInput && !priceInput.disabled) customPrices[`${item.id}_price`] = parseFloat(priceInput.value) || 0;
        });
    });

    localStorage.setItem(STORAGE_KEY_CUSTOM_PRICES, JSON.stringify(customPrices));
    showAdminToast("All rate card prices saved successfully!", "success");
}

// 5. CUSTOMER DIRECTORY & CRM (Desktop Table + Mobile Cards)
function renderCustomerDirectory() {
    const orders = getAdminOrders();
    const tbody = document.getElementById('customerDirectoryTableBody');
    const mobileContainer = document.getElementById('customerDirectoryCardsMobile');

    const customerMap = {};

    orders.forEach(o => {
        const phone = o.customer.phone || 'Unknown';
        if (!customerMap[phone]) {
            customerMap[phone] = {
                name: o.customer.name,
                phone: phone,
                address: o.customer.address,
                ordersCount: 0,
                totalSpent: 0,
                lastOrderDate: o.timestamp
            };
        }
        customerMap[phone].ordersCount++;
        customerMap[phone].totalSpent += (o.total || 0);
    });

    const customers = Object.values(customerMap);
    if (customers.length === 0) {
        if (tbody) tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:32px; color:#94a3b8;">No customer records yet.</td></tr>`;
        if (mobileContainer) mobileContainer.innerHTML = `<div style="text-align:center; padding:32px; color:#94a3b8;">No customer records yet.</div>`;
        return;
    }

    // Desktop Table
    if (tbody) {
        tbody.innerHTML = customers.map(c => {
            let phoneClean = c.phone.replace(/[^0-9]/g, '');
            if (phoneClean.length === 10) phoneClean = '91' + phoneClean;

            return `
                <tr>
                    <td><strong>${c.name}</strong></td>
                    <td>
                        <a href="tel:${c.phone}" style="color:#1a73e8; text-decoration:none; font-weight:600;">
                            ${c.phone}
                        </a>
                    </td>
                    <td style="max-width:240px; font-size:0.75rem; color:#475569;">${c.address}</td>
                    <td><span style="font-weight:700; background:#eff6ff; color:#1d4ed8; padding:3px 8px; border-radius:12px; font-size:0.75rem;">${c.ordersCount} Orders</span></td>
                    <td><strong style="color:#0f172a;">₹${c.totalSpent.toLocaleString('en-IN')}</strong></td>
                    <td>
                        <a href="https://wa.me/${phoneClean}?text=Hello%20${encodeURIComponent(c.name)},%20Greetings%20from%20The%20Supreme%20Laundry!%20Special%20discounts%20available%20for%20your%20next%20pickup." target="_blank" class="btn-row-action wa" style="text-decoration:none;" title="Send WhatsApp Offer">
                            <i class="fab fa-whatsapp"></i>
                        </a>
                    </td>
                </tr>
            `;
        }).join('');
    }

    // Mobile Cards
    if (mobileContainer) {
        mobileContainer.innerHTML = customers.map(c => {
            let phoneClean = c.phone.replace(/[^0-9]/g, '');
            if (phoneClean.length === 10) phoneClean = '91' + phoneClean;

            return `
                <div class="adm-mobile-customer-card">
                    <div class="mcc-top">
                        <div>
                            <span class="mcc-name">${c.name}</span><br>
                            <a href="tel:${c.phone}" class="mcc-phone"><i class="fas fa-phone-alt"></i> ${c.phone}</a>
                        </div>
                        <span class="mcc-orders-badge">${c.ordersCount} Bookings</span>
                    </div>
                    <div class="mcc-address"><i class="fas fa-map-marker-alt" style="color:#ef4444;"></i> ${c.address}</div>
                    <div class="mcc-footer">
                        <span class="mcc-spend">Lifetime Spent: <strong>₹${c.totalSpent.toLocaleString('en-IN')}</strong></span>
                        <a href="https://wa.me/${phoneClean}?text=Hello%20${encodeURIComponent(c.name)},%20Greetings%20from%20The%20Supreme%20Laundry!%20Special%20offers%20available%20for%20your%20next%20pickup." target="_blank" class="mcc-wa-btn">
                            <i class="fab fa-whatsapp"></i> WhatsApp
                        </a>
                    </div>
                </div>
            `;
        }).join('');
    }
}

// 6. STORE SETTINGS
function loadSettingsForm() {
    const config = JSON.parse(localStorage.getItem(STORAGE_KEY_STORE_CONFIG)) || defaultStoreConfig;

    const elPhone = document.getElementById('setStorePhone');
    const elAddress = document.getElementById('setStoreAddress');
    const elMinOrder = document.getElementById('setMinOrder');

    if (elPhone) elPhone.value = config.phone || '9007895400';
    if (elAddress) elAddress.value = config.address || 'Near Kalurmore Bus Stand, Action Area 2, New Town, Kolkata - 700160';
    if (elMinOrder) elMinOrder.value = config.minOrderFreeDelivery || 300;
}

function saveStoreSettings(e) {
    if (e) e.preventDefault();
    const config = {
        phone: document.getElementById('setStorePhone')?.value?.trim() || '9007895400',
        address: document.getElementById('setStoreAddress')?.value?.trim() || 'Near Kalurmore Bus Stand, Action Area 2, New Town, Kolkata - 700160',
        minOrderFreeDelivery: parseFloat(document.getElementById('setMinOrder')?.value) || 300
    };

    localStorage.setItem(STORAGE_KEY_STORE_CONFIG, JSON.stringify(config));

    // Check if new PIN was entered
    const newPin = document.getElementById('setNewPin')?.value?.trim();
    if (newPin) {
        changeAdminPin(newPin);
        document.getElementById('setNewPin').value = '';
    } else {
        alert("Store settings saved successfully!");
    }
}

// Manual Walk-in Order Creation
function openManualOrderModal() {
    openAdminModal('admManualOrderModal');
}

function handleManualOrderSubmit(e) {
    e.preventDefault();
    const name = document.getElementById('manCustName').value.trim();
    const phone = document.getElementById('manCustPhone').value.trim();
    const address = document.getElementById('manCustAddress').value.trim();
    const itemsNote = document.getElementById('manItemsNote').value.trim();
    const totalAmount = parseFloat(document.getElementById('manTotalAmount').value) || 0;

    const today = new Date();
    const dateCode = today.toISOString().slice(0,10).replace(/-/g, '');
    const randCode = Math.floor(1000 + Math.random() * 9000);
    const newId = `TSL-${dateCode}-${randCode}`;

    const newOrder = {
        id: newId,
        timestamp: today.toISOString(),
        customer: { name, phone, address: address || 'Store Walk-in / Drop-off' },
        pickup: {
            date: today.toISOString().slice(0, 10),
            slot: 'Direct Store Walk-in',
            speed: 'standard'
        },
        items: [{ name: itemsNote || 'Assorted Garments', service: 'Dry Clean / Wash', qty: 1, price: totalAmount, total: totalAmount }],
        subtotal: totalAmount,
        deliveryFee: 0,
        expressFee: 0,
        total: totalAmount,
        status: 'Order Placed',
        payment: {
            status: 'Unpaid',
            mode: 'Cash',
            paidAmount: 0,
            dueAmount: totalAmount,
            transactionId: '',
            paidAt: null,
            notes: 'Walk-in booking'
        }
    };

    const orders = getAdminOrders();
    orders.unshift(newOrder);
    saveAdminOrders(orders);

    closeAdminModal('admManualOrderModal');
    e.target.reset();
    alert(`Order ${newId} created successfully! You can now collect payment or update status.`);
}

// Modal Helpers
function openAdminModal(modalId) {
    const backdrop = document.getElementById('admBackdrop');
    const modal = document.getElementById(modalId);
    if (backdrop) backdrop.classList.add('show');
    if (modal) modal.classList.add('show');
}

function closeAdminModal(modalId) {
    const backdrop = document.getElementById('admBackdrop');
    const modal = document.getElementById(modalId);
    if (backdrop) backdrop.classList.remove('show');
    if (modal) modal.classList.remove('show');
}

function closeAllAdminModals() {
    const backdrop = document.getElementById('admBackdrop');
    if (backdrop) backdrop.classList.remove('show');
    document.querySelectorAll('.adm-modal-box').forEach(m => m.classList.remove('show'));
}

// Master Render
function renderAdminDashboard() {
    seedDemoOrdersIfEmpty();
    renderOverviewStats();
    renderOrdersTable();
    renderRateCardEditor();
    renderCustomerDirectory();
    loadSettingsForm();
}

// Init on load
document.addEventListener('DOMContentLoaded', () => {
    renderAdminDashboard();
});
