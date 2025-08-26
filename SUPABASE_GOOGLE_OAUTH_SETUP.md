# 🔐 Supabase Google OAuth Setup Guide

## Step-by-Step Configuration

### 1. Enable Google Provider in Supabase
1. Open your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project (`itwpcyamstuhiyarrtyz`)
3. Go to **Authentication** → **Providers**
4. Find **Google** in the list
5. Toggle it **ON** (enabled)

### 2. Add Google OAuth Credentials
In the Google provider configuration:

**Client ID**: `your-google-client-id.apps.googleusercontent.com`
**Client Secret**: `your-google-client-secret`

### 3. Configure Redirect URLs
Go to **Authentication** → **URL Configuration**:

**Site URL**: `http://localhost:3000`
**Redirect URLs** (add both):
```
http://localhost:3000/auth/callback
https://localhost:3000/auth/callback
```

### 4. Google Cloud Console Setup
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. **APIs & Services** → **Credentials**
3. **Create Credentials** → **OAuth 2.0 Client ID**
4. **Application type**: Web application
5. **Authorized redirect URIs**:
   ```
   https://itwpcyamstuhiyarrtyz.supabase.co/auth/v1/callback
   ```
   (Replace with your actual Supabase project URL)

### 5. Test Configuration
1. Save all settings
2. Restart your frontend: `npm run dev`
3. Try Google sign-in again

## 🔍 Troubleshooting

**Error: "provider is not enabled"**
- ✅ Enable Google provider in Supabase Authentication → Providers

**Error: "redirect_uri_mismatch"**
- ✅ Add correct redirect URI in Google Cloud Console
- ✅ Use your actual Supabase project URL

**Error: "invalid_client"**
- ✅ Check Client ID and Secret are correct
- ✅ Make sure OAuth consent screen is configured

## ✨ Success Indicators
- Google provider shows as "Enabled" in Supabase
- Green checkmark next to Google in providers list
- No console errors when clicking Google sign-in
- Smooth redirect to Google account selection

---
**Need help?** Check the console for detailed error messages.
