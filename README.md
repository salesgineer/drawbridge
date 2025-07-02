# 🎯 Moat - Enhanced UI Feedback with ai-dev-tasks Integration

A Chrome extension that transforms UI feedback into **structured, AI-processable task lists** with human verification checkpoints inspired by ai-dev-tasks methodology.

## ✨ Enhanced Features

### 🧠 ai-dev-tasks Integration *(NEW)*
- **Smart Priority Classification**: Auto-detects High (🔥), Medium (⚡), Low (💡) priority
- **Task Type Detection**: Categorizes as Styling, Layout, Content, Enhancement
- **Implementation Planning**: Suggests approach and files to modify
- **Time Estimation**: Predicts 2-20 minute implementation time
- **Dependency Detection**: Identifies related tasks affecting same elements
- **Human Verification**: Structured workflow with approval checkpoints

### 📝 Enhanced Markdown Task Logging
- **Rich task format** with metadata and planning sections
- **Progress tracking** with comprehensive status indicators
- **Implementation guidance** with suggested approaches
- **Git-friendly format** for team collaboration
- **Structured workflow** compatible with Cursor @commands

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

### Dual-File Task System *(NEW)*

Moat now generates **two complementary files** for optimal human-AI collaboration:

#### 1. **`moat-tasks.md`** - Human-Readable Summary
```markdown
# Moat Tasks - Local Development

**Total**: 5 | **Pending**: 4 | **Completed**: 1

## Tasks

1. ⚡ **Glass Buttons** - "update these to glass buttons" *(5 min)* - ✅ completed
2. ⚡ **Features Background** - "make this background blue" *(5 min)* - 📋 pending  
3. 📋 **Hero Section** - "make this red" *(5 min)* - 📋 pending
4. 📋 **Hero Title** - "Make this blue" *(2 min)* - 📋 pending

---
*Use @process-moat-tasks.mdc for implementation*
```

#### 2. **`moat-tasks-detail.md`** - AI-Processable Format
```markdown
## ⚡ 📋 Task 001: Glass Buttons

**Priority**: Medium | **Type**: Styling | **Time**: 5 minutes

### Request
"update these to glass buttons"

### Technical Details
- **Element**: `div.hero-buttons`
- **Location**: styles.css
- **Approach**: Add backdrop-filter and rgba backgrounds

### Implementation Plan
- Apply glass effect with semi-transparent backgrounds
- Add backdrop-filter: blur(10px) for modern glass look
- Update hover states with enhanced transparency

### Status: ✅ completed
**Applied**: Updated buttons with glass effect styling
**Files Modified**: start-here/styles.css
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

## 🎨 Enhanced Cursor Integration

### ai-dev-tasks Workflow Commands *(NEW)*
```bash
# Primary command - Process moat annotations/tasks
"run moat" - Auto-detects and processes annotations with smart workflow

# Generate structured tasks from raw annotations
Use @generate-moat-tasks.mdc to analyze .moat/.moat-stream.jsonl

# Process tasks with human verification (recommended)
Use @process-moat-tasks.mdc to implement tasks in .moat/moat-tasks.md

# Legacy auto-processing (no verification)
Use @moat-auto-fix.mdc for immediate implementation
```

### Structured Processing Workflow
1. **Generate Tasks** - Transform annotations into structured task plan
2. **Review Plan** - Human approval of task grouping and priorities
3. **Incremental Processing** - One task at a time with verification
4. **Human Approval** - Get "yes" confirmation before each change
5. **Status Updates** - Track progress in markdown file

### Legacy Automated Processing
When Cursor processes Moat annotations automatically:

1. **Read** `.moat/.moat-stream.jsonl`
2. **Parse** `formatting.cursorPrompt`
3. **Apply** fixes to suggested files
4. **Update** status via Moat rules

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
├── start-here/           # Interactive demo & test environment
└── docs/                 # Documentation
```

Moat transforms UI feedback into structured, actionable tasks that both humans and AI can understand! 🚀