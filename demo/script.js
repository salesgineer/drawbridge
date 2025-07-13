// Simple demo functionality for Drawbridge setup guide

document.addEventListener('DOMContentLoaded', function() {
  // Initialize demo
  initializeDemo();
  
  // Add click handlers for demo elements
  addDemoInteractions();
  
  // Add helpful console logs for debugging
  console.log('Drawbridge Demo loaded successfully');
  console.log('To activate commenting, ensure the Chrome extension is installed and press "C"');
});

function initializeDemo() {
  // Add visual indicators to demo elements
  const demoElements = document.querySelectorAll('.demo-button, .demo-card, .demo-form');
  
  demoElements.forEach(element => {
    // Add a subtle data attribute to help with debugging
    element.setAttribute('data-demo-element', 'true');
    
    // Add tooltip-like behavior for better UX
    element.addEventListener('mouseenter', function() {
      this.style.transition = 'transform 0.1s ease';
      this.style.transform = 'translateY(-1px)';
    });
    
    element.addEventListener('mouseleave', function() {
      this.style.transform = 'translateY(0)';
    });
  });
}

function addDemoInteractions() {
  // Primary button interaction
  const primaryButton = document.querySelector('.demo-button.primary');
  if (primaryButton) {
    primaryButton.addEventListener('click', function() {
      showDemoMessage('Click and describe changes like: "make this green" or "add more padding"');
    });
  }
  
  // Secondary button interaction
  const secondaryButton = document.querySelector('.demo-button.secondary');
  if (secondaryButton) {
    secondaryButton.addEventListener('click', function() {
      showDemoMessage('Try commenting: "change this to a different color" or "make this larger"');
    });
  }
  
  // Demo card interaction
  const demoCard = document.querySelector('.demo-card');
  if (demoCard) {
    demoCard.addEventListener('click', function() {
      showDemoMessage('Try: "add a shadow to this card" or "change the border radius"');
    });
  }
  
  // Demo form interaction
  const demoForm = document.querySelector('.demo-form');
  if (demoForm) {
    demoForm.addEventListener('click', function() {
      showDemoMessage('Try: "make the input border blue" or "add focus styles"');
    });
  }
}

function showDemoMessage(message) {
  // Create a temporary message to help users understand what they can do
  const existingMessage = document.querySelector('.demo-message-popup');
  if (existingMessage) {
    existingMessage.remove();
  }
  
  const messageElement = document.createElement('div');
  messageElement.className = 'demo-message-popup';
  messageElement.textContent = message;
  messageElement.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 1rem 1.5rem;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.2);
    z-index: 1000;
    max-width: 300px;
    font-size: 0.9rem;
    line-height: 1.4;
    animation: slideIn 0.3s ease;
  `;
  
  // Add animation keyframes
  if (!document.querySelector('#demo-animations')) {
    const style = document.createElement('style');
    style.id = 'demo-animations';
    style.textContent = `
      @keyframes slideIn {
        from {
          transform: translateX(100%);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }
      @keyframes slideOut {
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
  }
  
  document.body.appendChild(messageElement);
  
  // Auto-remove after 4 seconds
  setTimeout(() => {
    if (messageElement.parentNode) {
      messageElement.style.animation = 'slideOut 0.3s ease';
      setTimeout(() => {
        if (messageElement.parentNode) {
          messageElement.remove();
        }
      }, 300);
    }
  }, 4000);
}

// Check if Chrome extension is available
function checkExtensionStatus() {
  // This is a basic check - in a real implementation, you'd want to 
  // communicate with the extension to verify it's properly loaded
  const extensionIndicator = document.createElement('div');
  extensionIndicator.style.cssText = `
    position: fixed;
    bottom: 20px;
    left: 20px;
    background: #28a745;
    color: white;
    padding: 0.5rem 1rem;
    border-radius: 6px;
    font-size: 0.8rem;
    font-weight: 500;
    z-index: 1000;
  `;
  extensionIndicator.textContent = 'Demo ready - Press "C" to start commenting';
  
  document.body.appendChild(extensionIndicator);
  
  // Remove after 5 seconds
  setTimeout(() => {
    if (extensionIndicator.parentNode) {
      extensionIndicator.remove();
    }
  }, 5000);
}

// Initialize extension status check after a short delay
setTimeout(checkExtensionStatus, 1000);

// Keyboard shortcut hint
document.addEventListener('keydown', function(e) {
  if (e.key.toLowerCase() === 'c' && !e.ctrlKey && !e.metaKey) {
    // Show a hint that the extension should handle this
    showDemoMessage('Extension should activate commenting mode now. If nothing happens, check that the extension is installed and active.');
  }
});

// Smooth scrolling for any anchor links (if added later)
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      target.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  });
});

// Add some debugging helpers
window.drawbridgeDemo = {
  showMessage: showDemoMessage,
  checkExtension: checkExtensionStatus,
  version: '2.0.0'
};

// Log helpful information
console.log('Drawbridge Demo Functions:', window.drawbridgeDemo); 