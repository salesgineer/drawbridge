#!/bin/bash

# Float annotation watcher for Cursor
STREAM_FILE=".float/.float-stream.jsonl"
LAST_LINE_FILE=".float/.last-processed"

echo "🚀 Float Watcher Started"
echo "Watching: $STREAM_FILE"
echo ""

# Create .float directory if needed
mkdir -p .float

# Initialize last line tracker
touch "$LAST_LINE_FILE"
LAST_PROCESSED=$(cat "$LAST_LINE_FILE" 2>/dev/null || echo "0")

# Function to process new annotations
process_annotations() {
    if [ ! -f "$STREAM_FILE" ]; then
        return
    fi
    
    # Count total lines
    TOTAL_LINES=$(wc -l < "$STREAM_FILE" | tr -d ' ')
    
    # Check if there are new lines
    if [ "$TOTAL_LINES" -gt "$LAST_PROCESSED" ]; then
        # Process new lines
        NEW_LINES=$((TOTAL_LINES - LAST_PROCESSED))
        echo "📝 Found $NEW_LINES new annotation(s)"
        echo ""
        
        # Get the last annotation
        LAST_ANNOTATION=$(tail -n 1 "$STREAM_FILE")
        
        # Parse and display (using jq if available, otherwise basic parsing)
        if command -v jq &> /dev/null; then
            PROMPT=$(echo "$LAST_ANNOTATION" | jq -r '.formatting.cursorPrompt')
            ELEMENT=$(echo "$LAST_ANNOTATION" | jq -r '.annotation.elementLabel')
            
            echo "Element: $ELEMENT"
            echo "---"
            echo "$PROMPT"
            echo "---"
            
            # Copy to clipboard on macOS
            if [[ "$OSTYPE" == "darwin"* ]]; then
                echo "$PROMPT" | pbcopy
                echo "✓ Copied to clipboard!"
            fi
        else
            echo "$LAST_ANNOTATION"
        fi
        
        echo ""
        echo "──────────────────────────────────────────"
        echo ""
        
        # Update last processed line
        echo "$TOTAL_LINES" > "$LAST_LINE_FILE"
    fi
}

# Initial check
process_annotations

# Watch for changes
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    fswatch -o "$STREAM_FILE" 2>/dev/null | while read; do
        process_annotations
    done
else
    # Linux
    while inotifywait -e modify "$STREAM_FILE" 2>/dev/null; do
        process_annotations
    done
fi 