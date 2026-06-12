// Load all products on products page
document.addEventListener('DOMContentLoaded', function() {
    loadAllProducts();
});

let currentProducts = getAllProducts();

// Load all products
function loadAllProducts() {
    const container = document.getElementById('productsGrid');
    currentProducts = getAllProducts();
    
    container.innerHTML = currentProducts.map(product => createProductCard(product)).join('');
}

// Sort products
function sortProducts() {
    const sortValue = document.getElementById('sortFilter').value;
    
    switch(sortValue) {
        case 'price-low':
            currentProducts.sort((a, b) => a.price - b.price);
            break;
        case 'price-high':
            currentProducts.sort((a, b) => b.price - a.price);
            break;
        case 'name':
            currentProducts.sort((a, b) => a.name.localeCompare(b.name));
            break;
        default:
            currentProducts = getAllProducts();
    }
    
    displayFilteredProducts();
}

// Filter products by size
function filterProducts() {
    const sizeFilter = document.getElementById('sizeFilter').value;
    const allProducts = getAllProducts();
    
    if (sizeFilter === 'all') {
        currentProducts = allProducts;
    } else {
        currentProducts = allProducts.filter(product => product.size === sizeFilter);
    }
    
    // Reapply current sort
    sortProducts();
}

// Display filtered products
function displayFilteredProducts() {
    const container = document.getElementById('productsGrid');
    
    if (currentProducts.length === 0) {
        container.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 60px 20px;">
                <i class="fas fa-search" style="font-size: 60px; color: #e0e0e0; margin-bottom: 20px;"></i>
                <h3>No products found</h3>
                <p style="color: #666;">Try adjusting your filters</p>
            </div>
        `;
    } else {
        container.innerHTML = currentProducts.map(product => createProductCard(product)).join('');
    }
}
