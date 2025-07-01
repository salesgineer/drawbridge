#!/bin/bash

# Watch Moat tasks file
echo "👀 Watching Moat tasks file..."
echo "Press Ctrl+C to stop"
echo ""

# Clear screen and show current tasks
show_tasks() {
    clear
    echo "🔄 Moat Tasks - $(date)"
    echo "════════════════════════════════════════"
    
    if [ -f "start-here/.moat/moat-tasks.md" ]; then
    cat start-here/.moat/moat-tasks.md
    else
        echo "📝 No tasks file found. Create some annotations first!"
    fi
    
    echo ""
    echo "════════════════════════════════════════"
    echo "👀 Watching for changes... (Ctrl+C to exit)"
}

# Show initial state
show_tasks

# Watch for file changes
if command -v fswatch >/dev/null 2>&1; then
    fswatch -o start-here/.moat/moat-tasks.md | while read; do
        show_tasks
    done
elif command -v inotifywait >/dev/null 2>&1; then
    while inotifywait -e modify start-here/.moat/moat-tasks.md; do
        show_tasks
    done
else
    echo "⚠️  File watching not available. Install fswatch (macOS) or inotify-tools (Linux)"
    echo "For now, manually refresh with: cat start-here/.moat/moat-tasks.md"
fi 