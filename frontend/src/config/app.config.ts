// App Configuration - Update branding here
export const APP_CONFIG = {
  // App Branding
  APP_NAME: "BusSewa",
  APP_SUBTITLE: "Bus Booking Application for MSS 2026",
  
  // Page Title (shown in browser tab)
  PAGE_TITLE: "BusSewa - MSS 2026",
  
  // Organization
  ORGANIZATION: "MSS 2026",
  
  // Version
  VERSION: "v2.0",
  
  // API Configuration - Fixed for production
  API_BASE_URL: process.env.REACT_APP_API_URL || '/api',
  
  // Features
  FEATURES: {
    JOURNEY_BASED_BOOKING: true,
    AGE_BASED_PRICING: true,
    SEAT_ALLOCATION: true,
    EXPORT_DATA: true,
    IMPORT_DATA: false, // Keep simple for now
  },
  
  // Bus Configuration
  BUS_CAPACITY: 42,
  PRIORITY_SEATS: 8, // First 8 seats for seniors
  
  // Colors (for theming)
  COLORS: {
    PRIMARY: '#007bff',
    SUCCESS: '#28a745',
    DANGER: '#dc3545',
    WARNING: '#ffc107',
    INFO: '#17a2b8',
    SECONDARY: '#6c757d',
  }
};

export default APP_CONFIG;