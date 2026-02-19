# Google Search Console Setup Guide

## Step 1: Access Google Search Console
1. Go to [Google Search Console](https://search.google.com/search-console/)
2. Sign in with your Google account

## Step 2: Add Your Property
1. Click **"Add Property"** in the top-left
2. Choose **"URL prefix"** option
3. Enter your domain: `https://vetcarepath-tzppwpga.manus.space`
4. Click **"Continue"**

## Step 3: Verify Ownership
Google will provide several verification methods. Choose **HTML file upload**:

1. Download the verification HTML file provided by Google
2. Upload it to your website's public directory (same location as sitemap.xml)
3. Click **"Verify"** in Google Search Console

**Alternative: HTML Tag Method**
1. Copy the meta tag provided by Google
2. Add it to the `<head>` section of `/client/index.html`
3. Deploy your changes
4. Click **"Verify"** in Google Search Console

## Step 4: Submit Your Sitemap
Once verified:
1. In Google Search Console, go to **"Sitemaps"** in the left sidebar
2. Enter `sitemap.xml` in the "Add a new sitemap" field
3. Click **"Submit"**

## Step 5: Monitor Indexing
- Google will start crawling your site within 24-48 hours
- Check the **"Coverage"** report to see indexed pages
- Check the **"Performance"** report to track search impressions and clicks

## Your Sitemap URL
```
https://vetcarepath-tzppwpga.manus.space/sitemap.xml
```

## Your Robots.txt URL
```
https://vetcarepath-tzppwpga.manus.space/robots.txt
```

## Pages Included in Sitemap
- Homepage (/) - Priority: 1.0, Updated: Weekly
- Pricing (/pricing) - Priority: 0.9, Updated: Monthly
- Blog (/blog) - Priority: 0.8, Updated: Weekly
- Dashboard (/dashboard) - Priority: 0.7, Updated: Weekly
- Templates (/templates) - Priority: 0.7, Updated: Monthly
- Blog Posts (5 articles) - Priority: 0.7, Updated: Monthly
  - Top 10 Civilian Jobs for Infantry Veterans
  - How to Translate Your MOS to Resume Language
  - Veteran Career Transition Complete Guide
  - Veteran Resume Mistakes to Avoid
  - Veteran Networking Strategies LinkedIn
- Login (/login) - Priority: 0.3, Updated: Yearly
- Signup (/signup) - Priority: 0.3, Updated: Yearly

**Total URLs in Sitemap**: 12 pages

## Expected Results
- **Sitemap Processing**: 1-7 days
- **Initial Indexing**: 1-4 weeks
- **Search Visibility**: 2-4 weeks for ranking improvements
- **Performance Data**: Available after 2-3 days of indexing
- **Organic Traffic**: Gradual increase over 30-90 days

## Sitemap Last Updated
**February 18, 2026** - All page dates updated to current date

## Troubleshooting
- If verification fails, ensure the HTML file or meta tag is accessible
- If sitemap errors appear, check that the XML is valid at `/sitemap.xml`
- If pages aren't indexed, check "Coverage" report for errors

## Next Steps After Submission
1. Set up **URL inspection** to manually request indexing for important pages
2. Monitor **Search Performance** weekly to track keyword rankings
3. Update sitemap whenever you add new pages to your site
