# 🎯 Drawbridge Interactive Demo

An interactive demonstration of the Drawbridge Chrome extension that shows users how to provide visual UI feedback and see it transformed into code changes.

## 🚀 What This Demo Shows

This demo page demonstrates the core Drawbridge workflow:

1. **Visual Annotations** - Click any UI element to describe desired changes
2. **AI Processing** - Intelligent code generation with human approval  
3. **Live Updates** - Changes applied instantly to your project

## 🎨 Interactive Exercises

The demo includes three hands-on exercises:

### Exercise 1: Change Colors
- Click the demo button and describe color changes
- Practice: "make this button green" or "change to a purple gradient"

### Exercise 2: Update Content  
- Click the welcome message to change text or translate languages
- Practice: "change this to Spanish" or "make this more friendly"

### Exercise 3: Reposition Elements
- Click the profile card to rearrange its layout
- Practice: "move the avatar to the right" or "center all content"

## 🛠 How to Use

1. **Start the Demo Server**
   ```bash
   # From the project root
       cd start-here
   python -m http.server 8000
   # or
   node -e "require('http').createServer(require('fs').readFileSync.bind(require('fs'))).listen(8000)"
   ```

2. **Open in Browser**
   - Navigate to `http://localhost:8000`
   - Explore the interactive exercises

3. **Try with Drawbridge Extension**
   - Install the Drawbridge Chrome extension
   - Press `f` to enter annotation mode
   - Click elements and describe changes
   - Watch AI implement your feedback

## 🎯 Key Features Demonstrated

- **Modern UI Design** - Clean, responsive interface with Space Grotesk typography
- **Interactive Elements** - Clickable components that respond to user interaction
- **Progress Tracking** - Visual progress bar and completion states
- **Smooth Animations** - Polished micro-interactions and transitions
- **Responsive Design** - Works beautifully on desktop, tablet, and mobile

## 🔧 Technical Stack

- **HTML5** - Semantic markup with accessibility in mind
- **CSS3** - Modern styling with gradients, animations, and responsive design
- **Vanilla JavaScript** - Interactive functionality without frameworks
- **Space Grotesk Font** - Consistent typography with the main extension
- **SVG Icons** - Scalable vector graphics for crisp visuals

## 📱 Responsive Breakpoints

- **Desktop**: 1200px and above
- **Tablet**: 768px - 1199px  
- **Mobile**: Below 768px

## 🎨 Design System

The demo uses the same design system as the Drawbridge extension:

- **Primary Color**: `#3B82F6` (Blue 500)
- **Secondary Color**: `#2563EB` (Blue 600)
- **Success Color**: `#16A34A` (Green 600)
- **Warning Color**: `#D97706` (Amber 600)
- **Text Color**: `#1F2937` (Gray 800)
- **Background**: `#FFFFFF` (White)

## 🚀 Next Steps

After completing the demo exercises:

1. Install the Drawbridge Chrome extension
2. Connect it to your local development project
3. Start annotating your own UI elements
4. Experience the full Drawbridge workflow

---

**Built with ❤️ for the developer community** 