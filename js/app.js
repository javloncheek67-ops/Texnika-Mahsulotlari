// ==========================================================================
// TEXNOTOP - ASOSIY JAVASCRIPT ILOVASI (WHITE & ORANGE THEME)
// ==========================================================================

// Global Holatlar (State)
let currentCategory = 'all';
let currentSearch = '';
let currentSort = 'popular';
let cart = JSON.parse(localStorage.getItem('texnotop_cart')) || [];
let wishlist = JSON.parse(localStorage.getItem('texnotop_wishlist')) || [];
let currentSlide = 0;
let slideInterval = null;

// Raqamlarni so'm formatiga o'tkazish yordamchisi (12 500 000 so'm)
function formatPrice(num) {
  return new Intl.NumberFormat('uz-UZ').format(num) + " so'm";
}

// Boshlang'ich yuklash (DOM Loaded)
document.addEventListener('DOMContentLoaded', () => {
  renderCategories();
  renderProducts();
  updateCartUI();
  updateWishlistUI();
  initHeroSlider();
  initFlashDealsCountdown();
  initQrCode();
  setupEventListeners();
});

// --------------------------------------------------------------------------
// 1. KATEGORIYALARNI CHIQARISH
// --------------------------------------------------------------------------
function renderCategories() {
  const container = document.getElementById('categories-container');
  if (!container) return;

  container.innerHTML = CATEGORIES_DATA.map(cat => {
    const isActive = cat.id === currentCategory ? 'active' : '';
    // Mahsulotlar sonini hisoblash
    const count = cat.id === 'all' 
      ? PRODUCTS_DATA.length 
      : PRODUCTS_DATA.filter(p => p.category === cat.id).length;

    return `
      <button class="category-pill-btn ${isActive}" onclick="filterByCategory('${cat.id}')">
        <span>${cat.name}</span>
        <span class="cat-count">${count}</span>
      </button>
    `;
  }).join('');
}

function filterByCategory(catId) {
  currentCategory = catId;
  renderCategories();
  renderProducts();

  // Scroll smoothly to products section
  const section = document.getElementById('products-section');
  if (section) {
    const navHeight = 80;
    const pos = section.getBoundingClientRect().top + window.pageYOffset - navHeight;
    window.scrollTo({ top: pos, behavior: 'smooth' });
  }
}

// --------------------------------------------------------------------------
// 2. MAHSULOTLARNI FILTRLASH VA CHIQARISH
// --------------------------------------------------------------------------
function renderProducts() {
  const grid = document.getElementById('products-grid');
  const countEl = document.getElementById('products-counter');
  if (!grid) return;

  // Filtrlash
  let filtered = [...PRODUCTS_DATA];

  // Kategoriya bo'yicha
  if (currentCategory !== 'all') {
    filtered = filtered.filter(p => p.category === currentCategory);
  }

  // Qidiruv bo'yicha
  if (currentSearch.trim() !== '') {
    const query = currentSearch.toLowerCase().trim();
    filtered = filtered.filter(p => 
      p.name.toLowerCase().includes(query) ||
      p.brand.toLowerCase().includes(query) ||
      p.categoryName.toLowerCase().includes(query)
    );
  }

  // Saralash (Sort)
  if (currentSort === 'price-asc') {
    filtered.sort((a, b) => a.price - b.price);
  } else if (currentSort === 'price-desc') {
    filtered.sort((a, b) => b.price - a.price);
  } else if (currentSort === 'rating') {
    filtered.sort((a, b) => b.rating - a.rating);
  } else if (currentSort === 'discount') {
    filtered.sort((a, b) => (b.discount || 0) - (a.discount || 0));
  }

  // Soni yangilash
  if (countEl) {
    countEl.innerText = `${filtered.length} ta mahsulot topildi`;
  }

  if (filtered.length === 0) {
    grid.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px; background: white; border-radius: 16px; border: 1px dashed #cbd5e1;">
        <div style="width: 64px; height: 64px; background: #fff7ed; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px auto; color: var(--primary-orange);">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
        </div>
        <h3 style="font-size: 20px; font-weight: 700; margin-bottom: 8px;">Hech qanday mahsulot topilmadi</h3>
        <p style="color: #64748b; font-size: 14px; margin-bottom: 20px;">Iltimos, boshqa so'z bilan qidirib ko'ring yoki barcha mahsulotlarga qayting.</p>
        <button onclick="resetFilters()" class="catalog-btn" style="display: inline-flex; margin: 0 auto;">Barcha mahsulotlarni ko'rish</button>
      </div>
    `;
    return;
  }

  // Kartochkalar
  grid.innerHTML = filtered.map(p => {
    const isWish = wishlist.some(item => item.id === p.id);
    const badgeHtml = p.badge 
      ? `<span class="card-badge ${p.badgeType === 'hot' ? 'badge-hot' : 'badge-sale'}">${p.badge}</span>` 
      : '';
    const discountHtml = p.discount 
      ? `<span class="discount-badge-percent">-${p.discount}%</span>` 
      : '';

    return `
      <div class="product-card" data-id="${p.id}">
        <!-- Nishonlar -->
        <div class="card-badge-container">
          ${badgeHtml}
          ${discountHtml}
        </div>

        <!-- Sevimlilar tugmasi -->
        <button class="btn-wishlist ${isWish ? 'active' : ''}" onclick="toggleWishlist(${p.id}, event)" title="Sevimlilarga qo'shish">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="${isWish ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
          </svg>
        </button>

        <!-- Rasm -->
        <div class="card-image-box" onclick="openQuickView(${p.id})">
          <img src="${p.image}" alt="${p.name}" loading="lazy" onerror="this.src='https://placehold.co/400x400/FFF7ED/FF6600?text=${encodeURIComponent(p.brand)}';">
          <button class="quick-view-overlay-btn" type="button">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            Tezkor ko'rish
          </button>
        </div>

        <!-- Kategoriya va Brend -->
        <div class="card-category-brand">
          <span>${p.categoryName}</span>
          <span class="card-brand">${p.brand}</span>
        </div>

        <!-- Nomi -->
        <h4 class="card-title" onclick="openQuickView(${p.id})">${p.name}</h4>

        <!-- Reyting -->
        <div class="card-rating">
          <div class="stars-gold">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
          </div>
          <span class="rating-score">${p.rating}</span>
          <span class="reviews-count">(${p.reviewsCount} ta baho)</span>
        </div>

        <!-- Muddatli to'lov tegi -->
        <div class="installment-tag">
          ⚡ ${p.installment}
        </div>

        <!-- Narx -->
        <div class="card-pricing-box">
          ${p.oldPrice ? `
            <div class="old-price-line">
              <span>${formatPrice(p.oldPrice)}</span>
            </div>
          ` : ''}
          <div class="current-price">${formatPrice(p.price)}</div>
        </div>

        <!-- Amallar -->
        <div class="card-action-row">
          <button class="btn-add-cart" onclick="addToCart(${p.id}, event)">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>
            Savatga
          </button>
          <button class="btn-quick-order" onclick="openDirectCheckout(${p.id}, event)">
            1 klikda
          </button>
        </div>
      </div>
    `;
  }).join('');
}

function resetFilters() {
  currentCategory = 'all';
  currentSearch = '';
  currentSort = 'popular';
  const searchInput = document.getElementById('search-input');
  if (searchInput) searchInput.value = '';
  const sortSelect = document.getElementById('sort-select');
  if (sortSelect) sortSelect.value = 'popular';
  renderCategories();
  renderProducts();
}

// --------------------------------------------------------------------------
// 3. SAVAT (CART) TIZIMI
// --------------------------------------------------------------------------
function addToCart(productId, event) {
  if (event) event.stopPropagation();
  const product = PRODUCTS_DATA.find(p => p.id === productId);
  if (!product) return;

  const existingIndex = cart.findIndex(item => item.id === productId);
  if (existingIndex > -1) {
    cart[existingIndex].qty += 1;
  } else {
    cart.push({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      brand: product.brand,
      qty: 1
    });
  }

  saveCart();
  updateCartUI();
  showToast(`<b>${product.name.substring(0, 25)}...</b> savatga qo'shildi! 🛒`);
}

function updateCartQuantity(productId, delta) {
  const itemIndex = cart.findIndex(item => item.id === productId);
  if (itemIndex === -1) return;

  cart[itemIndex].qty += delta;
  if (cart[itemIndex].qty <= 0) {
    cart.splice(itemIndex, 1);
  }

  saveCart();
  updateCartUI();
}

function removeFromCart(productId) {
  cart = cart.filter(item => item.id !== productId);
  saveCart();
  updateCartUI();
  showToast("Mahsulot savatdan o'chirildi", "info");
}

function clearCart() {
  cart = [];
  saveCart();
  updateCartUI();
}

function saveCart() {
  localStorage.setItem('texnotop_cart', JSON.stringify(cart));
}

function updateCartUI() {
  const badgeEls = document.querySelectorAll('.cart-count-badge');
  const totalCount = cart.reduce((acc, item) => acc + item.qty, 0);
  
  badgeEls.forEach(el => {
    el.innerText = totalCount;
    el.style.display = totalCount > 0 ? 'flex' : 'none';
  });

  const cartList = document.getElementById('cart-items-container');
  const cartSubtotal = document.getElementById('cart-subtotal');
  const cartTotal = document.getElementById('cart-total-price');
  const cartEmpty = document.getElementById('cart-empty-state');
  const cartFooter = document.getElementById('cart-footer-panel');

  if (!cartList) return;

  if (cart.length === 0) {
    cartList.innerHTML = '';
    if (cartEmpty) cartEmpty.style.display = 'block';
    if (cartFooter) cartFooter.style.display = 'none';
    return;
  }

  if (cartEmpty) cartEmpty.style.display = 'none';
  if (cartFooter) cartFooter.style.display = 'block';

  let sum = 0;
  cartList.innerHTML = cart.map(item => {
    const itemTotal = item.price * item.qty;
    sum += itemTotal;

    return `
      <div class="cart-item-card">
        <img src="${item.image}" alt="${item.name}" class="cart-item-img" onerror="this.src='https://placehold.co/100x100?text=Texno';">
        <div class="cart-item-info">
          <h5 class="cart-item-title">${item.name}</h5>
          <div class="cart-item-price">${formatPrice(item.price)}</div>
          
          <div class="cart-qty-control">
            <button class="qty-btn" onclick="updateCartQuantity(${item.id}, -1)">-</button>
            <span class="qty-number">${item.qty}</span>
            <button class="qty-btn" onclick="updateCartQuantity(${item.id}, 1)">+</button>
          </div>
        </div>
        
        <button class="cart-item-remove-btn" onclick="removeFromCart(${item.id})" title="O'chirish">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
      </div>
    `;
  }).join('');

  if (cartSubtotal) cartSubtotal.innerText = formatPrice(sum);
  if (cartTotal) cartTotal.innerText = formatPrice(sum);
}

function openCartDrawer() {
  const drawer = document.getElementById('cart-drawer-modal');
  if (drawer) {
    drawer.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
}

function closeCartDrawer() {
  const drawer = document.getElementById('cart-drawer-modal');
  if (drawer) {
    drawer.classList.remove('active');
    document.body.style.overflow = '';
  }
}

// --------------------------------------------------------------------------
// 4. SEVIMLILAR (WISHLIST) TIZIMI
// --------------------------------------------------------------------------
function toggleWishlist(productId, event) {
  if (event) event.stopPropagation();
  const product = PRODUCTS_DATA.find(p => p.id === productId);
  if (!product) return;

  const index = wishlist.findIndex(item => item.id === productId);
  if (index > -1) {
    wishlist.splice(index, 1);
    showToast(`<b>${product.name.substring(0, 25)}</b> sevimlilardan olib tashlandi`);
  } else {
    wishlist.push(product);
    showToast(`<b>${product.name.substring(0, 25)}</b> sevimlilarga saqlandi ❤️`);
  }

  saveWishlist();
  updateWishlistUI();
  renderProducts(); // Kartalardagi yurak holatini yangilash
}

function saveWishlist() {
  localStorage.setItem('texnotop_wishlist', JSON.stringify(wishlist));
}

function updateWishlistUI() {
  const badgeEls = document.querySelectorAll('.wishlist-count-badge');
  const count = wishlist.length;
  badgeEls.forEach(el => {
    el.innerText = count;
    el.style.display = count > 0 ? 'flex' : 'none';
  });
}

function openWishlistModal() {
  if (wishlist.length === 0) {
    showToast("Sevimlilar ro'yxatingiz hozircha bo'sh 😊", "info");
    return;
  }
  
  // Mahsulotlar to'rini vaqtincha sevimlilar bilan filtrlash
  const grid = document.getElementById('products-grid');
  const countEl = document.getElementById('products-counter');
  
  if (countEl) {
    countEl.innerText = `Sevimlilar: ${wishlist.length} ta mahsulot`;
  }
  
  // Barcha kategoriya pilllarini faolsizlantirish
  document.querySelectorAll('.category-pill-btn').forEach(b => b.classList.remove('active'));

  grid.innerHTML = wishlist.map(p => {
    return `
      <div class="product-card" data-id="${p.id}">
        <div class="card-badge-container">
          <span class="card-badge badge-hot">Sevimlilar</span>
        </div>
        <button class="btn-wishlist active" onclick="toggleWishlist(${p.id}, event)">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
          </svg>
        </button>
        <div class="card-image-box" onclick="openQuickView(${p.id})">
          <img src="${p.image}" alt="${p.name}">
        </div>
        <div class="card-category-brand">
          <span>${p.categoryName}</span>
          <span class="card-brand">${p.brand}</span>
        </div>
        <h4 class="card-title" onclick="openQuickView(${p.id})">${p.name}</h4>
        <div class="card-pricing-box">
          <div class="current-price">${formatPrice(p.price)}</div>
        </div>
        <div class="card-action-row">
          <button class="btn-add-cart" onclick="addToCart(${p.id}, event)">Savatga</button>
        </div>
      </div>
    `;
  }).join('');

  const section = document.getElementById('products-section');
  if (section) section.scrollIntoView({ behavior: 'smooth' });
}

// --------------------------------------------------------------------------
// 5. TEZKOR KO'RISH (QUICK VIEW) MODALI
// --------------------------------------------------------------------------
function openQuickView(productId) {
  const product = PRODUCTS_DATA.find(p => p.id === productId);
  if (!product) return;

  const modal = document.getElementById('quick-view-modal');
  const body = document.getElementById('quick-view-body');
  if (!modal || !body) return;

  // Xususiyatlar jadvali
  const specsRows = Object.entries(product.specs || {}).map(([key, value]) => `
    <tr>
      <td>${key}</td>
      <td>${value}</td>
    </tr>
  `).join('');

  body.innerHTML = `
    <div class="quick-view-grid">
      <div class="qv-image-box">
        <img src="${product.image}" alt="${product.name}" onerror="this.src='https://placehold.co/400x400?text=${encodeURIComponent(product.brand)}';">
      </div>
      <div>
        <div style="font-size: 13px; font-weight: 700; color: var(--primary-orange); text-transform: uppercase; margin-bottom: 6px;">
          ${product.brand} &bull; ${product.categoryName}
        </div>
        <h2 style="font-size: 22px; font-weight: 800; color: #0f172a; line-height: 1.3; margin-bottom: 12px;">
          ${product.name}
        </h2>
        <div class="card-rating" style="margin-bottom: 16px;">
          <div class="stars-gold">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
          </div>
          <span class="rating-score">${product.rating}</span>
          <span class="reviews-count">(${product.reviewsCount} ta mijoz bahosi)</span>
        </div>

        <div style="background: #f8fafc; border-radius: 12px; padding: 14px; margin-bottom: 18px; border: 1px solid #e2e8f0;">
          <div style="font-size: 13px; color: #64748b; text-decoration: line-through;">${product.oldPrice ? formatPrice(product.oldPrice) : ''}</div>
          <div style="font-size: 26px; font-weight: 800; color: var(--primary-orange);">
            ${formatPrice(product.price)}
          </div>
          <div style="margin-top: 6px; font-size: 12px; font-weight: 600; color: #15803d; display: flex; align-items: center; gap: 6px;">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
            Omborda mavjud &bull; 1 ish kunida yetkaziladi
          </div>
        </div>

        <p style="font-size: 14px; color: #475569; line-height: 1.6; margin-bottom: 18px;">
          ${product.description}
        </p>

        <h4 style="font-size: 14px; font-weight: 700; margin-bottom: 8px;">Texnik xususiyatlari:</h4>
        <table class="qv-specs-table">
          <tbody>
            ${specsRows}
          </tbody>
        </table>

        <div style="display: flex; gap: 12px; margin-top: 24px;">
          <button class="btn-checkout" style="margin-top: 0; flex: 1;" onclick="addToCart(${product.id}); closeQuickView();">
            Savatga qo'shish
          </button>
          <button class="btn-quick-order" style="padding: 12px 20px; font-size: 14px;" onclick="closeQuickView(); openDirectCheckout(${product.id});">
            1 klikda xarid
          </button>
        </div>
      </div>
    </div>
  `;

  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeQuickView() {
  const modal = document.getElementById('quick-view-modal');
  if (modal) {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }
}

// --------------------------------------------------------------------------
// 6. BUYURTMA BERISH (CHECKOUT) MODALI
// --------------------------------------------------------------------------
let directCheckoutItem = null;

function openDirectCheckout(productId, event) {
  if (event) event.stopPropagation();
  directCheckoutItem = PRODUCTS_DATA.find(p => p.id === productId);
  openCheckoutModal();
}

function openCheckoutModal() {
  closeCartDrawer();
  const modal = document.getElementById('checkout-modal');
  const itemsSummary = document.getElementById('checkout-items-summary');
  const totalEl = document.getElementById('checkout-total-sum');

  if (!modal) return;

  let itemsToBuy = [];
  let totalSum = 0;

  if (directCheckoutItem) {
    itemsToBuy = [{ ...directCheckoutItem, qty: 1 }];
    totalSum = directCheckoutItem.price;
  } else {
    itemsToBuy = [...cart];
    totalSum = cart.reduce((acc, item) => acc + (item.price * item.qty), 0);
  }

  if (itemsToBuy.length === 0) {
    showToast("Buyurtma berish uchun savat bo'sh", "info");
    return;
  }

  if (itemsSummary) {
    itemsSummary.innerHTML = itemsToBuy.map(item => `
      <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px dashed #e2e8f0; font-size: 13.5px;">
        <span style="font-weight: 500; color: #0f172a; max-width: 70%;">${item.name} <b style="color: var(--primary-orange);">x${item.qty}</b></span>
        <span style="font-weight: 700; color: #0f172a;">${formatPrice(item.price * item.qty)}</span>
      </div>
    `).join('');
  }

  if (totalEl) {
    totalEl.innerText = formatPrice(totalSum);
  }

  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeCheckoutModal() {
  const modal = document.getElementById('checkout-modal');
  if (modal) {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }
  directCheckoutItem = null;
}

function submitCheckoutOrder(event) {
  event.preventDefault();
  const name = document.getElementById('checkout-name').value;
  const phone = document.getElementById('checkout-phone').value;
  const address = document.getElementById('checkout-address').value;
  const payMethod = document.querySelector('input[name="payment_method"]:checked')?.value || "Naqd pul";

  if (!name || !phone) {
    alert("Iltimos, ismingiz va telefon raqamingizni kiriting!");
    return;
  }

  // Tasodifiy buyurtma kodi
  const orderNumber = "TX-" + Math.floor(100000 + Math.random() * 900000);

  // Buyurtma yakunlash
  closeCheckoutModal();
  if (!directCheckoutItem) {
    clearCart();
  }
  directCheckoutItem = null;

  // Muvaffaqiyat modali
  showOrderSuccessModal(orderNumber, name, phone, address, payMethod);
}

function showOrderSuccessModal(orderNo, name, phone, address, payMethod) {
  const modal = document.getElementById('order-success-modal');
  const detailsEl = document.getElementById('order-success-details');
  if (!modal || !detailsEl) return;

  detailsEl.innerHTML = `
    <div style="text-align: center; margin-bottom: 20px;">
      <div style="width: 70px; height: 70px; background: #dcfce7; color: #16a34a; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px auto;">
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg>
      </div>
      <h3 style="font-size: 22px; font-weight: 800; color: #0f172a;">Buyurtmangiz qabul qilindi!</h3>
      <p style="color: #64748b; font-size: 14px; margin-top: 6px;">Buyurtma raqami: <strong style="color: var(--primary-orange);">#${orderNo}</strong></p>
    </div>

    <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; font-size: 13.5px; line-height: 1.8;">
      <div>👤 <strong>Mijoz:</strong> ${name}</div>
      <div>📞 <strong>Telefon:</strong> ${phone}</div>
      <div>📍 <strong>Manzil:</strong> ${address || 'Yetkazib berish xizmati bilan kelishiladi'}</div>
      <div>💳 <strong>To'lov turi:</strong> ${payMethod}</div>
      <div>🚚 <strong>Yetkazib berish:</strong> Bepul (Bugun yoki 24 soat ichida)</div>
    </div>
  `;

  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeOrderSuccessModal() {
  const modal = document.getElementById('order-success-modal');
  if (modal) {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }
}

// --------------------------------------------------------------------------
// 7. FLASH DEAL COUNTDOWN TAYMER
// --------------------------------------------------------------------------
function initFlashDealsCountdown() {
  const hoursEl = document.getElementById('timer-hours');
  const minutesEl = document.getElementById('timer-minutes');
  const secondsEl = document.getElementById('timer-seconds');
  if (!hoursEl || !minutesEl || !secondsEl) return;

  // Ertangi kunga qadar vaqt hisoblash
  let targetTime = new Date().getTime() + (14 * 3600 * 1000) + (45 * 60 * 1000) + (30 * 1000);

  function tick() {
    const now = new Date().getTime();
    const distance = targetTime - now;

    if (distance <= 0) {
      targetTime = new Date().getTime() + (24 * 3600 * 1000);
      return;
    }

    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    hoursEl.innerText = hours < 10 ? '0' + hours : hours;
    minutesEl.innerText = minutes < 10 ? '0' + minutes : minutes;
    secondsEl.innerText = seconds < 10 ? '0' + seconds : seconds;
  }

  tick();
  setInterval(tick, 1000);
}

// --------------------------------------------------------------------------
// 8. HERO SLIDER BANNER
// --------------------------------------------------------------------------
function initHeroSlider() {
  const slides = document.querySelectorAll('.hero-slide');
  const dots = document.querySelectorAll('.slider-dot');
  if (slides.length === 0) return;

  function showSlide(index) {
    slides.forEach((s, i) => s.classList.toggle('active', i === index));
    dots.forEach((d, i) => d.classList.toggle('active', i === index));
    currentSlide = index;
  }

  window.setSlide = function(index) {
    showSlide(index);
    resetSliderInterval();
  };

  function nextSlide() {
    currentSlide = (currentSlide + 1) % slides.length;
    showSlide(currentSlide);
  }

  function resetSliderInterval() {
    if (slideInterval) clearInterval(slideInterval);
    slideInterval = setInterval(nextSlide, 5500);
  }

  resetSliderInterval();
}

// --------------------------------------------------------------------------
// 9. TOAST XABARNOMALARI
// --------------------------------------------------------------------------
function showToast(message, type = 'success') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = 'toast-message';
  toast.innerHTML = `
    <div style="color: var(--primary-orange); display: flex;">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
    </div>
    <span>${message}</span>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3200);
}

// --------------------------------------------------------------------------
// 10. HODISALAR TINGLOVCHILARI (EVENT LISTENERS)
// --------------------------------------------------------------------------
function setupEventListeners() {
  // Qidiruv maydoni
  const searchInput = document.getElementById('search-input');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      currentSearch = e.target.value;
      renderProducts();
    });
  }

  // Saralash tanlagichi
  const sortSelect = document.getElementById('sort-select');
  if (sortSelect) {
    sortSelect.addEventListener('change', (e) => {
      currentSort = e.target.value;
      renderProducts();
    });
  }

  // Backdrop orqali yopish
  window.addEventListener('click', (e) => {
    if (e.target.classList.contains('drawer-backdrop')) {
      closeCartDrawer();
    }
    if (e.target.classList.contains('modal-backdrop')) {
      closeQuickView();
      closeCheckoutModal();
      closeOrderSuccessModal();
      closeQrModal();
    }
  });

  // ESC tugmasi bilan yopish
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeCartDrawer();
      closeQuickView();
      closeCheckoutModal();
      closeOrderSuccessModal();
      closeQrModal();
    }
  });
}

// --------------------------------------------------------------------------
// 11. QR KOD TIZIMI (SAYTGA TELEFONDAN KIRISH)
// --------------------------------------------------------------------------

// Saytning to'g'ri havolasini aniqlash
function getQrTargetUrl() {
  // 1. Foydalanuvchi maxsus kiritgan havola (agar mavjud bo'lsa)
  const customUrl = localStorage.getItem('texnotop_custom_qr_url');
  if (customUrl && customUrl.trim()) {
    return customUrl.trim();
  }

  // 2. Agar sayt real web-serverda (Netlify, Vercel yoki boshqa hostingda) ochilgan bo'lsa
  if (window.location.protocol === 'http:' || window.location.protocol === 'https:') {
    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    if (!isLocalhost) {
      // Toza URL (hash yoki ortiqcha belgilarsiz)
      let cleanUrl = window.location.origin + window.location.pathname;
      if (!cleanUrl.endsWith('/')) {
        cleanUrl += '/';
      }
      return cleanUrl;
    }
  }

  // 3. Agar kompyuterda lokal fayl sifatida ochilgan bo'lsa (file:/// yoki localhost)
  return 'https://texnika-mahsulotlari.netlify.app/';
}

// Barcha QR kodlarni chizish (Headerdagi mini va Modal ichidagi katta QR)
function renderQrCodes() {
  if (typeof QRCode === 'undefined') {
    console.warn('QRCode kutubxonasi hali yuklanmadi');
    return;
  }

  const targetUrl = getQrTargetUrl();

  // 1. Headerdagi mini QR-kod (38x38 frame ichida)
  const thumbContainer = document.getElementById('navbar-qr-thumb');
  if (thumbContainer) {
    thumbContainer.innerHTML = '';
    try {
      new QRCode(thumbContainer, {
        text: targetUrl,
        width: 76,
        height: 76,
        colorDark: '#0f172a',
        colorLight: '#ffffff',
        correctLevel: QRCode.CorrectLevel.M
      });
    } catch (e) {
      console.error('Navbar QR xatolik:', e);
    }
  }

  // 2. Modaldagi katta skanerlanuvchi QR-kod (240x240)
  const modalContainer = document.getElementById('modal-qr-container');
  if (modalContainer) {
    modalContainer.innerHTML = '';
    try {
      new QRCode(modalContainer, {
        text: targetUrl,
        width: 240,
        height: 240,
        colorDark: '#0f172a',
        colorLight: '#ffffff',
        correctLevel: QRCode.CorrectLevel.H
      });
    } catch (e) {
      console.error('Modal QR xatolik:', e);
    }
  }

  // Havola inputini yangilash
  const urlInput = document.getElementById('qr-target-url-input');
  if (urlInput) {
    urlInput.value = targetUrl;
  }

  const customField = document.getElementById('qr-custom-url-field');
  if (customField) {
    customField.value = targetUrl;
  }

  // Holat tegi (Status tag)
  const statusTag = document.getElementById('qr-status-tag');
  if (statusTag) {
    if (localStorage.getItem('texnotop_custom_qr_url')) {
      statusTag.textContent = "Maxsus havola";
      statusTag.style.color = "#ea580c";
      statusTag.style.background = "#ffedd5";
    } else if (window.location.protocol.startsWith('http') && !window.location.hostname.includes('localhost') && !window.location.hostname.includes('127.0.0.1')) {
      statusTag.textContent = "Jonli sayt";
      statusTag.style.color = "#16a34a";
      statusTag.style.background = "#dcfce7";
    } else {
      statusTag.textContent = "Rasmiy havola";
      statusTag.style.color = "#0284c7";
      statusTag.style.background = "#e0f2fe";
    }
  }
}

function initQrCode() {
  renderQrCodes();
}

// QR Modalini ochish
function openQrModal() {
  const modal = document.getElementById('qr-code-modal');
  if (!modal) return;
  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
  renderQrCodes();
}

// QR Modalini yopish
function closeQrModal() {
  const modal = document.getElementById('qr-code-modal');
  if (!modal) return;
  modal.classList.remove('active');
  document.body.style.overflow = '';
  const editSec = document.getElementById('qr-custom-url-section');
  if (editSec) editSec.style.display = 'none';
}

// QR URL manzilini clipboardga nusxalash
function copyQrUrl() {
  const url = getQrTargetUrl();
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(url).then(() => {
      showToast("Sayt havolasi nusxalandi! 📋", "success");
    }).catch(() => fallbackCopy(url));
  } else {
    fallbackCopy(url);
  }
}

function fallbackCopy(text) {
  const input = document.getElementById('qr-target-url-input');
  if (input) {
    input.focus();
    input.select();
    try {
      document.execCommand('copy');
      showToast("Sayt havolasi nusxalandi! 📋", "success");
    } catch (e) {
      showToast("Havolani qo'lda nusxalang: " + text, "info");
    }
  }
}

// QR Kod rasmini kompyuterga yuklab olish (.png formatda)
function downloadQrCode() {
  const modalContainer = document.getElementById('modal-qr-container');
  if (!modalContainer) return;
  
  const canvas = modalContainer.querySelector('canvas');
  const img = modalContainer.querySelector('img');
  let dataUrl = '';

  if (canvas) {
    dataUrl = canvas.toDataURL('image/png');
  } else if (img && img.src) {
    dataUrl = img.src;
  }

  if (dataUrl) {
    const link = document.createElement('a');
    link.download = 'texnotop-sayt-qr-kod.png';
    link.href = dataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("QR-kod rasmi yuklab olindi! 📥", "success");
  } else {
    showToast("QR-kod rasmini saqlab bo'lmadi", "error");
  }
}

// Maxsus havola tahrirlash qismini ochish/yopish
function toggleEditQrUrl() {
  const sec = document.getElementById('qr-custom-url-section');
  if (!sec) return;
  const isHidden = sec.style.display === 'none' || !sec.style.display;
  sec.style.display = isHidden ? 'block' : 'none';
  if (isHidden) {
    const field = document.getElementById('qr-custom-url-field');
    if (field) {
      field.value = getQrTargetUrl();
      field.focus();
    }
  }
}

// Foydalanuvchi kiritgan yangi havolani saqlash
function saveCustomQrUrl() {
  const field = document.getElementById('qr-custom-url-field');
  if (!field) return;
  let val = field.value.trim();
  if (!val) {
    showToast("Iltimos, haqiqiy sayt havolasini kiriting", "info");
    return;
  }
  if (!val.startsWith('http://') && !val.startsWith('https://')) {
    val = 'https://' + val;
  }
  localStorage.setItem('texnotop_custom_qr_url', val);
  renderQrCodes();
  showToast("QR-kod yangilandi! Endi yangi havolaga o'tadi 🚀", "success");
  const sec = document.getElementById('qr-custom-url-section');
  if (sec) sec.style.display = 'none';
}

// Standart (original) havolaga qaytarish
function resetDefaultQrUrl() {
  localStorage.removeItem('texnotop_custom_qr_url');
  renderQrCodes();
  showToast("Havola standart holatga qaytarildi", "info");
  const sec = document.getElementById('qr-custom-url-section');
  if (sec) sec.style.display = 'none';
}

