# Google OAuth Setup Instructions

## Current Configuration

**Project ID:** smart-tab-480011  
**Client ID:** 964674682868-06epaopujpi15qcakreevu6r2otetaoe.apps.googleusercontent.com  
**Client Secret:** (Stored in environment variables)

## Required Redirect URIs

You must add these redirect URIs to your Google Cloud Console:

### Development
```
https://3000-i8947pyinl7f12jih2swi-3af1bb17.us2.manus.computer/auth/google/callback
```

### Production (After Deployment)
```
https://your-custom-domain.com/auth/google/callback
```

## Setup Steps

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Select project: **smart-tab-480011**
3. Navigate to **APIs & Services** → **Credentials**
4. Click on your OAuth 2.0 Client ID
5. Under **Authorized redirect URIs**, click **+ ADD URI**
6. Paste the development URL above
7. Click **SAVE**

## Testing

After adding the redirect URI:
1. Go to `/login` or `/signup`
2. Click "Continue with Google"
3. You should be redirected to Google's consent screen
4. After approving, you'll be redirected back to `/tools`

## Troubleshooting

**Error: redirect_uri_mismatch**
- Ensure the redirect URI in Google Console exactly matches the one configured in the app
- Check for trailing slashes or http vs https mismatches

**Error: invalid_client**
- Verify GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET are correctly set in environment variables
