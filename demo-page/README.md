# Float Demo Page

This is a simple test page for demonstrating Float annotations.

## Quick Start

1. **Start the demo server:**
   ```bash
   python3 -m http.server 8080
   ```

2. **Open in Chrome:**
   Navigate to `http://localhost:8080`

3. **Make sure Float is active:**
   - You should see the Float badge (bottom-left)
   - It should say "AG-UI" if connected to the AG-UI server

4. **Test an annotation:**
   - Press `f` to enter comment mode
   - Click any element (it will highlight in blue)
   - Type your feedback (e.g., "make this bigger")
   - Press Enter

## Elements to Test

Try annotating these elements:
- **Logo** - "Make the logo bigger"
- **Hero Title** - "Change color to blue"
- **Buttons** - "Add more spacing"
- **Feature Cards** - "Add drop shadow"
- **Email Input** - "Make the input field wider"
- **Footer** - "Change background to dark blue"

## Viewing Annotations

1. **In the Moat sidebar** (press Cmd+Shift+F)
2. **In the monitor:** `node monitor-float-ag-ui.js`
3. **In the file:** `.float/.float-stream.jsonl`

## Processing Annotations

After creating annotations, in Cursor:
```
process float annotations
```

This will read and apply your UI feedback automatically! 