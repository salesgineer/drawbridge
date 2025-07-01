// Drawbridge Interactive Demo JavaScript

document.addEventListener('DOMContentLoaded', function() {
  // Initialize demo functionality
  initNavigation();
  initExerciseTracking();
  initDemoInteractions();
  initProgressTracking();
  initSmoothAnimations();
});

// Navigation functionality
function initNavigation() {
  const navButtons = document.querySelectorAll('.nav-button');
  const sections = document.querySelectorAll('.demo-section');
  
  navButtons.forEach(button => {
    button.addEventListener('click', () => {
      const targetId = button.getAttribute('data-target');
      const targetSection = document.getElementById(targetId);
      
      if (targetSection) {
        // Update active nav button
        navButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        
        // Smooth scroll to section
        targetSection.scrollIntoView({ 
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });
  
  // Set initial active nav button based on scroll position
  updateActiveNavOnScroll();
}

// Update active navigation based on scroll position
function updateActiveNavOnScroll() {
  const sections = document.querySelectorAll('.demo-section');
  const navButtons = document.querySelectorAll('.nav-button');
  
  window.addEventListener('scroll', () => {
    let current = '';
    sections.forEach(section => {
      const sectionTop = section.offsetTop - 100;
      if (window.pageYOffset >= sectionTop) {
        current = section.getAttribute('id');
      }
    });
    
    navButtons.forEach(button => {
      button.classList.remove('active');
      if (button.getAttribute('data-target') === current) {
        button.classList.add('active');
      }
    });
  });
}

// Exercise tracking functionality
function initExerciseTracking() {
  const exercises = [
    { id: 'color-button', exerciseId: 'exercise-1' },
    { id: 'welcome-message', exerciseId: 'exercise-2' },
    { id: 'profile-card', exerciseId: 'exercise-3' }
  ];
  
  // Track which exercises have been interacted with
  let completedExercises = new Set();
  
  exercises.forEach(exercise => {
    const element = document.getElementById(exercise.id);
    const exerciseCard = document.getElementById(exercise.exerciseId);
    
    if (element && exerciseCard) {
      element.addEventListener('click', () => {
        // Mark exercise as completed
        if (!completedExercises.has(exercise.exerciseId)) {
          completedExercises.add(exercise.exerciseId);
          markExerciseCompleted(exerciseCard);
          updateProgressBar(completedExercises.size);
          
          // Add highlight effect
          element.classList.add('highlighted');
          
          // Show completion feedback
          showCompletionFeedback(exercise.exerciseId);
        }
      });
    }
  });
}

// Mark exercise as completed
function markExerciseCompleted(exerciseCard) {
  exerciseCard.classList.add('completed');
  const status = exerciseCard.querySelector('.exercise-status');
  if (status) {
    status.textContent = 'Completed';
  }
  
  // Add fade-in animation to make it feel responsive
  exerciseCard.style.transform = 'scale(1.02)';
  setTimeout(() => {
    exerciseCard.style.transform = 'scale(1)';
  }, 200);
}

// Update progress bar
function updateProgressBar(completedCount) {
  const progressFill = document.getElementById('progress-fill');
  const completedText = document.getElementById('completed-exercises');
  const totalExercises = 3;
  
  if (progressFill && completedText) {
    const percentage = (completedCount / totalExercises) * 100;
    progressFill.style.width = `${percentage}%`;
    completedText.textContent = completedCount;
    
    // Add celebration effect when all exercises are complete
    if (completedCount === totalExercises) {
      showCelebrationEffect();
    }
  }
}

// Show completion feedback
function showCompletionFeedback(exerciseId) {
  const messages = {
    'exercise-1': '🎨 Great! You\'ve learned how to request color changes.',
    'exercise-2': '📝 Awesome! Text and content updates are easy with Drawbridge.',
    'exercise-3': '🎯 Perfect! You\'ve mastered element repositioning.'
  };
  
  const message = messages[exerciseId];
  if (message) {
    showNotification(message, 'success');
  }
}

// Show celebration effect
function showCelebrationEffect() {
  const progressSection = document.querySelector('.progress-section');
  if (progressSection) {
    progressSection.style.background = 'linear-gradient(135deg, #DCFCE7, #BBF7D0)';
    progressSection.style.border = '1px solid #16A34A';
    
    // Add confetti effect
    createConfetti();
    
    setTimeout(() => {
      showNotification('🎉 Congratulations! You\'ve completed all exercises. Ready to try Drawbridge on your own project?', 'celebration');
    }, 500);
  }
}

// Simple confetti effect
function createConfetti() {
  const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];
  const confettiCount = 50;
  
  for (let i = 0; i < confettiCount; i++) {
    const confetti = document.createElement('div');
    confetti.style.position = 'fixed';
    confetti.style.width = '10px';
    confetti.style.height = '10px';
    confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
    confetti.style.left = Math.random() * 100 + '%';
    confetti.style.top = '-10px';
    confetti.style.opacity = '0.8';
    confetti.style.borderRadius = '50%';
    confetti.style.pointerEvents = 'none';
    confetti.style.zIndex = '9999';
    
    document.body.appendChild(confetti);
    
    // Animate confetti falling
    const animation = confetti.animate([
      { transform: 'translateY(0) rotate(0deg)', opacity: 0.8 },
      { transform: `translateY(${window.innerHeight + 20}px) rotate(720deg)`, opacity: 0 }
    ], {
      duration: 3000 + Math.random() * 2000,
      easing: 'cubic-bezier(0.5, 0, 0.5, 1)'
    });
    
    animation.onfinish = () => confetti.remove();
  }
}

// Demo interactions and visual effects
function initDemoInteractions() {
  // Add hover effects to demo elements
  const demoElements = document.querySelectorAll('.demo-button, .demo-message, .demo-profile-card');
  
  demoElements.forEach(element => {
    element.addEventListener('mouseenter', () => {
      element.style.cursor = 'pointer';
    });
    
    element.addEventListener('mouseleave', () => {
      element.style.cursor = 'default';
    });
  });
  
  // Setup button interactions
  const setupButtons = document.querySelectorAll('.setup-button');
  setupButtons.forEach(button => {
    button.addEventListener('click', (e) => {
      e.preventDefault();
      const buttonText = button.textContent.trim();
      
      if (buttonText.includes('Install Extension')) {
        showNotification('🚀 In a real setup, this would open the Chrome Web Store or installation guide.', 'info');
      } else if (buttonText.includes('Setup Guide')) {
        showNotification('📚 This would open detailed setup instructions for connecting Drawbridge to your project.', 'info');
      }
    });
  });
}

// Progress tracking and animations
function initProgressTracking() {
  // Intersection Observer for fade-in animations
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
  
  // Observe exercise cards and feature cards
  const animatedElements = document.querySelectorAll('.exercise-card, .feature-card, .setup-step');
  animatedElements.forEach(el => {
    observer.observe(el);
  });
}

// Smooth animations and transitions
function initSmoothAnimations() {
  // Add stagger delay to feature cards
  const featureCards = document.querySelectorAll('.feature-card');
  featureCards.forEach((card, index) => {
    card.style.animationDelay = `${index * 0.1}s`;
  });
  
  // Add stagger delay to exercise cards
  const exerciseCards = document.querySelectorAll('.exercise-card');
  exerciseCards.forEach((card, index) => {
    card.style.animationDelay = `${index * 0.2}s`;
  });
}

// Notification system
function showNotification(message, type = 'info') {
  // Remove existing notifications
  const existingNotification = document.querySelector('.demo-notification');
  if (existingNotification) {
    existingNotification.remove();
  }
  
  const notification = document.createElement('div');
  notification.className = `demo-notification ${type}`;
  notification.innerHTML = `
    <div class="notification-content">
      <span class="notification-message">${message}</span>
      <button class="notification-close" onclick="this.parentElement.parentElement.remove()">×</button>
    </div>
  `;
  
  // Add notification styles
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: ${type === 'success' ? '#DCFCE7' : type === 'celebration' ? '#FEF3C7' : '#EFF6FF'};
    color: ${type === 'success' ? '#16A34A' : type === 'celebration' ? '#D97706' : '#3B82F6'};
    border: 1px solid ${type === 'success' ? '#BBF7D0' : type === 'celebration' ? '#FDE68A' : '#BFDBFE'};
    border-radius: 8px;
    padding: 16px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    z-index: 10000;
    max-width: 400px;
    animation: slideInFromRight 0.3s ease;
    font-family: 'Space Grotesk', sans-serif;
    font-size: 14px;
    line-height: 1.5;
  `;
  
  const notificationContent = notification.querySelector('.notification-content');
  notificationContent.style.cssText = `
    display: flex;
    align-items: flex-start;
    gap: 12px;
  `;
  
  const closeButton = notification.querySelector('.notification-close');
  closeButton.style.cssText = `
    background: none;
    border: none;
    font-size: 18px;
    cursor: pointer;
    color: currentColor;
    opacity: 0.7;
    padding: 0;
    line-height: 1;
  `;
  
  document.body.appendChild(notification);
  
  // Auto-remove after 5 seconds
  setTimeout(() => {
    if (notification && notification.parentNode) {
      notification.style.animation = 'slideOutToRight 0.3s ease forwards';
      setTimeout(() => notification.remove(), 300);
    }
  }, 5000);
}

// Add CSS animations for notifications
const style = document.createElement('style');
style.textContent = `
  @keyframes slideInFromRight {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
  
  @keyframes slideOutToRight {
    from {
      transform: translateX(0);
      opacity: 1;
    }
    to {
      transform: translateX(100%);
      opacity: 0;
    }
  }
`;
document.head.appendChild(style); 