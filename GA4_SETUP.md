# Google Analytics 4 (GA4) Setup Guide

## Overview

This guide will help you set up Google Analytics 4 to track user behavior, conversions, and measure SEO effectiveness.

## Step 1: Create GA4 Property

1. Go to [Google Analytics](https://analytics.google.com/)
2. Sign in with your Google account
3. Click **"Admin"** (gear icon in the bottom left)
4. In the **"Property"** column, click **"Create Property"**
5. Enter property details:
   - **Property name**: Pathfinder - Veteran Career Transition
   - **Reporting time zone**: Your timezone
   - **Currency**: USD
6. Click **"Next"**
7. Fill in business information:
   - **Industry category**: Education / Career Services
   - **Business size**: Select appropriate size
8. Select business objectives (choose all that apply):
   - Generate leads
   - Examine user behavior
   - Measure customer engagement
9. Click **"Create"**
10. Accept the Terms of Service

## Step 2: Get Your Measurement ID

1. After creating the property, you'll see **"Data Streams"**
2. Click **"Web"**
3. Enter your website URL: `https://vetcarepath-tzppwpga.manus.space`
4. Enter stream name: **"Pathfinder Website"**
5. Click **"Create stream"**
6. Copy the **Measurement ID** (format: `G-XXXXXXXXXX`)

## Step 3: Add Measurement ID to Your Project

Use the `webdev_request_secrets` tool to add the GA4 Measurement ID:

```typescript
await webdev_request_secrets({
  message: "Please provide your Google Analytics 4 Measurement ID to enable analytics tracking.",
  secrets: [{
    key: "VITE_GA4_MEASUREMENT_ID",
    description: "Google Analytics 4 Measurement ID (format: G-XXXXXXXXXX)",
    // value will be provided by user
  }]
});
```

Or manually add it in the Manus Management UI:
1. Go to **Settings → Secrets**
2. Add new secret:
   - Key: `VITE_GA4_MEASUREMENT_ID`
   - Value: Your Measurement ID (e.g., `G-ABC123XYZ`)

## Step 4: Verify Tracking

1. After adding the Measurement ID, restart the dev server
2. Visit your website
3. In Google Analytics, go to **Reports → Realtime**
4. You should see your visit in real-time (may take 30-60 seconds)

## Tracked Events

The following events are automatically tracked:

### Standard Events
- **page_view** - Automatic page view tracking
- **session_start** - When a user starts a session
- **first_visit** - First time a user visits the site

### Custom Events
- **sign_up** - User registration (with method: google/email)
- **login** - User login (with method: google/email)
- **purchase** - Payment completion (with transaction_id, value, currency)
- **resume_upload** - Resume file upload (with resume_type)
- **ai_analysis** - AI analysis request (with analysis_type)

## Conversion Tracking

### Set Up Conversions in GA4

1. In Google Analytics, go to **Admin → Events**
2. Click **"Create event"** or mark existing events as conversions
3. Recommended conversions to track:
   - **purchase** - Payment completion
   - **sign_up** - New user registration
   - **resume_upload** - Resume upload completion

### Mark Events as Conversions

1. Go to **Admin → Conversions**
2. Click **"New conversion event"**
3. Enter event name (e.g., `purchase`, `sign_up`)
4. Click **"Save"**

## Custom Dimensions (Optional)

To track additional user properties:

1. Go to **Admin → Custom definitions**
2. Click **"Create custom dimension"**
3. Add dimensions like:
   - **user_role** - User role (admin/user)
   - **subscription_status** - Active/Inactive
   - **resume_count** - Number of resumes uploaded

## Integration Points

The GA4 tracking is integrated at these points in the application:

### 1. App Initialization
- Location: `client/src/main.tsx`
- Initializes GA4 when the app loads

### 2. Signup Flow
- Location: `client/src/pages/Signup.tsx`
- Tracks `sign_up` event with method (google/email)

### 3. Login Flow
- Location: `client/src/pages/Login.tsx`
- Tracks `login` event with method (google/email)

### 4. Payment Success
- Location: `client/src/pages/Success.tsx`
- Tracks `purchase` event with transaction details

### 5. Resume Upload
- Location: `client/src/pages/Dashboard.tsx`
- Tracks `resume_upload` event when user uploads resume

### 6. AI Analysis
- Location: Resume analysis components
- Tracks `ai_analysis` event when user requests AI analysis

## Analytics Helper Functions

Use these functions throughout the app to track custom events:

```typescript
import { 
  trackEvent, 
  trackPageView, 
  trackConversion,
  trackSignup,
  trackLogin,
  trackPurchase,
  trackResumeUpload,
  trackAIAnalysis 
} from '@/lib/analytics';

// Track custom event
trackEvent('button_click', { button_name: 'Get Started' });

// Track page view
trackPageView('/pricing', 'Pricing Page');

// Track conversion
trackConversion('lead_form_submit', 0, 'USD');

// Track signup
trackSignup('google'); // or 'email'

// Track login
trackLogin('email');

// Track purchase
trackPurchase('txn_123456', 99.00, 'USD', [
  { item_id: 'plan_pro', item_name: 'Pro Plan', price: 99.00, quantity: 1 }
]);

// Track resume upload
trackResumeUpload('pdf');

// Track AI analysis
trackAIAnalysis('resume_analysis');
```

## Reports to Monitor

### 1. Realtime Report
- **Location**: Reports → Realtime
- **Purpose**: See current users and their activity
- **Use**: Verify tracking is working

### 2. Acquisition Report
- **Location**: Reports → Acquisition → Traffic acquisition
- **Purpose**: See where users come from (Google, direct, referral)
- **Use**: Measure SEO effectiveness

### 3. Engagement Report
- **Location**: Reports → Engagement → Events
- **Purpose**: See which events are being triggered
- **Use**: Track user actions and conversions

### 4. Conversion Report
- **Location**: Reports → Monetization → Conversions
- **Purpose**: See conversion rates and values
- **Use**: Measure business goals

### 5. User Report
- **Location**: Reports → User → Demographics
- **Purpose**: See user demographics and interests
- **Use**: Understand your audience

## Privacy & Compliance

### Cookie Consent
- GA4 uses cookies to track users
- Consider adding a cookie consent banner if required by your jurisdiction
- EU users may require GDPR-compliant consent

### IP Anonymization
- GA4 automatically anonymizes IP addresses
- No additional configuration needed

### Data Retention
- Default: 2 months for user-level data
- Can be extended to 14 months in Admin → Data Settings → Data Retention

## Troubleshooting

### No Data Showing in Reports

1. **Check Measurement ID**: Verify `VITE_GA4_MEASUREMENT_ID` is set correctly
2. **Check Browser Console**: Look for GA4 initialization logs
3. **Check Ad Blockers**: Disable ad blockers and try again
4. **Wait for Processing**: Data can take 24-48 hours to appear in standard reports (use Realtime for immediate verification)

### Events Not Tracking

1. **Check gtag Function**: Verify `window.gtag` is defined
2. **Check Event Names**: Ensure event names match GA4 conventions (lowercase, underscores)
3. **Check Browser Console**: Look for analytics tracking logs
4. **Use DebugView**: Enable debug mode in GA4 to see events in real-time

### Enable Debug Mode

Add this to your browser console to enable GA4 debug mode:

```javascript
window.gtag('config', 'G-YOUR-MEASUREMENT-ID', {
  'debug_mode': true
});
```

Then go to **Admin → DebugView** in GA4 to see events in real-time.

## Expected Timeline

- **Real-time data**: Immediate (30-60 seconds)
- **Standard reports**: 24-48 hours
- **Conversion data**: 24-48 hours
- **Search Console integration**: 1-2 weeks

## Next Steps After Setup

1. **Verify Tracking**: Check Realtime report to confirm data is flowing
2. **Set Up Conversions**: Mark important events as conversions
3. **Create Custom Reports**: Build reports for specific business questions
4. **Link Search Console**: Connect GA4 to Google Search Console for SEO data
5. **Set Up Alerts**: Create custom alerts for important metrics
6. **Review Weekly**: Check reports weekly to monitor performance

## Additional Resources

- [GA4 Documentation](https://support.google.com/analytics/answer/9304153)
- [GA4 Events Reference](https://support.google.com/analytics/answer/9267735)
- [GA4 Measurement Protocol](https://developers.google.com/analytics/devguides/collection/protocol/ga4)
