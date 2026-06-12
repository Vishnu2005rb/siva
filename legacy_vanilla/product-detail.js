// product-detail.js — loads product detail from localStorage viewProductId

document.addEventListener('DOMContentLoaded', function () {
    const productId = parseInt(localStorage.getItem('viewProductId'));
    if (!productId) {
        window.location.href = 'products.html';
        return;
    }

    const product = products.find(p => p.id === productId);
    if (!product) {
        window.location.href = 'products.html';
        return;
    }

    renderProductDetail(product);
    renderRelatedProducts(product);
});

// Render the main product detail
function renderProductDetail(product) {
    document.title = `${product.name} - NK Dairy Products`;
    document.getElementById('breadcrumbName').textContent = product.name;

    const features = [
        { icon: 'fa-leaf', label: '100% Pure Cow Ghee' },
        { icon: 'fa-certificate', label: 'Lab Certified Quality' },
        { icon: 'fa-shield-alt', label: 'No Preservatives' },
        { icon: 'fa-truck', label: 'Fast Home Delivery' },
    ];

    const featureHTML = features.map(f => `
        <div class="pd-feature-tag">
            <i class="fas ${f.icon}"></i>
            <span>${f.label}</span>
        </div>
    `).join('');

    const layout = document.getElementById('productDetailLayout');
    layout.innerHTML = `
        <div class="pd-image-panel">
            <div class="pd-image-main">
                <img src="${product.image}" alt="${product.name}"
                     onerror="this.style.display='none'; document.getElementById('imgFallback').style.display='flex'">
                <div id="imgFallback" class="pd-img-fallback" style="display:none;">
                    <i class="fas fa-jar"></i>
                </div>
            </div>
            <div class="pd-image-badge">
                <i class="fas fa-award"></i> Premium Quality
            </div>
        </div>

        <div class="pd-info-panel">
            <div class="pd-category">NK Dairy Products · Pure Ghee</div>
            <h1 class="pd-title">${product.name}</h1>

            <div class="pd-rating-row">
                <span class="stars pd-stars">${generateStars(product.rating)}</span>
                <span class="pd-rating-num">${product.rating} / 5</span>
                <span class="pd-reviews">(128 reviews)</span>
            </div>

            <div class="pd-price-row">
                <span class="pd-price">₹${product.price}</span>
                <span class="pd-size-badge">${product.size.toUpperCase()}</span>
            </div>

            <p class="pd-desc">
                Indulge in the rich, golden taste of our traditionally crafted cow ghee. Made from fresh, pure cow milk,
                every jar of <strong>${product.name}</strong> delivers authentic Bilona-method ghee — nutrient-rich,
                aromatic, and naturally preservative-free.
            </p>

            <div class="pd-features">
                ${featureHTML}
            </div>

            <div class="pd-quantity-row">
                <label>Quantity:</label>
                <div class="pd-qty-controls">
                    <button id="qtyMinus" onclick="changeQty(-1)"><i class="fas fa-minus"></i></button>
                    <span id="qtyValue">1</span>
                    <button id="qtyPlus" onclick="changeQty(1)"><i class="fas fa-plus"></i></button>
                </div>
            </div>

            <div class="pd-actions">
                <button class="pd-btn-cart" onclick="addToCartFromDetail(${product.id})">
                    <i class="fas fa-cart-plus"></i> Add to Cart
                </button>
                <button class="pd-btn-buy" onclick="buyNowFromDetail(${product.id})">
                    <i class="fas fa-bolt"></i> Buy Now
                </button>
            </div>

            <div class="pd-meta">
                <div class="pd-meta-item"><i class="fas fa-undo"></i> Easy 7-day returns</div>
                <div class="pd-meta-item"><i class="fas fa-lock"></i> Secure checkout</div>
                <div class="pd-meta-item"><i class="fas fa-truck"></i> Free delivery on orders above ₹500</div>
            </div>
        </div>
    `;
}

// Current quantity
let detailQty = 1;
function changeQty(delta) {
    detailQty = Math.max(1, detailQty + delta);
    document.getElementById('qtyValue').textContent = detailQty;
}

// Add to cart from detail page
function addToCartFromDetail(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const existing = cart.find(i => i.id === productId);
    if (existing) {
        existing.quantity += detailQty;
    } else {
        cart.push({ ...product, quantity: detailQty });
    }
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    showNotification(`${detailQty}x ${product.name} added to cart!`);
}

// Buy Now from detail page → goes to checkout with just this product
function buyNowFromDetail(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const buyNowCart = [{ ...product, quantity: detailQty }];
    localStorage.setItem('buyNowCart', JSON.stringify(buyNowCart));
    localStorage.setItem('isBuyNow', 'true');

    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) {
        // Not logged in — save redirect intent and go to register
        localStorage.setItem('redirectAfterAuth', 'checkout.html');
        showNotification('Please sign up to continue!');
        setTimeout(() => {
            window.location.href = 'register.html';
        }, 800);
    } else {
        // Already logged in — go straight to checkout
        window.location.href = 'checkout.html';
    }
}

// Render related products (excluding current)
function renderRelatedProducts(currentProduct) {
    const related = products.filter(p => p.id !== currentProduct.id).slice(0, 4);
    const container = document.getElementById('relatedProducts');
    container.innerHTML = related.map(p => createProductCard(p)).join('');
}
