# Google Drive Integration Setup

This extension uses Google Drive API for backup and sync functionality. Follow these steps to configure OAuth authentication.

## Prerequisites

- A Google Cloud Console account
- Chrome Web Store Developer account (for production) OR development mode (for testing)

## Setup Steps

### 1. Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Note your Project ID

### 2. Enable Google Drive API

1. In Google Cloud Console, go to **APIs & Services > Library**
2. Search for "Google Drive API"
3. Click **Enable**

### 3. Create OAuth 2.0 Credentials

1. Go to **APIs & Services > Credentials**
2. Click **Create Credentials > OAuth client ID**
3. Select **Application type: Chrome Extension**
4. Name: "My Rich Note Taker"
5. For **Application ID**:
   - **Development**: Use your extension ID from `chrome://extensions/` (enable Developer Mode)
   - **Production**: Use your Chrome Web Store extension ID
6. Click **Create**
7. Copy the **Client ID** (format: `xxxxx.apps.googleusercontent.com`)

### 4. Configure OAuth Consent Screen

1. Go to **APIs & Services > OAuth consent screen**
2. Select **External** (for testing) or **Internal** (for organization)
3. Fill in required fields:
   - App name: "My Rich Note Taker"
   - User support email: Your email
   - Developer contact: Your email
4. Add scope: `https://www.googleapis.com/auth/drive.appdata`
5. Add test users (for development)
6. Save and continue

### 5. Update manifest.json

Replace the placeholders in `manifest.json`:

```json
{
  "oauth2": {
    "client_id": "YOUR_CLIENT_ID.apps.googleusercontent.com",
    "scopes": [
      "https://www.googleapis.com/auth/drive.appdata"
    ]
  },
  "key": "YOUR_PUBLIC_KEY_HERE"
}
```

#### Get Your Public Key (Development)

1. Load your extension in Chrome (unpacked)
2. Go to `chrome://extensions/`
3. Enable **Developer mode**
4. Find your extension and copy the **ID**
5. The public key is generated automatically when you pack the extension
6. For development, you can leave `"key"` field or remove it

#### For Production (Chrome Web Store)

1. Pack your extension: `chrome://extensions/` > Pack extension
2. Upload to Chrome Web Store
3. The Web Store will provide the Extension ID
4. Use this ID in your OAuth credentials

### 6. Test the Integration

1. Build the extension: `npm run build`
2. Load the extension in Chrome
3. Open the dashboard
4. Click **Settings** in the sidebar
5. Click **Login to Google Drive**
6. Grant permissions
7. Test **Backup Now** button
8. Test **Restore from Backup** button

## Scopes Explained

### `https://www.googleapis.com/auth/drive.appdata`

- **Purpose**: Access application-specific data folder
- **Privacy**: Files are hidden from the user in Google Drive
- **Location**: Stored in a special app-data folder
- **Benefits**:
  - User can't accidentally delete backup files
  - Doesn't clutter their Drive
  - Automatically cleaned up if extension is uninstalled

## Troubleshooting

### "Error 400: redirect_uri_mismatch"

- Ensure your OAuth Client ID matches your extension ID
- For development, use the ID from `chrome://extensions/`
- For production, use Chrome Web Store ID

### "Error 403: access_denied"

- Check that Drive API is enabled in Google Cloud Console
- Verify the scope is correctly configured
- Add yourself as a test user in OAuth consent screen

### "Error: Failed to get auth token"

- Clear cached tokens: Click "Logout" then "Login" again
- Check that `identity` permission is in manifest.json
- Verify OAuth2 configuration in manifest.json

### Backup file not found

- Make sure you've run "Backup Now" at least once
- Check Google Drive API quota in Cloud Console
- Verify network connectivity

## Security Notes

1. **Never commit** your actual Client ID to public repositories
2. Use environment variables or config files for production
3. The `appdata` scope keeps backups private and secure
4. Users can revoke access at any time from their Google Account settings

## Data Format

Backup files are stored as JSON with this structure:

```json
{
  "version": "1.0",
  "timestamp": "2025-01-15T10:30:00.000Z",
  "collections": [...],
  "notes": [...],
  "tags": [...],
  "note_tags": [...]
}
```

Files are stored in the application data folder and named `my_notes_backup.json`.

## Rate Limits

Google Drive API has the following quotas:
- 1,000 requests per 100 seconds per user
- 10,000 requests per 100 seconds per project

For normal usage, these limits are more than sufficient.
