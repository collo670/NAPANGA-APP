// Admin side application logic

// Global state
let currentProperties = [];
let isAuthenticated = false;
let editPropertyId = null;

// Admin credentials (in real app, this would be handled securely on server)
const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'admin123';

// Initialize admin dashboard
document.addEventListener('DOMContentLoaded', () => {
    console.log('Admin panel initialized');
    
    // Check if already authenticated
    const savedAuth = localStorage.getItem('adminAuth');
    if (savedAuth === 'true') {
        isAuthenticated = true;
        showDashboard();
    }
    
    // Setup login form
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    // Setup navigation
    setupNavigation();
    
    // Setup logout button
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
    
    // Setup property form
    const propertyForm = document.getElementById('property-form');
    if (propertyForm) {
        propertyForm.addEventListener('submit', handleAddProperty);
    }
    
    // Setup country selector for currency update
    const countrySelect = document.getElementById('country');
    if (countrySelect) {
        countrySelect.addEventListener('change', updateCurrency);
    }
    
    // Setup image upload preview
    const imageInput = document.getElementById('images');
    if (imageInput) {
        imageInput.addEventListener('change', handleImagePreview);
    }
    
    // Setup listing filters
    setupListingFilters();
});

// Handle login
function handleLogin(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
        isAuthenticated = true;
        localStorage.setItem('adminAuth', 'true');
        showDashboard();
    } else {
        alert('Invalid credentials');
    }
}

// Show dashboard after login
function showDashboard() {
    document.getElementById('login-overlay').classList.add('hidden');
    document.getElementById('admin-dashboard').classList.remove('hidden');
    
    // Load dashboard data
    loadDashboardStats();
    loadListings();
    loadCountryStats();
}

// Handle logout
function handleLogout() {
    isAuthenticated = false;
    localStorage.removeItem('adminAuth');
    document.getElementById('login-overlay').classList.remove('hidden');
    document.getElementById('admin-dashboard').classList.add('hidden');
}

// Setup navigation between sections
function setupNavigation() {
    document.querySelectorAll('.sidebar-nav .nav-item').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Skip if it's logout
            if (item.classList.contains('logout')) return;
            
            // Update active state
            document.querySelectorAll('.sidebar-nav .nav-item').forEach(nav => {
                nav.classList.remove('active');
            });
            item.classList.add('active');
            
            // Show corresponding section
            const section = item.dataset.section;
            document.querySelectorAll('.admin-section').forEach(s => {
                s.classList.remove('active');
            });
            document.getElementById(`${section}-section`).classList.add('active');
            
            // Load section data if needed
            if (section === 'manage-listings') {
                loadListings();
            } else if (section === 'countries') {
                loadCountryStats();
            } else if (section === 'dashboard') {
                loadDashboardStats();
            }
        });
    });
}

// Load dashboard statistics
async function loadDashboardStats() {
    try {
        const properties = await db.getAllProperties();
        const stats = await db.getCountryStats();
        
        const totalProperties = properties.length;
        const availableProperties = properties.filter(p => p.status === 'Available').length;
        const featuredProperties = properties.filter(p => p.featured).length;
        const totalCountries = Object.keys(stats).length;
        
        const statsGrid = document.getElementById('stats-grid');
        if (statsGrid) {
            statsGrid.innerHTML = `
                <div class="stat-card">
                    <h3>Total Properties</h3>
                    <p class="stat-value">${totalProperties}</p>
                </div>
                <div class="stat-card">
                    <h3>Available</h3>
                    <p class="stat-value">${availableProperties}</p>
                </div>
                <div class="stat-card">
                    <h3>Featured</h3>
                    <p class="stat-value">${featuredProperties}</p>
                </div>
                <div class="stat-card">
                    <h3>Countries</h3>
                    <p class="stat-value">${totalCountries}</p>
                </div>
            `;
        }
    } catch (error) {
        console.error('Error loading dashboard stats:', error);
    }
}

// Update currency based on selected country
function updateCurrency() {
    const country = document.getElementById('country').value;
    const currencyInput = document.getElementById('currency');
    
    const currencies = {
        'Kenya': 'KES',
        'Tanzania': 'TZS',
        'Uganda': 'UGX'
    };
    
    currencyInput.value = currencies[country] || 'KES';
}

// Handle image preview
function handleImagePreview(e) {
    const files = e.target.files;
    const preview = document.getElementById('image-preview');
    preview.innerHTML = '';
    
    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const reader = new FileReader();
        
        reader.onload = (e) => {
            const img = document.createElement('img');
            img.src = e.target.result;
            preview.appendChild(img);
        };
        
        reader.readAsDataURL(file);
    }
}

// Handle add property form submission
async function handleAddProperty(e) {
    e.preventDefault();
    
    try {
        // Collect amenities
        const amenities = [];
        document.querySelectorAll('#property-form .amenities-grid input:checked').forEach(cb => {
            amenities.push(cb.value);
        });
        
        // Collect images (in real app, you'd upload these to a server)
        const imageFiles = document.getElementById('images').files;
        const images = [];
        for (let i = 0; i < imageFiles.length; i++) {
            // In a real app, you'd upload to cloud storage and get URLs
            // For demo, we'll create object URLs
            const imageUrl = URL.createObjectURL(imageFiles[i]);
            images.push(imageUrl);
        }
        
        // If no images, use default
        if (images.length === 0) {
            images.push('https://images.unsplash.com/photo-1560448204-603b3fc33ddc?w=500');
        }
        
        const property = {
            country: document.getElementById('country').value,
            city: document.getElementById('city').value,
            area: document.getElementById('area').value,
            title: document.getElementById('title').value,
            description: document.getElementById('description').value,
            type: document.getElementById('property-type').value,
            bedrooms: parseInt(document.getElementById('bedrooms').value),
            bathrooms: parseFloat(document.getElementById('bathrooms').value),
            size: parseInt(document.getElementById('size').value),
            price: parseInt(document.getElementById('price').value),
            paymentType: document.getElementById('payment-type').value,
            status: document.getElementById('status').value,
            amenities: amenities,
            images: images,
            featured: document.getElementById('featured').checked
        };
        
        await db.addProperty(property);
        alert('Property added successfully!');
        
        // Reset form
        e.target.reset();
        document.getElementById('image-preview').innerHTML = '';
        
        // Refresh listings
        loadListings();
        
    } catch (error) {
        console.error('Error adding property:', error);
        alert('Failed to add property. Please try again.');
    }
}

// Load listings for manage section
async function loadListings() {
    try {
        const properties = await db.getAllProperties();
        currentProperties = properties;
        displayListings(properties);
    } catch (error) {
        console.error('Error loading listings:', error);
    }
}

// Display listings in table
function displayListings(properties) {
    const tbody = document.getElementById('listings-table-body');
    if (!tbody) return;
    
    tbody.innerHTML = properties.map(property => `
        <tr>
            <td>${property.id}</td>
            <td>${property.title}</td>
            <td>${property.country}</td>
            <td>${formatPrice(property.price, property.currency)}</td>
            <td>
                <span class="status-badge ${property.status.toLowerCase()}">${property.status}</span>
            </td>
            <td>
                <input type="checkbox" ${property.featured ? 'checked' : ''} 
                       onchange="toggleFeatured('${property.id}')">
            </td>
            <td>
                <div class="action-btns">
                    <button class="edit-btn" onclick="editProperty('${property.id}')">Edit</button>
                    <button class="delete-btn" onclick="deleteProperty('${property.id}')">Delete</button>
                </div>
            </td>
        </tr>
    `).join('');
}

// Setup listing filters
function setupListingFilters() {
    const countryFilter = document.getElementById('listing-country-filter');
    const statusFilter = document.getElementById('listing-status-filter');
    const searchInput = document.getElementById('listing-search');
    
    if (countryFilter) {
        countryFilter.addEventListener('change', filterListings);
    }
    
    if (statusFilter) {
        statusFilter.addEventListener('change', filterListings);
    }
    
    if (searchInput) {
        searchInput.addEventListener('input', filterListings);
    }
}

// Filter listings
function filterListings() {
    const country = document.getElementById('listing-country-filter').value;
    const status = document.getElementById('listing-status-filter').value;
    const search = document.getElementById('listing-search').value.toLowerCase();
    
    let filtered = currentProperties;
    
    if (country) {
        filtered = filtered.filter(p => p.country === country);
    }
    
    if (status) {
        filtered = filtered.filter(p => p.status === status);
    }
    
    if (search) {
        filtered = filtered.filter(p => 
            p.title.toLowerCase().includes(search) ||
            p.city.toLowerCase().includes(search) ||
            p.area.toLowerCase().includes(search)
        );
    }
    
    displayListings(filtered);
}

// Toggle featured status
async function toggleFeatured(propertyId) {
    try {
        const property = await db.getProperty(propertyId);
        property.featured = !property.featured;
        await db.updateProperty(property);
        loadListings();
    } catch (error) {
        console.error('Error toggling featured:', error);
    }
}

// Edit property
async function editProperty(propertyId) {
    try {
        const property = await db.getProperty(propertyId);
        editPropertyId = propertyId;
        
        // Show edit modal (simplified - in real app you'd populate a form)
        alert('Edit functionality - In a full app, this would open a form with pre-filled data');
        
    } catch (error) {
        console.error('Error loading property for edit:', error);
    }
}

// Delete property
async function deleteProperty(propertyId) {
    if (confirm('Are you sure you want to delete this property?')) {
        try {
            await db.deleteProperty(propertyId);
            loadListings();
            loadDashboardStats();
            loadCountryStats();
            alert('Property deleted successfully');
        } catch (error) {
            console.error('Error deleting property:', error);
            alert('Failed to delete property');
        }
    }
}

// Load country statistics
async function loadCountryStats() {
    try {
        const stats = await db.getCountryStats();
        const properties = await db.getAllProperties();
        
        const container = document.getElementById('countries-stats');
        if (!container) return;
        
        container.innerHTML = Object.entries(stats).map(([country, data]) => `
            <div class="country-card">
                <h3>${country}</h3>
                <div class="stat-item">
                    <span>Total Listings:</span>
                    <strong>${data.total}</strong>
                </div>
                <div class="stat-item">
                    <span>Available:</span>
                    <strong style="color: var(--success-color)">${data.available}</strong>
                </div>
                <div class="stat-item">
                    <span>Rented:</span>
                    <strong style="color: var(--danger-color)">${data.rented}</strong>
                </div>
                <div class="stat-item">
                    <span>Featured:</span>
                    <strong style="color: var(--warning-color)">${data.featured}</strong>
                </div>
                <div class="stat-item">
                    <span>Average Price:</span>
                    <strong>${formatPrice(data.totalValue / data.total, getCurrencyForCountry(country))}</strong>
                </div>
            </div>
        `).join('');
        
    } catch (error) {
        console.error('Error loading country stats:', error);
    }
}

// Helper function to get currency for country
function getCurrencyForCountry(country) {
    const currencies = {
        'Kenya': 'KES',
        'Tanzania': 'TZS',
        'Uganda': 'UGX'
    };
    return currencies[country] || 'KES';
}

// Format price (reuse from app.js)
function formatPrice(price, currency) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(price);
}