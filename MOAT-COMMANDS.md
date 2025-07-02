# Moat Commands Reference

## 🚀 Quick Start

### Primary Commands:

#### `run moat`
**Full automated workflow** - Starts services + processes all pending tasks
```bash
# When you say "run moat", Cursor will:
1. ✅ Check HTTP server (port 8000) and moat-watcher  
2. 🔄 Start any missing services
3. 📋 Read current task queue from .moat files
4. 🎨 Process ALL pending tasks automatically (no approval needed)
5. ✅ Update status files immediately  
6. 🎉 Show completion summary with live URL
```

#### `process tasks`
**Task processing only** - Assumes services are running
```bash
# Processes all pending tasks from the queue without starting services
```

#### `start moat` 
**Services only** - Starts services without processing tasks
```bash
# Just starts HTTP server and watcher without task processing
```

---

## 🛠 Manual Script Usage

You can also run the helper script directly:
```bash
./run-moat.sh
```

This script will:
- ✅ Check and start HTTP server on port 8000
- ✅ Check and start Moat watcher  
- 📊 Show current task status
- 🎯 Guide you on next steps

---

## 🎯 Expected Workflow

1. **Create annotations** in Chrome using Moat extension
2. **Type "run moat"** in Cursor to automatically process all tasks
3. **Visit http://localhost:8000** to see live changes
4. **Repeat** as needed

---

## 📋 Task Status Tracking

Tasks are tracked in two files:
- `start-here/.moat/moat-tasks.md` - Human-readable summary
- `start-here/.moat/moat-tasks-detail.json` - Detailed task information

Status progression: `pending` → `in-progress` → `completed`

---

## 🔄 Auto-Sync Features

- **Real-time updates**: Chrome extension syncs every 3 seconds
- **Status tracking**: Files updated automatically  
- **No approval needed**: Tasks process without interruption
- **Live preview**: Changes visible immediately at http://localhost:8000

---

## 🎨 Design Engineering

When processing tasks, Cursor acts as a **Senior Design Engineer**:
- Transforms vague requests into polished implementations
- Uses modern CSS (animations, gradients, transforms)
- Adds delightful micro-interactions
- Maintains responsive design principles
- Ensures accessibility and performance best practices

---

Ready to start? Just type **"run moat"** and watch the magic happen! 🧭 