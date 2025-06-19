# 🎯 Test Float Annotation

## Quick Test Steps:

### Terminal 1: Watch the file
```bash
tail -f demo-page/.float/.float-stream.jsonl
```
(Keep this running to see annotations appear)

### Browser: Create annotation
1. Go to http://localhost:8080
2. Press `f` (comment mode)
3. Click the **hero title**
4. Type: `Make this blue and 60px`
5. Press Enter

You should see the annotation appear in Terminal 1!

### In Cursor: Process the annotation
Simply say:
```
process float annotations in demo-page
```

Cursor will:
1. Read the annotation from `.float/.float-stream.jsonl`
2. Find `demo-page/styles.css`
3. Update the `.hero-title` class
4. Show you the changes

## What to Look For:

**In the file**, you'll see something like:
```json
{
  "timestamp": 1718291234567,
  "annotation": {
    "content": "Make this blue and 60px",
    "elementLabel": "H1: Welcome to Float Demo",
    "target": "h1.hero-title"
  },
  "formatting": {
    "cursorPrompt": "Fix this UI issue:\nElement: H1: Welcome to Float Demo\nIssue: Make this blue and 60px",
    "targetFile": "styles.css"
  }
}
```

**In the CSS**, Cursor will change:
```css
.hero-title {
    font-size: 3rem;     /* → 60px */
    color: #1f2937;      /* → #3b82f6 (blue) */
}
```

## Troubleshooting:

**Annotation not appearing?**
- Make sure the Moat shows "Connected to: demo-page"
- Try refreshing the page and reconnecting
- Check browser console for errors

**Cursor not processing?**
- Make sure you're in the main Float directory
- The `.cursorrules` file has the Float automation rules
- Try: "read and process the latest annotation in demo-page/.float/.float-stream.jsonl" 