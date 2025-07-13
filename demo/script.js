// Drawbridge Demo Tutorial Script
// Tracks progress through three essential exercises

class DrawbridgeTutorial {
  constructor() {
    this.exercises = {
      1: { completed: false, comments: 0 },
      2: { completed: false, comments: 0 },
      3: { completed: false, comments: 0 }
    };
    
    this.totalComments = 0;
    this.startTime = Date.now();
    this.currentExercise = 1;
    
    this.init();
  }
  
  init() {
    this.setupEventListeners();
    this.updateProgress();
    this.simulatePluginDetection();
    this.startTimeTracking();
    this.checkForExistingProgress();
  }
  
  setupEventListeners() {
    // Keyboard shortcut demonstration
    document.addEventListener('keydown', (e) => {
      if (e.key === 'c' || e.key === 'C') {
        this.demonstrateCommentMode();
      }
    });
    
    // Exercise target click handlers
    document.getElementById('target-1').addEventListener('click', () => {
      this.handleExerciseInteraction(1);
    });
    
    document.getElementById('target-2').addEventListener('click', () => {
      this.handleExerciseInteraction(2);
    });
    
    document.getElementById('target-3').addEventListener('click', () => {
      this.handleExerciseInteraction(3);
    });
    
    // Demo button interactions
    document.querySelector('.demo-button').addEventListener('click', () => {
      this.showMessage('Great! You clicked the demo button. Now try pressing C and clicking on this button to comment on it.');
    });
    
    // Simulate real plugin interactions
    this.simulatePluginBehavior();
  }
  
  demonstrateCommentMode() {
    // Simulate entering comment mode
    document.body.style.cursor = 'crosshair';
    this.showMessage('Comment mode activated! Click on any element to annotate it.');
    
    // Add visual feedback
    document.querySelectorAll('.exercise-target').forEach(target => {
      target.style.borderColor = '#3b82f6';
      target.style.borderStyle = 'solid';
      target.style.boxShadow = '0 0 0 2px rgba(59, 130, 246, 0.2)';
    });
    
    // Reset after 3 seconds
    setTimeout(() => {
      document.body.style.cursor = 'default';
      document.querySelectorAll('.exercise-target').forEach(target => {
        target.style.borderStyle = 'dashed';
        target.style.borderColor = '#e5e7eb';
        target.style.boxShadow = 'none';
      });
    }, 3000);
  }
  
  handleExerciseInteraction(exerciseNum) {
    if (!this.exercises[exerciseNum].completed) {
      this.exercises[exerciseNum].comments++;
      this.totalComments++;
      
      // Show appropriate feedback based on exercise
      switch (exerciseNum) {
        case 1:
          this.handleExercise1();
          break;
        case 2:
          this.handleExercise2();
          break;
        case 3:
          this.handleExercise3();
          break;
      }
      
      this.updateProgress();
    }
  }
  
  handleExercise1() {
    const exercise = document.querySelector('[data-exercise="1"]');
    const status = document.getElementById('status-1');
    
    if (this.exercises[1].comments === 1) {
      status.innerHTML = '<span class="status-text">Great! You made your first comment!</span>';
      this.showMessage('Excellent! You created your first annotation. In a real project, this would appear in your .moat/moat-tasks.md file.');
      
      // Mark as completed
      this.exercises[1].completed = true;
      exercise.classList.add('completed');
      
      // Enable exercise 2
      const exercise2 = document.querySelector('[data-exercise="2"]');
      const status2 = document.getElementById('status-2');
      exercise2.classList.add('active');
      status2.innerHTML = '<span class="status-text">Ready to start</span>';
      
      // Show completion animation
      this.showCompletionAnimation(1);
    }
  }
  
  handleExercise2() {
    const exercise = document.querySelector('[data-exercise="2"]');
    const status = document.getElementById('status-2');
    
    if (this.exercises[2].comments === 1) {
      status.innerHTML = '<span class="status-text">Good! Try commenting on other elements too</span>';
      this.showMessage('Nice! Try clicking on different parts of the profile card to create multiple comments.');
    } else if (this.exercises[2].comments >= 3) {
      status.innerHTML = '<span class="status-text">Perfect! Multiple comments created</span>';
      this.showMessage('Excellent work! You understand how to create multiple annotations. This simulates a real design review.');
      
      // Mark as completed
      this.exercises[2].completed = true;
      exercise.classList.add('completed');
      
      // Enable exercise 3
      const exercise3 = document.querySelector('[data-exercise="3"]');
      const status3 = document.getElementById('status-3');
      exercise3.classList.add('active');
      status3.innerHTML = '<span class="status-text">Ready to start</span>';
      
      this.showCompletionAnimation(2);
    }
  }
  
  handleExercise3() {
    const exercise = document.querySelector('[data-exercise="3"]');
    const status = document.getElementById('status-3');
    
    if (this.exercises[3].comments === 1) {
      status.innerHTML = '<span class="status-text">Great! Now check Cursor for your tasks</span>';
      this.showMessage('Perfect! Now open Cursor and search for "moat-tasks" to find all your comments organized as actionable tasks.');
      
      // Mark as completed
      this.exercises[3].completed = true;
      exercise.classList.add('completed');
      
      this.showCompletionAnimation(3);
      this.showFinalMessage();
    }
  }
  
  showCompletionAnimation(exerciseNum) {
    const exerciseCard = document.querySelector(`[data-exercise="${exerciseNum}"]`);
    const exerciseNumber = exerciseCard.querySelector('.exercise-number');
    
    // Add completion checkmark
    exerciseNumber.innerHTML = '✓';
    exerciseNumber.style.background = 'var(--success)';
    exerciseNumber.style.color = 'white';
    
    // Animate the card
    exerciseCard.style.transform = 'scale(1.02)';
    setTimeout(() => {
      exerciseCard.style.transform = 'scale(1)';
    }, 200);
  }
  
  showFinalMessage() {
    setTimeout(() => {
      this.showMessage('🎉 Congratulations! You\'ve completed all three exercises. You\'re now ready to use Drawbridge on real projects!', 'success');
    }, 1000);
  }
  
  updateProgress() {
    const completedExercises = Object.values(this.exercises).filter(ex => ex.completed).length;
    const progressPercentage = Math.round((completedExercises / 3) * 100);
    
    // Update progress bar
    const progressFill = document.getElementById('progress-fill');
    const progressText = document.getElementById('progress-percentage');
    
    if (progressFill) {
      progressFill.style.width = `${progressPercentage}%`;
    }
    
    if (progressText) {
      progressText.textContent = `${progressPercentage}%`;
    }
    
    // Update stats
    const commentsCount = document.getElementById('comments-count');
    const exercisesCompleted = document.getElementById('exercises-completed');
    
    if (commentsCount) {
      commentsCount.textContent = this.totalComments;
    }
    
    if (exercisesCompleted) {
      exercisesCompleted.textContent = completedExercises;
    }
    
    // Update time spent
    this.updateTimeSpent();
  }
  
  updateTimeSpent() {
    const timeSpent = Math.floor((Date.now() - this.startTime) / 60000); // minutes
    const timeElement = document.getElementById('time-spent');
    
    if (timeElement) {
      timeElement.textContent = `${timeSpent}m`;
    }
  }
  
  startTimeTracking() {
    // Update time every 30 seconds
    setInterval(() => {
      this.updateTimeSpent();
    }, 30000);
  }
  
  simulatePluginDetection() {
    // Simulate plugin status
    const statusIndicator = document.getElementById('plugin-status');
    const statusDot = statusIndicator.querySelector('.status-dot');
    const statusText = statusIndicator.querySelector('.status-text');
    
    // Start with connecting state
    statusText.textContent = 'Connecting...';
    statusDot.style.background = '#d97706';
    
    // Simulate connection after 2 seconds
    setTimeout(() => {
      statusText.textContent = 'Plugin Ready';
      statusDot.style.background = '#059669';
      statusIndicator.style.background = 'var(--success-light)';
      statusIndicator.style.borderColor = 'var(--success-border)';
    }, 2000);
  }
  
  simulatePluginBehavior() {
    // Add hover effects that simulate real plugin behavior
    document.querySelectorAll('.exercise-target').forEach(target => {
      target.addEventListener('mouseenter', () => {
        if (document.body.style.cursor === 'crosshair') {
          target.style.outline = '2px solid #3b82f6';
          target.style.outlineOffset = '2px';
        }
      });
      
      target.addEventListener('mouseleave', () => {
        target.style.outline = 'none';
        target.style.outlineOffset = '0';
      });
    });
  }
  
  showMessage(text, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `tutorial-notification ${type}`;
    notification.innerHTML = `
      <div class="notification-content">
        <span class="notification-text">${text}</span>
        <button class="notification-close" onclick="this.parentElement.parentElement.remove()">×</button>
      </div>
    `;
    
    // Add styles
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${type === 'success' ? 'var(--success-light)' : 'var(--accent-light)'};
      border: 1px solid ${type === 'success' ? 'var(--success-border)' : 'var(--accent-border)'};
      border-radius: 8px;
      padding: 16px;
      max-width: 350px;
      box-shadow: 0 10px 30px var(--shadow-lg);
      z-index: 1000;
      animation: slideInRight 0.3s ease;
    `;
    
    const content = notification.querySelector('.notification-content');
    content.style.cssText = `
      display: flex;
      align-items: flex-start;
      gap: 12px;
    `;
    
    const textEl = notification.querySelector('.notification-text');
    textEl.style.cssText = `
      flex: 1;
      font-size: 14px;
      line-height: 1.4;
      color: var(--text-primary);
    `;
    
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.style.cssText = `
      background: none;
      border: none;
      font-size: 18px;
      cursor: pointer;
      color: var(--text-secondary);
      padding: 0;
      line-height: 1;
    `;
    
    // Add animation styles to head if not exists
    if (!document.querySelector('#tutorial-animations')) {
      const style = document.createElement('style');
      style.id = 'tutorial-animations';
      style.textContent = `
        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(100%);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `;
      document.head.appendChild(style);
    }
    
    document.body.appendChild(notification);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
      if (notification.parentElement) {
        notification.remove();
      }
    }, 5000);
  }
  
  checkForExistingProgress() {
    // Check localStorage for any existing progress
    const savedProgress = localStorage.getItem('drawbridge-tutorial-progress');
    if (savedProgress) {
      try {
        const progress = JSON.parse(savedProgress);
        this.exercises = { ...this.exercises, ...progress.exercises };
        this.totalComments = progress.totalComments || 0;
        this.updateProgress();
        
        // Restore UI state
        Object.keys(this.exercises).forEach(num => {
          if (this.exercises[num].completed) {
            const exercise = document.querySelector(`[data-exercise="${num}"]`);
            exercise.classList.add('completed');
            this.showCompletionAnimation(parseInt(num));
          }
        });
      } catch (e) {
        console.log('Could not restore tutorial progress');
      }
    }
  }
  
  saveProgress() {
    // Save progress to localStorage
    const progress = {
      exercises: this.exercises,
      totalComments: this.totalComments,
      startTime: this.startTime
    };
    localStorage.setItem('drawbridge-tutorial-progress', JSON.stringify(progress));
  }
}

// Additional utility functions for the demo

function copyToClipboard(text) {
  navigator.clipboard.writeText(text).then(() => {
    tutorial.showMessage('Copied to clipboard!');
  });
}

function openCursorGuide() {
  const modal = document.createElement('div');
  modal.className = 'cursor-guide-modal';
  modal.innerHTML = `
    <div class="modal-overlay" onclick="this.parentElement.remove()">
      <div class="modal-content" onclick="event.stopPropagation()">
        <div class="modal-header">
          <h3>Finding Your Tasks in Cursor</h3>
          <button class="modal-close" onclick="this.closest('.cursor-guide-modal').remove()">×</button>
        </div>
        <div class="modal-body">
          <div class="guide-step">
            <h4>1. Open File Explorer</h4>
            <p>In Cursor, look at your file explorer on the left side</p>
          </div>
          <div class="guide-step">
            <h4>2. Find .moat Directory</h4>
            <p>Look for a folder called <code>.moat</code> in your project root</p>
          </div>
          <div class="guide-step">
            <h4>3. Open moat-tasks.md</h4>
            <p>Inside the .moat folder, you'll find <code>moat-tasks.md</code> with all your comments</p>
          </div>
          <div class="guide-step">
            <h4>4. Search Alternative</h4>
            <p>Use <kbd>Cmd+Shift+F</kbd> (Mac) or <kbd>Ctrl+Shift+F</kbd> (Windows) and search for "moat-tasks"</p>
          </div>
        </div>
      </div>
    </div>
  `;
  
  // Add modal styles
  modal.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 2000;
  `;
  
  document.body.appendChild(modal);
}

// Scroll animations
function setupScrollAnimations() {
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('fade-in');
      }
    });
  }, observerOptions);
  
  // Observe all main sections
  document.querySelectorAll('section').forEach(section => {
    observer.observe(section);
  });
  
  // Observe exercise cards
  document.querySelectorAll('.exercise-card').forEach(card => {
    observer.observe(card);
  });
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  // Initialize tutorial system
  window.tutorial = new DrawbridgeTutorial();
  
  // Setup scroll animations
  setupScrollAnimations();
  
  // Add welcome message
  setTimeout(() => {
    tutorial.showMessage('Welcome to the Drawbridge tutorial! Press C to enter comment mode and start with Exercise 1.');
  }, 1000);
  
  // Save progress periodically
  setInterval(() => {
    tutorial.saveProgress();
  }, 10000); // Save every 10 seconds
  
  // Add keyboard shortcuts help
  document.addEventListener('keydown', (e) => {
    if (e.key === '?' && e.shiftKey) {
      tutorial.showMessage('Keyboard shortcuts: Press C for comment mode, ? for help, Cmd+Shift+F to search in Cursor');
    }
  });
});

// Handle page visibility changes to pause/resume timer
document.addEventListener('visibilitychange', () => {
  if (window.tutorial) {
    if (document.hidden) {
      tutorial.pauseTime = Date.now();
    } else if (tutorial.pauseTime) {
      const pauseDuration = Date.now() - tutorial.pauseTime;
      tutorial.startTime += pauseDuration;
      tutorial.pauseTime = null;
    }
  }
});

// Export for potential external use
window.DrawbridgeTutorial = DrawbridgeTutorial; 