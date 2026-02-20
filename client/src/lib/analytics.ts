/**
 * Google Analytics 4 Integration
 * 
 * This module provides GA4 tracking functionality for user behavior and conversions.
 * Set the GA4_MEASUREMENT_ID environment variable to enable tracking.
 */

// Get GA4 Measurement ID from environment variable
const GA4_MEASUREMENT_ID = import.meta.env.VITE_GA4_MEASUREMENT_ID;

/**
 * Initialize Google Analytics 4
 * Call this once when the app loads
 */
export function initGA4() {
  if (!GA4_MEASUREMENT_ID) {
    console.warn('[Analytics] GA4 Measurement ID not configured. Set VITE_GA4_MEASUREMENT_ID environment variable.');
    return;
  }

  // Load gtag.js script
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA4_MEASUREMENT_ID}`;
  document.head.appendChild(script);

  // Initialize dataLayer and gtag
  window.dataLayer = window.dataLayer || [];
  function gtag(...args: any[]) {
    window.dataLayer.push(arguments);
  }
  window.gtag = gtag;

  gtag('js', new Date());
  gtag('config', GA4_MEASUREMENT_ID, {
    send_page_view: true,
  });

  console.log('[Analytics] GA4 initialized with ID:', GA4_MEASUREMENT_ID);
}

/**
 * Track a custom event
 * @param eventName - Name of the event (e.g., 'signup', 'purchase', 'resume_upload')
 * @param eventParams - Additional parameters for the event
 */
export function trackEvent(eventName: string, eventParams?: Record<string, any>) {
  if (!window.gtag) {
    console.warn('[Analytics] GA4 not initialized. Event not tracked:', eventName);
    return;
  }

  window.gtag('event', eventName, eventParams);
  console.log('[Analytics] Event tracked:', eventName, eventParams);
}

/**
 * Track page view
 * @param pagePath - Path of the page (e.g., '/pricing', '/blog/post-slug')
 * @param pageTitle - Title of the page
 */
export function trackPageView(pagePath: string, pageTitle?: string) {
  if (!window.gtag) {
    console.warn('[Analytics] GA4 not initialized. Page view not tracked:', pagePath);
    return;
  }

  window.gtag('event', 'page_view', {
    page_path: pagePath,
    page_title: pageTitle,
  });
  console.log('[Analytics] Page view tracked:', pagePath);
}

/**
 * Track conversion (e.g., purchase, signup)
 * @param conversionName - Name of the conversion (e.g., 'purchase', 'signup')
 * @param value - Monetary value of the conversion
 * @param currency - Currency code (default: 'USD')
 */
export function trackConversion(conversionName: string, value?: number, currency: string = 'USD') {
  if (!window.gtag) {
    console.warn('[Analytics] GA4 not initialized. Conversion not tracked:', conversionName);
    return;
  }

  const params: Record<string, any> = {};
  if (value !== undefined) {
    params.value = value;
    params.currency = currency;
  }

  window.gtag('event', conversionName, params);
  console.log('[Analytics] Conversion tracked:', conversionName, params);
}

/**
 * Track user signup
 * @param method - Signup method (e.g., 'google', 'email')
 */
export function trackSignup(method: string) {
  trackEvent('sign_up', { method });
}

/**
 * Track user login
 * @param method - Login method (e.g., 'google', 'email')
 */
export function trackLogin(method: string) {
  trackEvent('login', { method });
}

/**
 * Track purchase/payment
 * @param transactionId - Unique transaction ID
 * @param value - Purchase amount
 * @param currency - Currency code
 * @param items - Array of purchased items
 */
export function trackPurchase(
  transactionId: string,
  value: number,
  currency: string = 'USD',
  items?: Array<{ item_id: string; item_name: string; price: number; quantity: number }>
) {
  trackEvent('purchase', {
    transaction_id: transactionId,
    value,
    currency,
    items,
  });
}

/**
 * Track resume upload
 * @param resumeType - Type of resume (e.g., 'pdf', 'docx')
 */
export function trackResumeUpload(resumeType: string) {
  trackEvent('resume_upload', { resume_type: resumeType });
}

/**
 * Track AI analysis request
 * @param analysisType - Type of analysis (e.g., 'resume_analysis', 'career_path')
 */
export function trackAIAnalysis(analysisType: string) {
  trackEvent('ai_analysis', { analysis_type: analysisType });
}

// TypeScript declarations for gtag
declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
  }
}
