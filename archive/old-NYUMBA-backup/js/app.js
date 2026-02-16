/**
 * NAPANGA - Property Listing Application
 * Main JavaScript Module
 * 
 * Features:
 * - Input sanitization for XSS protection
 * - Safe localStorage wrapper with error handling
 * - Filter modal management
 * - Dark mode toggle with persistence
 * - Interactive UI components
 */

// ============================================
// SECURITY UTILITIES
// ============================================

/**
 * Sanitize user input to prevent XSS attacks
 * @param {string} input - Raw user input
 * @returns {string} - Sanitized input
 */
function sanitizeInput(input) {
  if (typeof input !== 'string') {
    return '';
  }
  const div = document.createElement('div');
  div.textContent = input;
  return div.innerHTML;
}

/**
 * Validate and sanitize numeric input
 * @param {string|number} value - Input value
 * @param {number} min - Minimum allowed value
 * @param {number} max - Maximum allowed value
 * @returns {number|null} - Validated number or null
 */
function validateNumericInput(value, min = 0, max = Number.MAX_SAFE_INTEGER) {
  const num = parseFloat(value);
  if (isNaN(num) || num < min || num > max) {
    return null;
  }
  return num;
}

// ============================================
// SAFE LOCALSTORAGE WRAPPER
// ============================================

const safeLocalStorage = {
  /**
   * Check if localStorage is available
   * @returns {boolean}
   */
  isAvailable: function() {
    try {
      const test = '__storage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch (e) {
      return false;
    }
  },

  /**
   * Safely set an item in localStorage
   * @param {string} key - Storage key
   * @param {*} value - Value to store (will be JSON stringified)
   * @returns {boolean} - Success status
   */
  set: function(key, value) {
    try {
      if (typeof key === 'string' && value !== undefined) {
        localStorage.setItem(key, JSON.stringify(value));
        return true;
      }
    } catch (e) {
      console.warn('localStorage unavailable:', e.message);
    }
    return false;
  },

  /**
   * Safely get an item from localStorage
   * @param {string} key - Storage key
   * @param {*} defaultValue - Default value if key doesn't exist
   * @returns {*} - Parsed value or default
   */
  get: function(key, defaultValue = null) {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (e) {
      console.warn('Failed to read from localStorage:', e.message);
      return defaultValue;
    }
  },

  /**
   * Remove an item from localStorage
   * @param {string} key - Storage key
   * @returns {boolean} - Success status
   */
  remove: function(key) {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (e) {
      return false;
    }
  },

  /**
   * Clear all localStorage
   * @returns {boolean} - Success status
   */
  clear: function() {
    try {
      localStorage.clear();
      return true;
    } catch (e) {
      return false;
    }
  }
};

// ============================================
// THEME MANAGEMENT
// ============================================

const ThemeManager = {
  STORAGE_KEY: 'napanga_darkMode',
  
  /**
   * Initialize theme based on saved preference or system preference
   */
  init: function() {
    const savedTheme = safeLocalStorage.get(this.STORAGE_KEY);
    
    if (savedTheme !== null) {
      // Use saved preference
      if (savedTheme === true) {
        document.body.classList.add('dark-mode');
      }
    } else {
      // Fall back to system preference
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        document.body.classList.add('dark-mode');
      }
    }
    
    // Listen for system theme changes
    if (window.matchMedia) {
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        if (safeLocalStorage.get(this.STORAGE_KEY) === null) {
          document.body.classList.toggle('dark-mode', e.matches);
        }
      });
    }
  },
  
  /**
   * Toggle dark mode
   */
  toggle: function() {
    const isDark = document.body.classList.toggle('dark-mode');
    safeLocalStorage.set(this.STORAGE_KEY, isDark);
    return isDark;
  },
  
  /**
   * Get current theme state
   * @returns {boolean} - True if dark mode is active
   */
  isDark: function() {
    return document.body.classList.contains('dark-mode');
  }
};

// ============================================
// FILTER MODAL MANAGEMENT
// ============================================

const FilterModal = {
  modal: null,
  filterBtn: null,
  closeBtn: null,
  activeFilters: new Set(),
  
  /**
   * Initialize filter modal
   */
  init: function() {
    this.modal = document.getElementById('filter-modal');
    this.filterBtn = document.getElementById('filter-btn');
    this.closeBtn = document.getElementById('close-filter');
    
    if (!this.modal || !this.filterBtn) {
      console.warn('Filter modal elements not found');
      return;
    }
    
    this.bindEvents();
    this.loadSavedFilters();
  },
  
  /**
   * Bind event listeners
   */
  bindEvents: function() {
    // Open modal
    this.filterBtn.addEventListener('click', () => this.open());
    
    // Close modal
    if (this.closeBtn) {
      this.closeBtn.addEventListener('click', () => this.close());
    }
    
    // Close on outside click
    this.modal.addEventListener('click', (e) => {
      if (e.target === this.modal) {
        this.close();
      }
    });
    
    // Close on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.modal.classList.contains('active')) {
        this.close();
      }
    });
    
    // Filter option selection
    document.querySelectorAll('.filter-option').forEach(option => {
      option.addEventListener('click', (e) => this.toggleFilterOption(e.target));
    });
  },
  
  /**
   * Open the filter modal
   */
  open: function() {
    this.modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  },
  
  /**
   * Close the filter modal
   */
  close: function() {
    this.modal.classList.remove('active');
    document.body.style.overflow = '';
  },
  
  /**
   * Toggle a filter option
   * @param {HTMLElement} element - The clicked filter option
   */
  toggleFilterOption: function(element) {
    element.classList.toggle('selected');
    this.updateFilterCount();
  },
  
  /**
   * Update the filter count display
   */
  updateFilterCount: function() {
    const count = document.querySelectorAll('.filter-option.selected').length;
    const countDisplay = document.querySelector('.filter-footer button:last-child');
    if (countDisplay) {
      countDisplay.textContent = `Omba vichujio (${count})`;
    }
  },
  
  /**
   * Load saved filters from localStorage
   */
  loadSavedFilters: function() {
    const savedFilters = safeLocalStorage.get('napanga_filters', []);
    if (Array.isArray(savedFilters)) {
      savedFilters.forEach(filterId => {
        const element = document.querySelector(`[data-filter-id="${filterId}"]`);
        if (element) {
          element.classList.add('selected');
        }
      });
      this.updateFilterCount();
    }
  },
  
  /**
   * Save current filters to localStorage
   */
  saveFilters: function() {
    const selectedFilters = Array.from(document.querySelectorAll('.filter-option.selected'))
      .map(el => el.dataset.filterId)
      .filter(id => id);
    safeLocalStorage.set('napanga_filters', selectedFilters);
  },
  
  /**
   * Clear all filters
   */
  clearFilters: function() {
    document.querySelectorAll('.filter-option.selected').forEach(el => {
      el.classList.remove('selected');
    });
    this.updateFilterCount();
    safeLocalStorage.remove('napanga_filters');
  }
};

// ============================================
// FILTER CHIPS MANAGEMENT
// ============================================

const FilterChips = {
  /**
   * Initialize filter chips
   */
  init: function() {
    document.querySelectorAll('.chip').forEach(chip => {
      chip.addEventListener('click', (e) => this.toggleChip(e.currentTarget));
    });
  },
  
  /**
   * Toggle a chip's active state
   * @param {HTMLElement} chip - The clicked chip
   */
  toggleChip: function(chip) {
    // If this chip is being activated, deactivate others (radio-like behavior)
    if (!chip.classList.contains('active')) {
      document.querySelectorAll('.chip.active').forEach(activeChip => {
        activeChip.classList.remove('active');
      });
    }
    chip.classList.toggle('active');
    
    // Save preference
    const activeChip = document.querySelector('.chip.active');
    if (activeChip) {
      safeLocalStorage.set('napanga_activeChip', activeChip.textContent.trim());
    }
  }
};

// ============================================
// WISHLIST (HEART) MANAGEMENT
// ============================================

const Wishlist = {
  STORAGE_KEY: 'napanga_wishlist',
  items: new Set(),
  
  /**
   * Initialize wishlist
   */
  init: function() {
    // Load saved wishlist items
    const saved = safeLocalStorage.get(this.STORAGE_KEY, []);
    if (Array.isArray(saved)) {
      this.items = new Set(saved);
    }
    
    // Bind heart icon clicks
    document.querySelectorAll('.card-title svg[data-wishlist]').forEach(heart => {
      const propertyId = heart.dataset.propertyId;
      if (propertyId && this.items.has(propertyId)) {
        this.setHeartActive(heart, true);
      }
      
      heart.addEventListener('click', (e) => {
        e.stopPropagation();
        this.toggleItem(propertyId, heart);
      });
    });
  },
  
  /**
   * Toggle a property in the wishlist
   * @param {string} propertyId - Property identifier
   * @param {HTMLElement} heartElement - The heart SVG element
   */
  toggleItem: function(propertyId, heartElement) {
    if (!propertyId) return;
    
    if (this.items.has(propertyId)) {
      this.items.delete(propertyId);
      this.setHeartActive(heartElement, false);
    } else {
      this.items.add(propertyId);
      this.setHeartActive(heartElement, true);
    }
    
    this.save();
  },
  
  /**
   * Set heart icon active state
   * @param {HTMLElement} element - Heart SVG element
   * @param {boolean} active - Active state
   */
  setHeartActive: function(element, active) {
    if (active) {
      element.setAttribute('stroke', '#dc2626');
      element.setAttribute('fill', '#dc2626');
    } else {
      element.setAttribute('stroke', '#64748b');
      element.setAttribute('fill', 'none');
    }
  },
  
  /**
   * Save wishlist to localStorage
   */
  save: function() {
    safeLocalStorage.set(this.STORAGE_KEY, Array.from(this.items));
  }
};

// ============================================
// SEARCH FUNCTIONALITY
// ============================================

const SearchManager = {
  input: null,
  debounceTimer: null,
  
  /**
   * Initialize search
   */
  init: function() {
    this.input = document.querySelector('.search-input-wrapper input');
    if (!this.input) return;
    
    this.input.addEventListener('input', (e) => this.handleInput(e));
    this.input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        this.performSearch(e.target.value);
      }
    });
  },
  
  /**
   * Handle input with debouncing
   * @param {Event} e - Input event
   */
  handleInput: function(e) {
    clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(() => {
      const sanitizedValue = sanitizeInput(e.target.value);
      if (sanitizedValue !== e.target.value) {
        e.target.value = sanitizedValue;
      }
      // Trigger search after 300ms of no typing
      if (sanitizedValue.length >= 2 || sanitizedValue.length === 0) {
        this.performSearch(sanitizedValue);
      }
    }, 300);
  },
  
  /**
   * Perform search action
   * @param {string} query - Search query
   */
  performSearch: function(query) {
    // This would typically make an API call or filter visible results
    console.log('Searching for:', query);
    // Emit custom event for other components to listen to
    document.dispatchEvent(new CustomEvent('napanga:search', { 
      detail: { query: sanitizeInput(query) } 
    }));
  }
};

// ============================================
// SMOOTH SCROLL
// ============================================

const SmoothScroll = {
  /**
   * Initialize smooth scroll for anchor links
   */
  init: function() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = anchor.getAttribute('href');
        if (targetId && targetId !== '#') {
          const target = document.querySelector(targetId);
          if (target) {
            target.scrollIntoView({
              behavior: 'smooth',
              block: 'start'
            });
          }
        }
      });
    });
  }
};

// ============================================
// APPLICATION INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', function() {
  // Initialize all modules
  ThemeManager.init();
  FilterModal.init();
  FilterChips.init();
  Wishlist.init();
  SearchManager.init();
  SmoothScroll.init();
  
  // Dark mode toggle button
  const darkModeBtn = document.getElementById('dark-mode-toggle');
  if (darkModeBtn) {
    darkModeBtn.addEventListener('click', () => ThemeManager.toggle());
  }
  
  // Clear filters button
  const clearFiltersBtn = document.querySelector('.filter-footer button:first-child');
  if (clearFiltersBtn) {
    clearFiltersBtn.addEventListener('click', () => FilterModal.clearFilters());
  }
  
  // Apply filters button
  const applyFiltersBtn = document.querySelector('.filter-footer button:last-child');
  if (applyFiltersBtn) {
    applyFiltersBtn.addEventListener('click', () => {
      FilterModal.saveFilters();
      FilterModal.close();
      // Dispatch event for other components
      document.dispatchEvent(new CustomEvent('napanga:filtersApplied'));
    });
  }
  
  console.log('NAPANGA application initialized successfully');
});

// ============================================
// EXPORT FOR MODULE USAGE (if needed)
// ============================================

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    sanitizeInput,
    validateNumericInput,
    safeLocalStorage,
    ThemeManager,
    FilterModal,
    FilterChips,
    Wishlist,
    SearchManager
  };
}
