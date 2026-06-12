// Load order confirmation details
document.addEventListener('DOMContentLoaded', function() {
    displayOrderConfirmation();
});

function displayOrderConfirmation() {
    // Generate order ID
    const orderId = 'NK-' + Math.floor(10000 + Math.random() * 90000);
    
    // Get order date
    const orderDate = new Date().toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    
    // Get total amount
    const orderTotal = localStorage.getItem('orderTotal') || '0';
    
    // Get payment method
    const paymentMethod = localStorage.getItem('paymentMethod') || 'N/A';
    
    // Update order details
    document.getElementById('orderId').textContent = orderId;
    document.getElementById('orderDate').textContent = orderDate;
    document.getElementById('orderTotal').textContent = `₹${orderTotal}`;
    document.getElementById('paymentMethod').textContent = paymentMethod;
    
    // Calculate delivery date (3-5 business days)
    const deliveryDate = new Date();
    deliveryDate.setDate(deliveryDate.getDate() + 4);
    document.getElementById('deliveryDate').textContent = deliveryDate.toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    
    // Clear temporary data
    localStorage.removeItem('shippingInfo');
    localStorage.removeItem('paymentMethod');
    localStorage.removeItem('orderTotal');
}
