# My Rich Note Taker - Chrome Extension

A modern, feature-rich note-taking Chrome extension built with React, TypeScript, and Material Design icons.

## Features

### Core Functionality
- **Rich Text Editor** - TipTap-powered WYSIWYG editor with Markdown shortcuts
- **Web Clipping** - Quick clip any webpage with Alt+W
- **Collections** - Organize notes into color-coded collections
- **Tags** - Tag notes for easy categorization and search
- **Search** - Full-text search across all notes
- **Audio Recording** - Record audio with live speech-to-text transcription
- **Templates** - 7 pre-built templates (Meeting Notes, To-Do List, Recipe, etc.)

### Technical Features
- **Auto-save** - Notes save automatically with 1-second debounce
- **IndexedDB Storage** - Fast, local-first data storage using Dexie.js
- **Dark Theme** - Beautiful dark mode matching Chrome's aesthetic
- **Material Icons** - Modern icons from @mui/icons-material
- **Keyboard Shortcuts** - Alt+W (popup), Alt+S (dashboard)
- **Local Backup** - Export/import notes as JSON files

### Optional Features
- **Google Drive Sync** - Cloud backup (requires setup, disabled by default)

## Tech Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Fast build tool
- **TipTap** - Rich text editor
- **Dexie.js** - IndexedDB wrapper
- **Material UI Icons** - Icon library
- **Chrome Extension Manifest V3**

## Installation

### For Development

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Extension
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Build the extension**
   ```bash
   npm run build
   ```

4. **Load in Chrome**
   - Open Chrome and go to `chrome://extensions/`
   - Enable **Developer mode** (top right)
   - Click **Load unpacked**
   - Select the `dist` folder

### For Users

1. Download the latest release
2. Extract the ZIP file
3. Follow step 4 above to load in Chrome

## Usage

### Quick Clip (Popup)
- Click the extension icon or press **Alt+W**
- The current page info auto-fills
- Select a collection and add tags
- Click "Save Clip"

### Dashboard (Main App)
- Press **Alt+S** or right-click extension → Options
- Create collections using "+ New Collection"
- Create notes with "+ New Note"
- Use the rich text editor with Markdown shortcuts:
  - `#` for headings
  - `-` or `*` for lists
  - `**bold**` for bold text
  - `>` for blockquotes

### Audio Recording
- Click the microphone icon in the editor toolbar
- Speak - live transcription appears
- Click stop - transcription appends to note

### Templates
- Click "Templates" dropdown in editor
- Select a template (Meeting Notes, Recipe, etc.)
- Template content loads into editor

### Backup
- Open Settings (gear icon in sidebar)
- **Local Backup**: Download/upload JSON files
- **Google Drive**: Requires OAuth setup (see below)

## Development

### Available Scripts

```bash
# Development mode (watch mode)
npm run dev

# Production build
npm run build

# Preview build
npm run preview
```

### Project Structure

```
Extension/
├── src/
│   ├── components/       # Reusable components
│   │   ├── AudioRecorder.tsx
│   │   ├── RichTextEditor.tsx
│   │   ├── TemplateSelector.tsx
│   │   ├── ThemeSwitcher.tsx
│   │   └── Settings.tsx
│   ├── dashboard/        # Dashboard page
│   │   ├── Dashboard.tsx
│   │   ├── Sidebar.tsx
│   │   ├── NoteList.tsx
│   │   └── Editor.tsx
│   ├── popup/           # Popup page
│   │   └── Popup.tsx
│   ├── services/        # Business logic
│   │   ├── db.ts        # Dexie database
│   │   └── driveSync.ts # Google Drive sync
│   ├── context/         # React contexts
│   │   └── ThemeContext.tsx
│   ├── constants/       # Constants
│   │   └── templates.ts
│   ├── background.ts    # Service worker
│   ├── popup.tsx        # Popup entry
│   ├── dashboard.tsx    # Dashboard entry
│   └── index.css        # Global styles
├── public/
│   └── icons/           # Extension icons
├── manifest.json        # Chrome extension manifest
├── vite.config.ts       # Vite configuration
├── tsconfig.json        # TypeScript config
└── package.json         # Dependencies
```

## Google Drive Setup (Optional)

**Note**: Google Drive sync is disabled by default. To enable:

1. Get Google OAuth credentials from [Google Cloud Console](https://console.cloud.google.com/)
2. Enable Google Drive API
3. Add your Chrome Extension ID to authorized origins
4. Update `manifest.json` with your `client_id`
5. Set `ENABLE_GOOGLE_DRIVE_SYNC = true` in `src/components/Settings.tsx`

See `GOOGLE_DRIVE_SETUP.md` for detailed instructions (if available).

## Browser Compatibility

- Chrome 88+
- Chromium-based browsers (Edge, Brave, etc.)

## Known Limitations

- No cloud sync without Google Drive setup
- Speech-to-text requires browser support (Chrome/Edge)
- No mobile version

## Contributing

Contributions welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License - feel free to use this project for personal or commercial purposes.

## Acknowledgments

- Icons from [Material UI](https://mui.com/material-ui/material-icons/)
- Rich text editing by [TipTap](https://tiptap.dev/)
- Built with [Vite](https://vitejs.dev/)

## Support

For issues or questions, please open an issue on GitHub.

---

**Made with Claude Code** 🤖
