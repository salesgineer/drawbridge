// Moat Chrome Extension - Popup Script

document.addEventListener('DOMContentLoaded', async () => {
  const toggleMoatBtn = document.getElementById('toggleMoat');
  const exportBtn = document.getElementById('exportAnnotations');
  const queueCount = document.getElementById('queueCount');
  const emptyState = document.getElementById('emptyState');
  const queueState = document.getElementById('queueState');
  const protocolStatus = document.getElementById('protocolStatus');

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

  // Get queue status from content script
  chrome.tabs.sendMessage(tab.id, { action: 'getQueueStatus' }, (response) => {
    if (response) {
      updateQueueDisplay(response.count);
      
      // Update project connection status
      if (protocolStatus) {
        protocolStatus.innerHTML = `
          <span class="protocol-indicator ${response.projectConnected ? 'connected' : 'disconnected'}"></span>
          <span class="protocol-label">Project ${response.projectConnected ? 'Connected' : 'Not Connected'}</span>
        `;
        protocolStatus.style.display = 'flex';
      }
    }
  });

  // Update queue display
  function updateQueueDisplay(count) {
    if (count > 0) {
      queueCount.textContent = count;
      emptyState.style.display = 'none';
      queueState.style.display = 'block';
    } else {
      emptyState.style.display = 'block';
      queueState.style.display = 'none';
    }
  }

  // Toggle Moat
  toggleMoatBtn.addEventListener('click', async () => {
    console.log('Popup: Toggle Moat button clicked');
    chrome.tabs.sendMessage(tab.id, { action: 'toggleMoat' }, (response) => {
      console.log('Popup: Response from content script:', response);
    });
    window.close();
  });

  // Export annotations
  exportBtn.addEventListener('click', async () => {
    chrome.tabs.sendMessage(tab.id, { action: 'exportAnnotations' });
  });
}); 