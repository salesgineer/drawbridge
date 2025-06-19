// Moat Moat - Sidebar Component
(function() {
  let moat = null;
  let isVisible = false;
  let draggedItem = null;
  let projectStatus = 'not-connected';
  let projectPath = null;

  // Create Moat sidebar
  function createMoat() {
    console.log('Moat: createMoat called, creating sidebar element...');
    moat = document.createElement('div');
    moat.id = 'moat-moat';
    moat.className = 'float-moat';
    console.log('Moat: Element created with class:', moat.className);
    moat.innerHTML = `
      <div class="float-moat-header">
        <h3>Moat Annotations</h3>
        <div class="float-moat-actions">
          <span class="float-moat-protocol-status" title="Connection Protocol">
            <span class="float-protocol-indicator"></span>
            <span class="float-protocol-label">File</span>
          </span>
          <button class="float-moat-export" title="Export annotations">📥</button>
          <button class="float-moat-close">×</button>
        </div>
      </div>
      <div class="float-moat-project-status">
        <span class="float-project-indicator"></span>
        <span class="float-project-label">Not connected to project</span>
        <button class="float-project-connect">Connect</button>
      </div>
      <div class="float-moat-tabs">
        <button class="float-moat-tab active" data-tab="current">Current Session</button>
        <button class="float-moat-tab" data-tab="all">All Tasks</button>
      </div>
      <div class="float-moat-queue" data-view="current">
        <div class="float-moat-empty">
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
    moat.querySelector('.float-project-connect').addEventListener('click', handleProjectButton);
    
    // Tab switching
    moat.querySelectorAll('.float-moat-tab').forEach(tab => {
      tab.addEventListener('click', () => switchTab(tab.dataset.tab));
    });
    
    console.log('Moat: Event listeners attached');
  }

  // Handle project button click
  async function handleProjectButton() {
    console.log('Moat: Connect button clicked, projectStatus:', projectStatus);
    
    if (projectStatus === 'not-connected') {
      console.log('Moat: Showing setup confirmation...');
      // First time setup - show confirmation dialog
      const confirmed = await showSetupConfirmation();
      console.log('Moat: Setup confirmation result:', confirmed);
      
      if (confirmed) {
        console.log('Moat: Dispatching moat:setup-project event...');
        window.dispatchEvent(new CustomEvent('moat:setup-project'));
      }
    } else if (projectStatus === 'connected') {
      console.log('Moat: Already connected, showing project menu...');
      // Already connected - show options
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
    localStorage.removeItem(`moat.project.${window.location.origin}`);
    updateProjectStatus('not-connected', null);
    showNotification('Project disconnected');
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

  // Switch tabs
  function switchTab(tabName) {
    if (!moat) return;
    
    // Update active tab
    moat.querySelectorAll('.float-moat-tab').forEach(tab => {
      tab.classList.toggle('active', tab.dataset.tab === tabName);
    });
    
    // Update queue view
    const queueContainer = moat.querySelector('.float-moat-queue');
    queueContainer.dataset.view = tabName;
    
    // Render appropriate content
    if (tabName === 'current') {
      renderCurrentQueue();
    } else {
      renderAllTasks();
    }
  }

  // Read tasks from markdown files (if connected to project)
  async function readTasksFromMarkdown() {
    if (projectStatus !== 'connected' || !window.directoryHandle) {
      return [];
    }
    
    try {
      // Try to read from summary file first
      const summaryTasks = await readTasksFromSummaryFile();
      if (summaryTasks.length > 0) {
        return summaryTasks;
      }
      
      // Fallback to detailed file if summary doesn't exist
      const detailedTasks = await readTasksFromDetailedFile();
      return detailedTasks;
    } catch (error) {
      console.warn('Moat: Could not read markdown files:', error);
      return [];
    }
  }
  
  // Read tasks from summary file (moat-tasks-summary.md)
  async function readTasksFromSummaryFile() {
    try {
      console.log('Moat: Attempting to read summary file, directoryHandle:', !!window.directoryHandle);
      const summaryFileHandle = await window.directoryHandle.getFileHandle('moat-tasks-summary.md');
      console.log('Moat: Got summary file handle:', summaryFileHandle);
      const file = await summaryFileHandle.getFile();
      const content = await file.text();
      console.log('Moat: Summary file content length:', content.length);
      console.log('Moat: Summary file preview:', content.substring(0, 200));
      return parseSummaryTasks(content);
    } catch (error) {
      console.log('Moat: Summary file error:', error.message);
      console.log('Moat: Summary file not found, trying detailed file');
      return [];
    }
  }
  
  // Read tasks from detailed file (moat-tasks.md or moat-tasks-detail.md)
  async function readTasksFromDetailedFile() {
    try {
      // Try moat-tasks.md first
      let fileHandle;
      try {
        fileHandle = await window.directoryHandle.getFileHandle('moat-tasks.md');
      } catch {
        // Try moat-tasks-detail.md
        fileHandle = await window.directoryHandle.getFileHandle('moat-tasks-detail.md');
      }
      
      const file = await fileHandle.getFile();
      const content = await file.text();
      return parseDetailedTasks(content);
    } catch (error) {
      console.warn('Moat: No markdown task files found');
      return [];
    }
  }
  
  // Parse tasks from summary format (moat-tasks-summary.md)
  function parseSummaryTasks(content) {
    const tasks = [];
    console.log('Moat: Parsing summary tasks from content:', content.substring(0, 500));
    
    // Match summary format: 1. ⚡ **Glass Buttons** - "update these to glass buttons" *(5 min)* - ✅ completed *(Just now)*
    const summaryPattern = /(\d+)\.\s*([🔥⚡💡📋])\s*\*\*(.+?)\*\*\s*-\s*"(.+?)"\s*\*\((.+?)\)\*\s*-\s*(📋|📤|⏳|✅|❌)\s*(\w+)/gi;
    
    let match;
    while ((match = summaryPattern.exec(content)) !== null) {
      const [, taskNumber, priorityEmoji, title, description, timeEstimate, statusEmoji, statusText] = match;
      
      console.log('Moat: Found summary task:', { taskNumber, title, description, statusEmoji, statusText });
      
      // Convert priority emoji to text
      const priority = priorityEmoji === '🔥' ? 'High' : 
                     priorityEmoji === '⚡' ? 'Medium' : 
                     priorityEmoji === '💡' ? 'Low' : 'Medium';
      
      // Convert status emoji to text
      const status = getStatusFromEmoji(statusEmoji);
      
      tasks.push({
        id: `summary-task-${taskNumber}`,
        number: parseInt(taskNumber),
        title: title.trim(),
        content: description.trim(),
        status: status,
        priority: priority,
        type: 'Styling', // Default type for summary format
        estimatedTime: timeEstimate.trim(),
        priorityEmoji: priorityEmoji,
        format: 'summary'
      });
    }
    
    console.log('Moat: Parsed summary tasks:', tasks);
    return tasks;
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
  function showMoat() {
    console.log('Moat: showMoat called, moat exists:', !!moat);
    if (!moat) {
      console.log('Moat: Creating moat element...');
      createMoat();
    }
    console.log('Moat: Adding float-moat-visible class...');
    moat.classList.add('float-moat-visible');
    isVisible = true;
    console.log('Moat: Sidebar should now be visible, isVisible:', isVisible);
    renderQueue();
  }

  // Hide Moat
  function hideMoat() {
    console.log('Moat: hideMoat called, moat exists:', !!moat);
    if (moat) {
      moat.classList.remove('float-moat-visible');
      isVisible = false;
    }
  }

  // Toggle Moat
  function toggleMoat() {
    console.log('Moat: toggleMoat called, current isVisible:', isVisible);
    if (isVisible) {
      console.log('Moat: Hiding sidebar...');
      hideMoat();
    } else {
      console.log('Moat: Showing sidebar...');
      showMoat();
    }
  }

  // Get status icon
  function getStatusIcon(status) {
    switch (status) {
      case 'in queue': return '🔵';
      case 'sent': return '📤';
      case 'in progress': return '🟡';
      case 'resolved': return '✅';
      default: return '🔵';
    }
  }

  // Render queue (decides which view to show)
  function renderQueue() {
    if (!moat) return;
    
    const currentView = moat.querySelector('.float-moat-queue').dataset.view || 'current';
    if (currentView === 'current') {
      renderCurrentQueue();
    } else {
      renderAllTasks();
    }
  }
  
  // Render current session queue
  function renderCurrentQueue() {
    if (!moat) return;
    
    const queue = JSON.parse(localStorage.getItem('moat.queue') || '[]');
    const queueContainer = moat.querySelector('.float-moat-queue');
    
    // Debug logging
    console.log('Moat: renderCurrentQueue called, queue length:', queue.length);
    console.log('Moat: Current queue data:', queue);
    
    if (queue.length === 0) {
      queueContainer.innerHTML = '<div class="float-moat-empty">No annotations yet. Press \'f\' to start.</div>';
      return;
    }
    
    queueContainer.innerHTML = queue.map((annotation, index) => {
      // Use elementLabel if available, otherwise fall back to target
      const elementLabel = annotation.elementLabel || annotation.target || 'Unknown element';
      
      return `
        <div class="float-moat-item" 
             data-id="${annotation.id}" 
             data-index="${index}"
             draggable="true">
          <div class="float-moat-item-header">
            <span class="float-moat-status">${getStatusIcon(annotation.status)}</span>
            <span class="float-moat-target" title="${annotation.target}">${elementLabel}</span>
            <button class="float-moat-remove" data-id="${annotation.id}">✕</button>
          </div>
          <div class="float-moat-content">${annotation.content}</div>
          <div class="float-moat-meta">
            <span class="float-moat-time">${new Date(annotation.timestamp).toLocaleTimeString()}</span>
            ${annotation.status !== 'in queue' ? `<span class="float-moat-status-text">${annotation.status}</span>` : ''}
          </div>
        </div>
      `;
    }).join('');
    
    // Add event listeners for current queue
    addCurrentQueueListeners(queue);
  }
  
  // Render all tasks (current + markdown)
  async function renderAllTasks() {
    if (!moat) return;
    
    const queueContainer = moat.querySelector('.float-moat-queue');
    queueContainer.innerHTML = '<div class="float-moat-loading">Loading all tasks...</div>';
    
    // Get current session annotations
    const currentQueue = JSON.parse(localStorage.getItem('moat.queue') || '[]');
    
    // Get tasks from markdown file
    const markdownTasks = await readTasksFromMarkdown();
    
    // Combine and organize all tasks
    const allTasks = [...markdownTasks, ...currentQueue.map(convertAnnotationToTask)];
    
    if (allTasks.length === 0) {
      queueContainer.innerHTML = `
        <div class="float-moat-empty">
          <p>No tasks found</p>
          ${projectStatus !== 'connected' ? '<p class="float-moat-hint">Connect to a project to see markdown tasks</p>' : ''}
        </div>
      `;
      return;
    }
    
    // Sort tasks: completed last, then by priority, then by creation time
    allTasks.sort((a, b) => {
      // Completed tasks go to bottom
      if (a.status === 'completed' && b.status !== 'completed') return 1;
      if (b.status === 'completed' && a.status !== 'completed') return -1;
      
      // Priority order: High > Medium > Low
      const priorityOrder = { 'High': 3, 'Medium': 2, 'Low': 1 };
      const aPriority = priorityOrder[a.priority] || 2;
      const bPriority = priorityOrder[b.priority] || 2;
      
      if (aPriority !== bPriority) return bPriority - aPriority;
      
      // By creation time (newest first)
      return (b.timestamp || 0) - (a.timestamp || 0);
    });
    
    // Group tasks by status
    const pending = allTasks.filter(t => ['pending', 'in queue'].includes(t.status));
    const inProgress = allTasks.filter(t => ['sent', 'in progress'].includes(t.status));
    const completed = allTasks.filter(t => ['completed', 'resolved'].includes(t.status));
    
    queueContainer.innerHTML = `
      ${pending.length > 0 ? `
        <div class="float-moat-section">
          <h4 class="float-moat-section-title">📋 Pending (${pending.length})</h4>
          ${pending.map(task => renderTaskItem(task)).join('')}
        </div>
      ` : ''}
      
      ${inProgress.length > 0 ? `
        <div class="float-moat-section">
          <h4 class="float-moat-section-title">⏳ In Progress (${inProgress.length})</h4>
          ${inProgress.map(task => renderTaskItem(task)).join('')}
        </div>
      ` : ''}
      
      ${completed.length > 0 ? `
        <div class="float-moat-section">
          <h4 class="float-moat-section-title">✅ Completed (${completed.length})</h4>
          ${completed.map(task => renderTaskItem(task)).join('')}
        </div>
      ` : ''}
    `;
    
    // Add event listeners for all tasks
    addAllTasksListeners();
  }
  
  // Render individual task item
  function renderTaskItem(task) {
    const statusIcon = getStatusIcon(task.status);
    const priorityIcon = task.priorityEmoji || getDefaultPriorityIcon(task.priority);
    const isCompleted = ['completed', 'resolved'].includes(task.status);
    
    return `
      <div class="float-moat-item ${isCompleted ? 'float-moat-completed' : ''}" 
           data-id="${task.id}"
           data-type="${task.format || 'current'}">
        <div class="float-moat-item-header">
          <span class="float-moat-status">${statusIcon}</span>
          <span class="float-moat-priority" title="${task.priority} Priority">${priorityIcon}</span>
          <span class="float-moat-target" title="${task.title}">${task.title}</span>
          ${task.format === 'enhanced' || task.format === 'legacy' ? 
            `<span class="float-moat-badge">${task.estimatedTime}</span>` : 
            `<button class="float-moat-remove" data-id="${task.id}">✕</button>`
          }
        </div>
        <div class="float-moat-content">${task.content}</div>
        <div class="float-moat-meta">
          ${task.type ? `<span class="float-moat-type">${task.type}</span>` : ''}
          ${task.timestamp ? `<span class="float-moat-time">${new Date(task.timestamp).toLocaleTimeString()}</span>` : ''}
          ${task.format ? `<span class="float-moat-source">${task.format}</span>` : ''}
        </div>
      </div>
    `;
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
  
  // Get default priority icon
  function getDefaultPriorityIcon(priority) {
    switch (priority) {
      case 'High': return '🔥';
      case 'Medium': return '⚡';
      case 'Low': return '💡';
      default: return '⚡';
    }
  }
  
  // Add event listeners for current queue
  function addCurrentQueueListeners(queue) {
    if (!moat) return;
    
    const queueContainer = moat.querySelector('.float-moat-queue');
    
    // Add event listeners
    queueContainer.querySelectorAll('.float-moat-item').forEach(item => {
      // Click to highlight element
      item.addEventListener('click', (e) => {
        if (e.target.closest('.float-moat-remove')) return;
        
        const id = item.dataset.id;
        const annotation = queue.find(a => a.id === id);
        if (annotation) {
          highlightAnnotatedElement(annotation);
        }
      });
      
      // Drag and drop
      item.addEventListener('dragstart', handleDragStart);
      item.addEventListener('dragover', handleDragOver);
      item.addEventListener('drop', handleDrop);
      item.addEventListener('dragend', handleDragEnd);
    });
    
    // Remove buttons
    queueContainer.querySelectorAll('.float-moat-remove').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        removeAnnotation(btn.dataset.id);
      });
    });
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
          // For markdown tasks, show a notification that they can't be highlighted
          showNotification('Markdown tasks cannot be highlighted directly');
        }
      });
    });
    
    // Remove buttons (only for current session items)
    queueContainer.querySelectorAll('.float-moat-remove').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        removeAnnotation(btn.dataset.id);
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

  // Remove annotation
  function removeAnnotation(id) {
    let queue = JSON.parse(localStorage.getItem('moat.queue') || '[]');
    queue = queue.filter(a => a.id !== id);
    localStorage.setItem('moat.queue', JSON.stringify(queue));
    renderQueue();
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
  window.addEventListener('moat:toggle-moat', (e) => {
    console.log('Moat: Received moat:toggle-moat event');
    toggleMoat();
  });
  window.addEventListener('moat:annotation-added', (e) => {
    if (isVisible) {
      renderQueue();
    }
    // Auto-show Moat when first annotation is added
    const queue = JSON.parse(localStorage.getItem('moat.queue') || '[]');
    if (queue.length === 1) {
      showMoat();
    }
  });

  // Listen for storage changes (for cross-tab sync)
  window.addEventListener('storage', (e) => {
    if (e.key === 'moat.queue' && isVisible) {
      renderQueue();
    }
  });

  // Listen for project connection events
  window.addEventListener('moat:project-connected', (e) => {
    if (e.detail) {
      if (e.detail.status === 'connected') {
        updateProjectStatus('connected', e.detail.path);
      } else {
        updateProjectStatus('not-connected', null);
      }
    }
  });

  window.addEventListener('moat:project-disconnected', () => {
    updateProjectStatus('not-connected', null);
  });

  // Listen for annotation status updates
  window.addEventListener('moat:annotation-status-updated', (e) => {
    if (isVisible) {
      renderQueue();
    }
  });



  // Check initial project connection status on load
  console.log('Moat: Initializing, document.readyState:', document.readyState);
  
  if (document.readyState === 'loading') {
    console.log('Moat: Document still loading, waiting for DOMContentLoaded...');
    document.addEventListener('DOMContentLoaded', () => {
      console.log('Moat: DOMContentLoaded fired, creating sidebar...');
      createMoat();
      // Check initial project connection status
      const savedProject = localStorage.getItem(`moat.project.${window.location.origin}`);
      if (savedProject) {
        const projectData = JSON.parse(savedProject);
        updateProjectStatus('connected', projectData.path);
      }
    });
  } else {
    console.log('Moat: Document already loaded, creating sidebar immediately...');
    createMoat();
    // Check initial project connection status
    const savedProject = localStorage.getItem(`moat.project.${window.location.origin}`);
    if (savedProject) {
      const projectData = JSON.parse(savedProject);
      updateProjectStatus('connected', projectData.path);
    }
  }

})(); 