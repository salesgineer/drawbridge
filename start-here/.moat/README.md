# 🧭 Moat - Visual UI Feedback for Your Project

Moat is now connected to your project! This directory contains everything you need to turn visual feedback into code changes.

## 🚀 Quick Start

### 1. Create Visual Annotations
1. **Press `f`** in your browser to enter annotation mode
2. **Click any UI element** you want to change
3. **Describe the change** (e.g., "make this blue", "move to center")
4. **Press Enter** to save the annotation

### 2. Process Annotations with AI
In Cursor, run this command to process your UI feedback:
```
Use @.moat/process-moat-tasks.mdc
```

The AI will:
- ✅ Process one task at a time
- ✅ Show you exactly what it changed
- ✅ Wait for your approval before continuing
- ✅ Update your code with clean, professional changes

## 📁 Files in This Directory

- **`process-moat-tasks.mdc`** - Main command for processing UI tasks
- **`moat-workflow.mdc`** - Advanced workflow and batch processing  
- **`moat-tasks.md`** - Your current task list (auto-generated)
- **`moat-tasks-detail.json`** - Technical task data (auto-generated)
- **`config.json`** - Moat settings for this project

## 🎯 Example Workflow

1. **Annotate**: Click a button → "make this green and bigger"
2. **Process**: Run `Use @.moat/process-moat-tasks.mdc`
3. **Review**: AI shows the changes and waits for approval
4. **Approve**: Type "yes" to apply the changes
5. **See Results**: Changes appear immediately in your browser!

## 💡 Common Annotation Examples

### Styling Changes
- "make this blue" → Changes color
- "bigger font" → Increases font size  
- "add shadow" → Adds drop shadow effect
- "make it round" → Adds border radius

### Layout Changes
- "center this" → Centers horizontally
- "move to bottom" → Positions at bottom
- "add spacing" → Adds margin/padding
- "align right" → Right-aligns content

### Content Changes
- "change text to..." → Updates content
- "add a button here" → Inserts new element
- "remove this" → Hides/removes element

## 🛠 Advanced Usage

### Batch Processing
For multiple related changes:
```
Process all styling tasks from .moat/moat-tasks.md using @.moat/moat-workflow.mdc
```

### Manual Task Review
Check your current tasks:
```
Review @.moat/moat-tasks.md
```

### Custom Instructions
You can edit the `.mdc` files in this directory to customize how Moat processes your specific project.

## 🎨 Best Practices

### Creating Good Annotations
- **Be specific**: "make this blue" vs "change the color"
- **One change per annotation**: Don't combine multiple requests
- **Use visual terms**: "bigger", "centered", "more spacing"
- **Context matters**: Click the exact element you want changed

### Working with AI
- **Review each change**: Don't approve without checking
- **Give feedback**: If something isn't right, describe what to fix
- **Test thoroughly**: Make sure changes work on mobile too
- **Save your work**: Commit changes to git regularly

## 🌟 Tips for Success

- **Start small**: Try simple changes first (colors, text)
- **Be patient**: Let the AI process one task at a time
- **Stay involved**: Review and approve each change
- **Experiment**: Try different ways of describing changes
- **Have fun**: Enjoy the magic of visual → code transformation!

---

**Happy building with Moat!** 🎯

*This directory was auto-created by the Moat Chrome extension. You can customize these files for your project's specific needs.*