/* ==========================================================
   THE SUPREME LAUNDRY — ITEM CATALOGUE & METADATA
   Fast Editing & Low Token Usage Module
   Hotline: 9007895400
   ========================================================== */

// 1. OFFICIAL PRICE DATABASE (4 CATEGORIES: IRON, MEN, WOMEN, HOME)
window.PRICE_DATABASE = {
    iron: [
        { id: 'i1', name: 'Regular Garments', price: 15, unit: 'pc', cat: 'Steam Iron', icon: 'fa-tshirt', img: 'assets/items/item-regular.png' },
        { id: 'i2', name: 'Single Bedsheet', price: 30, unit: 'pc', cat: 'Steam Iron', icon: 'fa-bed' },
        { id: 'i3', name: 'Double Bedsheet', price: 40, unit: 'pc', cat: 'Steam Iron', icon: 'fa-bed', img: 'assets/items/item-bedsheet.png' },
        { id: 'i4', name: 'Kurti (Heavy)', price: 80, plus: true, unit: 'pc', cat: 'Steam Iron', icon: 'fa-female' },
        { id: 'i5', name: 'Kurta (Heavy)', price: 80, plus: true, unit: 'pc', cat: 'Steam Iron', icon: 'fa-user-tie' },
        { id: 'i6', name: 'Blazer', price: 150, unit: 'pc', cat: 'Steam Iron', icon: 'fa-vest', img: 'assets/items/item-blazer.png' },
        { id: 'i7', name: 'Waist Coat', price: 80, unit: 'pc', cat: 'Steam Iron', icon: 'fa-vest-patches' },
        { id: 'i8', name: 'Saree', price: 50, unit: 'pc', cat: 'Steam Iron', icon: 'fa-scroll', img: 'assets/items/item-saree.png' },
        { id: 'i9', name: 'Sherwani', price: 100, plus: true, unit: 'pc', cat: 'Steam Iron', icon: 'fa-crown' },
        { id: 'i10', name: 'Curtain', price: 150, plus: true, unit: 'panel', cat: 'Steam Iron', icon: 'fa-border-all' },
        { id: 'i11', name: 'Choli + Lahenga + Duppata', price: 350, unit: 'set', cat: 'Steam Iron', icon: 'fa-gem' },
        { id: 'i12', name: 'Lahenga', price: 150, unit: 'pc', cat: 'Steam Iron', icon: 'fa-female' }
    ],
    men: [
        { id: 'm1', name: 'Shirt / T-Shirt', washPrice: 40, dryPrice: 90, premPrice: 130, cat: "Men's Wear", icon: 'fa-tshirt', img: 'assets/items/item-men-shirt.png' },
        { id: 'm2', name: 'Pant / Trouser', washPrice: 50, dryPrice: 110, premPrice: 150, cat: "Men's Wear", icon: 'fa-socks', img: 'assets/items/item-men-trouser.png' },
        { id: 'm3', name: 'Jeans', washPrice: 60, dryPrice: 125, premPrice: 165, cat: "Men's Wear", icon: 'fa-user' },
        { id: 'm4', name: 'Kurta (Light)', washPrice: 90, dryPrice: 150, premPrice: 200, cat: "Men's Wear", icon: 'fa-user-tie' },
        { id: 'm5', name: 'Kurta (Heavy)', washPrice: null, dryPrice: 250, premPrice: 350, cat: "Men's Wear", icon: 'fa-user-tie' },
        { id: 'm6', name: 'Pyjama (Light)', washPrice: 50, dryPrice: 75, premPrice: 100, cat: "Men's Wear", icon: 'fa-user' },
        { id: 'm7', name: 'Pyjama (Heavy)', washPrice: null, dryPrice: 100, premPrice: 150, cat: "Men's Wear", icon: 'fa-user' },
        { id: 'm8', name: 'Blazer / Coat', washPrice: null, dryPrice: 300, premPrice: 350, cat: "Men's Wear", icon: 'fa-vest', img: 'assets/items/item-men-blazer.png' },
        { id: 'm9', name: 'Suit 2 Pcs', washPrice: null, dryPrice: 350, premPrice: 450, cat: "Men's Wear", icon: 'fa-user-tie', img: 'assets/items/item-men-suit.png' },
        { id: 'm10', name: 'Suit 3 Pcs', washPrice: null, dryPrice: 450, premPrice: 600, cat: "Men's Wear", icon: 'fa-user-tie' },
        { id: 'm11', name: 'Half Jacket', washPrice: null, dryPrice: 200, premPrice: 300, cat: "Men's Wear", icon: 'fa-vest' },
        { id: 'm12', name: 'Full Jacket', washPrice: null, dryPrice: 280, premPrice: 350, cat: "Men's Wear", icon: 'fa-mitten' },
        { id: 'm13', name: 'Overcoat', washPrice: null, dryPrice: 350, premPrice: 410, cat: "Men's Wear", icon: 'fa-coat' },
        { id: 'm14', name: 'Shoes (Kids)', washPrice: null, dryPrice: 160, premPrice: 250, cat: "Men's Wear", icon: 'fa-shoe-prints' },
        { id: 'm15', name: 'Shoes (Adult Pair)', washPrice: null, dryPrice: 320, premPrice: 370, cat: "Men's Wear", icon: 'fa-shoe-prints' },
        { id: 'm16', name: 'Socks Per Pair', washPrice: 20, dryPrice: 50, premPrice: 75, cat: "Men's Wear", icon: 'fa-socks' },
        { id: 'm17', name: 'Shorts', washPrice: 50, dryPrice: 75, premPrice: 100, cat: "Men's Wear", icon: 'fa-user', img: 'assets/items/item-shorts.jpg' },
        { id: 'm18', name: 'Full Sleeves Sweater / Cardigan', washPrice: null, dryPrice: 190, premPrice: 260, cat: "Men's Wear", icon: 'fa-snowflake' },
        { id: 'm19', name: 'Sleeveless Sweater / Cardigan', washPrice: null, dryPrice: 150, premPrice: 230, cat: "Men's Wear", icon: 'fa-snowflake' },
        { id: 'm20', name: 'Tie', washPrice: null, dryPrice: 50, premPrice: 80, cat: "Men's Wear", icon: 'fa-user-tie' },
        { id: 'm21', name: 'Dhoti / Lungi', washPrice: null, dryPrice: 120, premPrice: 220, cat: "Men's Wear", icon: 'fa-scroll' },
        { id: 'm22', name: 'Undergarments', washPrice: 35, dryPrice: 50, premPrice: 80, cat: "Men's Wear", icon: 'fa-tshirt' },
        { id: 'm23', name: 'Sherwani', washPrice: null, dryPrice: 350, premPrice: 450, cat: "Men's Wear", icon: 'fa-crown' }
    ],
    women: [
        { id: 'w1', name: 'Blouse / Top', washPrice: null, dryPrice: 80, premPrice: 110, cat: "Women's Wear", icon: 'fa-female' },
        { id: 'w2', name: 'Choli + Lahenga + Duppata (Regular)', washPrice: null, dryPrice: 450, premPrice: 570, cat: "Women's Wear", icon: 'fa-gem', img: 'assets/items/item-women-lehenga.png' },
        { id: 'w3', name: 'Choli + Lahenga + Duppata (Heavy)', washPrice: null, dryPrice: 750, premPrice: 1050, cat: "Women's Wear", icon: 'fa-crown' },
        { id: 'w4', name: 'Dress (Cotton)', washPrice: null, dryPrice: 200, premPrice: 250, cat: "Women's Wear", icon: 'fa-female' },
        { id: 'w5', name: 'Dress (Heavy)', washPrice: null, dryPrice: 410, premPrice: 550, cat: "Women's Wear", icon: 'fa-gem' },
        { id: 'w6', name: 'Duppata (Regular)', washPrice: 50, dryPrice: 90, premPrice: 120, cat: "Women's Wear", icon: 'fa-wind' },
        { id: 'w7', name: 'Duppata (Heavy)', washPrice: 70, dryPrice: 120, premPrice: 150, cat: "Women's Wear", icon: 'fa-wind' },
        { id: 'w8', name: 'Pyzama / Plazo', washPrice: 50, dryPrice: 90, premPrice: 120, cat: "Women's Wear", icon: 'fa-female' },
        { id: 'w9', name: 'Kurti (Light)', washPrice: 90, dryPrice: 150, premPrice: 200, cat: "Women's Wear", icon: 'fa-female', img: 'assets/items/item-women-kurti.png' },
        { id: 'w10', name: 'Kurti (Heavy)', washPrice: null, dryPrice: 250, premPrice: 350, cat: "Women's Wear", icon: 'fa-female' },
        { id: 'w11', name: 'Lenha / Skirt', washPrice: null, dryPrice: 350, premPrice: 480, cat: "Women's Wear", icon: 'fa-female' },
        { id: 'w12', name: 'Saree (Cotton / Synthetic / Light)', washPrice: null, dryPrice: 160, premPrice: 220, cat: "Women's Wear", icon: 'fa-scroll', img: 'assets/items/item-cotton-saree.jpg' },
        { id: 'w13', name: 'Saree (Silk / Chiffon / Georgette / Pattu / Heavy)', washPrice: null, dryPrice: 250, premPrice: 350, cat: "Women's Wear", icon: 'fa-scroll', img: 'assets/items/item-women-saree.png' },
        { id: 'w14', name: 'Saree (Heavy / Embroidered)', washPrice: null, dryPrice: 350, premPrice: 450, cat: "Women's Wear", icon: 'fa-crown' },
        { id: 'w15', name: 'Benarasi Saree', washPrice: null, dryPrice: 350, premPrice: 550, cat: "Women's Wear", icon: 'fa-crown' },
        { id: 'w16', name: 'Ritukumar / Sabyasachi & Others Branded Saree', washPrice: null, dryPrice: 1050, premPrice: 1550, cat: "Women's Wear", icon: 'fa-gem' },
        { id: 'w17', name: 'Petti Coat', washPrice: null, dryPrice: 60, premPrice: 120, cat: "Women's Wear", icon: 'fa-female' },
        { id: 'w18', name: 'Stole / Scraf', washPrice: null, dryPrice: 50, premPrice: 110, cat: "Women's Wear", icon: 'fa-wind' },
        { id: 'w19', name: 'Shorts', washPrice: null, dryPrice: 50, premPrice: 100, cat: "Women's Wear", icon: 'fa-user', img: 'assets/items/item-shorts.jpg' }
    ],
    home: [
        { id: 'h1', name: 'Bath Mat', washPrice: null, dryPrice: 50, premPrice: 100, cat: 'Home Linen', icon: 'fa-bath' },
        { id: 'h2', name: 'Bath Robe Small', washPrice: null, dryPrice: 60, premPrice: 100, cat: 'Home Linen', icon: 'fa-bath' },
        { id: 'h3', name: 'Bath Robe Big', washPrice: null, dryPrice: 90, premPrice: 150, cat: 'Home Linen', icon: 'fa-bath' },
        { id: 'h4', name: 'Bath Towel', washPrice: null, dryPrice: 60, premPrice: 120, cat: 'Home Linen', icon: 'fa-water', img: 'assets/items/item-home-towel.png' },
        { id: 'h5', name: 'Bed Cover Single', washPrice: null, dryPrice: 200, premPrice: 250, cat: 'Home Linen', icon: 'fa-bed' },
        { id: 'h6', name: 'Bed Cover Double / King', washPrice: null, dryPrice: 300, premPrice: 350, cat: 'Home Linen', icon: 'fa-bed' },
        { id: 'h7', name: 'Bed Sheet Single', washPrice: null, dryPrice: 100, premPrice: 150, cat: 'Home Linen', icon: 'fa-bed' },
        { id: 'h8', name: 'Bed Sheet Double / King', washPrice: null, dryPrice: 180, premPrice: 220, cat: 'Home Linen', icon: 'fa-bed', img: 'assets/items/item-home-bedsheet.png' },
        { id: 'h9', name: 'Blanket Single', washPrice: null, dryPrice: 320, premPrice: 380, cat: 'Home Linen', icon: 'fa-cloud', img: 'assets/items/item-home-blanket.png' },
        { id: 'h10', name: 'Blanket Double / King', washPrice: null, dryPrice: 410, premPrice: 480, cat: 'Home Linen', icon: 'fa-cloud' },
        { id: 'h11', name: 'Cushion Cover Small', washPrice: null, dryPrice: 70, premPrice: 120, cat: 'Home Linen', icon: 'fa-couch', img: 'assets/items/item-home-cushion.png' },
        { id: 'h12', name: 'Cushion Cover Big - Regular', washPrice: null, dryPrice: 120, premPrice: 150, cat: 'Home Linen', icon: 'fa-couch' },
        { id: 'h13', name: 'Pillow Cover Cotton / Terry Cotton', washPrice: null, dryPrice: 50, premPrice: 90, cat: 'Home Linen', icon: 'fa-bed' },
        { id: 'h14', name: 'Pillow Cover Heavy', washPrice: null, dryPrice: 100, premPrice: 150, cat: 'Home Linen', icon: 'fa-bed' },
        { id: 'h15', name: 'Quilt Cover Single', washPrice: null, dryPrice: 200, premPrice: 250, cat: 'Home Linen', icon: 'fa-bed' },
        { id: 'h16', name: 'Quilt Cover Double / King', washPrice: null, dryPrice: 300, premPrice: 350, cat: 'Home Linen', icon: 'fa-bed' },
        { id: 'h17', name: 'Quilt Single', washPrice: null, dryPrice: 350, premPrice: 460, cat: 'Home Linen', icon: 'fa-bed' },
        { id: 'h18', name: 'Quilt Double / King', washPrice: null, dryPrice: 500, premPrice: 550, cat: 'Home Linen', icon: 'fa-bed' },
        { id: 'h19', name: 'Soft Toy Small', washPrice: null, dryPrice: 120, premPrice: 150, cat: 'Home Linen', icon: 'fa-paw' },
        { id: 'h20', name: 'Soft Toy Medium', washPrice: null, dryPrice: 200, premPrice: 250, cat: 'Home Linen', icon: 'fa-paw' },
        { id: 'h21', name: 'Soft Toy Big', washPrice: null, dryPrice: 300, premPrice: 380, cat: 'Home Linen', icon: 'fa-paw' },
        { id: 'h22', name: 'Curtain Without Lining (Per Panel)', washPrice: null, dryPrice: 210, premPrice: 250, cat: 'Home Linen', icon: 'fa-border-all' },
        { id: 'h23', name: 'Curtain With Lining (Per Panel)', washPrice: null, dryPrice: 320, premPrice: 390, cat: 'Home Linen', icon: 'fa-border-all' },
        { id: 'h24', name: 'Face Towel', washPrice: null, dryPrice: 40, premPrice: 80, cat: 'Home Linen', icon: 'fa-water' },
        { id: 'h25', name: 'Hand Towel', washPrice: null, dryPrice: 50, premPrice: 100, cat: 'Home Linen', icon: 'fa-water' },
        { id: 'h26', name: 'Sofa Cover Per Sheet', washPrice: null, dryPrice: 120, premPrice: 180, cat: 'Home Linen', icon: 'fa-couch' },
        { id: 'h27', name: 'Table Cloth Small', washPrice: null, dryPrice: 70, premPrice: 160, cat: 'Home Linen', icon: 'fa-table' },
        { id: 'h28', name: 'Table Cloth Big', washPrice: null, dryPrice: 150, premPrice: 280, cat: 'Home Linen', icon: 'fa-table' },
        { id: 'h29', name: 'Table Runner Fancy', washPrice: null, dryPrice: 160, premPrice: 250, cat: 'Home Linen', icon: 'fa-table' },
        { id: 'h30', name: 'Foot Mat 1ft * 2ft', washPrice: null, dryPrice: 60, premPrice: 120, cat: 'Home Linen', icon: 'fa-shoe-prints' },
        { id: 'h31', name: 'Pram', washPrice: null, dryPrice: 350, premPrice: 450, cat: 'Home Linen', icon: 'fa-baby-carriage' },
        { id: 'h32', name: 'Suitcase Small', washPrice: null, dryPrice: 250, premPrice: 350, cat: 'Home Linen', icon: 'fa-suitcase' },
        { id: 'h33', name: 'Suit Case Medium', washPrice: null, dryPrice: 350, premPrice: 450, cat: 'Home Linen', icon: 'fa-suitcase' },
        { id: 'h34', name: 'Suit Case Big', washPrice: null, dryPrice: 450, premPrice: 550, cat: 'Home Linen', icon: 'fa-suitcase' }
    ],
    sofa: [
        { id: 's1', name: 'Cotton Synthetic', washPrice: null, dryPrice: 250, premPrice: null, unit: 'seat', cat: 'Sofa Cleaning', icon: 'fa-couch', img: 'assets/items/item-sofa-cotton.png' },
        { id: 's2', name: 'Silk, Velvet & Jute', washPrice: null, dryPrice: 300, premPrice: null, unit: 'seat', cat: 'Sofa Cleaning', icon: 'fa-couch', img: 'assets/items/item-sofa-silk.png' },
        { id: 's3', name: 'Leather', washPrice: null, dryPrice: 400, premPrice: null, unit: 'seat', cat: 'Sofa Cleaning', icon: 'fa-couch', img: 'assets/items/item-sofa-leather.png' },
        { id: 's4', name: 'Carpet Cleaning', washPrice: null, dryPrice: 30, premPrice: null, unit: 'sq.ft', cat: 'Carpets Dryclean', icon: 'fa-rug', img: 'assets/items/item-carpet.png' }
    ]
};

// 2. FEATURED ITEMS ON HOME CATEGORIES
window.FEATURED_HOME_ITEMS = {
    iron: ['i1', 'i3', 'i8', 'i6'],
    men: ['m1', 'm2', 'm8', 'm9'],
    women: ['w12', 'w2', 'w9', 'w19'],
    home: ['h8', 'h9', 'h4', 'h11'],
    sofa: ['s1', 's2', 's3', 's4']
};

// 3. CATEGORY META LABELS & BADGES
window.CATEGORY_META_LABELS = {
    iron: { label: "Steam Ironing", count: 12 },
    men: { label: "Men's Wear", count: 23 },
    women: { label: "Women's & Bridal Wear", count: 19 },
    home: { label: "Home & Linen Care", count: 34 },
    sofa: { label: "Sofa & Carpet Cleaning", count: 4 }
};

var PRICE_DATABASE = window.PRICE_DATABASE;
var FEATURED_HOME_ITEMS = window.FEATURED_HOME_ITEMS;
var CATEGORY_META_LABELS = window.CATEGORY_META_LABELS;

// 4. PRICING DATA ARRAY FOR COMPATIBILITY & ADMIN RATE CARD
window.PRICING_DATA = [
    { categoryKey: 'men', categoryName: "Men's Wear", items: window.PRICE_DATABASE.men },
    { categoryKey: 'women', categoryName: "Women's & Bridal Wear", items: window.PRICE_DATABASE.women },
    { categoryKey: 'home', categoryName: "Home & Linen Care", items: window.PRICE_DATABASE.home },
    { categoryKey: 'sofa', categoryName: "Sofa & Carpet Cleaning", items: window.PRICE_DATABASE.sofa },
    { categoryKey: 'iron', categoryName: "Steam Ironing", items: window.PRICE_DATABASE.iron }
];
var PRICING_DATA = window.PRICING_DATA;

// 5. AUTO-APPLY OVERRIDDEN PRICES FROM ADMIN PANEL
(function applyCustomAdminPrices() {
    try {
        const customPrices = JSON.parse(localStorage.getItem('tsl_custom_prices') || '{}');
        for (const catKey in window.PRICE_DATABASE) {
            window.PRICE_DATABASE[catKey].forEach(item => {
                if (customPrices[`${item.id}_wash`] !== undefined) item.washPrice = customPrices[`${item.id}_wash`];
                if (customPrices[`${item.id}_dry`] !== undefined) item.dryPrice = customPrices[`${item.id}_dry`];
                if (customPrices[`${item.id}_prem`] !== undefined) item.premPrice = customPrices[`${item.id}_prem`];
                if (customPrices[`${item.id}_price`] !== undefined) item.price = customPrices[`${item.id}_price`];
            });
        }
    } catch(e) {
        console.warn("Could not apply custom prices:", e);
    }
})();

