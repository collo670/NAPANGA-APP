// Database configuration and CRUD operations for IndexedDB

const DB_NAME = 'RentEaseDB';
const DB_VERSION = 1;
const STORES = {
    PROPERTIES: 'properties',
    BOOKINGS: 'bookings',
    MESSAGES: 'messages',
    CACHE: 'cache'
};

class Database {
    constructor() {
        this.db = null;
        this.init();
    }

    // Initialize database
    async init() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(DB_NAME, DB_VERSION);

            request.onerror = () => {
                console.error('Database error:', request.error);
                reject(request.error);
            };

            request.onsuccess = () => {
                this.db = request.result;
                console.log('Database initialized successfully');
                resolve(this.db);
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;

                // Create properties store
                if (!db.objectStoreNames.contains(STORES.PROPERTIES)) {
                    const propertyStore = db.createObjectStore(STORES.PROPERTIES, { 
                        keyPath: 'id',
                        autoIncrement: false 
                    });
                    
                    // Create indexes for faster queries
                    propertyStore.createIndex('country', 'country', { unique: false });
                    propertyStore.createIndex('city', 'city', { unique: false });
                    propertyStore.createIndex('status', 'status', { unique: false });
                    propertyStore.createIndex('featured', 'featured', { unique: false });
                    propertyStore.createIndex('price', 'price', { unique: false });
                    propertyStore.createIndex('createdAt', 'createdAt', { unique: false });
                }

                // Create bookings store
                if (!db.objectStoreNames.contains(STORES.BOOKINGS)) {
                    db.createObjectStore(STORES.BOOKINGS, { 
                        keyPath: 'id',
                        autoIncrement: true 
                    });
                }

                // Create messages store
                if (!db.objectStoreNames.contains(STORES.MESSAGES)) {
                    db.createObjectStore(STORES.MESSAGES, { 
                        keyPath: 'id',
                        autoIncrement: true 
                    });
                }

                // Create cache store for offline data
                if (!db.objectStoreNames.contains(STORES.CACHE)) {
                    const cacheStore = db.createObjectStore(STORES.CACHE, { 
                        keyPath: 'key' 
                    });
                    cacheStore.createIndex('timestamp', 'timestamp', { unique: false });
                }
            };
        });
    }

    // Generate property ID based on country and year
    generatePropertyId(country, existingIds = []) {
        const year = new Date().getFullYear();
        let countryCode;
        
        switch(country) {
            case 'Kenya':
                countryCode = 'KE';
                break;
            case 'Tanzania':
                countryCode = 'TZ';
                break;
            case 'Uganda':
                countryCode = 'UG';
                break;
            default:
                countryCode = 'XX';
        }

        // Get the next number for this country/year combination
        const countryYearPrefix = `${countryCode}-${year}`;
        let maxNumber = 0;
        
        existingIds.forEach(id => {
            if (id.startsWith(countryYearPrefix)) {
                const num = parseInt(id.split('-')[2]);
                if (!isNaN(num) && num > maxNumber) {
                    maxNumber = num;
                }
            }
        });

        const nextNumber = (maxNumber + 1).toString().padStart(3, '0');
        return `${countryYearPrefix}-${nextNumber}`;
    }

    // Property CRUD Operations

    async addProperty(property) {
        try {
            await this.init();
            
            // Get all existing IDs to generate unique property ID
            const existingProperties = await this.getAllProperties();
            const existingIds = existingProperties.map(p => p.id);
            
            // Generate property ID
            property.id = this.generatePropertyId(property.country, existingIds);
            property.createdAt = new Date().toISOString();
            
            // Set currency based on country
            switch(property.country) {
                case 'Kenya':
                    property.currency = 'KES';
                    break;
                case 'Tanzania':
                    property.currency = 'TZS';
                    break;
                case 'Uganda':
                    property.currency = 'UGX';
                    break;
                default:
                    property.currency = 'KES';
            }

            return new Promise((resolve, reject) => {
                const transaction = this.db.transaction([STORES.PROPERTIES], 'readwrite');
                const store = transaction.objectStore(STORES.PROPERTIES);
                
                const request = store.add(property);
                
                request.onsuccess = () => {
                    console.log('Property added successfully:', property.id);
                    // Update cache
                    this.updateCache('properties', property);
                    resolve(property.id);
                };
                
                request.onerror = () => {
                    console.error('Error adding property:', request.error);
                    reject(request.error);
                };
            });
        } catch (error) {
            console.error('Error in addProperty:', error);
            throw error;
        }
    }

    async getAllProperties() {
        try {
            await this.init();
            
            return new Promise((resolve, reject) => {
                const transaction = this.db.transaction([STORES.PROPERTIES], 'readonly');
                const store = transaction.objectStore(STORES.PROPERTIES);
                const request = store.getAll();
                
                request.onsuccess = () => {
                    resolve(request.result);
                };
                
                request.onerror = () => {
                    console.error('Error getting properties:', request.error);
                    reject(request.error);
                };
            });
        } catch (error) {
            console.error('Error in getAllProperties:', error);
            throw error;
        }
    }

    async getProperty(id) {
        try {
            await this.init();
            
            return new Promise((resolve, reject) => {
                const transaction = this.db.transaction([STORES.PROPERTIES], 'readonly');
                const store = transaction.objectStore(STORES.PROPERTIES);
                const request = store.get(id);
                
                request.onsuccess = () => {
                    resolve(request.result);
                };
                
                request.onerror = () => {
                    console.error('Error getting property:', request.error);
                    reject(request.error);
                };
            });
        } catch (error) {
            console.error('Error in getProperty:', error);
            throw error;
        }
    }

    async updateProperty(property) {
        try {
            await this.init();
            
            return new Promise((resolve, reject) => {
                const transaction = this.db.transaction([STORES.PROPERTIES], 'readwrite');
                const store = transaction.objectStore(STORES.PROPERTIES);
                
                // Update the modified timestamp
                property.updatedAt = new Date().toISOString();
                
                const request = store.put(property);
                
                request.onsuccess = () => {
                    console.log('Property updated successfully:', property.id);
                    // Update cache
                    this.updateCache('properties', property);
                    resolve(property.id);
                };
                
                request.onerror = () => {
                    console.error('Error updating property:', request.error);
                    reject(request.error);
                };
            });
        } catch (error) {
            console.error('Error in updateProperty:', error);
            throw error;
        }
    }

    async deleteProperty(id) {
        try {
            await this.init();
            
            return new Promise((resolve, reject) => {
                const transaction = this.db.transaction([STORES.PROPERTIES], 'readwrite');
                const store = transaction.objectStore(STORES.PROPERTIES);
                
                const request = store.delete(id);
                
                request.onsuccess = () => {
                    console.log('Property deleted successfully:', id);
                    // Remove from cache
                    this.removeFromCache('properties', id);
                    resolve(true);
                };
                
                request.onerror = () => {
                    console.error('Error deleting property:', request.error);
                    reject(request.error);
                };
            });
        } catch (error) {
            console.error('Error in deleteProperty:', error);
            throw error;
        }
    }

    // Filter and search methods
    async filterProperties(filters = {}) {
        try {
            let properties = await this.getAllProperties();
            
            // Apply filters
            if (filters.country) {
                properties = properties.filter(p => p.country === filters.country);
            }
            
            if (filters.city) {
                properties = properties.filter(p => 
                    p.city.toLowerCase().includes(filters.city.toLowerCase())
                );
            }
            
            if (filters.area) {
                properties = properties.filter(p => 
                    p.area.toLowerCase().includes(filters.area.toLowerCase())
                );
            }
            
            if (filters.propertyType) {
                properties = properties.filter(p => p.type === filters.propertyType);
            }
            
            if (filters.minPrice) {
                properties = properties.filter(p => p.price >= parseInt(filters.minPrice));
            }
            
            if (filters.maxPrice) {
                properties = properties.filter(p => p.price <= parseInt(filters.maxPrice));
            }
            
            if (filters.bedrooms) {
                if (filters.bedrooms === '4+') {
                    properties = properties.filter(p => p.bedrooms >= 4);
                } else {
                    properties = properties.filter(p => p.bedrooms === parseInt(filters.bedrooms));
                }
            }
            
            if (filters.amenities && filters.amenities.length > 0) {
                properties = properties.filter(p => {
                    return filters.amenities.every(amenity => 
                        p.amenities && p.amenities.includes(amenity)
                    );
                });
            }
            
            if (filters.status) {
                properties = properties.filter(p => p.status === filters.status);
            }
            
            if (filters.featured !== undefined) {
                properties = properties.filter(p => p.featured === filters.featured);
            }
            
            // Sort by createdAt (newest first)
            properties.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            
            return properties;
        } catch (error) {
            console.error('Error in filterProperties:', error);
            throw error;
        }
    }

    // Statistics methods
    async getCountryStats() {
        try {
            const properties = await this.getAllProperties();
            const stats = {};
            
            properties.forEach(property => {
                if (!stats[property.country]) {
                    stats[property.country] = {
                        total: 0,
                        available: 0,
                        rented: 0,
                        featured: 0,
                        totalValue: 0
                    };
                }
                
                stats[property.country].total++;
                stats[property.country].totalValue += property.price;
                
                if (property.status === 'Available') {
                    stats[property.country].available++;
                } else {
                    stats[property.country].rented++;
                }
                
                if (property.featured) {
                    stats[property.country].featured++;
                }
            });
            
            return stats;
        } catch (error) {
            console.error('Error in getCountryStats:', error);
            throw error;
        }
    }

    // Cache methods for offline support
    async updateCache(key, data) {
        try {
            await this.init();
            
            const cacheData = {
                key: key,
                data: data,
                timestamp: Date.now()
            };
            
            const transaction = this.db.transaction([STORES.CACHE], 'readwrite');
            const store = transaction.objectStore(STORES.CACHE);
            store.put(cacheData);
        } catch (error) {
            console.error('Error updating cache:', error);
        }
    }

    async getFromCache(key) {
        try {
            await this.init();
            
            return new Promise((resolve, reject) => {
                const transaction = this.db.transaction([STORES.CACHE], 'readonly');
                const store = transaction.objectStore(STORES.CACHE);
                const request = store.get(key);
                
                request.onsuccess = () => {
                    const cached = request.result;
                    if (cached && (Date.now() - cached.timestamp) < 24 * 60 * 60 * 1000) { // 24 hours cache
                        resolve(cached.data);
                    } else {
                        resolve(null);
                    }
                };
                
                request.onerror = () => {
                    reject(request.error);
                };
            });
        } catch (error) {
            console.error('Error getting from cache:', error);
            return null;
        }
    }

    async removeFromCache(key, id) {
        try {
            await this.init();
            
            // For properties cache, we need to remove the specific property from the array
            const cached = await this.getFromCache(key);
            if (cached && Array.isArray(cached)) {
                const updatedCache = cached.filter(item => item.id !== id);
                await this.updateCache(key, updatedCache);
            }
        } catch (error) {
            console.error('Error removing from cache:', error);
        }
    }

    // Initialize with sample data (for demo purposes)
    async initializeSampleData() {
        try {
            const existingProperties = await this.getAllProperties();
            if (existingProperties.length === 0) {
                const sampleProperties = [
                    {
                        country: 'Kenya',
                        city: 'Nairobi',
                        area: 'Westlands',
                        title: 'Modern 2BR Apartment with City View',
                        description: 'Beautiful apartment in the heart of Westlands. Close to shopping malls and restaurants.',
                        type: 'Apartment',
                        bedrooms: 2,
                        bathrooms: 2,
                        size: 85,
                        price: 85000,
                        currency: 'KES',
                        paymentType: 'Monthly',
                        status: 'Available',
                        amenities: ['WiFi', 'Parking', 'Security', 'Furnished'],
                        images: ['https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=500'],
                        featured: true
                    },
                    {
                        country: 'Tanzania',
                        city: 'Dar es Salaam',
                        area: 'Masaki',
                        title: 'Luxury Villa with Ocean View',
                        description: 'Stunning villa with direct beach access and private pool.',
                        type: 'Villa',
                        bedrooms: 4,
                        bathrooms: 3,
                        size: 250,
                        price: 3500000,
                        currency: 'TZS',
                        paymentType: 'Monthly',
                        status: 'Available',
                        amenities: ['WiFi', 'Parking', 'Pool', 'Gym', 'Security', 'Air Conditioning'],
                        images: ['https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=500'],
                        featured: true
                    },
                    {
                        country: 'Uganda',
                        city: 'Kampala',
                        area: 'Kololo',
                        title: 'Spacious Family Home',
                        description: 'Large family home with garden and parking. Quiet neighborhood.',
                        type: 'House',
                        bedrooms: 3,
                        bathrooms: 2,
                        size: 180,
                        price: 2500000,
                        currency: 'UGX',
                        paymentType: 'Monthly',
                        status: 'Available',
                        amenities: ['WiFi', 'Parking', 'Security', 'Furnished', 'Kitchen'],
                        images: ['https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=500'],
                        featured: false
                    }
                ];

                for (const property of sampleProperties) {
                    await this.addProperty(property);
                }
                console.log('Sample data initialized');
            }
        } catch (error) {
            console.error('Error initializing sample data:', error);
        }
    }
}

// Create global database instance
const db = new Database();

// Initialize sample data when the database is ready
db.init().then(() => {
    db.initializeSampleData();
});