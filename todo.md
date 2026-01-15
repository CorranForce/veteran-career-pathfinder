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
