// Service Worker for PWA functionality

const CACHE_NAME = 'rentease-cache-v2';
const STATIC_CACHE_NAME = 'rentease-static-v2';
const IMAGES_CACHE_NAME = 'rentease-images-v2';

// Assets to cache on install
const STATIC_ASSETS = [
    './',
    './index.html',
    './admin/admin.html',
    './admin/property.html',
    './admin/styles.css',
    './admin/app.js',
    './admin/admin.js',
    './admin/db.js',
    './admin/manifest.json',
    'https://images.unsplash.com/photo-1560448204-603b3fc33ddc?w=500',
    'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=500',
    'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=500',
    'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=500'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
    console.log('Service Worker installing...');
    
    event.waitUntil(
        caches.open(STATIC_CACHE_NAME)
            .then((cache) => {
                console.log('Caching static assets');
                return cache.addAll(STATIC_ASSETS);
            })
            .then(() => {
                console.log('Static assets cached successfully');
                return self.skipWaiting();
            })
            .catch((error) => {
                console.error('Error caching static assets:', error);
            })
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    console.log('Service Worker activating...');
    
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== STATIC_CACHE_NAME && 
                        cacheName !== IMAGES_CACHE_NAME && 
                        cacheName !== CACHE_NAME) {
                        console.log('Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => {
            console.log('Service Worker activated');
            return self.clients.claim();
        })
    );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url);
    
    // Skip intercepting navigation requests (HTML pages) - let them load normally
    // This prevents the issue where all HTML files redirect to index
    if (event.request.mode === 'navigate') {
        return;
    }
    
    // Handle API requests (IndexedDB data)
    if (event.request.url.includes('/api/')) {
        // For API requests, try network first, then cache
        event.respondWith(
            fetch(event.request)
                .then((response) => {
                    // Cache successful responses
                    if (response.status === 200) {
                        const responseClone = response.clone();
                        caches.open(CACHE_NAME).then((cache) => {
                            cache.put(event.request, responseClone);
                        });
                    }
                    return response;
                })
                .catch(() => {
                    // If network fails, try cache
                    return caches.match(event.request);
                })
        );
    }
    // Handle images
    else if (event.request.destination === 'image') {
        event.respondWith(
            caches.open(IMAGES_CACHE_NAME).then((cache) => {
                return cache.match(event.request).then((cachedResponse) => {
                    if (cachedResponse) {
                        return cachedResponse;
                    }
                    
                    return fetch(event.request).then((networkResponse) => {
                        cache.put(event.request, networkResponse.clone());
                        return networkResponse;
                    }).catch(() => {
                        // Return a fallback image if both cache and network fail
                        return caches.match('./images/fallback.jpg');
                    });
                });
            })
        );
    }
    // Handle HTML, CSS, JS
    else if (event.request.document || 
             event.request.destination === 'style' || 
             event.request.destination === 'script') {
        
        event.respondWith(
            caches.match(event.request).then((cachedResponse) => {
                if (cachedResponse) {
                    return cachedResponse;
                }
                
                return fetch(event.request).then((networkResponse) => {
                    return caches.open(STATIC_CACHE_NAME).then((cache) => {
                        cache.put(event.request, networkResponse.clone());
                        return networkResponse;
                    });
                });
            }).catch(() => {
                // If page is HTML and offline, show offline page
                if (event.request.document) {
                    return caches.match('./offline.html');
                }
            })
        );
    }
    // Default strategy: network first, then cache
    else {
        event.respondWith(
            fetch(event.request)
                .then((response) => {
                    const responseClone = response.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, responseClone);
                    });
                    return response;
                })
                .catch(() => {
                    return caches.match(event.request);
                })
        );
    }
});

// Background sync for offline actions
self.addEventListener('sync', (event) => {
    if (event.tag === 'sync-properties') {
        event.waitUntil(syncProperties());
    }
});

// Function to sync properties when back online
async function syncProperties() {
    try {
        // Get offline actions from IndexedDB
        const offlineActions = await getOfflineActions();
        
        for (const action of offlineActions) {
            try {
                // Process each action
                await processOfflineAction(action);
            } catch (error) {
                console.error('Error processing offline action:', error);
            }
        }
        
        // Clear processed actions
        await clearOfflineActions();
        
        // Notify all clients that sync is complete
        const clients = await self.clients.matchAll();
        clients.forEach(client => {
            client.postMessage({
                type: 'SYNC_COMPLETE',
                message: 'Offline actions synced successfully'
            });
        });
        
    } catch (error) {
        console.error('Error in syncProperties:', error);
    }
}

// Helper function to get offline actions from IndexedDB
async function getOfflineActions() {
    // This is a simplified version - in a real app, you'd query IndexedDB
    return [];
}

// Helper function to process offline action
async function processOfflineAction(action) {
    // Process based on action type
    switch (action.type) {
        case 'ADD_PROPERTY':
            // Send to server
            break;
        case 'UPDATE_PROPERTY':
            // Send to server
            break;
        case 'DELETE_PROPERTY':
            // Send to server
            break;
    }
}

// Helper function to clear offline actions
async function clearOfflineActions() {
    // Clear from IndexedDB
}

// Handle push notifications
self.addEventListener('push', (event) => {
    const options = {
        body: event.data.text(),
        icon: './admin/icons/icon-192.png',
        badge: './admin/icons/badge.png',
        vibrate: [100, 50, 100],
        data: {
            dateOfArrival: Date.now(),
            primaryKey: 1
        },
        actions: [
            {
                action: 'explore',
                title: 'View Property'
            },
            {
                action: 'close',
                title: 'Close'
            }
        ]
    };
    
    event.waitUntil(
        self.registration.showNotification('RentEase Africa', options)
    );
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    
    if (event.action === 'explore') {
        // Open the app
        event.waitUntil(
            clients.openWindow('./')
        );
    }
});

// Cache cleanup (periodic)
self.addEventListener('periodicsync', (event) => {
    if (event.tag === 'cleanup-cache') {
        event.waitUntil(cleanupCache());
    }
});

// Cleanup old cache entries
async function cleanupCache() {
    const maxAge = 30 * 24 * 60 * 60 * 1000; // 30 days
    
    const cacheNames = await caches.keys();
    
    for (const cacheName of cacheNames) {
        const cache = await caches.open(cacheName);
        const requests = await cache.keys();
        
        for (const request of requests) {
            const response = await cache.match(request);
            const cacheDate = response.headers.get('date');
            
            if (cacheDate) {
                const age = Date.now() - new Date(cacheDate).getTime();
                if (age > maxAge) {
                    await cache.delete(request);
                }
            }
        }
    }
}

// Handle messages from client
self.addEventListener('message', (event) => {
    if (event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
    
    if (event.data.type === 'CACHE_PROPERTY') {
        // Cache specific property data
        caches.open(CACHE_NAME).then((cache) => {
            const propertyData = event.data.property;
            const response = new Response(JSON.stringify(propertyData), {
                headers: { 'Content-Type': 'application/json' }
            });
            cache.put(`/api/property/${propertyData.id}`, response);
        });
    }
});

console.log('Service Worker loaded');