// Demo Page JavaScript

// Smooth scrolling for navigation links
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

// Handle email form submission
const emailForm = document.querySelector('.email-form');
emailForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const emailInput = document.querySelector('.email-input');
    const email = emailInput.value;
    
    // Simple validation
    if (email && email.includes('@')) {
        alert(`Thanks for subscribing with: ${email}`);
        emailInput.value = '';
    } else {
        alert('Please enter a valid email address');
    }
});

// Handle button clicks
document.querySelectorAll('.btn').forEach(button => {
    button.addEventListener('click', function(e) {
        // Skip if it's the submit button (handled by form)
        if (this.classList.contains('btn-submit')) return;
        
        // Add ripple effect
        const ripple = document.createElement('span');
        ripple.classList.add('ripple');
        this.appendChild(ripple);
        
        // Remove ripple after animation
        setTimeout(() => ripple.remove(), 600);
        
        // Log button clicks for demo
        console.log(`Button clicked: ${this.textContent}`);
    });
});

// Add hover effect to feature cards
const featureCards = document.querySelectorAll('.feature-card');
featureCards.forEach(card => {
    card.addEventListener('mouseenter', function() {
        this.style.backgroundColor = '#f3f4f6';
    });
    
    card.addEventListener('mouseleave', function() {
        this.style.backgroundColor = '#f9fafb';
    });
});

// Log page interactions for Float testing
document.body.addEventListener('click', (e) => {
    const element = e.target;
    const tagName = element.tagName.toLowerCase();
    const className = element.className;
    const text = element.textContent.trim().substring(0, 50);
    
    console.log(`Clicked: ${tagName}${className ? '.' + className : ''} - "${text}"`);
});

// Display Float hint on page load (console only)
window.addEventListener('load', () => {
    console.log('%c🎯 Moat Demo Page Ready!', 'font-size: 16px; font-weight: bold; color: #3b82f6;');
    console.log('%cPress "f" to enter Moat comment mode and click any element to annotate it.', 'font-size: 14px; color: #666;');
});

// Add CSS for ripple effect
const style = document.createElement('style');
style.textContent = `
    .btn {
        position: relative;
        overflow: hidden;
    }
    
    .ripple {
        position: absolute;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.5);
        transform: scale(0);
        animation: ripple 0.6s ease-out;
        pointer-events: none;
    }
    
    @keyframes ripple {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
    

`;
document.head.appendChild(style); 