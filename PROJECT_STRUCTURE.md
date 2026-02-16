# NAPANGA APP - Project Structure

## Overview
NAPANGA is a Progressive Web App (PWA) for house rental listings in Dar es Salaam, Tanzania. This document describes the organized project structure.

## Directory Organization

### 📁 `/public` - Public-Facing Application
Contains all public-facing web pages and PWA configuration files.
```
public/
├── manifest.json          # PWA manifest for app installation
├── browserconfig.xml      # Windows browser configuration
├── sw.js                  # Service Worker for offline support
└── pages/
    ├── index.html         # Main public homepage
    ├── property.html      # Property listing page
    ├── public.html        # Public information page
    ├── vyumba.html        # Rooms/apartments listing page
    └── admin-index.html   # Legacy admin index
```

### 👨‍💼 `/admin` - Admin Dashboard
Contains all admin panel functionality and related files.
```
admin/
├── admin.html                 # Admin dashboard main page
├── admin.js                   # Admin dashboard JavaScript
├── ADMINI.js                  # Admin supplementary code
├── house-rental-admin.html    # Alternative admin interface
├── house-rental-admin-v3.html # Admin v3 interface
├── ADMIN MANIFEST.json        # Admin PWA manifest
└── ADMIN SW.js                # Admin service worker
```

### 📦 `/src` - Source Code & Assets
Contains all application assets organized by type.
```
src/
├── css/
│   ├── styles.css             # Main application styles
│   └── admin-styles.css       # Admin panel styles
├── js/
│   ├── app.js                 # Main application JavaScript
│   └── DB.js                  # Database management (IndexedDB)
├── images/
│   ├── mfano.png              # Sample property image 1
│   ├── nyumba1.png            # Property image 2
│   ├── nyumba2.png            # Property image 3
│   └── Nyumba3.png            # Property image 4
└── icons/
    ├── icon.svg               # SVG icon file
    └── generate-icons.html    # Icon generation utility
```

### 🔧 `/scripts` - Utility Scripts
Contains backup and restore scripts.
```
scripts/
├── backup.bat                 # Backup script (Windows)
├── restore.bat                # Restore script (Windows)
└── backups/
    ├── backup-manifest.json   # Backup manifest
    └── backup.html            # Backup HTML file
```

### 📚 `/docs` - Documentation
Dedicated folder for project documentation.
```
docs/
└── (Add documentation files here)
```

### 🗂️ `/archive` - Old Backups
Archive of old project structure and backups.
```
archive/
└── old-NYUMBA-backup/        # Previous version backup
```

## File Organization Summary

| File Type | Location | Purpose |
|-----------|----------|---------|
| HTML Pages | `/public/pages/` | User-facing web pages |
| Admin Pages | `/admin/` | Administrative interface |
| Stylesheets | `/src/css/` | CSS styling |
| JavaScript | `/src/js/` | Application logic and database |
| Images | `/src/images/` | Property listing images |
| Icons | `/src/icons/` | App icons and branding |
| Config | `/public/` | PWA and browser configuration |
| Scripts | `/scripts/` | Backup/restore utilities |

## Key Features

### PWA Configuration
- **manifest.json**: Enables app installation on mobile devices
- **sw.js**: Service Worker for offline functionality
- **browserconfig.xml**: Windows-specific browser settings

### Database
- **DB.js**: Uses IndexedDB for offline data storage
- Stores: properties, bookings, messages, cache

### Admin Interface
- Secure login overlay
- Dashboard for property management
- Separate PWA configuration for admin panel

## Getting Started

1. **For Users**: Open `public/pages/index.html` in a browser
2. **For Admin**: Access `/admin/admin.html`
3. **Service Worker**: Automatically enabled for PWA features
4. **Offline Support**: All data stored in IndexedDB (IndexedDB)

## Integration Points

- Public app loads from `/src/js/app.js`
- Styles loaded from `/src/css/styles.css`
- Images referenced from `/src/images/`
- Icons served from `/src/icons/`

## Maintenance

- Keep `/backups/` and `/archive/` for version history
- Update `/src/css/` files for styling changes
- Modify database logic in `/src/js/DB.js`
- Add new admin features in `/admin/` folder

---
Last Updated: February 15, 2026
Organized Structure: Main Application Refactor
