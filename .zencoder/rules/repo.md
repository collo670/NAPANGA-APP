---
description: Repository Information Overview
alwaysApply: true
---

# NAPANGA Information

## Summary
**NAPANGA** is a high-performance, Progressive Web App (PWA) designed for house rental listings in Dar es Salaam, Tanzania. The project features a single-page architecture that merges property search and discovery with a comprehensive management dashboard and listing wizard. It is built as a standalone frontend application with zero external dependencies, utilizing vanilla JavaScript and browser-native APIs for offline functionality.

## Structure
The repository is organized into distinct modules for public users, administrators, and shared assets:

- **`admin/`**: Contains the administrative dashboard (`admin.html`), property management logic (`admin.js`), and its own PWA configuration (service worker and manifest).
- **`public/pages/`**: Houses the main user-facing web pages, including the homepage (`index.html`), property listings (`vyumba.html`), and detailed property views (`house.html`).
- **`js/`**: Root-level JavaScript directory containing the main application logic (`app.js`) and the public PWA manifest.
- **`src/`**: Shared assets organized by type, including property images (`images/`) and application icons (`icons/`).
- **`scripts/`**: Windows batch utilities (`backup.bat`, `restore.bat`) for manual backup and restoration of project files.
- **`archive/`**: Stores legacy project versions and backups.

## Language & Runtime
**Language**: HTML5, CSS3, JavaScript (Vanilla ES6+)  
**Runtime**: Web Browser (Desktop & Mobile)  
**Build System**: None (Standalone SPA)  
**Package Manager**: None (Zero external dependencies)

## Dependencies
**Main Dependencies**:
- **IndexedDB**: Browser-native database used for offline data storage (properties, bookings, messages).
- **Service Workers**: Used for offline support and PWA features.
- **CSS Custom Properties**: Extensive use of CSS variables for theming and dark mode support.

**Development Dependencies**:
- None (No external build tools or libraries required).

## Build & Installation
The project requires no compilation or build steps.
```bash
# To run the public application locally:
# Open public/pages/index.html or NAPANGA-Pro.html in any modern web browser.

# To run the admin dashboard:
# Open admin/admin.html in a browser.
```

## Maintenance & Operations
**Backup & Restore**:
The project includes Windows-specific batch scripts for maintaining file integrity:
```bash
# Create a full backup (includes assets)
scripts\backup.bat --full

# Create a quick backup (code only)
scripts\backup.bat --quick

# Restore from a backup directory
scripts\restore.bat [backup_folder]
```

## Testing
**Framework**: Manual Testing  
**Test Location**: Local browser environment  
**Naming Convention**: N/A  
**Configuration**: N/A

**Run Command**:
The project relies on manual verification. As per documentation:
1. Open `NAPANGA-Pro.html` in a browser.
2. Test responsiveness across different breakpoints (320px to 1280px+).
3. Verify PWA installation features on mobile devices (iOS/Android).
4. Check offline functionality by simulating offline mode in browser dev tools.
