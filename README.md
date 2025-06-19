# 🎯 Moat - Visual UI Feedback with Markdown Task Logging

A Chrome extension that turns UI feedback into actionable markdown task lists and Cursor-ready annotations.

## ✨ Features

### 📝 Markdown Task Logging
- **Human-readable task lists** in `.moat/moat-tasks.md`
- **Status tracking** with emoji indicators (📋 → 📤 → ⏳ → ✅)
- **Git-friendly format** for team collaboration
- **Persistent history** across browser sessions

### 🔄 Cursor Integration
- **Machine-readable stream** in `.moat/.moat-stream.jsonl`
- **Pre-formatted prompts** for AI processing
- **File path suggestions** for component targeting
- **Automatic .gitignore** setup

### 🎯 Visual Annotation
- **Click any element** to annotate
- **Screenshot capture** with html2canvas
- **Smart CSS selectors** for accurate targeting
- **Sidebar management** with drag & drop

## 🚀 Quick Start

### 1. Install Extension
1. Download `moat-chrome.zip`
2. Extract and load in Chrome (`chrome://extensions/`)
3. Enable "Developer mode" and "Load unpacked"

### 2. Demo Setup
```bash
# Clone and start demo
git clone <repo>
cd moat
npm run demo
```

### 3. Connect to Project
1. Open http://localhost:8080
2. Press `Cmd+Shift+P` to connect to project
3. Select your project folder
4. Moat creates `.moat/` directory with:
   - `moat-tasks.md` (human-readable)
   - `.moat-stream.jsonl` (Cursor-ready)
   - `config.json` (settings)

### 4. Create Annotations
1. Press `f` to enter comment mode
2. Click any element to annotate
3. Type your feedback and press Enter
4. Check both markdown and JSONL files

## 📋 Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `f` | Enter comment mode |
| `Esc` | Exit comment mode |
| `Cmd+Shift+F` | Toggle sidebar |
| `Cmd+Shift+P` | Connect project |
| `Cmd+Shift+E` | Export annotations |

## 📁 Output Files

### Markdown Task List (`moat-tasks.md`)
```markdown
# Moat Tasks

## 📋 Button: Get Started

**Task:** Change to green background

- **Element:** `button.btn-primary`
- **Page:** http://localhost:8080/
- **Created:** 6/19/2025, 12:45:00 PM
- **Status:** in queue
- **ID:** `moat-123`

---
```

### Cursor Stream (`.moat-stream.jsonl`)
```json
{
  "timestamp": 1718291234567,
  "annotation": { /* full annotation data */ },
  "formatting": {
    "cursorPrompt": "Fix this UI issue:\nElement: Button: Get Started\nIssue: Change to green background\nSelector: button.btn-primary",
    "targetFile": "src/pages/index.tsx"
  }
}
```

## 🔧 Configuration

Moat auto-creates `config.json`:
```json
{
  "version": "1.0.0",
  "projectName": "my-project",
  "streaming": {
    "enabled": true,
    "format": "jsonl",
    "cursorIntegration": true
  },
  "ui": {
    "autoShowMoat": true,
    "confirmBeforeSend": false
  }
}
```

## 📊 Status Flow

```
📋 in queue → 📤 sent → ⏳ in progress → ✅ resolved
```

## 🎨 Cursor Integration

### Automated Processing
When Cursor processes Moat annotations:

1. **Read** `.moat/.moat-stream.jsonl`
2. **Parse** `formatting.cursorPrompt`
3. **Apply** fixes to suggested files
4. **Update** status via Moat rules

### Manual Processing
```bash
# Process latest annotation
cursor process-moat-annotations

# Watch for new annotations
cursor watch-moat-stream
```

## 🏗 Architecture

```
Browser Extension → File System API → Project Files
    ↓                     ↓              ↓
  Annotations     →   .moat/        →   moat-tasks.md
                                   →   .moat-stream.jsonl
                                   →   config.json
```

## 🔄 Workflow

1. **Annotate** - Press `f`, click element, describe issue
2. **Log** - Moat writes to markdown + JSONL
3. **Process** - Cursor reads stream and applies fixes
4. **Track** - Status updates in markdown file
5. **Collaborate** - Share markdown with team

## 📝 Benefits

- **Human + Machine Readable** - Markdown for humans, JSONL for AI
- **Team Collaboration** - Share task lists across team
- **Version Control** - Git-friendly format
- **Persistent** - Survives browser restarts
- **Automated** - Zero manual work required

## 🛠 Development

```bash
# Start demo server
npm run demo

# Watch for changes
npm run watch
```

## 📦 File Structure

```
moat/
├── moat-chrome/          # Chrome extension
│   ├── content_script.js  # Main annotation logic
│   ├── moat.js           # Sidebar component
│   ├── popup.html/js     # Extension popup
│   └── manifest.json     # Extension config
├── demo-page/            # Test environment
└── docs/                 # Documentation
```

Moat transforms UI feedback into structured, actionable tasks that both humans and AI can understand! 🚀