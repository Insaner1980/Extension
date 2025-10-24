# Icon Creation Guide

## Quick Solution: Use Online Tool

Go to: https://favicon.io/favicon-generator/

### Settings:
- **Text:** 📝 (or use letter "N")
- **Background:** #202124 (Chrome dark background)
- **Font Color:** #8ab4f8 (Chrome blue)
- **Font:** Roboto
- **Size:** Generate all sizes

Download and extract to `public/icons/`

---

## Alternative: Use these SVG files

Save the SVG code below, then convert to PNG using online tools:
- https://convertio.co/svg-png/
- https://cloudconvert.com/svg-to-png

### icon.svg (use for all sizes)

```svg
<svg width="128" height="128" xmlns="http://www.w3.org/2000/svg">
  <!-- Background -->
  <rect width="128" height="128" fill="#202124" rx="24"/>

  <!-- Notepad icon -->
  <g transform="translate(24, 24)">
    <!-- Paper -->
    <rect x="15" y="10" width="50" height="60" fill="#8ab4f8" rx="4"/>

    <!-- Lines on paper -->
    <line x1="22" y1="22" x2="58" y2="22" stroke="#202124" stroke-width="2"/>
    <line x1="22" y1="32" x2="58" y2="32" stroke="#202124" stroke-width="2"/>
    <line x1="22" y1="42" x2="48" y2="42" stroke="#202124" stroke-width="2"/>
    <line x1="22" y1="52" x2="52" y2="52" stroke="#202124" stroke-width="2"/>

    <!-- Pen/Pencil -->
    <g transform="rotate(-30 70 55)">
      <rect x="65" y="45" width="8" height="30" fill="#fdd663" rx="2"/>
      <polygon points="69,45 73,45 71,40" fill="#9aa0a6"/>
    </g>
  </g>
</svg>
```

### Convert sizes:
- Save as `icon.svg`
- Convert to PNG at:
  - 16x16 → `icon16.png`
  - 48x48 → `icon48.png`
  - 128x128 → `icon128.png`
- Place all in `public/icons/`

---

## Even Simpler: Emoji Icon (No conversion needed!)

For quick testing, use this simple approach:

1. Go to: https://favicon.io/emoji-favicons/memo/
2. Download the favicon package
3. Rename files:
   - `favicon-16x16.png` → `icon16.png`
   - `favicon-32x32.png` → `icon48.png` (resize to 48x48)
   - `android-chrome-192x192.png` → resize to `icon128.png`
4. Move to `public/icons/`

---

## Manual Method (Use any image editor)

### Using Paint / GIMP / Photoshop:

1. Create new image: 128x128px
2. Fill background with: `#202124` (dark gray)
3. Add text "📝" or draw a notepad icon
4. Use color `#8ab4f8` (blue) for the icon
5. Save as PNG
6. Resize to create three versions:
   - 16x16 → `icon16.png`
   - 48x48 → `icon48.png`
   - 128x128 → `icon128.png`

---

## Temporary Solution for Testing

If you just want to test the extension NOW without creating icons:

1. Find ANY PNG image on your computer
2. Copy it 3 times
3. Rename to `icon16.png`, `icon48.png`, `icon128.png`
4. Put in `public/icons/`
5. Build and load extension

The extension will work fine with placeholder icons!

---

## After Creating Icons

```bash
# Check files exist:
dir public\icons

# Should show:
# icon16.png
# icon48.png
# icon128.png

# Then rebuild:
npm run build
```

Icons will be copied to `dist/icons/` during build.
