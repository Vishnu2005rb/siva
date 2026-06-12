// Load order summary on checkout page
document.addEventListener('DOMContentLoaded', function() {
    loadOrderSummary();
    loadUserInfo();
    setupPaymentMethodToggle();
    setupAddressForm();
});

// Load order summary
function loadOrderSummary() {
    // Support both Buy Now (single product) and normal cart flow
    const isBuyNow = localStorage.getItem('isBuyNow') === 'true';
    const cart = isBuyNow
        ? (JSON.parse(localStorage.getItem('buyNowCart')) || [])
        : (JSON.parse(localStorage.getItem('cart')) || []);
    const orderItems = document.getElementById('orderItems');

    if (cart.length === 0) {
        window.location.href = isBuyNow ? 'products.html' : 'cart.html';
        return;
    }
    
    // Display order items
    orderItems.innerHTML = cart.map(item => `
        <div class="order-item">
            <div class="order-item-image">
                <i class="fas ${item.image}"></i>
            </div>
            <div class="order-item-info">
                <h4>${item.name}</h4>
                <p>Qty: ${item.quantity}</p>
            </div>
            <div class="order-item-price">₹${item.price * item.quantity}</div>
        </div>
    `).join('');
    
    // Update summary
    updateCheckoutSummary();
}

// Update checkout summary
function updateCheckoutSummary() {
    const isBuyNow = localStorage.getItem('isBuyNow') === 'true';
    const cart = isBuyNow
        ? (JSON.parse(localStorage.getItem('buyNowCart')) || [])
        : (JSON.parse(localStorage.getItem('cart')) || []);
    
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const delivery = 0;
    const tax = 0;
    const total = subtotal + delivery + tax;
    
    document.getElementById('summarySubtotal').textContent = `₹${subtotal.toFixed(2)}`;
    document.getElementById('summaryDelivery').textContent = `₹${delivery}`;
    document.getElementById('summaryTax').textContent = `₹${tax.toFixed(2)}`;
    document.getElementById('summaryTotal').textContent = `₹${total.toFixed(2)}`;
    
    // Store for later use
    localStorage.setItem('orderTotal', total.toFixed(2));
}

// Load user info into form
function loadUserInfo() {
    const user = JSON.parse(localStorage.getItem('user'));
    
    if (user) {
        const names = user.name.split(' ');
        document.getElementById('firstName').value = names[0] || '';
        document.getElementById('lastName').value = names.slice(1).join(' ') || '';
        document.getElementById('email').value = user.email || '';
        document.getElementById('phone').value = user.phone || '';
    }
}

// Setup payment method toggle
function setupPaymentMethodToggle() {
    const paymentRadios = document.querySelectorAll('input[name="payment"]');
    
    paymentRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            // Hide all payment details
            document.getElementById('cardDetails').style.display = 'none';
            document.getElementById('upiDetails').style.display = 'none';
            document.getElementById('netbankingDetails').style.display = 'none';
            
            // Show selected payment details
            if (this.value === 'card') {
                document.getElementById('cardDetails').style.display = 'block';
            } else if (this.value === 'upi') {
                document.getElementById('upiDetails').style.display = 'block';
            } else if (this.value === 'netbanking') {
                document.getElementById('netbankingDetails').style.display = 'block';
            }
        });
    });
}

// Setup address form submission
function setupAddressForm() {
    const form = document.getElementById('addressForm');
    
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Store shipping info
        const shippingInfo = {
            firstName: document.getElementById('firstName').value,
            lastName: document.getElementById('lastName').value,
            email: document.getElementById('email').value,
            phone: document.getElementById('phone').value,
            address: document.getElementById('address').value,
            city: document.getElementById('city').value,
            state: document.getElementById('state').value,
            pincode: document.getElementById('pincode').value,
            country: document.getElementById('country').value
        };
        
        localStorage.setItem('shippingInfo', JSON.stringify(shippingInfo));
        
        // Move to payment step
        moveToPaymentStep();
    });
}

// Move to payment step
function moveToPaymentStep() {
    document.getElementById('shippingForm').style.display = 'none';
    document.getElementById('paymentForm').style.display = 'block';
    
    // Update progress steps
    document.querySelector('.step.active').classList.remove('active');
    document.getElementById('step2').classList.add('active');
    
    window.scrollTo(0, 0);
}

// Back to shipping
function backToShipping() {
    document.getElementById('paymentForm').style.display = 'none';
    document.getElementById('shippingForm').style.display = 'block';
    
    // Update progress steps
    document.getElementById('step2').classList.remove('active');
    document.querySelector('.step').classList.add('active');
    
    window.scrollTo(0, 0);
}

// Process payment
function processPayment() {
    const selectedPayment = document.querySelector('input[name="payment"]:checked').value;
    
    // Validate payment details based on method
    if (selectedPayment === 'card') {
        const cardNumber = document.getElementById('cardNumber').value;
        const cardName = document.getElementById('cardName').value;
        const expiry = document.getElementById('expiry').value;
        const cvv = document.getElementById('cvv').value;
        
        if (!cardNumber || !cardName || !expiry || !cvv) {
            alert('Please fill in all card details');
            return;
        }
    } else if (selectedPayment === 'upi') {
        const upiId = document.getElementById('upiId').value;
        if (!upiId) {
            alert('Please enter your UPI ID');
            return;
        }
    } else if (selectedPayment === 'netbanking') {
        const bank = document.getElementById('bank').value;
        if (!bank) {
            alert('Please select your bank');
            return;
        }
    }
    
    // Store payment method
    localStorage.setItem('paymentMethod', selectedPayment.toUpperCase());
    
    // Simulate payment processing
    showProcessingOverlay();
    
    setTimeout(() => {
        // Clear cart and buyNow flags
        localStorage.removeItem('cart');
        localStorage.removeItem('buyNowCart');
        localStorage.removeItem('isBuyNow');
        
        // Redirect to confirmation
        window.location.href = 'order-confirmation.html';
    }, 2000);
}

// Show processing overlay
function showProcessingOverlay() {
    const overlay = document.createElement('div');
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0,0,0,0.8);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        color: white;
    `;
    
    overlay.innerHTML = `
        <div style="text-align: center;">
            <i class="fas fa-spinner fa-spin" style="font-size: 60px; margin-bottom: 20px;"></i>
            <h2>Processing your payment...</h2>
            <p>Please wait while we confirm your order</p>
        </div>
    `;
    
    document.body.appendChild(overlay);
}
