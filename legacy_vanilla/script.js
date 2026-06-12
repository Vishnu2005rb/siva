// Product Data
const products = [
    {
        id: 1,
        name: "Premium Cow Ghee - 50ml",
        price: 40,
        size: "50ml",
        description: "Pure cow ghee made from organic milk",
        rating: 4.5,
        image: "images/ghee_50ml.png"
    },
    {
        id: 2,
        name: "Premium Cow Ghee - 100ml",
        price: 80,
        size: "100ml",
        description: "Pure cow ghee made from organic milk",
        rating: 4.6,
        image: "images/ghee_100ml.png"
    },
    {
        id: 3,
        name: "Premium Cow Ghee - 200ml",
        price: 150,
        size: "200ml",
        description: "Pure cow ghee made from organic milk",
        rating: 4.5,
        image: "images/ghee_200ml.png"
    },
    {
        id: 4,
        name: "Premium Cow Ghee - 500ml",
        price: 375,
        size: "500ml",
        description: "Pure cow ghee made from organic milk",
        rating: 4.7,
        image: "images/ghee_500ml.png"
    },
    {
        id: 5,
        name: "Premium Cow Ghee - 1L",
        price: 750,
        size: "1l",
        description: "Pure cow ghee made from organic milk",
        rating: 4.8,
        image: "images/ghee_1l.png"
    },
    {
        id: 6,
        name: "Premium Cow Ghee - 2L",
        price: 1500,
        size: "2l",
        description: "Pure cow ghee made from organic milk",
        rating: 4.9,
        image: "images/ghee_2l.png"
    },
    {
        id: 7,
        name: "Premium Cow Ghee - 5L",
        price: 3750,
        size: "5l",
        description: "Pure cow ghee made from organic milk",
        rating: 4.9,
        image: "images/ghee_2l.png"
    }
];

// Initialize cart from localStorage
let cart = JSON.parse(localStorage.getItem('cart')) || [];

// Update cart count on page load
document.addEventListener('DOMContentLoaded', function () {
    updateCartCount();
    updateUserButton();

    // Load featured products on home page
    if (document.getElementById('featuredProducts')) {
        loadFeaturedProducts();
    }
});

// Load featured products (first 4)
function loadFeaturedProducts() {
    const container = document.getElementById('featuredProducts');
    const featured = products.slice(0, 4);

    container.innerHTML = featured.map(product => createProductCard(product)).join('');
}

// Create product card HTML
function createProductCard(product) {
    return `
        <div class="product-card">
            <div class="product-image" onclick="viewProductDetail(${product.id})" style="cursor:pointer;">
                <img src="${product.image}" alt="${product.name}" loading="lazy" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex'">
                <div class="product-image-fallback" style="display:none;"><i class="fas fa-jar"></i></div>
            </div>
            <div class="product-badge">100% Pure</div>
            <div class="product-info">
                <h3 onclick="viewProductDetail(${product.id})" style="cursor:pointer;">${product.name}</h3>
                <p>${product.description}</p>
                <div class="product-rating">
                    <span class="stars">${generateStars(product.rating)}</span>
                    <span>(${product.rating})</span>
                </div>
                <div class="product-footer">
                    <span class="product-price">₹${product.price}</span>
                    <div class="product-btn-group">
                        <button class="btn-add-cart" onclick="addToCart(${product.id})">
                            <i class="fas fa-cart-plus"></i> Add to Cart
                        </button>
                        <button class="btn-buy-now" onclick="viewProductDetail(${product.id})">
                            <i class="fas fa-bolt"></i> Buy Now
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// View product detail page
function viewProductDetail(productId) {
    localStorage.setItem('viewProductId', productId);
    window.location.href = 'product-detail.html';
}

// Buy Now directly (skip to checkout with single item)
function buyNow(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const user = JSON.parse(localStorage.getItem('user'));

    // Save the buy now cart regardless
    const buyNowCart = [{ ...product, quantity: 1 }];
    localStorage.setItem('buyNowCart', JSON.stringify(buyNowCart));
    localStorage.setItem('isBuyNow', 'true');

    if (!user) {
        // Not logged in — save redirect intent and send to register
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

// Generate star ratings
function generateStars(rating) {
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 !== 0;
    let stars = '';

    for (let i = 0; i < fullStars; i++) {
        stars += '<i class="fas fa-star"></i>';
    }
    if (halfStar) {
        stars += '<i class="fas fa-star-half-alt"></i>';
    }

    return stars;
}

// Add to cart
function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const existingItem = cart.find(item => item.id === productId);

    if (existingItem) {
        existingItem.quantity++;
    } else {
        cart.push({
            ...product,
            quantity: 1
        });
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();

    // Show notification
    showNotification('Product added to cart!');
}

// Update cart count badge
function updateCartCount() {
    const cartCountElements = document.querySelectorAll('.cart-count');
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

    cartCountElements.forEach(element => {
        element.textContent = totalItems;
    });
}

// Show notification
function showNotification(message) {
    // Create notification element
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 80px;
        right: 20px;
        background-color: #4caf50;
        color: white;
        padding: 15px 25px;
        border-radius: 5px;
        box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        z-index: 10000;
        animation: slideIn 0.3s ease-out;
    `;
    notification.textContent = message;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => notification.remove(), 300);
    }, 2000);
}

// Add animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Check login status and update button
function updateUserButton() {
    const userBtn = document.getElementById('userBtn');
    if (!userBtn) return;

    const user = JSON.parse(localStorage.getItem('user'));

    if (user) {
        userBtn.textContent = user.name;
        userBtn.onclick = logout;
    } else {
        userBtn.textContent = 'Login';
        userBtn.onclick = () => location.href = 'login.html';
    }
}

// Logout function
function logout() {
    localStorage.removeItem('user');
    location.href = 'index.html';
}

// Check login and redirect
function checkLoginAndRedirect() {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user) {
        logout();
    } else {
        location.href = 'login.html';
    }
}

// Get all products
function getAllProducts() {
    return products;
}
