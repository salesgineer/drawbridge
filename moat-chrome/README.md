# Moat Chrome Extension

A Chrome extension for visually annotating React/Next.js applications during development.

## 🚀 Quick Setup

1. **Generate Icons** (first time only):
   - Open `generate-icons.html` in a browser
   - Right-click each canvas and save as:
     - `icons/moat-16.png`
     - `icons/moat-48.png`
     - `icons/moat-128.png`

2. **Install Extension**:
   - Open Chrome and go to `chrome://extensions`
   - Enable "Developer mode" (top right)
   - Click "Load unpacked"
   - Select the `moat-chrome` directory

3. **Start Using**:
   - Navigate to your React/Next.js app on `localhost`
   - Press `f` to enter comment mode
   - Click any element to annotate (including containers and backgrounds)
   - View annotations in the Moat sidebar

## 🔌 Cursor Integration - Stream Annotations

Moat can automatically stream annotations to your project for Cursor to pick up:

### Setup (One-time per project)

1. **Open the Moat** - Click the Moat extension icon
2. **Connect Project** - Click "Connect Project" button
3. **Select Folder** - Choose your project root directory
4. **Done!** - Moat creates `.moat/` directory and starts streaming

### What Happens

- Creates `.moat/config.json` - Project settings
- Creates `.moat/.moat-stream.jsonl` - Live annotation stream
- Adds `.moat-stream.jsonl` to `.gitignore` automatically
- Shows green dot when connected 🟢

### Stream Format

Each annotation is appended to `.moat/.moat-stream.jsonl` as a new line:

```json
{
  "timestamp": 1234567890,
  "annotation": { /* full annotation object */ },
  "formatting": {
    "cursorPrompt": "Fix this UI issue:\nElement: Link: Profile\nIssue: Move to bottom\nSelector: a[href='/profile']\nURL: http://localhost:3000",
    "targetFile": "src/pages/index.tsx"
  }
}
```

### In Cursor

1. Open `.moat/.moat-stream.jsonl`
2. Cursor watches for changes
3. New annotations appear as they're created
4. Use the formatted prompt for AI suggestions

## ⌨️ Keyboard Shortcuts

- `f` - Enter comment mode
- `Esc` - Exit comment mode
- `Cmd/Ctrl + Shift + F` - Toggle Moat sidebar
- `Enter` - Submit annotation
- `Shift + Enter` - New line in annotation

## 📁 Files

- `manifest.json` - Chrome extension configuration
- `content_script.js` - Main annotation logic
- `moat.js` - Sidebar component
- `moat.css` - All styles
- `popup.html/js` - Extension popup UI
- `html2canvas.min.js` - Screenshot capture library

## 🔧 Features

- **Universal Element Selection**: Annotate ANY element - links, buttons, containers, backgrounds
- **Smart Element Labels**: 
  - Links: "Link: Profile"
  - Containers: "Sidebar Container", "Background Container"
  - Auto-detects element purpose from classes, roles, and styles
- **Comment Protection**: Can't accidentally lose work - clicking another element shakes the comment box
- **Visual Confirmation**: Brief pulse effect when selecting elements
- **Enhanced Context**: Captures element metadata for better AI understanding
- **Drag & Drop**: Reorder annotations by priority
- **Export**: Download annotations as `.moat.json`
- **Screenshot Capture**: Automatically captures element screenshots
- **🆕 Cursor Streaming**: Real-time sync to your project directory

## 🎯 Element Selection

Moat can now select and annotate any element on the page:

- **Interactive Elements**: Links, buttons, inputs
- **Containers**: Divs, sections, articles with smart labeling
- **Backgrounds**: Elements with background colors or images
- **Lists**: UL/OL and individual list items
- **Any HTML Element**: If you can see it, you can annotate it

## 📤 Export Format

Annotations are exported in MCP-compatible JSON:

```json
{
  "sessionId": "moat-session-xyz",
  "timestamp": 1715736000,
  "url": "http://localhost:3000",
  "annotations": [
    {
      "type": "user_message",
      "role": "user",
      "content": "Move this to the bottom, 16px above viewport",
      "target": "a[href='/profile']",
      "elementLabel": "Link: Profile",
      "elementContext": {
        "tagName": "a",
        "text": "Profile",
        "href": "/profile",
        "ariaLabel": null,
        "className": "nav-link"
      },
      "boundingRect": { "x": 100, "y": 300, "width": 200, "height": 40 },
      "screenshot": "data:image/png;base64,...",
      "status": "sent"
    }
  ]
}
```

## 🐛 Troubleshooting

- **Extension not working?** Make sure you're on a `localhost` URL
- **Wrong element selected?** The improved selector prioritizes unique attributes
- **Can't see Moat?** Click the extension icon or press `Cmd/Ctrl + Shift + F`
- **Element not found?** Check if the page structure changed after annotation
- **Comment box shaking?** Finish or cancel your current annotation before selecting another element
- **Project not connecting?** Make sure to allow file system access when prompted
- **Lost connection?** Click the settings icon (⚙️) and reconnect 