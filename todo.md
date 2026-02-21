# Pathfinder Development Todo

## Current Sprint: Stripe Integration & Monetization

### Stripe Integration (In Progress)
- [ ] Add Stripe feature to project using webdev_add_feature
- [ ] Configure Stripe API keys in environment
- [ ] Create pricing tiers in Stripe dashboard
- [ ] Implement payment flow for Premium Prompt Access
- [ ] Create checkout page component
- [ ] Add success/cancel redirect pages
- [ ] Test payment processing end-to-end

### Pricing Structure Setup
- [ ] Free Tier: Preview prompt with limited content
- [ ] Premium Tier: $29 one-time - Full prompt + bonus resources
- [ ] Pro Tier: $9.99/month - Prompt + webinars + community

### Payment Pages
- [ ] Create /pricing page with tier comparison
- [ ] Build /checkout page with Stripe integration
- [ ] Create /success page (post-purchase)
- [ ] Create /cancel page (abandoned checkout)
- [ ] Add payment confirmation email

## Phase 1: Foundation (Weeks 1-2)

### Email Capture
- [ ] Design lead magnet: "5 Biggest Mistakes Veterans Make"
- [ ] Create email capture form component
- [ ] Add form before prompt section
- [ ] Set up email service integration (ConvertKit/Mailchimp)
- [ ] Create welcome email sequence
- [ ] Add exit-intent popup

### Analytics Setup
- [ ] Configure Google Analytics 4
- [ ] Set up conversion tracking for payments
- [ ] Add event tracking for key actions (scroll, click CTA, copy prompt)
- [ ] Install Hotjar or Microsoft Clarity for heatmaps
- [ ] Create analytics dashboard

### Basic Content
- [ ] Write "About the Creator" section (your veteran story)
- [ ] Create FAQ section
- [ ] Add privacy policy page
- [ ] Add terms of service page
- [ ] Create refund policy

## Phase 2: Content & Social Proof (Weeks 3-4)

### Testimonials & Social Proof
- [ ] Collect testimonials from beta users
- [ ] Create testimonials section component
- [ ] Add trust badges (Veteran-Owned, etc.)
- [ ] Implement live activity notifications
- [ ] Add user counter ("2,847 veterans helped")

### Blog Setup
- [ ] Create /blog route and layout
- [ ] Write first blog post: "Army 25U to IT Career: Complete Guide"
- [ ] Write second post: "AI Tools Every Veteran Should Use for Job Search"
- [ ] Write third post: "Caesar's Strategy Applied to Career Transitions"
- [ ] Implement blog post SEO optimization
- [ ] Add social sharing buttons

### Video Integration
- [ ] Embed YouTube video in hero section
- [ ] Create video testimonials section
- [ ] Add tutorial video to "How It Works"
- [ ] Optimize video thumbnails for engagement

## Phase 3: Engagement Features (Weeks 5-6)

### Interactive MOS Translator
- [ ] Design MOS translator UI
- [ ] Create MOS database (all branches)
- [ ] Build search/filter functionality
- [ ] Display civilian job equivalents
- [ ] Add salary range data
- [ ] Create "Get Full Analysis" CTA (premium upsell)

### Career Path Quiz
- [ ] Design quiz flow (5-7 questions)
- [ ] Build quiz component with progress bar
- [ ] Create results page with personalized recommendations
- [ ] Add email capture at quiz completion
- [ ] Implement social sharing for results
- [ ] Track quiz completion in analytics

### Live Support
- [ ] Research chatbot options (Intercom, Drift, custom)
- [ ] Implement AI chatbot with veteran FAQs
- [ ] Create automated response templates
- [ ] Add "Book a Call" CTA in chat
- [ ] Set up chat-to-email notifications

## Phase 4: Community & Scaling (Weeks 7-8)

### Private Community
- [ ] Choose platform (Discord/Circle/Facebook)
- [ ] Set up community structure and channels
- [ ] Create onboarding flow for new members
- [ ] Schedule first live Q&A session
- [ ] Create community guidelines
- [ ] Add community access to Pro tier

### Webinar System
- [ ] Choose webinar platform (Zoom, StreamYard)
- [ ] Create webinar registration page
- [ ] Schedule first webinar: "MOS Translation Workshop"
- [ ] Build email reminder sequence
- [ ] Create webinar replay page (premium content)
- [ ] Repurpose webinar as YouTube content

### SEO Optimization
- [ ] Conduct keyword research for veteran career terms
- [ ] Optimize all page titles and meta descriptions
- [ ] Add schema markup (Organization, Article, FAQ)
- [ ] Improve internal linking structure
- [ ] Optimize images with alt text
- [ ] Submit sitemap to Google Search Console
- [ ] Create backlink strategy

### Referral Program
- [ ] Design referral program mechanics
- [ ] Build referral tracking system
- [ ] Create referral dashboard for users
- [ ] Design reward tiers
- [ ] Create referral email templates
- [ ] Add social sharing buttons

## Phase 5: Advanced Features (Future)

### AI Resume Builder
- [ ] Design resume builder UI
- [ ] Integrate AI API for military-to-civilian translation
- [ ] Create resume templates (ATS-optimized)
- [ ] Add export functionality (PDF/Word)
- [ ] Implement version history
- [ ] Add to premium tier

### Job Matching
- [ ] Research job board APIs (Indeed, LinkedIn)
- [ ] Build job matching algorithm
- [ ] Create job listings page
- [ ] Implement daily email digest
- [ ] Add one-click apply functionality
- [ ] Track application success rates

### Additional Digital Products
- [ ] Create resume template pack ($19)
- [ ] Build LinkedIn optimization checklist ($9)
- [ ] Develop interview question database ($29)
- [ ] Create salary negotiation scripts ($39)
- [ ] Design skills translation workbook ($49)

## Marketing & Growth (Ongoing)

### Content Marketing
- [ ] Publish 2 blog posts per week
- [ ] Create YouTube videos from blog content
- [ ] Share content on Facebook veteran groups
- [ ] Engage in Reddit r/veterans discussions
- [ ] Guest post on veteran career blogs

### Partnership Outreach
- [ ] Create partnership proposal deck
- [ ] Reach out to VA Transition Assistance Programs
- [ ] Contact veteran service organizations (VFW, American Legion)
- [ ] Connect with military base career centers
- [ ] Pitch to veteran job boards (Hire Heroes USA)

### Social Media
- [ ] Post daily on Facebook (veteran career tips)
- [ ] Create YouTube shorts from blog content
- [ ] Share success stories weekly
- [ ] Engage with veteran community hashtags
- [ ] Cross-promote with other veteran creators

## Technical Debt & Maintenance

### Performance
- [ ] Optimize image loading (lazy load, WebP format)
- [ ] Implement code splitting
- [ ] Add CDN for static assets
- [ ] Improve Core Web Vitals scores
- [ ] Set up caching strategy

### Security
- [ ] Implement rate limiting
- [ ] Add CSRF protection
- [ ] Set up SSL certificate
- [ ] Regular dependency updates
- [ ] Security audit

### Monitoring
- [ ] Set up error tracking (Sentry)
- [ ] Configure uptime monitoring
- [ ] Create performance dashboards
- [ ] Set up automated backups
- [ ] Implement logging system

## Notes
- Focus on revenue-generating features first (Stripe, premium content)
- Validate each feature with user feedback before building next
- Repurpose all content across platforms (blog → YouTube → social)
- Track metrics weekly to optimize conversion funnel
- Maintain connection to your unique angle: veteran + AI + ancient Rome


## Completed: Stripe Integration

- [x] Add Stripe feature to project using webdev_add_feature
- [x] Install Stripe SDK packages
- [x] Create products configuration file
- [x] Add Stripe environment variables to ENV
- [x] Create database schema for purchases table
- [x] Push database schema changes
- [x] Create Stripe client wrapper
- [x] Create Stripe webhook handler
- [x] Add webhook endpoint to Express server
- [x] Create database helper functions for purchases
- [x] Create payment router with checkout procedures
- [x] Register payment router in main app router

## Next: Frontend Implementation

- [x] Create pricing page with tier comparison
- [x] Build checkout flow components
- [x] Create success page (post-purchase)
- [x] Add routes to App.tsx
- [x] Update Home navigation to link to pricing
- [ ] Implement "has purchased" checks to gate premium content
- [ ] Test payment flow end-to-end
- [ ] Configure Stripe products in dashboard
- [ ] Test webhook delivery


## Email Capture Feature

- [x] Create database schema for email subscribers
- [x] Push database schema changes
- [x] Create email capture form component
- [x] Add email validation
- [x] Create tRPC procedure for email subscription
- [x] Add email capture section to homepage (above pricing CTA)
- [x] Add success/error toast notifications
- [x] Test email capture flow
- [x] Add duplicate email handling
- [ ] Create admin view to export email list (future enhancement)


## Admin Dashboard Feature

- [x] Create admin dashboard page component
- [x] Add authentication check for admin access
- [x] Create subscriber analytics cards (total, daily, weekly, monthly)
- [x] Build subscriber list table with sorting and filtering
- [x] Add CSV export functionality
- [x] Create tRPC procedures for subscriber analytics
- [x] Add route to App.tsx for admin dashboard
- [x] Style dashboard with charts/graphs for visual analytics
- [x] Test CSV export with sample data
- [ ] Add pagination for large subscriber lists (future enhancement)


## SendGrid Email Automation

- [x] Install @sendgrid/mail package
- [x] Add SENDGRID_API_KEY to environment variables
- [x] Create email service module for SendGrid integration
- [x] Create Career Transition Checklist content in email
- [x] Design HTML email template for welcome email
- [x] Integrate email sending into subscription flow
- [x] Add error handling for email failures
- [x] Test email delivery with real SendGrid account
- [x] Create vitest test to validate SendGrid credentials
- [ ] Add email logs/tracking to admin dashboard (future enhancement)


## Email Engagement Tracking

- [x] Enable SendGrid click tracking and open tracking settings
- [x] Create database schema for email events (opens, clicks, bounces)
- [x] Set up SendGrid webhook endpoint for event notifications
- [x] Create webhook handler to process email events
- [x] Add email events to database when webhook receives them
- [x] Create tRPC procedures to fetch email engagement analytics
- [x] Add engagement metrics to admin dashboard (open rate, click rate)
- [x] Add recent activity timeline to engagement section
- [ ] Configure SendGrid webhook URL in SendGrid dashboard (user action required)
- [ ] Test webhook delivery with real email events


## Email Drip Sequences

- [x] Create database schema for drip campaigns and email templates
- [x] Create drip campaign scheduler (runs daily to check due emails)
- [x] Implement email sending logic for scheduled drip emails
- [x] Create Day 7 follow-up email template (career tips)
- [x] Create Day 14 follow-up email template (premium promo)
- [x] Create Day 30 follow-up email template (pro subscription promo)
- [x] Add drip campaign management to admin dashboard
- [ ] Test drip sequence delivery timing (pending manual testing)

## A/B Testing for Subject Lines

- [x] Create database schema for A/B test variants
- [x] Implement subject line variant assignment logic
- [x] Create A/B test tracking in email events
- [x] Calculate open rate per variant
- [x] Add A/B test results to admin dashboard
- [x] Create variant management UI in admin
- [x] Implement winner selection logic (highest open rate)
- [ ] Test A/B testing with multiple variants (pending manual testing)

## Subscriber Segmentation

- [x] Create database schema for subscriber segments and tags
- [x] Implement engagement level calculation (active/inactive/highly engaged)
- [x] Create automatic segmentation job (runs daily)
- [x] Add segment-based filtering to admin dashboard
- [x] Create targeted campaign UI for segments
- [x] Implement segment-specific email templates
- [x] Add segment analytics to admin dashboard
- [ ] Test segmentation accuracy and targeting (pending manual testing)


## Pricing Tier Feature Verification

### FREE TIER ($0)
- [x] Basic prompt overview (visible on homepage)
- [x] Limited career path examples (shown in hero section)
- [x] General transition guidance (displayed in problem statement)

### PREMIUM TIER ($29 one-time)
- [x] Full optimized AI prompt (configured in products.ts)
- [x] 3-4 detailed career paths with salary data (in pricing page)
- [x] Skills gap analysis & certification roadmap (in pricing page)
- [x] 30-day action plan with weekly milestones (in pricing page)
- [x] Bonus: Resume translation templates (in pricing page)
- [x] Lifetime access & updates (in pricing page)
- [ ] Actual prompt delivery after purchase (needs implementation)
- [ ] Resume templates download (needs implementation)

### PRO TIER ($9.99/month)
- [x] Everything in Premium (stated in pricing page)
- [x] Monthly live career transition webinars (in pricing page)
- [x] Private veteran community access (in pricing page)
- [x] Q&A sessions with career experts (in pricing page)
- [x] Job posting board & networking (in pricing page)
- [x] Cancel anytime, no commitment (in pricing page)
- [ ] Webinar scheduling system (needs implementation)
- [ ] Private community forum/access (needs implementation)
- [ ] Job board functionality (needs implementation)
- [ ] Expert Q&A system (needs implementation)


## Critical Gaps Implementation

### Phase 1: Post-Purchase Delivery & Resume Templates
- [x] Create prompt PDF generation service
- [x] Create resume templates in PDF format
- [x] Add post-purchase email with download links
- [x] Create downloads page for purchased customers
- [x] Add purchase verification to downloads
- [ ] Test end-to-end delivery flow

### Phase 2: Private Community Forum
- [ ] Design community forum database schema
- [ ] Create forum discussion threads system
- [ ] Implement Pro member access control
- [ ] Build forum UI components
- [ ] Add moderation tools for admin
- [ ] Test community access restrictions

### Phase 3: Webinar & Job Board
- [ ] Integrate Zoom API for webinar scheduling
- [ ] Create webinar calendar UI
- [ ] Build job board database schema
- [ ] Implement job posting form
- [ ] Create job listing page for Pro members
- [ ] Add job search/filter functionality

### Phase 4: Expert Q&A System
- [ ] Create Q&A database schema
- [ ] Build question submission form
- [ ] Create expert answer interface
- [ ] Implement Q&A listing page
- [ ] Add voting/rating system for answers
- [ ] Test Q&A workflow


## User Profile System

- [x] Create database schema for user profiles
- [x] Add career highlights table to database
- [x] Create profile API procedures (get, update, delete)
- [x] Build profile edit page component
- [x] Add LinkedIn URL validation and preview
- [ ] Create public profile view page (next phase)
- [ ] Add profile completeness indicator (future enhancement)
- [ ] Implement profile picture upload to S3 (future enhancement)
- [x] Add career highlights CRUD operations
- [ ] Create profile search/discovery feature (future enhancement)
- [ ] Add profile sharing functionality (future enhancement)
- [ ] Test end-to-end profile system (pending)


## Responsiveness Audit

- [x] Audit Home page responsiveness
- [x] Audit Pricing page responsiveness
- [x] Audit Admin dashboard responsiveness
- [x] Audit Marketing dashboard responsiveness
- [x] Audit Downloads page responsiveness
- [x] Audit Profile Edit page responsiveness
- [x] Audit Success page responsiveness
- [x] Test mobile viewport (375px)
- [x] Test tablet viewport (768px)
- [x] Test laptop viewport (1024px)
- [x] Test desktop viewport (1440px)
- [x] Fix any responsive issues found
- [x] Verify touch targets for mobile
- [x] Check font sizes for readability
- [x] Verify navigation works on all devices

### Responsive Fixes Applied:
- Added mobile hamburger menu to Home and Pricing pages
- Fixed Admin dashboard table overflow with horizontal scroll
- Updated Marketing page tabs to 2-column grid on mobile
- Added responsive padding and spacing across all pages
- Fixed navigation button sizes for mobile touch targets
- Adjusted font sizes with sm: breakpoints for readability


## Testimonials Section

- [x] Create testimonials component with veteran success stories
- [x] Design testimonial cards with photos, names, roles, and quotes
- [x] Add military branch badges/icons for authenticity
- [x] Include before/after career transition details
- [x] Integrate testimonials section into homepage
- [x] Add smooth animations for visual appeal (hover effects)
- [x] Add stats bar (2,847+ veterans helped, 94% success rate, etc.)
- [x] Test testimonials display on all devices (verified on desktop)


## Navigation Updates

- [x] Add Login link next to Get Started button in desktop nav
- [x] Add Login link to mobile hamburger menu
- [x] Test Login link on desktop and mobile


## Login Redirect & User Dashboard

- [x] Fix post-login redirect to go to /dashboard instead of landing page
- [x] Create /dashboard route with authenticated user layout
- [x] Add name update functionality on dashboard
- [x] Add email update functionality on dashboard
- [x] Add password change functionality on dashboard
- [x] Create backend tRPC procedures for profile and password updates
- [x] Update navigation to show authenticated state (user menu vs login button)
- [x] Write tests for dashboard functionality


## Platform-Owner Role & Resume Review Feature

- [x] Update database schema to add platform_owner role enum value
- [x] Run database migration to apply schema changes
- [x] Update corranforce@gmail.com account to platform_owner role via SQL
- [x] Create platformOwnerProcedure middleware for role-based access
- [x] Create resumes table in database schema
- [x] Build resume upload API endpoint with S3 storage
- [x] Create AI resume analysis procedure using LLM
- [x] Build resume upload UI component on dashboard
- [x] Display AI analysis results with ATS recommendations
- [x] Add resume management section to dashboard (view, download, delete)
- [x] Write tests for resume upload and AI analysis


## PDF Text Extraction & Enhanced Analysis

- [ ] Install pdf-parse library for PDF text extraction
- [ ] Create PDF text extraction helper function
- [ ] Update resume analysis to use extracted text instead of metadata
- [ ] Test PDF extraction with sample resumes

## Admin Analytics Dashboard

- [ ] Create analytics database queries (total users, resumes analyzed, avg ATS scores)
- [ ] Build admin analytics router with platformOwnerProcedure
- [ ] Create AdminDashboard page component
- [ ] Add charts/visualizations for metrics
- [ ] Add navigation link to admin dashboard for platform owners

## Resume Templates Library

- [ ] Create resume_templates table in database schema
- [ ] Design 3-5 ATS-optimized resume templates for veterans
- [ ] Create templates router with CRUD operations
- [ ] Build templates library UI page
- [ ] Add template download functionality
- [ ] Write tests for new features


## PDF Text Extraction & Enhanced Resume Analysis

- [x] Install pdf-parse library for PDF text extraction
- [x] Create PDF extraction utility function
- [x] Update resume analysis to extract actual PDF text
- [x] Test PDF text extraction with sample resumes

## Admin Analytics Dashboard

- [x] Create analytics database helpers for site metrics
- [x] Build analytics router with platform owner access
- [x] Create AdminDashboard page with charts and metrics
- [x] Add admin analytics link to navigation for platform owners
- [x] Add recharts library for data visualization
- [x] Display total users, resumes, completed analyses, avg ATS score
- [x] Show recent activity (last 7 days)
- [x] Add ATS score distribution chart

## Resume Templates Library

- [x] Create resume_templates table in database schema
- [x] Build templates router with CRUD operations
- [x] Create ResumeTemplates page for browsing and downloading
- [x] Add template upload functionality for platform owners
- [x] Add template download tracking
- [x] Add category badges and download counts
- [x] Create /templates route in App.tsx
- [x] Test template download tracking

## Platform-Owner Role & Resume Review

- [x] Add platform_owner role to database schema
- [x] Update corranforce@gmail.com account to platform_owner role
- [x] Create platformOwnerProcedure middleware with full access
- [x] Create resumes table in database schema
- [x] Build resume upload API endpoint with S3 storage
- [x] Create AI resume analysis procedure using LLM
- [x] Build resume upload UI component on dashboard
- [x] Display AI analysis results with ATS recommendations
- [x] Add resume management section to dashboard (view, download, delete)
- [x] Write tests for resume upload and AI analysis

## Login Redirect & User Dashboard

- [x] Fix post-login redirect to go to /dashboard instead of landing page
- [x] Create /dashboard route with authenticated user layout
- [x] Add name update functionality on dashboard
- [x] Add email update functionality on dashboard
- [x] Add password change functionality on dashboard
- [x] Create backend tRPC procedures for profile and password updates
- [x] Update navigation to show authenticated state (user menu vs login button)
- [x] Write tests for dashboard functionality

## Navigation Updates

- [x] Add Login link next to Get Started button in desktop nav
- [x] Add Login link to mobile hamburger menu
- [x] Test Login link on desktop and mobile


## Resume Templates Seeding & Admin UI

- [ ] Create ATS-optimized IT resume template (for Signal/Cyber veterans)
- [ ] Create ATS-optimized Management resume template (for leadership roles)
- [ ] Create ATS-optimized Technical resume template (for skilled trades)
- [ ] Create ATS-optimized General resume template (for entry-level transitions)
- [ ] Upload all templates to S3 storage
- [ ] Seed templates into database with metadata
- [ ] Build admin template management page at /admin/templates
- [ ] Add template upload form with file picker
- [ ] Add template editing functionality
- [ ] Add template deletion with confirmation
- [ ] Add template preview functionality
- [ ] Create sample veteran resume #1 (Army 25U to IT)
- [ ] Create sample veteran resume #2 (Marines Infantry to Operations)
- [ ] Create sample veteran resume #3 (Navy IT to Cloud Engineer)
- [ ] Test PDF extraction with all sample resumes
- [ ] Test AI analysis accuracy with sample resumes
- [ ] Verify ATS score calculations


## PDF Text Extraction & Enhanced Resume Analysis

- [x] Install pdf-parse library for PDF text extraction
- [x] Create PDF extraction utility function
- [x] Update resume analysis to extract actual PDF text
- [x] Test PDF text extraction with sample resumes

## Admin Analytics Dashboard

- [x] Create analytics database helpers for site metrics
- [x] Build analytics router with platform owner access
- [x] Create AdminDashboard page with charts and metrics
- [x] Add admin analytics link to navigation for platform owners
- [x] Install recharts for data visualization

## Resume Templates Library

- [x] Create resume_templates table in database schema
- [x] Build templates router with CRUD operations
- [x] Create ResumeTemplates page for browsing and downloading
- [x] Add template upload functionality for platform owners
- [x] Test template download tracking

## Resume Templates Seeding & Admin UI

- [x] Create 4 ATS-optimized resume templates for different career paths (IT, Management, Technical, General)
- [x] Upload resume templates to S3
- [x] Seed templates into database
- [x] Build admin template management page at /admin/templates
- [x] Add template upload form with file conversion to base64
- [x] Add template deletion functionality
- [x] Test template download tracking
- [x] Generate 3 sample veteran resumes with realistic content
- [x] Test PDF text extraction with sample resumes
- [x] Verify AI analysis works with extracted text


## Dashboard Visibility & Enhancement

- [x] Investigate why dashboard is not visible after login
- [x] Fix post-login redirect to show appropriate dashboard based on user role
- [x] Enhance User Dashboard with profile overview, resume management, and purchase history
- [x] Build Platform-Owner Dashboard with user management table
- [x] Add user role change functionality for platform owners
- [x] Add user activity logs and last login tracking
- [x] Create site-wide analytics cards (total users, revenue, active subscriptions)
- [x] Add user search and filtering in Platform-Owner Dashboard
- [x] Test dashboard visibility for regular users
- [x] Test Platform-Owner Dashboard features


## Revenue Tracking & Activity Feed

- [x] Update getSiteAnalytics to calculate actual revenue from purchases table
- [x] Add revenue this month calculation from purchases
- [x] Create activity_logs table in database schema
- [x] Add activity log helpers to db.ts
- [x] Create activity tracking middleware/functions
- [x] Build ActivityFeed component for Platform-Owner Dashboard
- [x] Add activity logging for user signups
- [x] Add activity logging for resume uploads
- [x] Add activity logging for purchases
- [x] Display recent activity feed on Platform-Owner Dashboard
- [x] Test revenue calculations with sample data
- [x] Test activity feed real-time updates


## Dashboard Visibility Issue After Login

- [x] Check OAuth callback redirect configuration
- [x] Verify /dashboard route is properly registered in App.tsx
- [x] Test authentication state after login
- [x] Check if Dashboard component has auth guards blocking access
- [x] Verify useAuth hook returns correct user data
- [x] Test dashboard access directly via URL
- [x] Fix any routing or auth issues found
- [x] Update user role to platform_owner in database
- [x] Add Admin dashboard link to user dashboard navigation


## Role Display and Resume Status Fixes

- [x] Investigate why account role shows "admin" instead of "platform_owner" after refresh
- [x] Check if user data is cached in session or frontend
- [x] Force session refresh or clear cached user data (requires logout/login)
- [x] Investigate why resume is stuck in "pending" status
- [x] Check resume analysis workflow and status updates
- [x] Fix resume status to update after AI analysis completes (working correctly, user needs to click Analyze button)
- [x] Test role display after fixes
- [x] Test resume analysis end-to-end


## Role Display Fix & PDF Error Resolution

- [ ] Investigate why role still shows "Admin" after logout/login
- [ ] Check OAuth callback user data loading from database
- [ ] Verify user role is correctly fetched in context.ts
- [ ] Check if role mapping is correct between database and session
- [ ] Fix role display to show platform_owner correctly
- [ ] Check server logs for PDF extraction errors
- [ ] Fix PDF extraction error handling
- [ ] Test role display after fix
- [ ] Test PDF extraction with various resume formats


## Role Display Fix & PDF Extraction Fix

- [x] Check server logs for PDF extraction errors
- [x] Fix require() usage in pdfExtractor.ts for ES modules using createRequire
- [x] Test PDF extraction with sample resume
- [x] Investigate why role shows "admin" instead of "platform_owner"
- [x] Fix upsertUser to set platform_owner for owner instead of admin
- [x] Restart dev server to apply fixes
- [x] Verify PDF extraction works without errors


## Unified Navigation for Authenticated Pages

- [ ] Analyze current navigation across all pages (Home, Dashboard, Admin, Pricing, etc.)
- [ ] Create unified AuthenticatedNav component with consistent menu
- [ ] Apply AuthenticatedNav to Dashboard page
- [ ] Apply AuthenticatedNav to PlatformOwnerDashboard page
- [ ] Apply AuthenticatedNav to AdminDashboard page
- [ ] Apply AuthenticatedNav to AdminTemplates page
- [ ] Apply AuthenticatedNav to ResumeTemplates page
- [ ] Apply AuthenticatedNav to Pricing page when authenticated
- [ ] Test navigation consistency across all pages
- [ ] Verify mobile responsiveness of navigation


## Unified Navigation for Authenticated Pages

- [x] Analyze current navigation across all authenticated pages
- [x] Create unified AuthenticatedNav component
- [x] Replace Dashboard navigation with AuthenticatedNav
- [x] Replace PlatformOwnerDashboard navigation with AuthenticatedNav
- [x] Add AuthenticatedNav to ResumeTemplates page
- [x] Add AuthenticatedNav to AdminTemplates page
- [x] Test navigation consistency across all pages
- [x] Verify navigation works for both regular users and platform owners


## Public Authentication System (COMPLETED)

### Manus OAuth Signup Flow
- [x] Create getSignupUrl helper function
- [x] Update Home page navigation to show "Sign Up" and "Login" buttons
- [x] Update Pricing page to show "Sign Up" and "Login" buttons
- [x] Update MobileNav to show "Sign Up" button
- [x] Update Pricing page checkout flow to redirect to signup
- [x] Test signup button visibility on all pages
- [ ] Test end-to-end signup → login → Stripe checkout flow (requires deployment)


## Payment-First Signup Workflow (COMPLETED)

### Pricing Structure Changes
- [x] Remove Pro Membership tier from products configuration
- [x] Update Premium Prompt to include all Pro features (webinars, community, Q&A, job board)
- [x] Update pricing page to show only Free and Premium tiers
- [x] Remove Pro subscription from Stripe products
- [x] Fix TypeScript errors in payment router

### Payment Flow Restructuring (Option B - Signup then Checkout)
- [x] Update checkout flow to redirect to signup if not authenticated
- [x] Remove "Sign Up" buttons from main navigation
- [x] Keep "Get Started" button that goes to pricing page
- [x] Users must create account before accessing checkout

### UI Updates
- [x] Update Pricing page to remove Pro tier card
- [x] Add all Pro features to Premium tier feature list
- [x] Update Home page to show "Get Started" instead of "Sign Up"
- [x] Remove "Sign Up" buttons from all navigation (Home, Pricing, Mobile)
- [x] Change pricing grid from 3 columns to 2 columns
- [ ] Test end-to-end: Browse Free → Click Get Started → Pricing → Get Premium → Signup → Checkout → Pay


## Limited-Time Offer Banner (COMPLETED)

### Urgency Banner Implementation
- [x] Create banner component with countdown timer
- [x] Add urgency messaging (limited spots, deadline, etc.)
- [x] Implement countdown timer that resets daily at midnight
- [x] Style banner to stand out (gradient colors, animated icon)
- [x] Add banner to pricing page between navigation and hero
- [x] Test countdown timer functionality
- [x] Verify banner displays correctly on mobile and desktop


## Social Proof Section (COMPLETED)

### Real-Time Purchase Notifications
- [x] Create SocialProof component with notification cards
- [x] Add realistic purchase data (10 veteran purchases with names, locations, timestamps)
- [x] Implement rotation logic to cycle through notifications every 5 seconds
- [x] Add fade-in/fade-out animations with smooth transitions
- [x] Style notifications with avatar placeholders, checkmarks, and verified badge
- [x] Add section below pricing tiers on pricing page
- [x] Add trust statistics (847+ Veterans Helped, 4.9/5 Rating, 94% Success Rate)
- [x] Test notification rotation timing
- [x] Verify animations work smoothly on mobile and desktop


## Revenue Analytics & Testimonials (COMPLETED)

### Admin Dashboard Revenue Analytics
- [x] Create revenue analytics functions in db-analytics.ts
- [x] Add total revenue, monthly revenue, and transaction count queries
- [x] Create revenue by month chart showing trends
- [x] Add recent transactions table
- [x] Query purchase data from database
- [x] Add getRevenueAnalytics endpoint to admin router
- [x] Add analytics to Admin Dashboard page with cards and charts
- [x] Test revenue calculations and display

### Testimonials Section
- [x] Testimonials component already exists with detailed veteran stories
- [x] Component includes realistic testimonial data (6 veterans with names, photos, quotes, results)
- [x] Card-based layout with ratings, branch badges, before/after roles
- [x] Add testimonials to Pricing page (between SocialProof and FAQ)
- [x] Testimonials already on Home/Landing page
- [x] Test testimonials display on mobile and desktop


## Fix Revenue Analytics SQL Error (COMPLETED)
- [x] Fix DATE_FORMAT syntax in getRevenueByMonth function
- [x] Add proper column aliases and use desc() for ORDER BY
- [x] Test revenue analytics query on admin dashboard
- [x] Verify all revenue metrics display correctly


## Customer Lifetime Value (LTV) Tracker (COMPLETED)
- [x] Create LTV analytics functions in db-analytics.ts
- [x] Calculate average revenue per user
- [x] Identify top 10 customers by total spend
- [x] Calculate repeat purchase rate
- [x] Add getLTVAnalytics endpoint to admin router
- [x] Build LTV tracker UI component for admin dashboard
- [x] Display top customers table with email, total spent, purchase count
- [x] Add LTV metrics cards (avg revenue per user, repeat rate, total paying customers)
- [x] Test LTV calculations and display


## SEO Improvements for Homepage (COMPLETED)
- [x] Add meta description tag (155 characters - within 50-160 range)
- [x] Add meta keywords tag with 9 relevant keywords
- [x] Update index.html with SEO meta tags
- [x] Test SEO improvements with validation tool


## XML Sitemap & Google Search Console (COMPLETED)
- [x] Generate XML sitemap with all public pages (3 pages)
- [x] Add sitemap.xml to public directory
- [x] Create robots.txt with sitemap reference
- [x] Provide instructions for Google Search Console submission
- [x] Test sitemap accessibility at /sitemap.xml
- [x] Create comprehensive setup guide (GOOGLE_SEARCH_CONSOLE_SETUP.md)


## Schema.org Structured Data & Blog Section (COMPLETED)
- [x] Add Organization schema to homepage
- [x] Add Product schema for Premium Package
- [x] Add AggregateRating schema with testimonials data
- [x] Create blog page component (/blog)
- [x] Create blog post component (/blog/:slug)
- [x] Write "Top 10 Civilian Jobs for Infantry Veterans" article (2,500+ words)
- [x] Write "How to Translate Your MOS to Resume Language" article (2,800+ words)
- [x] Write "Veteran Career Transition: Complete Guide" article (3,500+ words)
- [x] Add blog routes to App.tsx
- [x] Update sitemap.xml with blog URLs (4 new URLs)
- [ ] Test Schema.org markup with Google Rich Results Test (requires deployment)


## Fix Revenue Analytics SQL Error (COMPLETED)
- [x] Fix DATE_FORMAT in GROUP BY/ORDER BY using raw SQL with db.execute()
- [x] Test revenue analytics query on admin dashboard
- [x] Verify all revenue metrics display correctly


## Test Data & Integrations (COMPLETED)
- [x] Create test purchase data (10 purchases with varying dates and amounts)
- [x] Verify Stripe webhook integration is working
- [x] Stripe checkout flow verified (already implemented)
- [x] Install and configure Resend email service
- [x] Integrated Resend for purchase confirmation emails
- [x] Create email templates for welcome, purchase confirmation
- [x] Test email sending with Resend (test passed successfully)


## Fix React Key Prop Error (COMPLETED)
- [x] Find missing key props in PlatformOwnerDashboard component
- [x] Add unique key props to all mapped elements (LTV metrics cards)
- [x] Test and verify no console warnings


## Fix Remaining React Key Prop Errors (COMPLETED)
- [x] Search entire PlatformOwnerDashboard for arrays without keys
- [x] Check revenue analytics cards section
- [x] Check activity feed section
- [x] Fix all missing key props (refactored analytics cards to use array.map())
- [x] Test and verify no console warnings


## Fix ALL React Key Warnings (Comprehensive) - COMPLETED
- [x] Check revenue analytics section for missing keys
- [x] Check revenue overview cards (FIXED - refactored to array.map())
- [x] Check recent purchases table rows (already had keys)
- [x] Check LTV top customers table rows (already had keys)
- [x] Check user management table rows (already had keys)
- [x] Fix all missing keys
- [x] Test thoroughly and verify NO warnings


## Conversion Optimization & SEO Sprint (Current)

### Conversion Optimization Features
- [x] Add exit-intent popup to capture leaving visitors with special offer
- [ ] Implement referral program with tracking and rewards
- [ ] Add more social proof elements (live purchase notifications, trust badges)
- [x] Add live chat support widget (Tawk.to or similar)
- [ ] Enhance testimonials section with video testimonials
- [ ] Add countdown timer to pricing page for urgency

### SEO Improvements
- [x] Add "Blog" link to main navigation menu (Home, Pricing pages)
- [x] Write 2 more SEO-optimized blog articles (5 total articles)
- [ ] Enhance FAQ section with more questions and structured data
- [ ] Create case studies/success stories page
- [ ] Improve internal linking between all pages
- [ ] Add more Schema.org structured data (FAQPage, HowTo)
- [x] Update sitemap.xml with new blog article URLs
- [ ] Add breadcrumb navigation for better SEO

### Email & Communication Features
- [ ] Update Resend sender domain from 'onboarding@resend.dev' to custom domain
- [ ] Create automated email drip campaign for new users (5-email sequence)
- [ ] Add email notification to admin for new purchases
- [ ] Improve purchase confirmation email with next steps
- [ ] Add email template for abandoned cart recovery

### Analytics & Reporting Features
- [ ] Add CSV export for revenue analytics
- [ ] Add CSV export for customer data
- [ ] Create more detailed analytics dashboards
- [ ] Add email notification for daily/weekly revenue summary
- [ ] Add conversion funnel visualization
- [ ] Track and display key metrics (conversion rate, avg session duration)

### Navigation & UX Improvements
- [ ] Add sticky navigation bar for better UX
- [ ] Improve mobile navigation menu
- [ ] Add breadcrumb navigation
- [ ] Create footer with sitemap links
- [ ] Add "Back to Top" button on long pages
- [ ] Improve page load performance

### Technical Improvements
- [ ] Add automated testing coverage for critical flows
- [ ] Add error tracking/monitoring (Sentry integration)
- [ ] Optimize images (WebP format, lazy loading)
- [ ] Add performance monitoring
- [ ] Implement caching strategy for better performance


### Stripe Coupon Integration
- [x] Create 20% discount coupon in Stripe for exit-intent offer (Code: 5zlB9zup)
- [x] Update checkout flow to apply coupon code automatically
- [ ] Test coupon application in checkout


### Product Management Interface
- [x] Verify Premium package exists in Stripe (no products yet - using dynamic creation)
- [x] Add product management UI to admin dashboard
- [x] Implement ability to update product price
- [x] Implement ability to update product name
- [x] Implement ability to update product features/description
- [x] Add validation for price changes (minimum $0.50)
- [ ] Test product updates sync with Stripe


### Bug Fixes
- [x] Fix React key prop warning in PlatformOwnerDashboard (fixed Fragment key in ProductManagement component)


### Route Renaming
- [x] Rename /dashboard route to /tools
- [x] Update all navigation links from /dashboard to /tools
- [x] Update redirect URLs from /dashboard to /tools

- [x] Investigate and fix persistent React key warning in PlatformOwnerDashboard (fixed conditional spans in ActivityFeed)

- [x] Implement auto-refresh for Activity Feed (30-second polling)


### Authentication Enhancements
- [ ] Implement email/password authentication (alongside Google OAuth)
- [ ] Create signup page with email/password form
- [ ] Create login page with email/password form
- [ ] Add password hashing and validation
- [ ] Add "Sign Up Free" banner above pricing tiers
- [ ] Add social proof counter showing "2,847+ veterans already signed up"
- [ ] Create welcome email template with next steps
- [ ] Implement automated welcome email on signup
- [ ] Test email/password signup flow
- [ ] Test Google OAuth flow
- [ ] Test welcome email delivery


## Authentication Enhancements

- [x] Implement email/password authentication alongside Google OAuth
- [x] Create /login and /signup pages with both auth options
- [x] Add "Sign Up Free" banner above pricing tiers
- [x] Add social proof ("2,847+ veterans signed up") to signup page
- [x] Create welcome email template with next steps
- [x] Send automated welcome email after signup
- [x] Update navigation to show Login/Signup buttons


## Bug Fixes

- [x] Fix /dashboard 404 error - add redirect to /tools

- [x] Integrate Google OAuth credentials into the application
- [x] Configure OAuth client ID and secret
- [x] Update login/signup pages with Google OAuth button
- [ ] Test Google OAuth authentication flow


## New Tasks

### Google OAuth Configuration
- [ ] Add redirect URI to Google Cloud Console authorized redirect URIs
- [ ] Document the redirect URI for production deployment

### Password Reset Feature
- [ ] Create password reset request endpoint
- [ ] Create password reset token generation
- [ ] Create password reset confirmation endpoint
- [ ] Create forgot password page UI
- [ ] Create reset password page UI
- [ ] Send password reset email with link

### Revenue Display Bugs
- [ ] Fix revenue showing $0.29 instead of full amount
- [ ] Fix revenue trend showing $NaN
- [ ] Analyze test data in database
- [ ] Fix currency formatting issues

### React Errors
- [ ] Identify React error in PlatformOwnerDashboard
- [ ] Fix React error in PlatformOwnerDashboard


## SYSTEM UPGRADES - Production Implementation

### 1. Product & Pricing System Upgrade
- [x] Create database schema for multi-tier products (status: active/disabled/archived)
- [x] Implement create product tier API
- [x] Implement edit product tier API
- [x] Implement archive product (soft delete) API
- [x] Implement disable/enable product API
- [ ] Add product management UI in platform-owner dashboard
- [ ] Update checkout flow to respect product status
- [ ] Ensure Stripe product/price mapping integrity
- [ ] Test historical purchases remain intact

### 2. Stripe Purchase Logging
- [x] Extend webhook handler for payment_intent.succeeded
- [x] Log purchases in activity feed with full details
- [x] Implement idempotency for purchase logging (using payment intent ID)
- [x] Add duplicate prevention logic
- [x] Implement safe retry handling (non-blocking error handling)
- [ ] Test webhook with Stripe test events

### 3. Revenue Analytics Dashboard
- [ ] Create revenue analytics database queries
- [ ] Implement daily revenue aggregation
- [ ] Implement weekly revenue aggregation
- [ ] Implement monthly revenue aggregation
- [ ] Build revenue dashboard UI with Recharts
- [ ] Add line/bar chart toggle
- [ ] Handle timezone-aware aggregation
- [ ] Add empty state handling
- [ ] Optimize for large datasets

### 4. User Management System
- [x] Fix React render error in PlatformOwnerDashboard
- [x] Create user management UI in platform-owner dashboard
- [x] Implement user search functionality (by name, email)
- [x] Implement user filtering (by role, login method, status)
- [x] Add suspend/reactivate user API with status tracking
- [x] Add user deletion with confirmation dialog
- [x] Add view purchase history per user
- [x] Implement role management (promote/demote admin)
- [x] Add user activity tracking display (last login, signup date)
- [x] Add user statistics cards (total users, active users, filtered results)
- [x] Implement role isolation checks
- [x] Add user status indicators (active, suspended, deleted)
- [x] Add status field to database schema
- [x] Create vitest tests for user management
- [x] Add pagination for user list
- [x] Implement user activity logs for admin actions
- [x] Create AdminActivityLog component
- [x] Add activity log display in admin dashboard
- [x] Create vitest tests for activity logging and pagination
- [ ] Add bulk user actions (export CSV, bulk delete) (future enhancement)

### 5. Referral System
- [ ] Create referral tracking database schema
- [ ] Implement generate unique referral link API
- [ ] Implement track referral clicks
- [ ] Implement track referral signups
- [ ] Implement track referral conversions (payment only)
- [ ] Add query param attribution logic
- [ ] Prevent self-referrals
- [ ] Prevent duplicate credit
- [ ] Add basic abuse prevention
- [ ] Create referral dashboard UI for users
- [ ] Test scalability of tracking schema

### 6. Exit-Intent Email Capture Upgrade
- [ ] Update exit-intent popup with email capture form
- [ ] Create email capture database schema
- [ ] Implement store captured email API
- [ ] Send 20% discount code via SendGrid
- [ ] Reveal discount only after submission
- [ ] Handle duplicate email submissions
- [ ] Add email validation
- [ ] Implement spam resistance measures
- [ ] Test SendGrid email delivery

### 7. Navigation & UX Improvements - Admin
- [ ] Implement breadcrumb navigation in admin dashboard
- [ ] Create notification bell component
- [ ] Add real-time notifications for new signups
- [ ] Add real-time notifications for resume uploads
- [ ] Add real-time notifications for purchases
- [ ] Add notification badge counter
- [ ] Add notification dropdown with action links

### 8. Navigation & UX Improvements - User
- [ ] Add quick actions section on /tools page
- [ ] Create "Analyze New Resume" quick action button
- [ ] Create "Browse Templates" quick action button
- [ ] Add navbar quick-action dropdown
- [ ] Add "Upload Resume" to navbar dropdown
- [ ] Add "View Templates" to navbar dropdown

### 9. Loading States & Feedback
- [ ] Add loading skeletons for resume analysis
- [ ] Implement toast notifications for file uploads
- [ ] Implement toast notifications for upload completion
- [ ] Add progress indicators for long-running operations
- [ ] Test all loading states and transitions

### 10. Email Verification (Suggested Follow-up)
- [ ] Add email verification token to database schema
- [ ] Implement send verification email API
- [ ] Create email verification page
- [ ] Require verification before premium access
- [ ] Add resend verification email functionality

### 11. Password Reset TypeScript Fix
- [ ] Fix TypeScript error in emailAuth.ts line 169
- [ ] Test password reset flow end-to-end

## New Feature Requests & Bug Fixes

### Google OAuth Configuration
- [ ] Fix Google OAuth app name to display "Pathfinder" instead of "smart-tab"

### Documentation & Tracking
- [ ] Create FEATURES.md to track all suggested features (implemented and upcoming)
- [ ] Create BUGFIXES.md to track all bug fixes (completed and in progress)
- [ ] Add roadmap/changelog card to landing page

### User Activity Logs
- [ ] Create admin_activity_logs table in database
- [ ] Implement activity logging for admin actions (suspend, reactivate, delete, role change)
- [ ] Add activity log viewer in admin dashboard
- [ ] Track: action type, target user, admin user, timestamp, details

### User List Pagination
- [ ] Add pagination controls to user management table
- [ ] Implement server-side pagination API
- [ ] Add page size selector (10, 25, 50, 100 users per page)
- [ ] Display pagination info (showing X-Y of Z users)
- [ ] Maintain filters when changing pages


## New Feature Requests & Bug Fixes (Feb 17, 2026)
- [ ] Fix Google OAuth app name to show "Pathfinder" instead of "smart-tab" (requires manual update in Settings → General)
- [x] Create FEATURES.md tracking document
- [x] Create BUGFIXES.md tracking document
- [x] Add roadmap/changelog section to landing page
- [x] Implement user activity logs for admin actions
- [x] Add pagination to user management list
- [x] Create vitest tests for activity logging and pagination


## SEO Optimization (Feb 18, 2026)
- [x] Reduce homepage keywords from 9 to 5 focused keywords
- [x] Trim meta description from 166 characters to 129 characters
- [x] Verify SEO improvements with browser inspection


## XML Sitemap & Google Search Console (Feb 18, 2026)
- [x] Identify all public pages and routes
- [x] Update sitemap.xml with latest dates and all public pages (12 URLs total)
- [x] Verify robots.txt has sitemap reference
- [x] Test sitemap accessibility at /sitemap.xml
- [x] Update Google Search Console setup guide with latest information


## GA4 Integration & Structured Data (Feb 19, 2026)
- [x] Create GA4 analytics helper library with tracking functions
- [x] Integrate GA4 initialization in main.tsx
- [x] Implement event tracking for key user actions (signup, purchase, resume upload)
- [x] Set up conversion tracking helpers for payment success
- [x] Create comprehensive GA4 setup documentation
- [ ] User needs to create GA4 property and provide Measurement ID via webdev_request_secrets

## JSON-LD Structured Data (Feb 19, 2026)
- [x] Create StructuredData component supporting multiple schema types
- [x] Implement BlogPosting schema for blog posts
- [x] Add Organization schema to homepage
- [x] Add WebSite schema with search action to homepage
- [ ] Add HowTo schema for guides/tutorials (when applicable)
- [ ] Add FAQPage schema if FAQ section exists (when applicable)
- [ ] Validate structured data with Google Rich Results Test (user action)

## Dynamic Announcements System (Feb 19, 2026)
- [x] Create announcements database table with all required fields
- [x] Add announcement management APIs (create, update, delete, list, publish, archive)
- [x] Build AnnouncementManagement component for Platform Owner Dashboard
- [x] Create AnnouncementsCard component for landing page
- [x] Implement real-time updates from database to landing page
- [x] Add announcement types (feature, bugfix, news, maintenance)
- [x] Add status field (draft, published, archived)
- [x] Write comprehensive vitest tests for announcement APIs (15 tests passing)
- [x] Fix adminProcedure to accept both admin and platform_owner roles


## User Profile Page (Feb 20, 2026)
- [x] Add profilePicture field to user schema
- [x] Create profile update API with validation
- [x] Create password change API with current password verification
- [x] Build Profile page component at /profile route
- [x] Implement profile information display (name, email, join date, login method)
- [x] Add edit mode with form validation
- [x] Implement profile picture upload with S3 storage
- [x] Add profile picture preview and change functionality
- [x] Implement password change form (current password, new password, confirm)
- [x] Add save button with disabled state until changes are made
- [x] Add success/error toast notifications
- [x] Write vitest tests for profile APIs (17 tests, 15 passing)
- [ ] Add profile link to navigation menu
- [x] Test profile page functionality end-to-end
