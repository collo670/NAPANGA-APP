// Public side application logic

// Global state
let currentProperties = [];
let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
let currentImageIndex = 0;
let propertyImages = [];

// Initialize application
document.addEventListener('DOMContentLoaded', async () => {
    console.log('App initialized');
    
    // Check if we're on property details page
    if (window.location.pathname.includes('property.html')) {
        loadPropertyDetails();
    } else {
        // Only load properties dynamically if grid is empty (no static content)
        const grid = document.getElementById('property-grid');
        if (grid && grid.children.length === 0) {
            await loadProperties();
        }
    }
    
    // Setup event listeners
    setupEventListeners();
    
    // Check if online/offline
    updateOnlineStatus();
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);
});

// Setup all event listeners
function setupEventListeners() {
    // Search button
    const searchBtn = document.getElementById('search-btn');
    if (searchBtn) {
        searchBtn.addEventListener('click', handleSearch);
    }
    
    // Search input (enter key)
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') handleSearch();
        });
    }
    
    // Filters
    const countryFilter = document.getElementById('country-filter');
    if (countryFilter) {
        countryFilter.addEventListener('change', handleFilterChange);
    }
    
    const propertyTypeFilter = document.getElementById('property-type-filter');
    if (propertyTypeFilter) {
        propertyTypeFilter.addEventListener('change', handleFilterChange);
    }
    
    const bedroomsFilter = document.getElementById('bedrooms-filter');
    if (bedroomsFilter) {
        bedroomsFilter.addEventListener('change', handleFilterChange);
    }
    
    // More filters button
    const moreFiltersBtn = document.getElementById('more-filters-btn');
    if (moreFiltersBtn) {
        moreFiltersBtn.addEventListener('click', toggleAdvancedFilters);
    }
    
    // Filter option buttons (toggle selected state)
    document.querySelectorAll('.filter-option').forEach(option => {
        option.addEventListener('click', function() {
            this.classList.toggle('selected');
        });
    });
    
    // Clear filters button
    const clearFiltersBtn = document.getElementById('clear-filters');
    if (clearFiltersBtn) {
        clearFiltersBtn.addEventListener('click', () => {
            document.querySelectorAll('.filter-option').forEach(opt => {
                opt.classList.remove('selected');
            });
            const minPrice = document.getElementById('min-price');
            const maxPrice = document.getElementById('max-price');
            if (minPrice) minPrice.value = '';
            if (maxPrice) maxPrice.value = '';
        });
    }
    
    // Apply filters button
    const applyFilters = document.getElementById('apply-filters');
    if (applyFilters) {
        applyFilters.addEventListener('click', handleAdvancedFilters);
    }
    
    // Mobile menu
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', toggleMobileMenu);
    }
    
    // Favorites link
    const favoritesLink = document.getElementById('favorites-link');
    if (favoritesLink) {
        favoritesLink.addEventListener('click', (e) => {
            e.preventDefault();
            showFavorites();
        });
    }
    
    // Share button (on details page)
    const shareBtn = document.getElementById('share-btn');
    if (shareBtn) {
        shareBtn.addEventListener('click', shareProperty);
    }
    
    // Favorite button (on details page)
    const favoriteBtn = document.getElementById('favorite-btn');
    if (favoriteBtn) {
        favoriteBtn.addEventListener('click', toggleFavorite);
    }
    
    // Contact button
    const contactBtn = document.getElementById('contact-btn');
    if (contactBtn) {
        contactBtn.addEventListener('click', contactOwner);
    }
}

// Load properties from database
async function loadProperties(filters = {}) {
    try {
        showLoading();
        
        let properties;
        
        // Try to get from cache first if offline
        if (!navigator.onLine) {
            properties = await db.getFromCache('properties');
            if (properties) {
                showOfflineIndicator('Showing cached data (offline mode)');
            }
        }
        
        // If online or no cache, get from database
        if (!properties) {
            properties = await db.filterProperties(filters);
        }
        
        currentProperties = properties;
        displayProperties(properties);
        updateResultsCount(properties.length);
    } catch (error) {
        console.error('Error loading properties:', error);
        showError('Failed to load properties');
    } finally {
        hideLoading();
    }
}

// Display properties in grid
function displayProperties(properties) {
    const grid = document.getElementById('property-grid');
    if (!grid) return;
    
    if (properties.length === 0) {
        grid.innerHTML = '<div class="no-results">No properties found</div>';
        return;
    }
    
    grid.innerHTML = properties.map(property => createPropertyCard(property)).join('');
    
    // Add click event to each card
    document.querySelectorAll('.property-card').forEach(card => {
        card.addEventListener('click', () => {
            const propertyId = card.dataset.id;
            window.location.href = `property.html?id=${propertyId}`;
        });
    });
}

// Create property card HTML
function createPropertyCard(property) {
    const isFavorite = favorites.includes(property.id);
    const imageUrl = property.images && property.images.length > 0 
        ? property.images[0] 
        : 'https://images.unsplash.com/photo-1560448204-603b3fc33ddc?w=500';
    
    return `
        <div class="property-card" data-id="${property.id}">
            <div class="card-image">
                <img src="${imageUrl}" alt="${property.title}" loading="lazy">
                ${property.featured ? '<span class="featured-badge">Featured</span>' : ''}
                <span class="availability-badge ${property.status.toLowerCase()}">${property.status}</span>
            </div>
            <div class="card-content">
                <h3>${property.title}</h3>
                <span class="location">📍 ${property.city}, ${property.area}, ${property.country}</span>
                <div class="price">
                    ${formatPrice(property.price, property.currency)}
                    <small>/${property.paymentType.toLowerCase()}</small>
                </div>
                <div class="card-amenities">
                    <span>${property.bedrooms} beds</span>
                    <span>${property.bathrooms} baths</span>
                    <span>${property.size} sqm</span>
                </div>
                <button class="favorite-btn ${isFavorite ? 'active' : ''}" onclick="event.stopPropagation(); toggleFavorite('${property.id}')">
                    ${isFavorite ? '❤️' : '🤍'} Save
                </button>
            </div>
        </div>
    `;
}

// Format price with currency
function formatPrice(price, currency) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(price);
}

// Handle search
async function handleSearch() {
    const searchTerm = document.getElementById('search-input').value;
    const filters = {
        city: searchTerm,
        area: searchTerm
    };
    await loadProperties(filters);
}

// Handle filter change
async function handleFilterChange() {
    const filters = {
        country: document.getElementById('country-filter').value,
        propertyType: document.getElementById('property-type-filter').value,
        bedrooms: document.getElementById('bedrooms-filter').value
    };
    await loadProperties(filters);
}

// Toggle advanced filters
function toggleAdvancedFilters() {
    const advancedFilters = document.getElementById('advanced-filters');
    const moreFiltersBtn = document.getElementById('more-filters-btn');
    
    if (advancedFilters) {
        advancedFilters.classList.toggle('hidden');
        
        // Update button text
        if (moreFiltersBtn) {
            const isOpen = !advancedFilters.classList.contains('hidden');
            moreFiltersBtn.textContent = isOpen ? 'Funga ▲' : 'More Filters ▼';
        }
    }
}

// Handle advanced filters
async function handleAdvancedFilters() {
    // Get selected property types (Aina ya Mali)
    const propertyTypes = [];
    document.querySelectorAll('.filter-section:nth-child(1) .filter-option.selected').forEach(btn => {
        propertyTypes.push(btn.textContent.trim());
    });
    
    // Get selected locations (Eneo)
    const locations = [];
    document.querySelectorAll('.filter-section:nth-child(2) .filter-option.selected').forEach(btn => {
        locations.push(btn.textContent.trim());
    });
    
    // Get selected features (Vipengele)
    const features = [];
    document.querySelectorAll('.filter-section:nth-child(4) .filter-option.selected').forEach(btn => {
        features.push(btn.textContent.trim());
    });
    
    const filters = {
        minPrice: document.getElementById('min-price')?.value || '',
        maxPrice: document.getElementById('max-price')?.value || '',
        propertyTypes: propertyTypes,
        locations: locations,
        features: features
    };
    
    await loadProperties(filters);
}

// Load property details
async function loadPropertyDetails() {
    const urlParams = new URLSearchParams(window.location.search);
    const propertyId = urlParams.get('id');
    
    if (!propertyId) {
        window.location.href = 'index.html';
        return;
    }
    
    try {
        showLoading();
        
        let property;
        
        // Try to get from cache if offline
        if (!navigator.onLine) {
            property = await db.getFromCache(`property_${propertyId}`);
        }
        
        // If online or no cache, get from database
        if (!property) {
            property = await db.getProperty(propertyId);
        }
        
        if (!property) {
            showError('Property not found');
            return;
        }
        
        displayPropertyDetails(property);
        
        // Store in cache for offline access
        if (navigator.onLine) {
            await db.updateCache(`property_${propertyId}`, property);
        }
        
        // Load similar properties
        await loadSimilarProperties(property);
        
    } catch (error) {
        console.error('Error loading property details:', error);
        showError('Failed to load property details');
    } finally {
        hideLoading();
    }
}

// Display property details
function displayPropertyDetails(property) {
    // Set page title
    document.getElementById('property-title').textContent = property.title;
    document.getElementById('property-location').textContent = `📍 ${property.city}, ${property.area}, ${property.country}`;
    document.getElementById('property-id').textContent = `ID: ${property.id}`;
    document.getElementById('property-price').textContent = formatPrice(property.price, property.currency);
    document.getElementById('payment-type').textContent = `/ ${property.paymentType}`;
    document.getElementById('bedrooms').textContent = property.bedrooms;
    document.getElementById('bathrooms').textContent = property.bathrooms;
    document.getElementById('size').textContent = property.size;
    document.getElementById('property-type').textContent = property.type;
    document.getElementById('property-description').textContent = property.description;
    
    // Display amenities
    const amenitiesList = document.getElementById('amenities-list');
    if (property.amenities && property.amenities.length > 0) {
        amenitiesList.innerHTML = property.amenities.map(amenity => 
            `<span class="amenity-item">✓ ${amenity}</span>`
        ).join('');
    } else {
        amenitiesList.innerHTML = '<p>No amenities listed</p>';
    }
    
    // Setup image gallery
    setupImageGallery(property.images || []);
    
    // Update favorite button state
    const favoriteBtn = document.getElementById('favorite-btn');
    if (favoriteBtn) {
        favoriteBtn.textContent = favorites.includes(property.id) ? '❤️ Saved' : '❤️ Save';
    }
}

// Setup image gallery
function setupImageGallery(images) {
    propertyImages = images;
    
    if (images.length === 0) {
        images = ['https://images.unsplash.com/photo-1560448204-603b3fc33ddc?w=500'];
    }
    
    // Set main image
    document.getElementById('current-image').src = images[0];
    
    // Create thumbnails
    const thumbnailGrid = document.getElementById('thumbnail-grid');
    thumbnailGrid.innerHTML = images.map((img, index) => 
        `<img src="${img}" alt="Thumbnail ${index + 1}" class="${index === 0 ? 'active' : ''}" onclick="changeImage(${index})">`
    ).join('');
    
    // Setup navigation buttons
    const prevBtn = document.getElementById('prev-image');
    const nextBtn = document.getElementById('next-image');
    
    if (prevBtn && nextBtn) {
        prevBtn.onclick = () => navigateImage(-1);
        nextBtn.onclick = () => navigateImage(1);
    }
}

// Change main image
function changeImage(index) {
    currentImageIndex = index;
    document.getElementById('current-image').src = propertyImages[index];
    
    // Update active thumbnail
    document.querySelectorAll('.thumbnail-grid img').forEach((img, i) => {
        if (i === index) {
            img.classList.add('active');
        } else {
            img.classList.remove('active');
        }
    });
}

// Navigate images
function navigateImage(direction) {
    let newIndex = currentImageIndex + direction;
    if (newIndex < 0) newIndex = propertyImages.length - 1;
    if (newIndex >= propertyImages.length) newIndex = 0;
    changeImage(newIndex);
}

// Load similar properties
async function loadSimilarProperties(currentProperty) {
    const filters = {
        country: currentProperty.country,
        propertyType: currentProperty.type,
        maxPrice: currentProperty.price * 1.5,
        minPrice: currentProperty.price * 0.5
    };
    
    const properties = await db.filterProperties(filters);
    const similar = properties
        .filter(p => p.id !== currentProperty.id)
        .slice(0, 3);
    
    const similarContainer = document.getElementById('similar-properties');
    if (similar.length > 0) {
        similarContainer.innerHTML = similar.map(p => createPropertyCard(p)).join('');
    } else {
        similarContainer.innerHTML = '<p>No similar properties found</p>';
    }
}

// Toggle favorite
function toggleFavorite(propertyId) {
    if (propertyId) {
        const index = favorites.indexOf(propertyId);
        if (index === -1) {
            favorites.push(propertyId);
        } else {
            favorites.splice(index, 1);
        }
    } else {
        // Called from details page
        const urlParams = new URLSearchParams(window.location.search);
        propertyId = urlParams.get('id');
        
        if (propertyId) {
            const index = favorites.indexOf(propertyId);
            if (index === -1) {
                favorites.push(propertyId);
                document.getElementById('favorite-btn').textContent = '❤️ Saved';
            } else {
                favorites.splice(index, 1);
                document.getElementById('favorite-btn').textContent = '❤️ Save';
            }
        }
    }
    
    localStorage.setItem('favorites', JSON.stringify(favorites));
}

// Show favorites
async function showFavorites() {
    if (favorites.length === 0) {
        alert('No favorites saved yet');
        return;
    }
    
    const properties = await db.getAllProperties();
    const favoriteProperties = properties.filter(p => favorites.includes(p.id));
    
    const grid = document.getElementById('property-grid');
    if (grid) {
        grid.innerHTML = favoriteProperties.map(p => createPropertyCard(p)).join('');
        updateResultsCount(favoriteProperties.length);
    }
}

// Share property
function shareProperty() {
    const urlParams = new URLSearchParams(window.location.search);
    const propertyId = urlParams.get('id');
    const propertyTitle = document.getElementById('property-title').textContent;
    
    if (navigator.share) {
        navigator.share({
            title: propertyTitle,
            text: 'Check out this property on RentEase Africa!',
            url: window.location.href
        }).catch(console.error);
    } else {
        // Fallback
        navigator.clipboard.writeText(window.location.href);
        alert('Link copied to clipboard!');
    }
}

// Contact owner
function contactOwner() {
    alert('Please login to contact the property owner.');
}

// Update results count
function updateResultsCount(count) {
    const resultsCount = document.getElementById('results-count');
    if (resultsCount) {
        resultsCount.textContent = `${count} propert${count === 1 ? 'y' : 'ies'}`;
    }
}

// Show/hide loading spinner
function showLoading() {
    const spinner = document.getElementById('loading-spinner');
    if (spinner) spinner.classList.remove('hidden');
}

function hideLoading() {
    const spinner = document.getElementById('loading-spinner');
    if (spinner) spinner.classList.add('hidden');
}

// Show error message
function showError(message) {
    const grid = document.getElementById('property-grid');
    if (grid) {
        grid.innerHTML = `<div class="error-message">${message}</div>`;
    }
}

// Update online status
function updateOnlineStatus() {
    const indicator = document.getElementById('offline-indicator');
    if (indicator) {
        if (!navigator.onLine) {
            indicator.classList.remove('hidden');
            showOfflineIndicator('You are offline - Showing cached data');
        } else {
            indicator.classList.add('hidden');
        }
    }
}

// Show offline indicator with message
function showOfflineIndicator(message) {
    const indicator = document.getElementById('offline-indicator');
    if (indicator) {
        indicator.textContent = message;
        indicator.classList.remove('hidden');
        
        // Auto hide after 3 seconds
        setTimeout(() => {
            indicator.classList.add('hidden');
        }, 3000);
    }
}

// Toggle mobile menu
function toggleMobileMenu() {
    const navLinks = document.querySelector('.nav-links');
    navLinks.style.display = navLinks.style.display === 'flex' ? 'none' : 'flex';
}