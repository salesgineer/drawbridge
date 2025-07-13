// Drawbridge Tutorial Carousel Script
// Simplified step-by-step tutorial with carousel navigation

class DrawbridgeTutorial {
  constructor() {
    this.currentStep = 1;
    this.totalSteps = 3;
    this.steps = {
      1: { completed: false, comments: 0, required: 1 },
      2: { completed: false, comments: 0, required: 3 },
      3: { completed: false, comments: 0, required: 1 }
    };
    
    this.totalComments = 0;
    this.startTime = Date.now();
    
    this.init();
  }
  
  init() {
    this.setupCarousel();
    this.setupEventListeners();
    this.updateProgress();
    this.simulatePluginDetection();
    this.startTimeTracking();
  }
  
  setupCarousel() {
    // Initialize carousel
    this.track = document.getElementById('carousel-track');
    this.prevBtn = document.getElementById('prev-btn');
    this.nextBtn = document.getElementById('next-btn');
    this.stepDots = document.querySelectorAll('.step-dot');
    
    // Set initial state
    this.updateCarousel();
    this.updateNavigation();
  }
  
  setupEventListeners() {
    // Navigation buttons
    this.prevBtn.addEventListener('click', () => this.previousStep());
    this.nextBtn.addEventListener('click', () => this.nextStep());
    
    // Step dots
    this.stepDots.forEach((dot, index) => {
      dot.addEventListener('click', () => this.goToStep(index + 1));
    });
    
    // Keyboard shortcut demonstration
    document.addEventListener('keydown', (e) => {
      if (e.key === 'c' || e.key === 'C') {
        this.demonstrateCommentMode();
      }
    });
    
    // Exercise target click handlers
    document.getElementById('target-1').addEventListener('click', () => {
      this.handleStepInteraction(1);
    });
    
    document.getElementById('target-2').addEventListener('click', () => {
      this.handleStepInteraction(2);
    });
    
    document.getElementById('target-3').addEventListener('click', () => {
      this.handleStepInteraction(3);
    });
    
    // Demo button interaction
    const demoButton = document.querySelector('.demo-button');
    if (demoButton) {
      demoButton.addEventListener('click', () => {
        // Just visual feedback, no notification
      });
    }
  }
  
  demonstrateCommentMode() {
    // Simulate entering comment mode
    document.body.style.cursor = 'crosshair';
    
    // Add visual feedback to current step's demo area
    const currentDemoArea = document.querySelector(`#target-${this.currentStep}`);
    if (currentDemoArea) {
      currentDemoArea.classList.add('comment-mode');
    }
    
    // Reset after 3 seconds
    setTimeout(() => {
      document.body.style.cursor = 'default';
      document.querySelectorAll('.demo-area').forEach(area => {
        area.classList.remove('comment-mode');
      });
    }, 3000);
  }
  
  handleStepInteraction(stepNum) {
    if (stepNum !== this.currentStep) return;
    
    this.steps[stepNum].comments++;
    this.totalComments++;
    
    // Check if step requirements are met
    if (this.steps[stepNum].comments >= this.steps[stepNum].required) {
      this.completeStep(stepNum);
    }
    
    this.updateProgress();
    this.updateStepStatus(stepNum);
  }
  
  completeStep(stepNum) {
    if (this.steps[stepNum].completed) return;
    
    this.steps[stepNum].completed = true;
    
    // Update UI
    const slide = document.querySelector(`[data-step="${stepNum}"] .slide-content`);
    const status = document.getElementById(`status-${stepNum}`);
    const stepDot = document.querySelector(`[data-step="${stepNum}"]`);
    
    if (slide) slide.classList.add('completed');
    if (status) status.innerHTML = '<span class="status-text">Completed!</span>';
    if (stepDot) stepDot.classList.add('completed');
    
    // Add completion animation
    this.showCompletionAnimation(stepNum);
    
    // Auto-advance to next step if not the last one
    if (stepNum < this.totalSteps) {
      setTimeout(() => {
        this.nextStep();
      }, 1500);
    } else {
      // All steps completed
      this.showFinalCompletion();
    }
    
    this.updateNavigation();
  }
  
  updateStepStatus(stepNum) {
    const status = document.getElementById(`status-${stepNum}`);
    if (!status || this.steps[stepNum].completed) return;
    
    const comments = this.steps[stepNum].comments;
    const required = this.steps[stepNum].required;
    
    if (stepNum === 1) {
      if (comments > 0) {
        status.innerHTML = '<span class="status-text">Great! You made your first comment!</span>';
      }
    } else if (stepNum === 2) {
      if (comments === 1) {
        status.innerHTML = '<span class="status-text">Good! Try other elements too</span>';
      } else if (comments === 2) {
        status.innerHTML = '<span class="status-text">Nice! One more comment</span>';
      }
    } else if (stepNum === 3) {
      if (comments > 0) {
        status.innerHTML = '<span class="status-text">Perfect! Check Cursor for your tasks</span>';
      }
    }
  }
  
  showCompletionAnimation(stepNum) {
    const stepDot = document.querySelector(`[data-step="${stepNum}"]`);
    if (stepDot) {
      stepDot.style.transform = 'scale(1.1)';
      setTimeout(() => {
        stepDot.style.transform = 'scale(1)';
      }, 200);
    }
  }
  
     showFinalCompletion() {
     // Completion section removed - just log completion
     console.log('🎉 All tutorial steps completed!');
   }
  
  nextStep() {
    if (this.currentStep < this.totalSteps) {
      // Only allow next if current step is completed or it's the first interaction
      if (this.steps[this.currentStep].completed || this.steps[this.currentStep].comments === 0) {
        this.currentStep++;
        this.updateCarousel();
        this.updateNavigation();
      }
    }
  }
  
  previousStep() {
    if (this.currentStep > 1) {
      this.currentStep--;
      this.updateCarousel();
      this.updateNavigation();
    }
  }
  
  goToStep(stepNum) {
    // Only allow going to completed steps or the next step
    if (stepNum <= this.currentStep || this.steps[stepNum - 1]?.completed) {
      this.currentStep = stepNum;
      this.updateCarousel();
      this.updateNavigation();
    }
  }
  
  updateCarousel() {
    // Update slide visibility
    document.querySelectorAll('.carousel-slide').forEach((slide, index) => {
      slide.classList.toggle('active', index + 1 === this.currentStep);
    });
    
    // Update transform (for future animation if needed)
    if (this.track) {
      this.track.style.transform = `translateX(-${(this.currentStep - 1) * 100}%)`;
    }
    
    // Update step indicators
    this.stepDots.forEach((dot, index) => {
      dot.classList.toggle('active', index + 1 === this.currentStep);
    });
    
    // Update progress text
    const progressText = document.getElementById('progress-text');
    if (progressText) {
      progressText.textContent = `Step ${this.currentStep} of ${this.totalSteps}`;
    }
    
    // Update progress bar
    const progressFill = document.getElementById('carousel-progress');
    if (progressFill) {
      const progressPercent = (this.currentStep / this.totalSteps) * 100;
      progressFill.style.width = `${progressPercent}%`;
    }
  }
  
  updateNavigation() {
    // Update previous button
    this.prevBtn.disabled = this.currentStep === 1;
    
    // Update next button
    const isLastStep = this.currentStep === this.totalSteps;
    const currentStepCompleted = this.steps[this.currentStep].completed;
    
    if (isLastStep) {
      this.nextBtn.style.display = currentStepCompleted ? 'none' : 'flex';
      this.nextBtn.innerHTML = '<span>Complete</span><span>→</span>';
    } else {
      this.nextBtn.style.display = 'flex';
      this.nextBtn.innerHTML = '<span>Next</span><span>→</span>';
    }
    
    // Enable/disable next based on current step progress
    this.nextBtn.disabled = false; // Always allow next for now
  }
  
     updateProgress() {
     const completedSteps = Object.values(this.steps).filter(step => step.completed).length;
     
     // Completion stats section removed - just track internally
     console.log(`Progress: ${completedSteps}/3 steps, ${this.totalComments} comments`);
     
     // Update time spent
     this.updateTimeSpent();
   }
  
     updateTimeSpent() {
     const timeSpent = Math.floor((Date.now() - this.startTime) / 60000); // minutes
     // Time element removed - just track internally
     console.log(`Time spent: ${timeSpent}m`);
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
    if (!statusIndicator) return;
    
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
  
  // Disabled notification system
  showMessage(text, type = 'info') {
    // Notifications disabled per user request
    return;
  }
}

// Utility functions
function copyToClipboard(text) {
  navigator.clipboard.writeText(text);
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
  
  // Observe main sections
  document.querySelectorAll('section').forEach(section => {
    observer.observe(section);
  });
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  // Initialize tutorial system
  window.tutorial = new DrawbridgeTutorial();
  
  // Setup scroll animations
  setupScrollAnimations();
  
  // Save progress periodically (simplified)
  setInterval(() => {
    // Could implement localStorage saving here if needed
  }, 30000);
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