#!/bin/bash

# Moat Runner - Automated task processing workflow
echo "🚀 Starting Moat..."

# Check if we're in the right directory
if [ ! -d "demo-page/.moat" ]; then
    echo "❌ Error: Not in Moat project directory or .moat folder not found"
    echo "   Please run this script from the project root"
    exit 1
fi

# Function to check if a process is running
check_process() {
    pgrep -f "$1" > /dev/null
}

# Check HTTP server
if check_process "python.*http.server 8000"; then
    echo "✅ HTTP Server: Already running on http://localhost:8000"
else
    echo "🔄 Starting HTTP server..."
    cd demo-page
    python3 -m http.server 8000 > /dev/null 2>&1 &
    cd ..
    sleep 2
    if check_process "python.*http.server 8000"; then
        echo "✅ HTTP Server: Started on http://localhost:8000"
    else
        echo "❌ Failed to start HTTP server"
        exit 1
    fi
fi

# Check Moat watcher
if check_process "moat-watcher.js"; then
    echo "✅ Moat Watcher: Already running"
else
    echo "🔄 Starting Moat watcher..."
    cd demo-page
    node ../moat-watcher.js > /dev/null 2>&1 &
    cd ..
    sleep 2
    if check_process "moat-watcher.js"; then
        echo "✅ Moat Watcher: Started and monitoring"
    else
        echo "❌ Failed to start Moat watcher"
        exit 1
    fi
fi

# Check for pending tasks
if [ -f "demo-page/.moat/moat-tasks.md" ]; then
    PENDING_COUNT=$(grep -c "^[0-9]\+\. \[ \]" demo-page/.moat/moat-tasks.md 2>/dev/null || echo "0")
    TOTAL_COUNT=$(grep -c "^[0-9]\+\." demo-page/.moat/moat-tasks.md 2>/dev/null || echo "0")
    
    echo ""
    echo "📋 Task Status:"
    echo "   Total Tasks: $TOTAL_COUNT"
    echo "   Pending Tasks: $PENDING_COUNT"
    
    if [ "$PENDING_COUNT" -gt "0" ]; then
        echo ""
        echo "🎯 Ready for task processing!"
        echo "   Next: Ask Cursor to 'process tasks' to handle pending items"
    else
        echo "   ✅ All tasks completed!"
    fi
else
    echo "📋 No task file found - ready for new annotations"
fi

echo ""
echo "🧭 Moat is ready!"
echo "   🌐 Demo: http://localhost:8000"
echo "   🔄 Watcher: Active"
echo "   📱 Extension: Ready for annotations"
echo ""
echo "Next steps:"
echo "  • Create annotations in Chrome with Moat extension"
echo "  • Ask Cursor to 'run moat' to process any new tasks" 