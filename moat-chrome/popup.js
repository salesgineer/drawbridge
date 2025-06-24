// Moat Chrome Extension - Popup Script

document.addEventListener('DOMContentLoaded', async () => {
  // Get current tab
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  
  // Check if we're on localhost
  if (!tab.url || (!tab.url.includes('localhost') && !tab.url.includes('127.0.0.1'))) {
    document.body.innerHTML = `
      <div style="padding: 20px; text-align: center;">
        <p style="margin: 0 0 10px 0;">Moat only works on localhost</p>
        <small style="color: #666;">Navigate to a local React/Next.js app</small>
      </div>
    `;
    return;
  }

  // Automatically open Moat sidebar when popup is opened
  console.log('Popup: Auto-opening Moat sidebar');
  chrome.tabs.sendMessage(tab.id, { action: 'toggleMoat' }, (response) => {
    console.log('Popup: Moat sidebar opened:', response);
    // Close popup immediately after triggering sidebar
    window.close();
  });
}); 