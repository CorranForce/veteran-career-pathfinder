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
