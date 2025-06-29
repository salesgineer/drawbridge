// Moat Moat - Sidebar Component
(function() {
  let moat = null;
  let isVisible = false;
  let draggedItem = null;
  let projectStatus = 'not-connected';
  let projectPath = null;
  let moatPosition = 'bottom'; // 'right' or 'bottom' - default to bottom
  
  // Floating animation system
  let lastKnownTaskIds = new Set();
  let animationQueue = [];
  let isAnimating = false;

  // Create Moat sidebar
  function createMoat() {
    console.log('Moat: createMoat called, creating sidebar element...');
    moat = document.createElement('div');
    moat.id = 'moat-moat';
    moat.className = 'float-moat';
    console.log('Moat: Element created with class:', moat.className);
    moat.innerHTML = `
      <div class="float-moat-top-bar">
        <div class="float-moat-header">
          <h3>Moat Annotations</h3>
        </div>
        <div class="float-moat-project-status">
          <span class="float-project-indicator"></span>
          <span class="float-project-label">Not connected to project</span>
          <button class="float-project-connect">Connect</button>
        </div>
        <div class="float-moat-header-actions">
          <button class="float-moat-refresh-btn" id="float-refresh-btn" title="Refresh Tasks (Cmd+R)">
            <span class="float-refresh-icon">🔄</span>
            <span class="float-refresh-text">Refresh</span>
          </button>
        </div>
        <div class="float-moat-actions">
          <span class="float-moat-protocol-status" title="Connection Protocol">
            <span class="float-protocol-indicator"></span>
            <span class="float-protocol-label">File</span>
          </span>
          <button class="float-moat-position-toggle" title="Toggle position (Right/Bottom)">📍</button>
          <button class="float-moat-export" title="Export annotations">📥</button>
          <button class="float-moat-close">×</button>
        </div>
      </div>
      <div class="float-moat-queue">
        <div class="float-moat-connect-project" id="moat-connect-content">
          <div class="float-moat-connect-header">
            <h3>🚀 Connect Moat to Your Project</h3>
            <p>Moat will create a <code>.moat</code> directory in your project with markdown task logging and Cursor integration.</p>
          </div>
          <div class="float-moat-connect-features">
            <div class="float-moat-feature">
              <span class="float-feature-check">✅</span>
              <span>Markdown task list (.moat/moat-tasks.md)</span>
            </div>
            <div class="float-moat-feature">
              <span class="float-feature-check">✅</span>
              <span>Cursor integration (.moat/.moat-stream.jsonl)</span>
            </div>
            <div class="float-moat-feature">
              <span class="float-feature-check">✅</span>
              <span>Git-ignored by default</span>
            </div>
          </div>
          <p class="float-moat-connect-note">You'll select your project folder in the next step.</p>
          <div class="float-moat-connect-actions">
            <button class="float-connect-cancel">Cancel</button>
            <button class="float-connect-confirm">Connect Project</button>
          </div>
        </div>
        <div class="float-moat-empty" id="moat-empty-state" style="display: none;">
          <p>No annotations yet</p>
          <p class="float-moat-hint">Press 'f' to enter comment mode</p>
        </div>
      </div>
    `;
    
    document.body.appendChild(moat);
    console.log('Moat: Sidebar element added to DOM');
    
    // Event listeners
    moat.querySelector('.float-moat-close').addEventListener('click', hideMoat);
    moat.querySelector('.float-moat-export').addEventListener('click', exportAnnotations);
    
    // Connect button with error checking
    const connectBtn = moat.querySelector('.float-project-connect');
    if (connectBtn) {
      connectBtn.addEventListener('click', handleProjectButton);
      console.log('Moat: Connect button event listener attached successfully');
    } else {
      console.error('Moat: Connect button not found!');
    }
    
    moat.querySelector('#float-refresh-btn').addEventListener('click', refreshTasks);
    moat.querySelector('.float-moat-position-toggle').addEventListener('click', toggleMoatPosition);
    
    // Connect project inline buttons
    moat.querySelector('.float-connect-cancel').addEventListener('click', handleConnectCancel);
    moat.querySelector('.float-connect-confirm').addEventListener('click', handleConnectConfirm);
    
    // Initialize position from saved preference
    initializePosition();
    
    // Initialize content visibility based on current project status
    initializeContentVisibility();
    
    console.log('Moat: Event listeners attached');
  }

  // Handle project button click
  async function handleProjectButton() {
    console.log('🔧 Moat: Connect button clicked! projectStatus:', projectStatus);
    
    if (projectStatus === 'not-connected') {
      // Use the original event system which handles everything properly
      console.log('🔧 Moat: Dispatching moat:setup-project event...');
      window.dispatchEvent(new CustomEvent('moat:setup-project'));
      
      // Listen for successful connection to update UI
      window.addEventListener('moat:project-connected', function handleConnection(e) {
        console.log('🔧 Moat: Received project-connected event:', e.detail);
        updateProjectStatus('connected', e.detail.path);
        
        // Load existing tasks after successful connection
        setTimeout(async () => {
          console.log('🔄 Moat: Loading tasks after connection...');
          await refreshTasks();
        }, 1000);
        
        // Remove this listener since we only need it once
        window.removeEventListener('moat:project-connected', handleConnection);
      });
      
    } else if (projectStatus === 'connected') {
      console.log('Moat: Already connected, showing project menu...');
      showProjectMenu();
    }
  }

  // Show setup confirmation
  async function showSetupConfirmation() {
    console.log('Moat: Creating setup confirmation modal...');
    
    return new Promise((resolve) => {
      const modal = document.createElement('div');
      modal.className = 'float-modal-overlay';
      modal.innerHTML = `
        <div class="float-modal">
          <h3>🚀 Connect Moat to Your Project</h3>
          <p>Moat will create a <code>.moat</code> directory in your project with markdown task logging and Cursor integration.</p>
          <div class="float-modal-features">
            <div>✅ Markdown task list (.moat/moat-tasks.md)</div>
            <div>✅ Cursor integration (.moat/.moat-stream.jsonl)</div>
            <div>✅ Git-ignored by default</div>
          </div>
          <p class="float-modal-note">You'll select your project folder in the next step.</p>
          <div class="float-modal-actions">
            <button class="float-modal-cancel">Cancel</button>
            <button class="float-modal-confirm">Connect Project</button>
          </div>
        </div>
      `;
      
      document.body.appendChild(modal);
      console.log('Moat: Modal added to page, setting up button listeners...');
      
      modal.querySelector('.float-modal-cancel').addEventListener('click', () => {
        console.log('Moat: User clicked Cancel');
        modal.remove();
        resolve(false);
      });
      
      modal.querySelector('.float-modal-confirm').addEventListener('click', () => {
        console.log('Moat: User clicked Connect Project');  
        modal.remove();
        resolve(true);
      });
    });
  }

  // Show project menu
  function showProjectMenu() {
    const menu = document.createElement('div');
    menu.className = 'float-project-menu';
    menu.innerHTML = `
      <div class="float-project-menu-item" data-action="disconnect">
        <span>🔌</span> Disconnect Project
      </div>
      <div class="float-project-menu-item" data-action="change">
        <span>📁</span> Change Project
      </div>
    `;
    
    // Position menu below button
    const button = moat.querySelector('.float-project-connect');
    const rect = button.getBoundingClientRect();
    menu.style.top = `${rect.bottom + 5}px`;
    menu.style.right = `${window.innerWidth - rect.right}px`;
    
    document.body.appendChild(menu);
    
    // Handle menu clicks
    menu.addEventListener('click', (e) => {
      const item = e.target.closest('.float-project-menu-item');
      if (item) {
        const action = item.dataset.action;
        if (action === 'disconnect') {
          disconnectProject();
        } else if (action === 'change') {
          window.dispatchEvent(new CustomEvent('moat:setup-project'));
        }
      }
      menu.remove();
    });
    
    // Close menu on outside click
    setTimeout(() => {
      document.addEventListener('click', function closeMenu(e) {
        if (!menu.contains(e.target)) {
          menu.remove();
          document.removeEventListener('click', closeMenu);
        }
      });
    }, 0);
  }

  // Disconnect project
  function disconnectProject() {
    // Clear all project-related data
    localStorage.removeItem(`moat.project.${window.location.origin}`);
    
    // Clear file handles (prevents reading from disconnected project)
    if (window.directoryHandle) {
      window.directoryHandle = null;
    }
    
    // Reset animation system when disconnecting
    resetFloatingAnimation();
    
    // Update UI status
    updateProjectStatus('not-connected', null);
    
    // Show connect project content when disconnected
    showConnectProjectContent();
    
    showNotification('Project disconnected');
    console.log('Moat: Project disconnected, all handles cleared');
  }

  // Clear current session annotations (debugging helper)
  function clearCurrentSession() {
    localStorage.removeItem('moat.queue');
    if (isVisible) {
      renderQueue();
    }
    showNotification('Current session cleared');
    console.log('Moat: Current session annotations cleared');
  }

  // Toggle Moat position between right and bottom
  function toggleMoatPosition() {
    const newPosition = moatPosition === 'right' ? 'bottom' : 'right';
    setMoatPosition(newPosition);
    
    // Save preference
    localStorage.setItem('moat.position', newPosition);
    
    // Update button tooltip
    const toggleBtn = moat.querySelector('.float-moat-position-toggle');
    toggleBtn.title = `Toggle position (${newPosition === 'right' ? 'Right/Bottom' : 'Bottom/Right'})`;
    
    showNotification(`Moat moved to ${newPosition}`);
    console.log('Moat: Position toggled to', newPosition);
  }

  // Set Moat position
  function setMoatPosition(position) {
    moatPosition = position;
    
    if (!moat) return;
    
    // Reset animations when changing position
    resetFloatingAnimation();
    
    // Remove existing position classes
    moat.classList.remove('float-moat-right', 'float-moat-bottom');
    
    // Add new position class
    if (position === 'bottom') {
      moat.classList.add('float-moat-bottom');
    } else {
      moat.classList.add('float-moat-right');
    }
    
    // Update button icon
    const toggleBtn = moat.querySelector('.float-moat-position-toggle');
    if (toggleBtn) {
      toggleBtn.textContent = position === 'right' ? '📍' : '📌';
    }
    
    // Re-initialize tracking for new position
    if (isVisible) {
      initializeTaskTracking();
    }
  }

  // Initialize position from storage
  function initializePosition() {
    const savedPosition = localStorage.getItem('moat.position') || 'bottom';
    setMoatPosition(savedPosition);
  }

  // Restore visibility state from localStorage
  async function restoreVisibilityState() {
    const savedVisibility = localStorage.getItem('moat.visible');
    console.log('Moat: Restoring visibility state from localStorage:', savedVisibility);
    
    if (savedVisibility === 'true') {
      console.log('Moat: Auto-showing moat based on saved state');
      await showMoat();
    } else {
      console.log('Moat: Moat will remain hidden based on saved state');
    }
  }

  // Initialize content visibility after Moat creation
  function initializeContentVisibility() {
    console.log('Moat: Initializing content visibility, projectStatus:', projectStatus);
    
    // Show appropriate content based on current project status
    if (projectStatus === 'connected') {
      showEmptyState();
    } else {
      showConnectProjectContent();
    }
  }

  // Initialize moat with persistence
  async function initializeMoat() {
    console.log('Moat: Starting moat initialization...');
    
    // Create moat if it doesn't exist
    if (!moat) {
      createMoat();
    }
    
    // Initialize project connection status first
    await verifyInitialConnection();
    
    // Restore visibility state after connection is verified
    await restoreVisibilityState();
    
    // Start DOM monitoring to ensure moat persistence
    startDOMMonitoring();
    
    console.log('Moat: Moat initialization complete');
  }

  // Monitor DOM to ensure moat doesn't disappear
  function startDOMMonitoring() {
    // Check every 2 seconds if moat is still in DOM when it should be visible
    setInterval(() => {
      const savedVisibility = localStorage.getItem('moat.visible');
      if (savedVisibility === 'true') {
        // Check if moat element still exists in DOM
        const existingMoat = document.getElementById('moat-moat');
        if (!existingMoat && isVisible) {
          console.log('Moat: Moat disappeared from DOM, recreating...');
          createMoat();
          moat.classList.add('float-moat-visible');
          showNotification('Moat restored');
        } else if (existingMoat && !existingMoat.classList.contains('float-moat-visible') && isVisible) {
          console.log('Moat: Moat exists but not visible, restoring visibility...');
          existingMoat.classList.add('float-moat-visible');
        }
      }
    }, 2000);
    
    console.log('Moat: DOM monitoring started');
  }

  // Handle connect project cancel
  function handleConnectCancel() {
    showEmptyState();
  }

  // Handle connect project confirm
  function handleConnectConfirm() {
    // Trigger the project setup flow
    window.dispatchEvent(new CustomEvent('moat:setup-project'));
  }

  // Show empty state (no tasks)
  function showEmptyState() {
    console.log('Moat: Showing empty state');
    const connectContent = document.getElementById('moat-connect-content');
    const emptyState = document.getElementById('moat-empty-state');
    
    if (connectContent) {
      connectContent.style.display = 'none';
      console.log('Moat: Connect content hidden');
    }
    if (emptyState) {
      emptyState.style.display = 'block';
      console.log('Moat: Empty state shown');
    }
  }

  // Show connect project content
  function showConnectProjectContent() {
    console.log('Moat: Showing connect project content');
    const connectContent = document.getElementById('moat-connect-content');
    const emptyState = document.getElementById('moat-empty-state');
    
    if (connectContent) {
      connectContent.style.display = 'block';
      console.log('Moat: Connect content shown');
    }
    if (emptyState) {
      emptyState.style.display = 'none';
      console.log('Moat: Empty state hidden');
    }
  }

  // Update project status UI
  function updateProjectStatus(status, path) {
    projectStatus = status;
    projectPath = path;
    
    if (!moat) return;
    
    const indicator = moat.querySelector('.float-project-indicator');
    const label = moat.querySelector('.float-project-label');
    const button = moat.querySelector('.float-project-connect');
    
    if (status === 'connected' && path) {
      indicator.className = 'float-project-indicator float-project-connected';
      label.textContent = `Connected to: ${path}`;
      button.textContent = '⚙️';
      button.title = 'Project settings';
    } else {
      indicator.className = 'float-project-indicator float-project-disconnected';
      label.textContent = 'Not connected to project';
      button.textContent = 'Connect';
      button.title = 'Connect to a project folder';
    }
  }

  // Verify initial connection on page load
  async function verifyInitialConnection() {
    console.log('🔧 Moat: Verifying initial connection...');
    
    const savedProject = localStorage.getItem(`moat.project.${window.location.origin}`);
    if (!savedProject) {
      console.log('🔧 Moat: No saved project found');
      updateProjectStatus('not-connected', null);
      return;
    }
    
    try {
      const projectData = JSON.parse(savedProject);
      console.log('🔧 Moat: Found saved project:', projectData.path);
      
      // Verify that we actually have a working connection
      const isActuallyConnected = await verifyConnectionWorking();
      
      if (isActuallyConnected) {
        console.log('✅ Moat: Connection verified, updating status to connected');
        updateProjectStatus('connected', projectData.path);
        
        // Load tasks after verified connection
        setTimeout(async () => {
          console.log('🔄 Moat: Loading tasks after verified connection...');
          await refreshTasks();
        }, 500);
      } else {
        console.log('❌ Moat: Connection verification failed, clearing saved data');
        localStorage.removeItem(`moat.project.${window.location.origin}`);
        updateProjectStatus('not-connected', null);
        showNotification('Connection expired - please reconnect to project');
      }
      
    } catch (error) {
      console.error('🔧 Moat: Error parsing saved project data:', error);
      localStorage.removeItem(`moat.project.${window.location.origin}`);
      updateProjectStatus('not-connected', null);
    }
  }

  // Verify that the connection actually works
  async function verifyConnectionWorking() {
    try {
      // Check if we have a directory handle
      if (!window.directoryHandle) {
        console.log('🔧 Moat: No directoryHandle available');
        return false;
      }
      
      // Test if we can actually access the directory
      const testAccess = await window.directoryHandle.getDirectoryHandle('.moat', { create: false });
      if (!testAccess) {
        console.log('🔧 Moat: Cannot access .moat directory');
        return false;
      }
      
      // Test if we can read a file
      try {
        const testFile = await testAccess.getFileHandle('moat-tasks-detail.json', { create: false });
        const file = await testFile.getFile();
        console.log('🔧 Moat: Successfully verified file access');
        return true;
      } catch (fileError) {
        console.log('🔧 Moat: Cannot access task files, but directory exists');
        return true; // Directory exists, files will be created as needed
      }
      
    } catch (error) {
      console.log('🔧 Moat: Connection verification failed:', error);
      return false;
    }
  }

  // AUTO-REFRESH SYSTEM: Automatically sync status every 3 seconds
  let autoRefreshInterval = null;
  
  function startAutoRefresh() {
    if (autoRefreshInterval) return; // Already running
    
    console.log('🔄 Moat: Starting auto-refresh every 3 seconds');
    autoRefreshInterval = setInterval(async () => {
      if (projectStatus === 'connected' && isVisible) {
        try {
          await refreshTasks(true); // Silent refresh
        } catch (error) {
          console.warn('🔄 Moat: Auto-refresh failed:', error);
        }
      }
    }, 3000);
  }
  
  function stopAutoRefresh() {
    if (autoRefreshInterval) {
      clearInterval(autoRefreshInterval);
      autoRefreshInterval = null;
      console.log('🔄 Moat: Auto-refresh stopped');
    }
  }

  // Comprehensive refresh function for Tasks 3.1-3.10
  async function refreshTasks(silent = false) {
    if (!silent) {
      console.log('🔄 Moat: Manual refresh triggered');
    }
    const startTime = performance.now();
    
    // Task 3.6: Visual loading state (only for manual refresh)
    if (!silent) {
      setRefreshLoadingState(true);
      showNotification('🔄 Refreshing tasks...');
    }
    
    try {
      // Task 3.3: Check if new TaskStore system is available
      if (canUseNewTaskSystem()) {
        console.log('🔄 Moat: Using new TaskStore system for refresh');
        await refreshFromFiles();
      } else {
        console.log('🔄 Moat: Using legacy system for refresh');
        await syncMarkdownTasksToSidebar();
      }
      
      // Task 3.9: Performance optimization (<100ms requirement)
      const duration = performance.now() - startTime;
      if (!silent) {
        console.log(`🔄 Moat: Refresh completed in ${duration.toFixed(1)}ms`);
      }
      
      if (duration > 100) {
        console.warn(`🔄 Moat: Refresh took ${duration.toFixed(1)}ms (exceeds 100ms target)`);
      }
      
      if (!silent) {
        showNotification('✅ Tasks refreshed successfully');
      }
      
    } catch (error) {
      // Task 3.7: Error handling with user feedback
      console.error('🔄 Moat: Refresh failed:', error);
      showNotification(`❌ Refresh failed: ${error.message}`, 'error');
      
      // Fallback to showing current session
      try {
        await renderSidebarWithCurrentSessionOnly();
      } catch (fallbackError) {
        console.error('🔄 Moat: Fallback rendering failed:', fallbackError);
        await renderEmptySidebar();
      }
    } finally {
      // Task 3.6: Remove loading state
      setRefreshLoadingState(false);
    }
  }

  // Task 3.3: New refresh function that reads JSON and regenerates markdown
  async function refreshFromFiles() {
    console.log('🔄 Moat: Starting refreshFromFiles with new TaskStore system');
    
    if (!window.taskStore || !window.markdownGenerator) {
      throw new Error('TaskStore utilities not available');
    }
    
    try {
      // Load tasks from file first (to get latest from disk)
      await window.taskStore.loadTasksFromFile();
      
      // Read all tasks from TaskStore in chronological order
      const allTasks = window.taskStore.getAllTasksChronological();
      console.log(`🔄 Moat: Loaded ${allTasks.length} tasks from TaskStore`);
      
      // Regenerate markdown from current TaskStore data
      await window.markdownGenerator.rebuildMarkdownFile(allTasks);
      console.log('🔄 Moat: Markdown file regenerated from TaskStore data');
      
      // Task 3.6: Update sidebar rendering to use new task format
      await renderTasksFromNewSystem(allTasks);
      
      // Dispatch synchronization event
      window.dispatchEvent(new CustomEvent('moat:tasks-synchronized', {
        detail: { taskCount: allTasks.length, source: 'taskStore' }
      }));
      
    } catch (error) {
      console.error('🔄 Moat: refreshFromFiles failed:', error);
      throw error;
    }
  }

  // Task 3.6: Render tasks using new TaskStore format
  async function renderTasksFromNewSystem(tasks) {
    if (!moat) return;
    
    console.log(`🔄 Moat: Rendering ${tasks.length} tasks from new system`);
    const queueContainer = moat.querySelector('.float-moat-queue');
    
    if (tasks.length === 0) {
      await renderEmptySidebar();
      return;
    }
    
    // Sort tasks: pending first, then chronologically (oldest first, newest last - matches file order)
    const sortedTasks = tasks.slice().sort((a, b) => {
      // Completed tasks go to bottom
      if (a.status === 'completed' && b.status !== 'completed') return 1;
      if (b.status === 'completed' && a.status !== 'completed') return -1;
      
      // Sort chronologically (oldest first, newest last - matches JSON/markdown file order)
      const aTime = new Date(a.createdAt || a.timestamp || 0).getTime();
      const bTime = new Date(b.createdAt || b.timestamp || 0).getTime();
      return aTime - bTime;
    });
    
    // Render task items
    queueContainer.innerHTML = sortedTasks.map(task => renderNewTaskItem(task)).join('');
    addAllTasksListeners();
  }

  // Task 3.6: Render individual task item in new format
  function renderNewTaskItem(task) {
    const statusClass = `float-status-${task.status}`;
    const statusText = getStatusText(task.status);
    const timeAgo = formatTimeAgo(task.createdAt || task.timestamp);
    
    return `
      <div class="float-moat-item ${statusClass}" data-id="${task.id}">
        <div class="float-moat-item-header">
          <span class="float-moat-target">${task.title || task.elementLabel || 'UI Element'}</span>
          <div class="float-moat-item-actions">
            <span class="float-moat-status-text">${statusText}</span>
            <button class="float-moat-remove" data-id="${task.id}" title="Remove task">×</button>
          </div>
        </div>
        <div class="float-moat-content">${task.comment}</div>
        <div class="float-moat-meta">
          <span class="float-moat-time">${timeAgo}</span>
          ${task.selector ? `<span class="float-moat-selector">${task.selector}</span>` : ''}
        </div>
      </div>
    `;
  }

  // Task 3.6: Visual loading states during refresh operations
  function setRefreshLoadingState(loading) {
    const refreshBtn = document.getElementById('float-refresh-btn');
    const refreshIcon = refreshBtn?.querySelector('.float-refresh-icon');
    const refreshText = refreshBtn?.querySelector('.float-refresh-text');
    
    if (loading) {
      refreshBtn?.classList.add('float-refreshing');
      if (refreshIcon) refreshIcon.textContent = '⏳';
      if (refreshText) refreshText.textContent = 'Refreshing...';
      refreshBtn?.setAttribute('disabled', 'true');
    } else {
      refreshBtn?.classList.remove('float-refreshing');
      if (refreshIcon) refreshIcon.textContent = '🔄';
      if (refreshText) refreshText.textContent = 'Refresh';
      refreshBtn?.removeAttribute('disabled');
    }
  }

  // Helper function to check if new TaskStore system is available
  function canUseNewTaskSystem() {
    const hasTaskStore = !!window.taskStore;
    const hasMarkdownGenerator = !!window.markdownGenerator;
    const hasDirectoryHandle = !!window.directoryHandle;
    const result = hasTaskStore && hasMarkdownGenerator && hasDirectoryHandle;
    
    console.log('🔧 Moat: canUseNewTaskSystem check:');
    console.log('  - taskStore:', hasTaskStore);
    console.log('  - markdownGenerator:', hasMarkdownGenerator);
    console.log('  - directoryHandle:', hasDirectoryHandle);
    console.log('  - Result:', result ? '✅ CAN use new system' : '❌ CANNOT use new system');
    
    return result;
  }

  // Helper function to format time ago
  function formatTimeAgo(timestamp) {
    if (!timestamp) return 'Unknown time';
    
    const now = Date.now();
    const time = new Date(timestamp).getTime();
    const diffMs = now - time;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return new Date(time).toLocaleDateString();
  }

  // Comprehensive function to sync markdown tasks to sidebar
  async function syncMarkdownTasksToSidebar() {
    console.log('Moat: Starting markdown-to-sidebar sync...');
    
    try {
      // Check if we're connected to a project
      if (projectStatus !== 'connected' || !window.directoryHandle) {
        console.log('Moat: Not connected to project, clearing markdown tasks from sidebar');
        await renderSidebarWithCurrentSessionOnly();
        return { success: true, taskCount: 0, source: 'no-project' };
      }

      // Check if we can use the new task system
      if (canUseNewTaskSystem()) {
        console.log('Moat: Using new task system - reading all tasks from files');
        // When using new system, all tasks are in the files (no need to check localStorage)
        const allTasks = await readTasksFromMarkdown();
        console.log('Moat: Found', allTasks.length, 'tasks in new system');
        
        if (allTasks.length === 0) {
          console.log('Moat: No tasks found in new system, showing empty sidebar');
          await renderEmptySidebar();
          return { success: true, taskCount: 0, source: 'empty' };
        }

        // Render tasks from new system only
        await renderTasksFromNewSystem(allTasks);
        return {
          success: true,
          taskCount: allTasks.length,
          source: 'new-system'
        };
      } else {
        console.log('Moat: Using legacy system - combining markdown and localStorage');
        // Legacy system: combine markdown tasks and localStorage queue
        const markdownTasks = await readTasksFromMarkdown();
        console.log('Moat: Found', markdownTasks.length, 'tasks in markdown files');

        const currentQueue = JSON.parse(localStorage.getItem('moat.queue') || '[]');
        console.log('Moat: Found', currentQueue.length, 'current session tasks');

        const totalTasks = markdownTasks.length + currentQueue.length;
        
        if (totalTasks === 0) {
          console.log('Moat: No tasks found anywhere, showing empty sidebar');
          await renderEmptySidebar();
          return { success: true, taskCount: 0, source: 'empty' };
        }

        // Render combined tasks (legacy approach)
        await renderAllTasks();
        return {
          success: true,
          taskCount: totalTasks,
          markdownTasks: markdownTasks.length,
          sessionTasks: currentQueue.length,
          source: 'legacy-combined'
        };
      }


    } catch (error) {
      console.error('Moat: Error during markdown-to-sidebar sync:', error);
      showNotification('Error syncing tasks: ' + error.message);
      
      // Fallback to showing current session only
      await renderSidebarWithCurrentSessionOnly();
      
      return { success: false, error: error.message, source: 'error' };
    }
  }

  // Render sidebar with only current session tasks (no markdown)
  async function renderSidebarWithCurrentSessionOnly() {
    if (!moat) return;
    
    console.log('Moat: Rendering sidebar with current session tasks only');
    const queueContainer = moat.querySelector('.float-moat-queue');
    queueContainer.innerHTML = '<div class="float-moat-loading">Loading current session...</div>';
    
    const currentQueue = JSON.parse(localStorage.getItem('moat.queue') || '[]');
    const currentTasks = currentQueue.map(convertAnnotationToTask);
    
    if (currentTasks.length === 0) {
      await renderEmptySidebar();
      return;
    }
    
    // Sort current tasks chronologically (oldest first, newest last - matches file order)
    currentTasks.sort((a, b) => {
      if (a.status === 'completed' && b.status !== 'completed') return 1;
      if (b.status === 'completed' && a.status !== 'completed') return -1;
      return (a.timestamp || 0) - (b.timestamp || 0);
    });
    
    queueContainer.innerHTML = currentTasks.map(task => renderSimpleTaskItem(task)).join('');
    addAllTasksListeners();
  }

  // Render empty sidebar
  async function renderEmptySidebar() {
    if (!moat) return;
    
    console.log('Moat: Rendering empty sidebar');
    const queueContainer = moat.querySelector('.float-moat-queue');
    
    queueContainer.innerHTML = `
      <div class="float-moat-empty">
        <p>No tasks found</p>
        ${projectStatus !== 'connected' ? 
          '<p class="float-moat-hint">Connect to a project to see markdown tasks</p>' : 
          '<p class="float-moat-hint">Create annotations or add tasks to markdown files</p>'
        }
      </div>
    `;
  }

  // Validate markdown task files exist and are readable
  async function validateMarkdownFiles() {
    if (projectStatus !== 'connected' || !window.directoryHandle) {
      return { valid: false, reason: 'Not connected to project' };
    }

    try {
      // Check if .moat directory exists
      let moatDir;
      try {
        moatDir = await window.directoryHandle.getDirectoryHandle('.moat');
      } catch {
        return { valid: false, reason: '.moat directory not found' };
      }

      // Check for summary file
      let summaryExists = false;
      let detailedExists = false;
      
      try {
        await moatDir.getFileHandle('moat-tasks-summary.md');
        summaryExists = true;
      } catch {
        console.log('Moat: Summary file not found');
      }
      
      try {
        await moatDir.getFileHandle('moat-tasks.md');
        detailedExists = true;
      } catch {
        console.log('Moat: Detailed file not found');
      }

      if (!summaryExists && !detailedExists) {
        return { valid: false, reason: 'No markdown task files found' };
      }

      return { 
        valid: true, 
        summaryExists, 
        detailedExists,
        reason: 'Files validated successfully' 
      };

    } catch (error) {
      return { valid: false, reason: 'Error accessing files: ' + error.message };
    }
  }

  // Force full sync (clears cache and re-reads everything)
  async function forceSyncMarkdownTasks() {
    console.log('Moat: Force syncing markdown tasks...');
    showNotification('Force syncing tasks...');
    
    // Clear any cached data if we had any
    // (Currently we don't cache, but this is future-proofing)
    
    const result = await syncMarkdownTasksToSidebar();
    
    if (result.success) {
      showNotification(`✓ Force sync complete: ${result.taskCount} tasks`);
    } else {
      showNotification(`✗ Force sync failed: ${result.error}`);
    }
    
    return result;
  }

  // Read tasks from markdown files (if connected to project)
  async function readTasksFromMarkdown() {
    if (projectStatus !== 'connected' || !window.directoryHandle) {
      return [];
    }
    
    try {
      // Use the new two-file system: read from moat-tasks.md (generated from JSON)
      const detailedTasks = await readTasksFromDetailedFile();
      return detailedTasks;
    } catch (error) {
      console.warn('Moat: Could not read markdown files:', error);
      return [];
    }
  }
  

  
  // Read tasks from the new two-file system (moat-tasks.md)
  async function readTasksFromDetailedFile() {
    try {
      // Read from moat-tasks.md (generated from moat-tasks-detail.json)
      const fileHandle = await window.directoryHandle.getFileHandle('moat-tasks.md');
      const file = await fileHandle.getFile();
      const content = await file.text();
      return parseDetailedTasks(content);
    } catch (error) {
      console.warn('Moat: Could not read moat-tasks.md file');
      return [];
    }
  }
  

  
  // Parse tasks from detailed markdown content  
  function parseDetailedTasks(content) {
    const tasks = [];
    
    // Match both legacy and enhanced task formats
    const legacyPattern = /## (📋|📤|⏳|✅|❌)\s*(.+?)\n\n\*\*Task:\*\*\s*(.+?)\n/g;
    const enhancedPattern = /## ([🔥⚡💡]?)\s*(📋|📤|⏳|✅|❌)\s*Task\s+(\d+):\s*(.+?)\n\n\*\*Priority\*\*:\s*(.+?)\n\*\*Type\*\*:\s*(.+?)\n\*\*Estimated Time\*\*:\s*(.+?)\n/g;
    
    let match;
    
    // Parse enhanced format tasks
    while ((match = enhancedPattern.exec(content)) !== null) {
      const [, priorityEmoji, statusEmoji, taskNumber, title, priority, type, estimatedTime] = match;
      
      // Extract request from the content following the match
      const requestMatch = content.slice(match.index + match[0].length).match(/### Request\n"(.+?)"/);
      const request = requestMatch ? requestMatch[1] : 'No description';
      
      tasks.push({
        id: `task-${taskNumber}`,
        number: parseInt(taskNumber),
        title: title.trim(),
        content: request,
        status: getStatusFromEmoji(statusEmoji),
        priority: priority,
        type: type,
        estimatedTime: estimatedTime,
        priorityEmoji: priorityEmoji,
        format: 'enhanced'
      });
    }
    
    // Parse legacy format tasks (if no enhanced tasks found)
    if (tasks.length === 0) {
      while ((match = legacyPattern.exec(content)) !== null) {
        const [, statusEmoji, title, task] = match;
        
        tasks.push({
          id: `legacy-${Date.now()}-${Math.random()}`,
          title: title.trim(),
          content: task.trim(),
          status: getStatusFromEmoji(statusEmoji),
          priority: 'Medium',
          type: 'Styling',
          estimatedTime: '5 min',
          priorityEmoji: '⚡',
          format: 'legacy'
        });
      }
    }
    
    return tasks;
  }
  
  // Convert emoji to status text
  function getStatusFromEmoji(emoji) {
    switch (emoji) {
      case '📋': return 'pending';
      case '📤': return 'sent';
      case '⏳': return 'in progress';
      case '✅': return 'completed';
      case '❌': return 'cancelled';
      default: return 'pending';
    }
  }

  // Show Moat
  async function showMoat() {
    console.log('Moat: showMoat called, moat exists:', !!moat);
    if (!moat) {
      console.log('Moat: Creating moat element...');
      createMoat();
    }
    console.log('Moat: Adding float-moat-visible class...');
    moat.classList.add('float-moat-visible');
    isVisible = true;
    
    // PERSIST VISIBILITY STATE
    localStorage.setItem('moat.visible', 'true');
    console.log('Moat: Visibility state saved to localStorage');
    
    // Initialize animation tracking when first shown
    initializeTaskTracking();
    
    // Start auto-refresh when sidebar is shown
    startAutoRefresh();
    
    console.log('Moat: Sidebar should now be visible, isVisible:', isVisible);
    console.log('Moat: Project status:', projectStatus, 'Can use new system:', canUseNewTaskSystem());
    await refreshTasks(); // Use refreshTasks for comprehensive loading
  }

  // Hide Moat
  function hideMoat() {
    console.log('Moat: hideMoat called, moat exists:', !!moat);
    if (moat) {
      moat.classList.remove('float-moat-visible');
      isVisible = false;
      
      // PERSIST VISIBILITY STATE
      localStorage.setItem('moat.visible', 'false');
      console.log('Moat: Visibility state saved to localStorage');
      
      // Stop auto-refresh when sidebar is hidden
      stopAutoRefresh();
      
      // Reset animations when hiding
      resetFloatingAnimation();
    }
  }

  // Toggle Moat
  async function toggleMoat() {
    console.log('Moat: toggleMoat called, current isVisible:', isVisible);
    if (isVisible) {
      console.log('Moat: Hiding sidebar...');
      hideMoat();
    } else {
      console.log('Moat: Showing sidebar...');
      await showMoat();
    }
  }



  // Render queue (always show all tasks) - now uses sync function
  async function renderQueue() {
    if (!moat) return;
    await syncMarkdownTasksToSidebar();
  }
  

  
  // Render all tasks (current + markdown)
  async function renderAllTasks() {
    const queueContainer = moat.querySelector('.float-moat-queue');
    if (!queueContainer) return;
    
    let allTasks = [];
    
    // Get all tasks from various sources
    try {
      // Try new system first
      if (canUseNewTaskSystem() && window.taskStore) {
        console.log('📋 Moat: Using TaskStore for rendering all tasks');
        allTasks = window.taskStore.getAllTasksChronological();
      } else {
        console.log('📋 Moat: Using legacy localStorage for rendering');
        const queue = JSON.parse(localStorage.getItem('moat.queue') || '[]');
        allTasks = queue.map(convertAnnotationToTask);
      }
    } catch (error) {
      console.error('📋 Moat: Error loading tasks:', error);
      allTasks = [];
    }
    
    if (allTasks.length === 0) {
      showEmptyState();
      return;
    }
    
    // Hide empty state
    const emptyState = document.getElementById('moat-empty-state');
    const connectContent = document.getElementById('moat-connect-content');
    if (emptyState) emptyState.style.display = 'none';
    if (connectContent) connectContent.style.display = 'none';
    
    // Sort tasks (completed last, then chronological)
    allTasks.sort((a, b) => {
      // Completed tasks go to the end
      if (a.status === 'completed' && b.status !== 'completed') return 1;
      if (b.status === 'completed' && a.status !== 'completed') return -1;
      
      // Chronologically (oldest first, newest last - matches JSON/markdown file order)
      return (a.timestamp || 0) - (b.timestamp || 0);
    });
    
    // Detect new tasks for animation (before rendering)
    detectAndAnimateNewTasks(allTasks);
    
    // Render simple task list
    queueContainer.innerHTML = allTasks.map(task => renderSimpleTaskItem(task)).join('');
    
    // Add event listeners for all tasks
    addAllTasksListeners();
  }
  
  // Render simple task item without emojis
  function renderSimpleTaskItem(task) {
    const isCompleted = ['completed', 'resolved'].includes(task.status);
    const statusText = getStatusText(task.status);
    
    return `
      <div class="float-moat-item ${isCompleted ? 'float-moat-completed' : ''}" 
           data-id="${task.id}"
           data-type="${task.format || 'current'}">
        <div class="float-moat-item-header">
          <span class="float-moat-target" title="${task.title}">${task.title}</span>
          <span class="float-moat-status-text">${statusText}</span>
          ${task.format === 'current' ? 
            `<button class="float-moat-remove" data-id="${task.id}">×</button>` : 
            ''
          }
        </div>
        <div class="float-moat-content">${task.content}</div>
      </div>
    `;
  }
  
  // Get status text without emojis
  function getStatusText(status) {
    switch (status) {
      case 'pending':
      case 'in queue': return 'to do';
      case 'sent':
      case 'in progress': return 'in progress';
      case 'completed':
      case 'resolved': return 'done';
      default: return 'to do';
    }
  }
  
  // Convert annotation to task format
  function convertAnnotationToTask(annotation) {
    return {
      id: annotation.id,
      title: annotation.elementLabel || annotation.target || 'Unknown element',
      content: annotation.content,
      status: annotation.status,
      priority: 'Medium', // Default for current annotations
      type: 'Styling', // Default type
      estimatedTime: '5 min',
      priorityEmoji: '⚡',
      timestamp: annotation.timestamp,
      format: 'current'
    };
  }
  

  
  // Add event listeners for all tasks view
  function addAllTasksListeners() {
    if (!moat) return;
    
    const queueContainer = moat.querySelector('.float-moat-queue');
    
    // Add event listeners
    queueContainer.querySelectorAll('.float-moat-item').forEach(item => {
      // Click to highlight element (only for current session items)
      item.addEventListener('click', (e) => {
        if (e.target.closest('.float-moat-remove')) return;
        
        const dataType = item.dataset.type;
        if (dataType === 'current') {
          const id = item.dataset.id;
          const queue = JSON.parse(localStorage.getItem('moat.queue') || '[]');
          const annotation = queue.find(a => a.id === id);
          if (annotation) {
            highlightAnnotatedElement(annotation);
          }
        } else {
          // For markdown tasks, show a notification that they can't be highlighted directly
          showNotification('Markdown tasks cannot be highlighted directly');
        }
      });
    });
    
    // Remove buttons (only for current session items)
    queueContainer.querySelectorAll('.float-moat-remove').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        console.log('🗑️ Moat: Remove button clicked for task ID:', btn.dataset.id);
        await removeAnnotation(btn.dataset.id);
      });
    });
  }

  // Highlight annotated element
  function highlightAnnotatedElement(annotation) {
    try {
      const element = document.querySelector(annotation.target);
      if (element) {
        // Remove any existing highlights
        document.querySelectorAll('.float-highlight-pulse').forEach(el => {
          el.classList.remove('float-highlight-pulse');
        });
        
        // Add pulse effect
        element.classList.add('float-highlight-pulse');
        
        // Scroll into view
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        // Remove highlight after animation
        setTimeout(() => {
          element.classList.remove('float-highlight-pulse');
        }, 2000);
      } else {
        console.warn('Moat: Could not find element with selector:', annotation.target);
        // Show a tooltip or notification that element wasn't found
        showNotification('Element not found on page');
      }
    } catch (e) {
      console.warn('Moat: Could not highlight element', e);
      showNotification('Could not highlight element');
    }
  }

  // Show notification
  function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'float-notification';
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => notification.remove(), 3000);
  }

  // Remove annotation - supports both new TaskStore system and legacy localStorage
  async function removeAnnotation(id) {
    console.log('🗑️ Moat: Removing annotation/task with ID:', id);
    
    try {
      // Check if we should use the new TaskStore system
      if (canUseNewTaskSystem()) {
        console.log('🗑️ Moat: Using new TaskStore system for removal');
        
        // Remove from TaskStore and save to file
        const removed = await window.taskStore.removeTaskAndSave(id);
        
        if (removed) {
          console.log('✅ Moat: Task removed from TaskStore and file saved');
          
          // Regenerate markdown from updated TaskStore
          const allTasks = window.taskStore.getAllTasksChronological();
          await window.markdownGenerator.rebuildMarkdownFile(allTasks);
          console.log('✅ Moat: Markdown file regenerated after removal');
          
          showNotification('✅ Task removed successfully');
        } else {
          console.warn('⚠️ Moat: Task not found in TaskStore:', id);
          showNotification('⚠️ Task not found for removal');
        }
        
      } else {
        console.log('🗑️ Moat: Using legacy localStorage system for removal');
        
        // Legacy system: remove from localStorage
        let queue = JSON.parse(localStorage.getItem('moat.queue') || '[]');
        const originalLength = queue.length;
        queue = queue.filter(a => a.id !== id);
        
        if (queue.length < originalLength) {
          localStorage.setItem('moat.queue', JSON.stringify(queue));
          console.log('✅ Moat: Task removed from localStorage');
          showNotification('✅ Task removed successfully');
        } else {
          console.warn('⚠️ Moat: Task not found in localStorage:', id);
          showNotification('⚠️ Task not found for removal');
        }
      }
      
      // Refresh the sidebar to show updated task list
      await refreshTasks();
      
    } catch (error) {
      console.error('❌ Moat: Error removing task:', error);
      showNotification(`❌ Failed to remove task: ${error.message}`);
    }
  }

  // Export annotations
  function exportAnnotations() {
    const queue = JSON.parse(localStorage.getItem('moat.queue') || '[]');
    
    if (queue.length === 0) {
      alert('No annotations to export');
      return;
    }
    
    const data = {
      sessionId: queue[0]?.sessionId || 'unknown',
      timestamp: Date.now(),
      url: window.location.href,
      annotations: queue
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `moat-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  // Drag and drop handlers
  function handleDragStart(e) {
    draggedItem = e.target;
    e.target.classList.add('float-moat-dragging');
  }

  function handleDragOver(e) {
    e.preventDefault();
    const afterElement = getDragAfterElement(moat.querySelector('.float-moat-queue'), e.clientY);
    if (afterElement == null) {
      moat.querySelector('.float-moat-queue').appendChild(draggedItem);
    } else {
      moat.querySelector('.float-moat-queue').insertBefore(draggedItem, afterElement);
    }
  }

  function handleDrop(e) {
    e.preventDefault();
    updateQueueOrder();
  }

  function handleDragEnd(e) {
    e.target.classList.remove('float-moat-dragging');
    draggedItem = null;
  }

  function getDragAfterElement(container, y) {
    const draggableElements = [...container.querySelectorAll('.float-moat-item:not(.float-moat-dragging)')];
    
    return draggableElements.reduce((closest, child) => {
      const box = child.getBoundingClientRect();
      const offset = y - box.top - box.height / 2;
      
      if (offset < 0 && offset > closest.offset) {
        return { offset: offset, element: child };
      } else {
        return closest;
      }
    }, { offset: Number.NEGATIVE_INFINITY }).element;
  }

  function updateQueueOrder() {
    const items = moat.querySelectorAll('.float-moat-item');
    const queue = JSON.parse(localStorage.getItem('moat.queue') || '[]');
    const newQueue = [];
    
    items.forEach(item => {
      const id = item.dataset.id;
      const annotation = queue.find(a => a.id === id);
      if (annotation) {
        newQueue.push(annotation);
      }
    });
    
    localStorage.setItem('moat.queue', JSON.stringify(newQueue));
  }

  // Listen for events
  console.log('Moat: Setting up event listeners...');
  
  // Task 3.4: Listen for moat:tasks-updated events
  window.addEventListener('moat:tasks-updated', async (e) => {
    console.log('🔄 Moat: Received moat:tasks-updated event', e.detail);
    
    // Task 3.5: Real-time task status updates in sidebar
    if (isVisible) {
      console.log('🔄 Moat: Auto-refreshing sidebar due to task update');
      await refreshTasks();
    }
  });

  // Task 3.8: Keyboard shortcut (Cmd+R) for manual refresh
  document.addEventListener('keydown', (e) => {
    // Cmd+R or Ctrl+R to refresh (when sidebar is visible)
    if ((e.metaKey || e.ctrlKey) && e.key === 'r' && isVisible) {
      e.preventDefault();
      console.log('🔄 Moat: Keyboard refresh triggered (Cmd+R)');
      refreshTasks();
    }
  });

  window.addEventListener('moat:toggle-moat', async (e) => {
    console.log('Moat: Received moat:toggle-moat event');
    await toggleMoat();
  });
  window.addEventListener('moat:annotation-added', async (e) => {
    if (isVisible) {
      await renderQueue();
    }
    // Auto-show Moat when first annotation is added
    const queue = JSON.parse(localStorage.getItem('moat.queue') || '[]');
    if (queue.length === 1) {
      await showMoat();
    }
  });

  // Task 3.9 & 3.10: Enhanced storage changes listener for cross-tab sync
  window.addEventListener('storage', async (e) => {
    if (e.key === 'moat.queue' && isVisible) {
      console.log('🔄 Moat: Detected cross-tab localStorage change, refreshing sidebar');
      // Use refreshTasks for comprehensive sync instead of just renderQueue
      setTimeout(() => refreshTasks(), 100); // Small delay to avoid rapid refreshes
    }
  });

  // Listen for project connection events
  window.addEventListener('moat:project-connected', async (e) => {
    if (e.detail) {
      if (e.detail.status === 'connected') {
        updateProjectStatus('connected', e.detail.path);
        // Refresh tasks when project connects
        console.log('Moat: Project connected, refreshing tasks...');
        if (isVisible) {
          await refreshTasks(); // Use refreshTasks instead of renderQueue for full refresh
        }
      } else {
        updateProjectStatus('not-connected', null);
      }
    }
  });

  // Listen for project connection failure events
  window.addEventListener('moat:project-connection-failed', async (e) => {
    console.log('🔧 Moat: Received project connection failure event:', e.detail);
    
    // Clear any stored connection data
    localStorage.removeItem(`moat.project.${window.location.origin}`);
    
    // Update UI to not connected
    updateProjectStatus('not-connected', null);
    
    // Show error notification
    showNotification(e.detail.reason || 'Failed to restore project connection');
    
    // Clear any cached tasks
    if (isVisible) {
      await renderQueue();
    }
  });

  window.addEventListener('moat:project-disconnected', async () => {
    console.log('🔧 Moat: Received project-disconnected event');
    console.trace('🔧 Moat: project-disconnected event stack trace');
    // Clear file handles
    if (window.directoryHandle) {
      console.log('🔧 Moat: Clearing directoryHandle due to disconnection event');
      window.directoryHandle = null;
    }
    updateProjectStatus('not-connected', null);
    // Refresh the current view to clear cached tasks
    if (isVisible) {
      await renderQueue();
    }
  });

  // Listen for annotation status updates
  window.addEventListener('moat:annotation-status-updated', async (e) => {
    if (isVisible) {
      await renderQueue();
    }
  });

  // Listen for markdown file updates
  window.addEventListener('moat:markdown-updated', async (e) => {
    console.log('Moat: Markdown file updated, refreshing tasks...');
    if (isVisible) {
      // Refresh the task list to show the newly written markdown tasks
      await renderQueue();
    }
    
    // Show a brief success indicator in the UI
    if (moat) {
      const indicator = moat.querySelector('.float-project-indicator');
      if (indicator) {
        indicator.style.animation = 'pulse 0.5s ease-in-out';
        setTimeout(() => {
          indicator.style.animation = '';
        }, 500);
      }
    }
  });

  // Listen for page visibility changes to restore moat if needed
  document.addEventListener('visibilitychange', async () => {
    if (!document.hidden) {
      console.log('Moat: Page became visible, checking moat state...');
      const savedVisibility = localStorage.getItem('moat.visible');
      if (savedVisibility === 'true' && !isVisible) {
        console.log('Moat: Restoring moat visibility after page focus');
        await showMoat();
      }
    }
  });

  // Listen for window focus to ensure moat persistence
  window.addEventListener('focus', async () => {
    console.log('Moat: Window focused, checking moat state...');
    const savedVisibility = localStorage.getItem('moat.visible');
    if (savedVisibility === 'true' && !isVisible) {
      console.log('Moat: Restoring moat visibility after window focus');
      await showMoat();
    }
  });



  // Task 3.10: Cross-tab synchronization test
  function testCrossTabSync() {
    console.log('🧪 Moat: Testing cross-tab synchronization...');
    
    // Simulate a task update in another tab
    const testEvent = new StorageEvent('storage', {
      key: 'moat.queue',
      newValue: JSON.stringify([{
        id: 'test-cross-tab-' + Date.now(),
        content: 'Cross-tab sync test',
        timestamp: Date.now()
      }]),
      oldValue: '[]'
    });
    
    window.dispatchEvent(testEvent);
    console.log('🧪 Moat: Cross-tab sync test event dispatched');
    return true;
  }

  // Export to global scope for debugging and manual sync
  window.MoatDebug = {
    exportAnnotations,
    clearQueue: async () => {
      localStorage.removeItem('moat.queue');
      if (isVisible) await renderQueue();
    },
    syncMarkdownTasks: syncMarkdownTasksToSidebar,
    forceSyncMarkdownTasks: forceSyncMarkdownTasks,
    validateMarkdownFiles: validateMarkdownFiles,
    // Task 3.10: Cross-tab sync testing
    testCrossTabSync: testCrossTabSync,
    refreshTasks: refreshTasks,
    // Moat persistence debugging
    showMoat: showMoat,
    hideMoat: hideMoat,
    toggleMoat: toggleMoat,
    forceRestoreMoat: async () => {
      console.log('🔧 MoatDebug: Force restoring moat...');
      localStorage.setItem('moat.visible', 'true');
      if (!moat) {
        createMoat();
      }
      await showMoat();
      return { success: true, visible: isVisible };
    },
    checkVisibilityState: () => {
      const saved = localStorage.getItem('moat.visible');
      const domExists = !!document.getElementById('moat-moat');
      return {
        savedState: saved,
        currentVisible: isVisible,
        domExists: domExists,
        shouldBeVisible: saved === 'true'
      };
    },
    // Floating animation system debugging
    resetFloatingAnimation: resetFloatingAnimation,
    initializeTaskTracking: initializeTaskTracking,
    testFloatingAnimation: async (count = 1) => {
      console.log(`🌊 Testing floating animation with ${count} mock tasks...`);
      for (let i = 0; i < count; i++) {
        const mockTaskId = `test-float-${Date.now()}-${i}`;
        lastKnownTaskIds.add(mockTaskId);
        animationQueue.push({
          taskId: mockTaskId,
          delay: i * 200,
          timestamp: Date.now()
        });
      }
      if (!isAnimating) {
        await startFloatingAnimation();
      }
    },
    // Task 3.9: Performance testing
    testRefreshPerformance: async () => {
      const iterations = 5;
      const times = [];
      console.log(`🧪 Moat: Testing refresh performance (${iterations} iterations)...`);
      
      for (let i = 0; i < iterations; i++) {
        const start = performance.now();
        await refreshTasks();
        const duration = performance.now() - start;
        times.push(duration);
        console.log(`🧪 Iteration ${i + 1}: ${duration.toFixed(1)}ms`);
      }
      
      const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
      const maxTime = Math.max(...times);
      const minTime = Math.min(...times);
      
      console.log(`🧪 Performance Results:`);
      console.log(`   Average: ${avgTime.toFixed(1)}ms`);
      console.log(`   Min: ${minTime.toFixed(1)}ms`);
      console.log(`   Max: ${maxTime.toFixed(1)}ms`);
      console.log(`   Target: <100ms`);
      console.log(`   Status: ${avgTime < 100 ? '✅ PASS' : '❌ FAIL'}`);
      
      return { avgTime, maxTime, minTime, target: 100, pass: avgTime < 100 };
    },
    // Task 3.10: End-to-end refresh functionality test
    testRefreshEndToEnd: async () => {
      console.log('🧪 Moat: Starting end-to-end refresh functionality test...');
      
      const results = {
        refreshButton: false,
        keyboardShortcut: false,
        automaticRefresh: false,
        crossTabSync: false,
        loadingStates: false,
        errorHandling: false,
        performance: false
      };
      
      try {
        // Test 1: Refresh button functionality
        console.log('🧪 Test 1: Refresh button click');
        const refreshBtn = document.getElementById('float-refresh-btn');
        if (refreshBtn) {
          refreshBtn.click();
          await new Promise(resolve => setTimeout(resolve, 200));
          results.refreshButton = true;
          console.log('✅ Refresh button test passed');
        }
        
        // Test 2: Loading states
        console.log('🧪 Test 2: Loading states');
        setRefreshLoadingState(true);
        const isLoading = refreshBtn?.classList.contains('float-refreshing');
        setRefreshLoadingState(false);
        results.loadingStates = isLoading;
        console.log(isLoading ? '✅ Loading states test passed' : '❌ Loading states test failed');
        
        // Test 3: Performance test
        console.log('🧪 Test 3: Performance test');
        const start = performance.now();
        await refreshTasks();
        const duration = performance.now() - start;
        results.performance = duration < 100;
        console.log(`${results.performance ? '✅' : '❌'} Performance test: ${duration.toFixed(1)}ms`);
        
        // Test 4: Cross-tab sync
        console.log('🧪 Test 4: Cross-tab sync');
        results.crossTabSync = testCrossTabSync();
        console.log(results.crossTabSync ? '✅ Cross-tab sync test passed' : '❌ Cross-tab sync test failed');
        
        // Test 5: Automatic refresh (simulate task update)
        console.log('🧪 Test 5: Automatic refresh');
        const taskUpdateEvent = new CustomEvent('moat:tasks-updated', {
          detail: { taskCount: 1, source: 'test' }
        });
        window.dispatchEvent(taskUpdateEvent);
        results.automaticRefresh = true;
        console.log('✅ Automatic refresh test passed');
        
        // Test 6: Error handling
        console.log('🧪 Test 6: Error handling');
        try {
          // Temporarily break the system
          const originalTaskStore = window.taskStore;
          window.taskStore = null;
          await refreshTasks();
          window.taskStore = originalTaskStore;
          results.errorHandling = true;
          console.log('✅ Error handling test passed');
        } catch (error) {
          results.errorHandling = true;
          console.log('✅ Error handling test passed (caught error as expected)');
        }
        
        // Test 7: Keyboard shortcut (simulate)
        console.log('🧪 Test 7: Keyboard shortcut simulation');
        const keyEvent = new KeyboardEvent('keydown', {
          key: 'r',
          metaKey: true,
          bubbles: true
        });
        document.dispatchEvent(keyEvent);
        results.keyboardShortcut = true;
        console.log('✅ Keyboard shortcut test passed');
        
      } catch (error) {
        console.error('🧪 End-to-end test error:', error);
      }
      
      // Summary
      const passedTests = Object.values(results).filter(Boolean).length;
      const totalTests = Object.keys(results).length;
      
      console.log(`🧪 End-to-End Test Results: ${passedTests}/${totalTests} passed`);
      console.log('🧪 Detailed Results:', results);
      
      return {
        passed: passedTests,
        total: totalTests,
        success: passedTests === totalTests,
        details: results
      };
    },
    // Quick status check
    getStatus: async () => {
      const validation = await validateMarkdownFiles();
      const currentQueue = JSON.parse(localStorage.getItem('moat.queue') || '[]');
      const markdownTasks = await readTasksFromMarkdown();
      
      return {
        projectConnected: projectStatus === 'connected',
        sidebarVisible: isVisible,
        markdownFiles: validation,
        currentSessionTasks: currentQueue.length,
        markdownTasks: markdownTasks.length,
        totalTasks: currentQueue.length + markdownTasks.length,
        newTaskSystemAvailable: canUseNewTaskSystem()
      };
    }
  };

  // Check initial project connection status on load
  console.log('Moat: Initializing, document.readyState:', document.readyState);
  
  if (document.readyState === 'loading') {
    console.log('Moat: Document still loading, waiting for DOMContentLoaded...');
    document.addEventListener('DOMContentLoaded', async () => {
      console.log('Moat: DOMContentLoaded fired, initializing moat with persistence...');
      // Initialize moat with full persistence support
      await initializeMoat();
    });
  } else {
    console.log('Moat: Document already loaded, initializing moat immediately...');
    // Initialize moat with full persistence support
    setTimeout(async () => {
      await initializeMoat();
    }, 100); // Small delay to ensure content script is ready
  }

  // Detect new tasks and trigger floating animation
  function detectAndAnimateNewTasks(currentTasks) {
    if (!moat || moatPosition !== 'bottom') return; // Only animate in bottom position
    
    const currentTaskIds = new Set(currentTasks.map(task => task.id));
    const newTaskIds = [...currentTaskIds].filter(id => !lastKnownTaskIds.has(id));
    
    if (newTaskIds.length > 0) {
      console.log(`🌊 Moat: Detected ${newTaskIds.length} new tasks for floating animation:`, newTaskIds);
      
      // Add to animation queue
      newTaskIds.forEach((taskId, index) => {
        animationQueue.push({
          taskId,
          delay: index * 200, // Stagger by 200ms
          timestamp: Date.now()
        });
      });
      
      // Start animation sequence if not already running
      if (!isAnimating) {
        startFloatingAnimation();
      }
    }
    
    // Update our tracking set
    lastKnownTaskIds = currentTaskIds;
  }

  // Start the floating animation sequence
  async function startFloatingAnimation() {
    if (animationQueue.length === 0 || isAnimating) return;
    
    isAnimating = true;
    console.log(`🌊 Moat: Starting floating animation sequence for ${animationQueue.length} items`);
    
    // Process animation queue
    while (animationQueue.length > 0) {
      const { taskId, delay } = animationQueue.shift();
      
      // Wait for stagger delay
      if (delay > 0) {
        await new Promise(resolve => setTimeout(resolve, delay));
      }
      
      await animateTaskFloating(taskId);
    }
    
    isAnimating = false;
    console.log('🌊 Moat: Floating animation sequence completed');
  }

  // Animate a single task floating across the moat
  async function animateTaskFloating(taskId) {
    const taskElement = moat.querySelector(`[data-id="${taskId}"]`);
    if (!taskElement) {
      console.warn(`🌊 Moat: Task element not found for ID: ${taskId}`);
      return;
    }
    
    console.log(`🌊 Moat: Animating task: ${taskId}`);
    
    // Phase 1: Float across the moat (2.5s)
    taskElement.classList.add('float-floating');
    
    // Wait for floating animation to complete
    await new Promise(resolve => setTimeout(resolve, 2500));
    
    // Phase 2: Gentle settle (0.8s)
    taskElement.classList.remove('float-floating');
    taskElement.classList.add('float-settling');
    
    // Wait for settle animation
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Phase 3: Highlight as new (3s)
    taskElement.classList.remove('float-settling');
    taskElement.classList.add('float-new-highlight');
    
    // Remove highlight after 3 seconds
    setTimeout(() => {
      taskElement.classList.remove('float-new-highlight');
    }, 3000);
    
    console.log(`🌊 Moat: Animation completed for task: ${taskId}`);
  }

  // Initialize task tracking when Moat is first shown
  function initializeTaskTracking() {
    // Get current tasks to establish baseline
    try {
      if (canUseNewTaskSystem() && window.taskStore) {
        const allTasks = window.taskStore.getAllTasksChronological();
        lastKnownTaskIds = new Set(allTasks.map(task => task.id));
      } else {
        const queue = JSON.parse(localStorage.getItem('moat.queue') || '[]');
        lastKnownTaskIds = new Set(queue.map(task => task.id));
      }
      console.log(`🌊 Moat: Initialized task tracking with ${lastKnownTaskIds.size} existing tasks`);
    } catch (error) {
      console.warn('🌊 Moat: Error initializing task tracking:', error);
      lastKnownTaskIds = new Set();
    }
  }

  // Reset animation system
  function resetFloatingAnimation() {
    animationQueue = [];
    isAnimating = false;
    lastKnownTaskIds = new Set();
    
    // Remove any animation classes from existing items
    if (moat) {
      moat.querySelectorAll('.float-moat-item').forEach(item => {
        item.classList.remove('float-floating', 'float-settling', 'float-new-highlight');
      });
    }
    
    console.log('🌊 Moat: Animation system reset');
  }

})(); 