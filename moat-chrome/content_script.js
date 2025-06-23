// Moat Chrome Extension - Content Script
(function() {
  let commentMode = false;
  let hoveredElement = null;
  let commentBox = null;
  let highlightedElement = null;
  let projectRoot = null;
  let markdownFileHandle = null; // Handle for moat-tasks.md

  // Generate unique session ID
  const sessionId = `moat-session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  // Import utility modules (added for Task 2.1)
  let taskStore = null;
  let markdownGenerator = null;

  // Initialize utility modules
  let migrator = null; // Task 4.6: Migration system

  function initializeUtilities() {
    console.log('🔧 Moat: Initializing TaskStore and MarkdownGenerator utilities...');
    console.log('🔧 Moat: window.MoatTaskStore available:', !!window.MoatTaskStore);
    console.log('🔧 Moat: window.MoatMarkdownGenerator available:', !!window.MoatMarkdownGenerator);
    console.log('🔧 Moat: window.directoryHandle available:', !!window.directoryHandle);
    
    // Initialize TaskStore
    if (window.MoatTaskStore) {
      try {
        taskStore = new window.MoatTaskStore.TaskStore();
        
        // Initialize TaskStore with directory handle if available
        if (window.directoryHandle) {
          taskStore.initialize(window.directoryHandle);
          console.log('✅ Moat: TaskStore initialized with directory handle');
        } else {
          console.log('⚠️ Moat: TaskStore created but not initialized (no directory handle)');
        }
        
        console.log('🔧 Moat: TaskStore instance:', taskStore);
      } catch (error) {
        console.error('❌ Moat: Error creating TaskStore instance:', error);
        taskStore = null;
      }
    } else {
      console.error('❌ Moat: TaskStore not available - ensure utils/taskStore.js is loaded');
      console.log('🔧 Moat: Available window properties:', Object.keys(window).filter(k => k.includes('Moat')));
    }

    // Initialize MarkdownGenerator (functions are available via global)
    if (window.MoatMarkdownGenerator) {
      try {
        markdownGenerator = window.MoatMarkdownGenerator;
        console.log('✅ Moat: MarkdownGenerator initialized successfully');
        console.log('🔧 Moat: MarkdownGenerator functions:', Object.keys(markdownGenerator));
      } catch (error) {
        console.error('❌ Moat: Error initializing MarkdownGenerator:', error);
        markdownGenerator = null;
      }
    } else {
      console.error('❌ Moat: MarkdownGenerator not available - ensure utils/markdownGenerator.js is loaded');
    }
  }

  // Retry initialization with delays
  async function initializeUtilitiesWithRetry(maxRetries = 3) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      console.log(`🔧 Moat: Initialization attempt ${attempt}/${maxRetries}`);
      
      initializeUtilities();
      
      // Check if both utilities are now available
      if (taskStore && markdownGenerator) {
        console.log('✅ Moat: All utilities initialized successfully');
        return true;
      }
      
      if (attempt < maxRetries) {
        console.log(`🔧 Moat: Utilities not ready, waiting 500ms before retry...`);
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
    
    console.error('❌ Moat: Failed to initialize utilities after', maxRetries, 'attempts');
    return false;

    // Task 4.6: Initialize migration system (only if directory handle is available)
    if (window.LegacyFileMigrator && taskStore && markdownGenerator && window.directoryHandle) {
      migrator = new window.LegacyFileMigrator(window.directoryHandle, taskStore, markdownGenerator);
      console.log('Moat: LegacyFileMigrator initialized');
      
      // Auto-trigger migration check on startup
      setTimeout(checkAndMigrateLegacyFiles, 1000);
    } else if (!window.directoryHandle) {
      console.log('Moat: Directory handle not available yet, migration system will be initialized after project connection');
    } else {
      console.warn('Moat: LegacyFileMigrator not available or dependencies missing');
    }
  }

  // Task 4.6: Migration trigger on extension startup
  async function checkAndMigrateLegacyFiles() {
    console.log('🔍 Moat: Checking for legacy files to migrate...');
    
    if (!migrator) {
      console.warn('🔍 Moat: Migration system not available');
      return;
    }

    try {
      const legacyFiles = await migrator.detectLegacyFiles();
      
      if (legacyFiles.hasLegacyFiles) {
        console.log('🔍 Moat: Legacy files detected, starting migration...');
        showNotification('🔄 Migrating legacy files to new format...', 'info');
        
        const result = await migrator.performMigration();
        
        if (result.success) {
          console.log('✅ Moat: Migration completed successfully');
          showNotification(`✅ Migration complete! Converted ${result.tasksConverted} tasks, archived ${result.filesArchived} files`);
          
          // Refresh the sidebar to show migrated tasks
          window.dispatchEvent(new CustomEvent('moat:tasks-updated', {
            detail: { source: 'migration', taskCount: result.tasksConverted }
          }));
          
        } else {
          console.error('❌ Moat: Migration failed:', result.errors);
          showNotification(`❌ Migration failed: ${result.errors[0] || 'Unknown error'}`, 'error');
        }
        
        // Store migration report for debugging
        window.moatMigrationReport = migrator.getMigrationReport();
        
      } else {
        console.log('🔍 Moat: No legacy files found, migration not needed');
      }
      
    } catch (error) {
      console.error('🔍 Moat: Migration check failed:', error);
      showNotification(`❌ Migration check failed: ${error.message}`, 'error');
    }
  }

  // Task 4.7: Manual migration trigger function
  async function triggerManualMigration() {
    console.log('🚀 Moat: Manual migration triggered');
    
    if (!migrator) {
      showNotification('❌ Migration system not available', 'error');
      return { success: false, error: 'Migration system not available' };
    }

    try {
      showNotification('🔄 Starting manual migration...', 'info');
      const result = await migrator.performMigration();
      
      if (result.success) {
        showNotification(`✅ Manual migration complete! ${result.tasksConverted} tasks converted`);
      } else {
        showNotification(`❌ Manual migration failed: ${result.errors[0]}`, 'error');
      }
      
      return result;
      
    } catch (error) {
      console.error('🚀 Moat: Manual migration failed:', error);
      showNotification(`❌ Manual migration error: ${error.message}`, 'error');
      return { success: false, error: error.message };
    }
  }

  // Task 4.8: Manual rollback function
  async function triggerMigrationRollback() {
    console.log('🔙 Moat: Migration rollback triggered');
    
    if (!migrator) {
      showNotification('❌ Migration system not available', 'error');
      return { success: false, error: 'Migration system not available' };
    }

    try {
      showNotification('🔄 Rolling back migration...', 'info');
      const result = await migrator.rollbackMigration();
      
      if (result.success) {
        showNotification(`✅ Rollback complete! Restored ${result.restoredCount} files`);
        
        // Refresh sidebar to show restored state
        window.dispatchEvent(new CustomEvent('moat:tasks-updated', {
          detail: { source: 'rollback' }
        }));
        
      } else {
        showNotification(`❌ Rollback failed: ${result.error}`, 'error');
      }
      
      return result;
      
    } catch (error) {
      console.error('🔙 Moat: Rollback failed:', error);
      showNotification(`❌ Rollback error: ${error.message}`, 'error');
      return { success: false, error: error.message };
    }
  }

  // Convert annotation format to TaskStore format (Task 2.1)
  function convertAnnotationToTask(annotation) {
    // Generate a clean title from element label and comment
    const title = annotation.elementLabel || 'UI Element Task';
    
    // Convert bounding rect format
    const boundingRect = {
      x: annotation.boundingRect.x,
      y: annotation.boundingRect.y,
      w: annotation.boundingRect.width,
      h: annotation.boundingRect.height
    };

    // Generate screenshot path
    const screenshotPath = annotation.screenshot ? `./screenshots/${annotation.id}.png` : '';

    return {
      title: title,
      comment: annotation.content,
      selector: annotation.target,
      boundingRect: boundingRect,
      screenshotPath: screenshotPath
    };
  }

  // Check if utilities are available and project is connected (Task 2.1)
  function canUseNewTaskSystem() {
    const hasTaskStore = !!taskStore;
    const hasMarkdownGenerator = !!markdownGenerator;
    const hasDirectoryHandle = !!window.directoryHandle;
    const taskStoreInitialized = hasTaskStore && taskStore.isInitialized && taskStore.isInitialized();
    const canUse = hasTaskStore && hasMarkdownGenerator && hasDirectoryHandle && taskStoreInitialized;
    
    console.log('🔧 Moat: canUseNewTaskSystem check:');
    console.log('  - taskStore:', hasTaskStore, taskStore ? '(instance available)' : '(null/undefined)');
    console.log('  - taskStore.isInitialized():', taskStoreInitialized, taskStore?.isInitialized ? '(properly initialized)' : '(not initialized)');
    console.log('  - markdownGenerator:', hasMarkdownGenerator, markdownGenerator ? '(functions available)' : '(null/undefined)');
    console.log('  - directoryHandle:', hasDirectoryHandle, window.directoryHandle ? '(handle available)' : '(null/undefined)');
    console.log('  - Result:', canUse ? '✅ CAN use new system' : '❌ CANNOT use new system');
    
    return canUse;
  }

  // Save screenshot to file (Task 2.6)
  async function saveScreenshotToFile(annotation) {
    if (!annotation.screenshot || !window.directoryHandle) {
      return '';
    }

    try {
      // Create screenshots directory if it doesn't exist
      const screenshotsDir = await window.directoryHandle.getDirectoryHandle('screenshots', { create: true });
      
      // Convert base64 to blob
      const base64Data = annotation.screenshot.replace(/^data:image\/png;base64,/, '');
      const binaryString = atob(base64Data);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      const blob = new Blob([bytes], { type: 'image/png' });

      // Save file with annotation ID as name
      const fileName = `${annotation.id}.png`;
      const fileHandle = await screenshotsDir.getFileHandle(fileName, { create: true });
      const writable = await fileHandle.createWritable();
      await writable.write(blob);
      await writable.close();

      console.log(`Moat: Screenshot saved as ${fileName}`);
      return `./screenshots/${fileName}`;
    } catch (error) {
      console.error('Moat: Failed to save screenshot:', error);
      return '';
    }
  }

  // New annotation save pipeline using TaskStore and MarkdownGenerator (Tasks 2.2-2.8)
  async function saveAnnotationWithNewSystem(annotation) {
    const startTime = performance.now(); // Task 2.7: Performance monitoring
    
    console.log('🚀 Moat: Starting saveAnnotationWithNewSystem pipeline');
    console.log('🚀 Moat: Annotation data:', {
      id: annotation.id,
      elementLabel: annotation.elementLabel,
      content: annotation.content,
      target: annotation.target
    });
    
    try {
      // Step 1: Verify prerequisites
      console.log('🔧 Moat: Verifying prerequisites...');
      if (!window.directoryHandle) {
        throw new Error('Directory handle not available');
      }
      
      // Try to reinitialize utilities if they're missing
      if (!taskStore || !markdownGenerator) {
        console.log('🔧 Moat: Missing utilities, attempting re-initialization...');
        await initializeUtilitiesWithRetry();
      }
      
      // If utilities still aren't available, use direct file writing
      if (!taskStore || !markdownGenerator) {
        console.log('🔧 Moat: Utilities not available, switching to direct file writing mode');
        return await saveAnnotationWithDirectFileWriting(annotation);
      }
      console.log('✅ Moat: Prerequisites verified');

      // Step 2: Save screenshot to file system
      console.log('🔧 Moat: Processing screenshot...');
      const screenshotPath = await saveScreenshotToFile(annotation);
      console.log('🔧 Moat: Screenshot result:', screenshotPath || 'No screenshot');
      
      // Step 3: Convert annotation to TaskStore format
      console.log('🔧 Moat: Converting annotation to task format...');
      const taskData = convertAnnotationToTask(annotation);
      if (screenshotPath) {
        taskData.screenshotPath = screenshotPath;
      }
      console.log('🔧 Moat: Task data prepared:', taskData);

      // Step 4: Add task to TaskStore
      console.log('🔧 Moat: Adding task to TaskStore...');
      const task = await taskStore.addTaskAndSave(taskData);
      console.log('✅ Moat: Task added to TaskStore with ID:', task.id);
      console.log('🔧 Moat: TaskStore now has', taskStore.getAllTasks().length, 'tasks');

      // Step 5: Generate and save markdown
      console.log('🔧 Moat: Generating markdown from TaskStore data...');
      const allTasks = taskStore.getAllTasksChronological();
      console.log('🔧 Moat: All tasks for markdown generation:', allTasks.length, 'tasks');
      
      await markdownGenerator.rebuildMarkdownFile(allTasks);
      console.log('✅ Moat: Markdown file regenerated from TaskStore');

      // Step 5.5: Verify files were actually written
      console.log('🔧 Moat: Verifying files were written to disk...');
      const verification = await verifyFilesWritten();
      if (verification.success) {
        console.log('✅ Moat: File verification successful');
      } else {
        console.error('❌ Moat: File verification failed:', verification.error);
      }

      // Step 6: Performance check
      const duration = performance.now() - startTime;
      console.log(`⏱️ Moat: Save operation completed in ${duration.toFixed(1)}ms`);
      if (duration > 500) {
        console.warn(`⚠️ Moat: Save operation took ${duration.toFixed(1)}ms (exceeds 500ms requirement)`);
      }

      // Step 7: Dispatch event
      console.log('🔧 Moat: Dispatching moat:tasks-updated event...');
      window.dispatchEvent(new CustomEvent('moat:tasks-updated', { 
        detail: { task, allTasks, duration } 
      }));

      // Step 8: Update status and notify
      updateAnnotationStatus(annotation.id, 'saved');
      
      showNotification(`✅ Task saved: "${task.comment.substring(0, 30)}${task.comment.length > 30 ? '...' : ''}"`);
      console.log('🎉 Moat: New system save pipeline completed successfully');
      return true;

    } catch (error) {
      const duration = performance.now() - startTime;
      console.error('❌ Moat: New task system save failed at step:', error.message);
      console.error('❌ Moat: Full error:', error);
      console.error('❌ Moat: Error stack:', error.stack);
      console.log(`⏱️ Moat: Failed save operation took ${duration.toFixed(1)}ms`);
      
      // Additional debugging info
      console.log('🔧 Moat: Debug info at failure:');
      console.log('  - taskStore:', !!taskStore, taskStore);
      console.log('  - markdownGenerator:', !!markdownGenerator, markdownGenerator);
      console.log('  - directoryHandle:', !!window.directoryHandle, window.directoryHandle);
      
      showNotification(`❌ Failed to save task: ${error.message}`, 'error');
      updateAnnotationStatus(annotation.id, 'failed');
      return false;
    }
  }

  // Legacy annotation save pipeline (fallback)
  async function saveAnnotationWithLegacySystem(annotation) {
    console.log('Moat: Using legacy file system for annotation:', annotation.elementLabel);

    // Dispatch legacy event
    window.dispatchEvent(new CustomEvent('moat:annotation-added', { detail: annotation }));

    // Try legacy markdown logging
    let markdownSuccess = false;
    if (markdownFileHandle) {
      try {
        markdownSuccess = await logToMarkdown(annotation);
        if (markdownSuccess) {
          updateAnnotationStatus(annotation.id, 'logged');
        }
      } catch (error) {
        console.error('Moat: Legacy markdown logging failed:', error);
      }
    }

    if (!markdownSuccess) {
      updateAnnotationStatus(annotation.id, 'queued');
      showNotification('📝 Annotation saved locally. Connect to project to enable file logging.', 'warning');
    } else {
      showNotification(`📝 Annotation saved: "${annotation.content.substring(0, 30)}${annotation.content.length > 30 ? '...' : ''}"`);
    }

    return markdownSuccess;
  }

  // Initialize when page loads
  function initializeQueue() {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initializeQueue);
      return;
    }
    
    // Initialize utility modules (Task 2.1)
    initializeUtilitiesWithRetry();
    
    // Initialize queue if not exists
    if (!localStorage.getItem('moat.queue')) {
      localStorage.setItem('moat.queue', JSON.stringify([]));
    }
    
    // Show success message
    console.log('Moat: Extension loaded successfully');
    
    // Initialize project connection if available
    initializeProject();
  }

  // Initialize project connection
  async function initializeProject() {
    // Since we clear connections on reload, always start as not-connected
    console.log('🔧 Moat: Project connection cleared - user must reconnect');
    
    // Notify Moat that no project is connected
    window.dispatchEvent(new CustomEvent('moat:project-connected', { 
      detail: { status: 'not-connected' } 
    }));
  }

  // Set up project connection
  async function setupProject() {
    console.log('🔧 Moat: Starting project setup...');
    console.log('🔧 Moat: File System Access API available:', !!window.showDirectoryPicker);
    
    try {
      // Check if File System Access API is available
      if (!('showDirectoryPicker' in window)) {
        console.error('❌ Moat: File System Access API not supported');
        showNotification('Your browser doesn\'t support file system access. Use Chrome 86+ or Edge 86+', 'error');
        return false;
      }
      
      console.log('🔧 Moat: File System Access API available, showing directory picker...');
      
      // Use File System Access API to let user choose project directory
      const dirHandle = await window.showDirectoryPicker({
        mode: 'readwrite',
        startIn: 'documents'
      });
      
      console.log('Moat: Directory selected:', dirHandle.name);
      projectRoot = dirHandle.name;
      
      // Create .moat directory
      const moatDir = await dirHandle.getDirectoryHandle('.moat', { create: true });
      
      // Store .moat directory handle for moat.js to access
      window.directoryHandle = moatDir;
      console.log('🔧 Moat: Stored directory handle for moat.js:', moatDir);
      console.log('🔧 Moat: Directory handle type:', typeof window.directoryHandle);
      console.log('🔧 Moat: Directory handle name:', window.directoryHandle?.name);
      
      // Re-initialize utilities now that we have the directory handle
      console.log('🔧 Moat: Re-initializing utilities with directory handle...');
      await initializeUtilitiesWithRetry();
      
      // Verify new task system is now available
      const canUseNew = canUseNewTaskSystem();
      console.log('🔧 Moat: Can use new task system after setup:', canUseNew);
      
      // Load existing tasks from file if available
      if (taskStore) {
        try {
          console.log('🔧 Moat: Attempting to load existing tasks from file...');
          await taskStore.loadTasksFromFile();
          const loadedTasks = taskStore.getAllTasks();
          console.log('✅ Moat: Loaded', loadedTasks.length, 'existing tasks from file');
          
          // Clear localStorage queue since we're using the new system now
          const existingQueue = JSON.parse(localStorage.getItem('moat.queue') || '[]');
          if (existingQueue.length > 0) {
            console.log('🔧 Moat: Clearing', existingQueue.length, 'localStorage queue items (switching to new system)');
            localStorage.removeItem('moat.queue');
          }
        } catch (error) {
          console.log('🔧 Moat: No existing tasks file, starting fresh:', error.message);
        }
      } else {
        console.error('❌ Moat: TaskStore not available after re-initialization');
      }
      
      // Create config file
      const configFile = await moatDir.getFileHandle('config.json', { create: true });
      const configWritable = await configFile.createWritable();
      await configWritable.write(JSON.stringify({
        version: '1.0.0',
        projectName: dirHandle.name,
        createdAt: new Date().toISOString(),
        streaming: {
          enabled: true,
          format: 'jsonl',
          cursorIntegration: true
        },
        ui: {
          autoShowMoat: true,
          confirmBeforeSend: false
        }
      }, null, 2));
      await configWritable.close();
      

      
              // Store file handle for markdown tasks file
        console.log('Moat: Creating markdown file handle...');
        markdownFileHandle = await moatDir.getFileHandle('moat-tasks.md', { create: true });
        console.log('Moat: Markdown file handle created successfully');
        
        // Initialize markdown file with header if empty
        try {
          console.log('Moat: Checking if markdown file needs initialization...');
          const markdownFile = await markdownFileHandle.getFile();
          const content = await markdownFile.text();
          console.log('Moat: Current markdown file content length:', content.length);
          
          if (!content.trim()) {
            console.log('Moat: Initializing empty markdown file...');
            const markdownWritable = await markdownFileHandle.createWritable();
            await markdownWritable.write(`# Moat Tasks

Generated by Moat Chrome Extension

`);
            await markdownWritable.close();
            console.log('Moat: Markdown file initialized');
          } else {
            console.log('Moat: Markdown file already has content');
          }
        } catch (e) {
          console.warn('Moat: Could not initialize markdown file', e);
        }
        

      
      // Save project connection
      localStorage.setItem(`moat.project.${window.location.origin}`, JSON.stringify({
        path: dirHandle.name,
        connectedAt: Date.now()
      }));
      
      // Update .gitignore if it exists
      try {
        const gitignoreHandle = await dirHandle.getFileHandle('.gitignore', { create: false });
        const gitignoreFile = await gitignoreHandle.getFile();
        let gitignoreContent = await gitignoreFile.text();
        
        if (!gitignoreContent.includes('.moat/')) {
          gitignoreContent += '\n# Moat task system\n.moat/\n';
          const gitignoreWritable = await gitignoreHandle.createWritable();
          await gitignoreWritable.write(gitignoreContent);
          await gitignoreWritable.close();
        }
      } catch (e) {
        // .gitignore doesn't exist, that's okay
      }
      
      // Notify success
      window.dispatchEvent(new CustomEvent('moat:project-connected', { 
        detail: { path: dirHandle.name, status: 'connected' } 
      }));
      
      showNotification('✅ Moat connected to project!');
      
      return true;
    } catch (error) {
      console.log('Moat: Project setup error details:', error.name, error.message);
      
      if (error.name === 'AbortError') {
        console.log('Moat: User cancelled directory picker');
        showNotification('Project connection cancelled');
      } else if (error.name === 'NotAllowedError') {
        console.error('Moat: Permission denied for file system access');
        showNotification('Permission denied. Please allow file system access.', 'error');
      } else if (error.name === 'SecurityError') {
        console.error('Moat: Security error accessing file system');
        showNotification('Security error. Make sure you\'re on localhost or HTTPS.', 'error');
      } else {
        console.error('Moat: Project setup failed', error);
        showNotification(`Failed to connect to project: ${error.message}`, 'error');
      }
      return false;
    }
  }





  // Suggest target file based on annotation
  function suggestTargetFile(annotation) {
    // This is a simple heuristic - could be made smarter
    const url = new URL(annotation.pageUrl);
    const path = url.pathname;
    
    if (path === '/' || path === '') {
      return 'src/pages/index.tsx';
    } else {
      // Convert URL path to likely file path
      const cleanPath = path.replace(/^\//, '').replace(/\/$/, '');
      return `src/pages/${cleanPath}.tsx`;
    }
  }

  // Update annotation status
  function updateAnnotationStatus(annotationId, status) {
    const queue = JSON.parse(localStorage.getItem('moat.queue') || '[]');
    const annotation = queue.find(a => a.id === annotationId);
    if (annotation) {
      annotation.status = status;
      localStorage.setItem('moat.queue', JSON.stringify(queue));
      window.dispatchEvent(new CustomEvent('moat:annotation-status-updated', { 
        detail: { id: annotationId, status } 
      }));
      
      // Update markdown file with new status
      if (markdownFileHandle) {
        updateMarkdownTaskStatus(annotation);
      }
    }
  }

  // Update task status in markdown file
  async function updateMarkdownTaskStatus(annotation) {
    if (!markdownFileHandle) return;
    
    try {
      const file = await markdownFileHandle.getFile();
      let content = await file.text();
      
      // Find the task entry by ID
      const taskIdPattern = new RegExp(`- \\*\\*ID:\\*\\* \`${annotation.id}\``, 'g');
      const match = taskIdPattern.exec(content);
      
      if (match) {
        // Find the status line before the ID
        const beforeId = content.substring(0, match.index);
        const statusLinePattern = /- \*\*Status:\*\* ([^\n]+)/g;
        let statusMatch;
        let lastStatusMatch = null;
        
        // Find the last status match before our ID
        while ((statusMatch = statusLinePattern.exec(beforeId)) !== null) {
          lastStatusMatch = statusMatch;
        }
        
        if (lastStatusMatch) {
          // Replace the status
          const oldStatus = lastStatusMatch[0];
          const newStatus = `- **Status:** ${annotation.status}`;
          content = content.replace(oldStatus, newStatus);
          
          // Also update the emoji in the header
          const taskHeaderPattern = new RegExp(`## [📋📤⏳✅] ${annotation.elementLabel.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`);
          const newEmoji = getStatusEmoji(annotation.status);
          content = content.replace(taskHeaderPattern, `## ${newEmoji} ${annotation.elementLabel}`);
          
          // Write back the updated content
          const writable = await markdownFileHandle.createWritable();
          await writable.write(content);
          await writable.close();
        }
      }
    } catch (error) {
      console.error('Moat: Failed to update markdown task status', error);
    }
  }

  // Direct file writing fallback (when utilities aren't available)
  async function saveAnnotationWithDirectFileWriting(annotation) {
    const startTime = performance.now();
    
    console.log('🚀 Moat: Using direct file writing fallback');
    console.log('🚀 Moat: Annotation data:', {
      id: annotation.id,
      elementLabel: annotation.elementLabel,
      content: annotation.content,
      target: annotation.target
    });
    
    try {
      // Step 1: Read existing tasks from JSON file
      console.log('🔧 Moat: Reading existing tasks from JSON file...');
      let existingTasks = [];
      
      try {
        const jsonHandle = await window.directoryHandle.getFileHandle('moat-tasks-detail.json');
        const jsonFile = await jsonHandle.getFile();
        const jsonContent = await jsonFile.text();
        if (jsonContent.trim()) {
          existingTasks = JSON.parse(jsonContent);
        }
        console.log('🔧 Moat: Found', existingTasks.length, 'existing tasks');
      } catch (error) {
        console.log('🔧 Moat: No existing JSON file, starting with empty array');
      }
      
      // Step 2: Create new task object
      console.log('🔧 Moat: Creating new task object...');
      const newTask = {
        id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        title: annotation.elementLabel || 'UI Element Task',
        comment: annotation.content,
        selector: annotation.target,
        boundingRect: {
          x: annotation.boundingRect?.x || 0,
          y: annotation.boundingRect?.y || 0,
          w: annotation.boundingRect?.width || 0,
          h: annotation.boundingRect?.height || 0
        },
        screenshotPath: annotation.screenshot ? `./screenshots/${annotation.id}.png` : '',
        status: 'pending',
        timestamp: Date.now()
      };
      console.log('🔧 Moat: New task created:', newTask);
      
      // Step 3: Add to tasks array
      existingTasks.push(newTask);
      console.log('🔧 Moat: Total tasks now:', existingTasks.length);
      
      // Step 4: Write JSON file
      console.log('🔧 Moat: Writing JSON file...');
      const jsonHandle = await window.directoryHandle.getFileHandle('moat-tasks-detail.json', { create: true });
      const jsonWritable = await jsonHandle.createWritable();
      await jsonWritable.write(JSON.stringify(existingTasks, null, 2));
      await jsonWritable.close();
      console.log('✅ Moat: JSON file written successfully');
      
      // Step 5: Generate and write markdown
      console.log('🔧 Moat: Generating markdown...');
      const sortedTasks = existingTasks.sort((a, b) => a.timestamp - b.timestamp);
      
      let markdown = '# Moat Tasks\n\n';
      
      // Add summary
      const pending = sortedTasks.filter(t => t.status === 'pending').length;
      const inProgress = sortedTasks.filter(t => t.status === 'in-progress').length;
      const completed = sortedTasks.filter(t => t.status === 'completed').length;
      
      markdown += `**Total**: ${sortedTasks.length} | `;
      markdown += `**Pending**: ${pending} | `;
      markdown += `**In Progress**: ${inProgress} | `;
      markdown += `**Completed**: ${completed}\n\n`;
      
      // Add tasks
      if (sortedTasks.length === 0) {
        markdown += '## Tasks\n\n_No tasks yet. Create an annotation to get started._\n';
      } else {
        markdown += '## Tasks\n\n';
        sortedTasks.forEach((task, index) => {
          const checkbox = task.status === 'completed' ? '[x]' : '[ ]';
          const taskNumber = index + 1;
          const title = task.title || 'Untitled Task';
          const comment = task.comment.length > 60 ? task.comment.substring(0, 57) + '...' : task.comment;
          
          markdown += `${taskNumber}. ${checkbox} ${title}`;
          if (comment) {
            markdown += ` – "${comment}"`;
          }
          markdown += '\n';
        });
      }
      
      markdown += '\n---\n\n';
      markdown += `_Generated: ${new Date().toLocaleString()}_\n`;
      markdown += `_Source: moat-tasks-detail.json_\n`;
      
      // Step 6: Write markdown file
      console.log('🔧 Moat: Writing markdown file...');
      const mdHandle = await window.directoryHandle.getFileHandle('moat-tasks.md', { create: true });
      const mdWritable = await mdHandle.createWritable();
      await mdWritable.write(markdown);
      await mdWritable.close();
      console.log('✅ Moat: Markdown file written successfully');
      
      // Step 7: Performance check
      const duration = performance.now() - startTime;
      console.log(`⏱️ Moat: Direct file writing completed in ${duration.toFixed(1)}ms`);
      
      // Step 8: Dispatch event and notify
      window.dispatchEvent(new CustomEvent('moat:tasks-updated', { 
        detail: { task: newTask, allTasks: existingTasks, duration } 
      }));
      
      updateAnnotationStatus(annotation.id, 'saved');
      showNotification(`✅ Task saved: "${newTask.comment.substring(0, 30)}${newTask.comment.length > 30 ? '...' : ''}"`);
      console.log('🎉 Moat: Direct file writing completed successfully');
      
      return true;
      
    } catch (error) {
      const duration = performance.now() - startTime;
      console.error('❌ Moat: Direct file writing failed:', error);
      console.log(`⏱️ Moat: Failed operation took ${duration.toFixed(1)}ms`);
      
      showNotification(`❌ Failed to save task: ${error.message}`, 'error');
      updateAnnotationStatus(annotation.id, 'failed');
      return false;
    }
  }

  // Verify files are actually written (debugging function)
  async function verifyFilesWritten() {
    if (!window.directoryHandle) {
      console.log('🔧 Moat: Cannot verify files - no directory handle');
      return { success: false, error: 'No directory handle' };
    }

    try {
      // Check moat-tasks-detail.json
      const jsonHandle = await window.directoryHandle.getFileHandle('moat-tasks-detail.json');
      const jsonFile = await jsonHandle.getFile();
      const jsonContent = await jsonFile.text();
      const jsonSize = jsonFile.size;
      
      // Check moat-tasks.md
      const mdHandle = await window.directoryHandle.getFileHandle('moat-tasks.md');
      const mdFile = await mdHandle.getFile();
      const mdContent = await mdFile.text();
      const mdSize = mdFile.size;
      
      console.log('🔧 Moat: File verification results:');
      console.log('  - moat-tasks-detail.json:', jsonSize, 'bytes');
      console.log('  - moat-tasks-detail.json content preview:', jsonContent.substring(0, 200));
      console.log('  - moat-tasks.md:', mdSize, 'bytes');
      console.log('  - moat-tasks.md content preview:', mdContent.substring(0, 200));
      
      return {
        success: true,
        json: { size: jsonSize, content: jsonContent },
        markdown: { size: mdSize, content: mdContent }
      };
    } catch (error) {
      console.error('🔧 Moat: File verification failed:', error);
      return { success: false, error: error.message };
    }
  }

  // Show notification
  function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `float-notification ${type === 'error' ? 'float-error' : ''}`;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => notification.remove(), 3000);
  }

  // Enhanced task classification functions
  function classifyPriority(annotation) {
    const content = annotation.content.toLowerCase();
    
    // High priority keywords
    if (content.includes('broken') || content.includes('fix') || 
        content.includes('error') || content.includes('bug') ||
        content.includes('urgent') || content.includes('critical')) {
      return { level: 'High', emoji: '🔥' };
    }
    
    // Low priority keywords  
    if (content.includes('maybe') || content.includes('nice') ||
        content.includes('consider') || content.includes('polish') ||
        content.includes('minor') || content.includes('small')) {
      return { level: 'Low', emoji: '💡' };
    }
    
    // Default to medium priority
    return { level: 'Medium', emoji: '⚡' };
  }
  
  function determineTaskType(annotation) {
    const content = annotation.content.toLowerCase();
    const target = annotation.target.toLowerCase();
    
    if (content.includes('color') || content.includes('font') || 
        content.includes('style') || content.includes('theme')) {
      return 'Styling';
    }
    
    if (content.includes('move') || content.includes('position') || 
        content.includes('align') || content.includes('center') ||
        content.includes('layout') || content.includes('size')) {
      return 'Layout';
    }
    
    if (content.includes('text') || content.includes('content') ||
        content.includes('copy') || content.includes('wording')) {
      return 'Content';
    }
    
    if (content.includes('add') || content.includes('new') ||
        content.includes('feature') || content.includes('enhance')) {
      return 'Enhancement';
    }
    
    return 'Styling'; // Default
  }
  
  function estimateImplementationTime(annotation) {
    const content = annotation.content.toLowerCase();
    const type = determineTaskType(annotation);
    
    // Quick changes (1-5 minutes)
    if (content.includes('color') || content.includes('font-size') ||
        content.includes('margin') || content.includes('padding')) {
      return '2 minutes';
    }
    
    // Medium changes (5-15 minutes)
    if (type === 'Layout' || content.includes('responsive') ||
        content.includes('position')) {
      return '10 minutes';
    }
    
    // Complex changes (15+ minutes)
    if (type === 'Enhancement' || content.includes('new') ||
        content.includes('add') || content.includes('feature')) {
      return '20 minutes';
    }
    
    return '5 minutes'; // Default
  }
  
  function generateApproach(annotation) {
    const content = annotation.content.toLowerCase();
    const type = determineTaskType(annotation);
    
    if (content.includes('blue')) {
      return 'Update CSS color property to blue (#3B82F6) or add blue utility class';
    }
    
    if (content.includes('bigger') || content.includes('larger')) {
      return 'Increase font-size or scale using CSS transform';
    }
    
    if (content.includes('center')) {
      return 'Add CSS centering with margin: 0 auto or text-align: center';
    }
    
    if (content.includes('move')) {
      return 'Adjust positioning using CSS position, top, left properties';
    }
    
    // Generic approach based on type
    switch (type) {
      case 'Styling': return 'Update CSS properties or utility classes';
      case 'Layout': return 'Modify CSS layout properties (display, position, flex)';
      case 'Content': return 'Update HTML content or text';
      case 'Enhancement': return 'Add new elements or functionality';
      default: return 'Apply requested changes following project patterns';
    }
  }
  
  function identifyFilesToModify(annotation) {
    const url = new URL(annotation.pageUrl);
    const path = url.pathname;
    
    // Common file patterns
    if (path === '/' || path === '') {
      return ['styles.css', 'index.html'];
    }
    
    // Component-based patterns
    if (annotation.elementLabel.includes('Hero')) {
      return ['components/Hero.tsx', 'styles/hero.css'];
    }
    
    if (annotation.elementLabel.includes('Navigation')) {
      return ['components/Navigation.tsx', 'styles/nav.css'];
    }
    
    return ['styles.css']; // Default
  }
  
  function generateTaskId() {
    const timestamp = Date.now();
    const hash = Math.random().toString(36).substr(2, 9);
    return `moat-${timestamp}-${hash}`;
  }
  
  function detectDependencies(annotation, existingTasks = []) {
    // Simple dependency detection - tasks affecting same element
    const sameSelectorTasks = existingTasks.filter(task => 
      task.target === annotation.target && task.status === 'pending'
    );
    
    if (sameSelectorTasks.length > 0) {
      return sameSelectorTasks.map(task => task.id);
    }
    
    return [];
  }
  
  function parseExistingTasks(markdownContent) {
    const tasks = [];
    
    if (!markdownContent || !markdownContent.trim()) {
      return tasks;
    }
    
    // Try to parse checkbox summary format first (e.g., "1. [ ] Title - "description"")
    const summaryPattern = /^(\d+)\.\s*\[([x ])\]\s*(.+?)\s*-\s*"(.+?)"$/gm;
    let match;
    
    while ((match = summaryPattern.exec(markdownContent)) !== null) {
      const [, number, checkbox, title, description] = match;
      const status = checkbox === 'x' ? 'completed' : 'pending';
      tasks.push({
        id: `summary-task-${number}`,
        number: parseInt(number),
        title: title.trim(),
        description: description.trim(),
        status: status,
        format: 'summary'
      });
    }
    
    // If no checkbox format found, try legacy format (backward compatibility)
    if (tasks.length === 0) {
      const legacyPattern = /^(\d+)\.\s*(.+?)\s*-\s*"(.+?)"\s*-\s*(\w+)$/gm;
      
      while ((match = legacyPattern.exec(markdownContent)) !== null) {
        const [, number, title, description, status] = match;
        tasks.push({
          id: `legacy-task-${number}`,
          number: parseInt(number),
          title: title.trim(),
          description: description.trim(),
          status: status.trim() === 'completed' || status.trim() === 'done' ? 'completed' : 'pending',
          format: 'legacy'
        });
      }
    }

    // If still no format found, try detailed format
    if (tasks.length === 0) {
      const detailedPattern = /## [🔥⚡💡]?\s*[📋🔄✅❌]?\s*Task\s+(\d+):\s*(.+)/g;
      
      while ((match = detailedPattern.exec(markdownContent)) !== null) {
        tasks.push({
          id: `task-${match[1]}`,
          number: parseInt(match[1]),
          title: match[2].trim(),
          status: 'pending', // Simplified status detection
          format: 'detailed'
        });
      }
    }
    
    console.log('Moat: Parsed', tasks.length, 'existing tasks from markdown');
    return tasks;
  }
  
  function interpretUserIntent(annotation) {
    const content = annotation.content.toLowerCase();
    
    if (content.includes('broken') || content.includes('fix')) {
      return 'Fix functionality or visual issue';
    }
    
    if (content.includes('better') || content.includes('improve')) {
      return 'Enhance user experience';
    }
    
    if (content.includes('like') || content.includes('want')) {
      return 'Implement user preference';
    }
    
    if (content.includes('should') || content.includes('need')) {
      return 'Address functional requirement';
    }
    
    return 'Apply visual/functional change as requested';
  }

  // REMOVED: logToMarkdown - replaced by TaskStore + MarkdownGenerator (Task 2.5)
  
  // REMOVED: Format conversion functions - replaced by TaskStore + MarkdownGenerator (Task 2.5)
  // REMOVED: logToSummaryMarkdown - replaced by TaskStore + MarkdownGenerator (Task 2.5)
  
  // REMOVED: logToDetailedMarkdown - replaced by TaskStore + MarkdownGenerator (Task 2.5)

  // Test annotation capture flow end-to-end with new system (Task 2.8)
  async function testAnnotationCaptureFlow() {
    console.log('🧪 Moat: Starting end-to-end annotation flow test...');
    
    if (!canUseNewTaskSystem()) {
      console.warn('🧪 Moat: Cannot test new system - utilities not available');
      return false;
    }
    
    const testStartTime = performance.now();
    
    try {
      // Create a test annotation
      const testAnnotation = {
        id: generateTaskId(),
        content: "Test annotation for end-to-end flow validation",
        target: "body",
        elementLabel: "Test Element",
        elementContext: { tagName: "BODY", textContent: "Test" },
        boundingRect: { top: 0, left: 0, width: 100, height: 100 },
        pageUrl: window.location.href,
        timestamp: Date.now(),
        sessionId: Date.now().toString(),
        screenshot: null // Skip screenshot for test
      };
      
      console.log('🧪 Moat: Created test annotation:', testAnnotation.id);
      
      // Test the complete save pipeline
      const saveSuccess = await saveAnnotationWithNewSystem(testAnnotation);
      
      if (!saveSuccess) {
        console.error('🧪 Moat: Test failed - save pipeline returned false');
        return false;
      }
      
      // Verify task was added to TaskStore
      const allTasks = taskStore.getAllTasks();
      const testTask = allTasks.find(task => task.id === testAnnotation.id);
      
      if (!testTask) {
        console.error('🧪 Moat: Test failed - task not found in TaskStore');
        return false;
      }
      
      // Verify task format
      const requiredFields = ['id', 'comment', 'elementLabel', 'target', 'createdAt', 'status'];
      const missingFields = requiredFields.filter(field => !testTask[field]);
      
      if (missingFields.length > 0) {
        console.error('🧪 Moat: Test failed - missing required fields:', missingFields);
        return false;
      }
      
      // Test performance requirement (< 500ms)
      const testDuration = performance.now() - testStartTime;
      if (testDuration > 500) {
        console.warn(`🧪 Moat: Performance test warning - operation took ${testDuration.toFixed(1)}ms (> 500ms)`);
      } else {
        console.log(`🧪 Moat: Performance test passed - operation took ${testDuration.toFixed(1)}ms`);
      }
      
      // Clean up test task
      await taskStore.removeTask(testTask.id);
      await markdownGenerator.rebuildMarkdownFile(taskStore.getAllTasksChronological());
      
      console.log('🧪 Moat: End-to-end test completed successfully');
      return true;
      
    } catch (error) {
      console.error('🧪 Moat: End-to-end test failed with error:', error);
      return false;
    }
  }

  // Run end-to-end test when system is ready (Task 2.8)
  function runEndToEndTestWhenReady() {
    if (canUseNewTaskSystem()) {
      console.log('🧪 Moat: New task system ready, running end-to-end test...');
      testAnnotationCaptureFlow().then(success => {
        if (success) {
          console.log('✅ Moat: End-to-end test passed - new system is working correctly');
        } else {
          console.error('❌ Moat: End-to-end test failed - check system configuration');
        }
      });
    } else {
      console.log('🧪 Moat: New task system not ready, will retry in 1 second...');
      setTimeout(runEndToEndTestWhenReady, 1000);
    }
  }

  // Get status emoji for markdown
  function getStatusEmoji(status) {
    switch (status) {
      case 'in queue': return '📋';
      case 'sent': return '📤';
      case 'in progress': return '⏳';
      case 'resolved': return '✅';
      default: return '📋';
    }
  }

  // Add annotation to queue (refactored for Tasks 2.2-2.8)
  async function addToQueue(annotation) {
    console.log('📝 Moat: ===== STARTING ANNOTATION PROCESSING =====');
    console.log('📝 Moat: Processing annotation:', annotation.elementLabel);
    console.log('📝 Moat: Annotation ID:', annotation.id);
    
    // Choose save system based on availability (Task 2.8: End-to-end flow)
    const canUseNew = canUseNewTaskSystem();
    console.log('📝 Moat: System selection result:', canUseNew ? 'NEW SYSTEM' : 'LEGACY SYSTEM');
    
    if (canUseNew) {
      console.log('📝 Moat: ✅ New task system available, using TaskStore + MarkdownGenerator');
      const success = await saveAnnotationWithNewSystem(annotation);
      console.log('📝 Moat: New system save result:', success ? 'SUCCESS' : 'FAILED');
      
      if (!success) {
        console.log('📝 Moat: ⚠️ New system failed, falling back to legacy');
        // Fallback to legacy system
        const queue = JSON.parse(localStorage.getItem('moat.queue') || '[]');
        queue.push(annotation);
        localStorage.setItem('moat.queue', JSON.stringify(queue));
        await saveAnnotationWithLegacySystem(annotation);
      }
    } else {
      console.log('📝 Moat: ❌ New task system not available, falling back to legacy system');
      // Add to localStorage for backward compatibility when using legacy system
      const queue = JSON.parse(localStorage.getItem('moat.queue') || '[]');
      queue.push(annotation);
      localStorage.setItem('moat.queue', JSON.stringify(queue));
      
      await saveAnnotationWithLegacySystem(annotation);
    }
    
    console.log('📝 Moat: ===== ANNOTATION PROCESSING COMPLETE =====');
  }

  // Get user-friendly element label
  function getElementLabel(element) {
    const tagName = element.tagName.toLowerCase();
    
    // For links
    if (tagName === 'a') {
      const text = element.textContent.trim();
      return text ? `Link: ${text}` : 'Link';
    }
    
    // For buttons
    if (tagName === 'button' || element.type === 'button') {
      const text = element.textContent.trim();
      return text ? `Button: ${text}` : 'Button';
    }
    
    // For inputs
    if (tagName === 'input') {
      const type = element.type || 'text';
      const placeholder = element.placeholder;
      const label = element.getAttribute('aria-label') || placeholder;
      return label ? `Input (${type}): ${label}` : `Input (${type})`;
    }
    
    // For images
    if (tagName === 'img') {
      const alt = element.alt;
      return alt ? `Image: ${alt}` : 'Image';
    }
    
    // For divs and containers
    if (tagName === 'div' || tagName === 'section' || tagName === 'article' || tagName === 'main') {
      const role = element.getAttribute('role');
      const ariaLabel = element.getAttribute('aria-label');
      const id = element.id;
      
      if (role) return `Container (${role})`;
      if (ariaLabel) return `Container: ${ariaLabel}`;
      if (id) return `Container #${id}`;
      
      // Check for common class patterns
      const classes = element.className.split(' ').filter(c => c && !c.startsWith('moat-'));
      if (classes.includes('header')) return 'Header Container';
      if (classes.includes('footer')) return 'Footer Container';
      if (classes.includes('sidebar')) return 'Sidebar Container';
      if (classes.includes('nav') || classes.includes('navigation')) return 'Navigation Container';
      if (classes.includes('content') || classes.includes('main')) return 'Main Container';
      
      // If it has background color or image, label it as such
      const computedStyle = window.getComputedStyle(element);
      if (computedStyle.backgroundImage !== 'none') return 'Background Container';
      if (computedStyle.backgroundColor !== 'rgba(0, 0, 0, 0)' && 
          computedStyle.backgroundColor !== 'transparent') return 'Colored Container';
      
      return 'Container';
    }
    
    // For lists
    if (tagName === 'ul' || tagName === 'ol') {
      return 'List';
    }
    
    if (tagName === 'li') {
      const text = element.textContent.trim().substring(0, 20);
      return text ? `List Item: ${text}${text.length > 20 ? '...' : ''}` : 'List Item';
    }
    
    // For elements with aria-label
    const ariaLabel = element.getAttribute('aria-label');
    if (ariaLabel) {
      return `${tagName}: ${ariaLabel}`;
    }
    
    // For elements with text content
    const text = element.textContent.trim().substring(0, 30);
    if (text) {
      return `${tagName}: ${text}${text.length > 30 ? '...' : ''}`;
    }
    
    // Default - capitalize tag name
    return tagName.charAt(0).toUpperCase() + tagName.slice(1);
  }

  // Get CSS selector for element
  function getSelector(element) {
    // First, check for ID
    if (element.id) {
      return `#${element.id}`;
    }
    
    const tagName = element.tagName.toLowerCase();
    
    // For links, try href attribute
    if (tagName === 'a' && element.href) {
      const href = element.getAttribute('href');
      if (href && href !== '#') {
        return `a[href="${href}"]`;
      }
    }
    
    // Check for unique attributes
    const uniqueAttributes = ['data-testid', 'data-id', 'data-component', 'aria-label', 'name', 'role'];
    for (const attr of uniqueAttributes) {
      const value = element.getAttribute(attr);
      if (value) {
        return `${tagName}[${attr}="${value}"]`;
      }
    }
    
    // For buttons/inputs with specific text
    if (tagName === 'button') {
      const text = element.textContent.trim();
      if (text && document.querySelectorAll(`button`).length > 1) {
        // Use nth-of-type to be more specific
        const parent = element.parentElement;
        const buttons = Array.from(parent.querySelectorAll('button'));
        const index = buttons.indexOf(element) + 1;
        if (index > 0) {
          return `${getSelector(parent)} > button:nth-of-type(${index})`;
        }
      }
    }
    
    // Build path-based selector
    const path = [];
    let current = element;
    
    while (current && current !== document.body) {
      let selector = current.tagName.toLowerCase();
      
      // Skip if we hit an element with ID
      if (current.id) {
        path.unshift(`#${current.id}`);
        break;
      }
      
      // For containers, try to use semantic selectors
      if (selector === 'div' || selector === 'section' || selector === 'article') {
        const role = current.getAttribute('role');
        const dataTestId = current.getAttribute('data-testid');
        
        if (role) {
          selector = `${selector}[role="${role}"]`;
        } else if (dataTestId) {
          selector = `${selector}[data-testid="${dataTestId}"]`;
        } else {
          // Add classes (but filter out moat classes and common utility classes)
          if (current.className && typeof current.className === 'string') {
            const classes = current.className
              .split(' ')
              .filter(c => c && !c.startsWith('moat-') && !c.match(/^(w-|h-|p-|m-|flex|grid|block|inline)/))
              .slice(0, 2); // Only use first 2 meaningful classes
            
            if (classes.length > 0) {
              selector += `.${classes.join('.')}`;
            }
          }
        }
      } else {
        // For non-containers, add classes
        if (current.className && typeof current.className === 'string') {
          const classes = current.className
            .split(' ')
            .filter(c => c && !c.startsWith('moat-'))
            .slice(0, 2);
          
          if (classes.length > 0) {
            selector += `.${classes.join('.')}`;
          }
        }
      }
      
      // Add nth-child if needed
      if (current.parentElement) {
        const siblings = Array.from(current.parentElement.children);
        const index = siblings.indexOf(current) + 1;
        
        // Only add nth-child if there are multiple siblings of same type
        const sameTags = siblings.filter(s => s.tagName === current.tagName);
        if (sameTags.length > 1) {
          selector += `:nth-child(${index})`;
        }
      }
      
      path.unshift(selector);
      current = current.parentElement;
    }
    
    // Return the path, limited to last 3 elements for brevity
    return path.slice(-3).join(' > ');
  }

  // Validate selector returns exactly one element
  function validateSelector(selector, targetElement) {
    try {
      const elements = document.querySelectorAll(selector);
      if (elements.length === 1 && elements[0] === targetElement) {
        return true;
      }
      return false;
    } catch (e) {
      return false;
    }
  }

  // Get enhanced element context
  function getElementContext(element) {
    return {
      tagName: element.tagName.toLowerCase(),
      text: element.textContent.trim().substring(0, 100),
      href: element.href || null,
      type: element.type || null,
      ariaLabel: element.getAttribute('aria-label') || null,
      dataTestId: element.getAttribute('data-testid') || null,
      className: element.className && typeof element.className === 'string' 
        ? element.className.split(' ').filter(c => c && !c.startsWith('moat-')).join(' ')
        : null
    };
  }

  // Create comment input box
  function createCommentBox(element, x, y) {
    // If comment box already exists, shake it instead of creating new one
    if (commentBox) {
      shakeCommentBox();
      return;
    }
    
    // Add visual confirmation pulse
    element.classList.add('float-highlight-pulse');
    setTimeout(() => {
      element.classList.remove('float-highlight-pulse');
    }, 500);
    
    commentBox = document.createElement('div');
    commentBox.className = 'float-comment-box';
    commentBox.innerHTML = `
      <textarea 
        class="float-comment-input" 
        placeholder="What needs to be fixed?"
        autofocus
      ></textarea>
      <div class="float-comment-actions">
        <button class="float-comment-cancel">Cancel</button>
        <button class="float-comment-submit">Submit (Enter)</button>
      </div>
    `;
    
    document.body.appendChild(commentBox);
    
    // Position near clicked element
    const rect = element.getBoundingClientRect();
    commentBox.style.left = `${Math.min(rect.left, window.innerWidth - 320)}px`;
    commentBox.style.top = `${rect.bottom + 10}px`;
    
    // Make sure it's visible in viewport
    const boxRect = commentBox.getBoundingClientRect();
    if (boxRect.bottom > window.innerHeight) {
      commentBox.style.top = `${rect.top - boxRect.height - 10}px`;
    }
    
    const textarea = commentBox.querySelector('textarea');
    const submitBtn = commentBox.querySelector('.float-comment-submit');
    const cancelBtn = commentBox.querySelector('.float-comment-cancel');
    
    // Focus textarea
    setTimeout(() => textarea.focus(), 50);
    
    // Handle submit
    const handleSubmit = async () => {
      const content = textarea.value.trim();
      if (!content) return;
      
      const rect = element.getBoundingClientRect();
      const selector = getSelector(element);
      
      // Validate selector
      if (!validateSelector(selector, element)) {
        console.warn('Moat: Selector validation failed, using fallback');
      }
      
      // Create annotation object
      const annotation = {
        type: "user_message",
        role: "user",
        content: content,
        target: selector,
        elementLabel: getElementLabel(element),
        elementContext: getElementContext(element),
        selectorMethod: "querySelector",
        boundingRect: {
          x: Math.round(rect.x),
          y: Math.round(rect.y),
          width: Math.round(rect.width),
          height: Math.round(rect.height)
        },
        pageUrl: window.location.href,
        timestamp: Date.now(),
        sessionId: sessionId,
        status: "in queue",
        id: `moat-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      };
      
      // Try to capture screenshot
      if (window.html2canvas) {
        try {
          const canvas = await html2canvas(element, {
            backgroundColor: null,
            scale: 1,
            logging: false,
            width: rect.width,
            height: rect.height
          });
          annotation.screenshot = canvas.toDataURL('image/png');
        } catch (e) {
          console.warn('Moat: Screenshot capture failed', e);
        }
      }
      
      addToQueue(annotation);
      exitCommentMode();
    };
    
    // Event listeners
    submitBtn.addEventListener('click', handleSubmit);
    cancelBtn.addEventListener('click', exitCommentMode);
    
    textarea.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSubmit();
      } else if (e.key === 'Escape') {
        exitCommentMode();
      }
    });
  }

  // Shake comment box to indicate it's already open
  function shakeCommentBox() {
    if (!commentBox) return;
    
    commentBox.classList.add('float-shake');
    setTimeout(() => {
      commentBox.classList.remove('float-shake');
    }, 500);
    
    // Also focus the textarea
    const textarea = commentBox.querySelector('textarea');
    if (textarea) textarea.focus();
  }

  // Remove comment box
  function removeCommentBox() {
    if (commentBox) {
      commentBox.remove();
      commentBox = null;
    }
  }

  // Enter comment mode
  function enterCommentMode() {
    commentMode = true;
    document.body.classList.add('float-comment-mode');
    
    // Show notification
    const notification = document.createElement('div');
    notification.className = 'float-notification';
    notification.textContent = 'Click any element to annotate';
    document.body.appendChild(notification);
    
    setTimeout(() => notification.remove(), 3000);
  }

  // Exit comment mode
  function exitCommentMode() {
    commentMode = false;
    document.body.classList.remove('float-comment-mode');
    removeCommentBox();
    removeHighlight();
  }

  // Highlight element on hover
  function highlightElement(element) {
    removeHighlight();
    highlightedElement = element;
    element.classList.add('float-highlight');
  }

  // Remove highlight
  function removeHighlight() {
    if (highlightedElement) {
      highlightedElement.classList.remove('float-highlight');
      highlightedElement = null;
    }
  }

  // Export annotations
  function exportAnnotations() {
    const queue = JSON.parse(localStorage.getItem('moat.queue') || '[]');
    const exportData = {
      version: '1.0.0',
      sessionId,
      timestamp: Date.now(),
      url: window.location.href,
      protocol: 'file',
      annotations: queue
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `moat-annotations-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    showNotification(`Exported ${queue.length} annotations`);
  }

  // Mouse move handler
  document.addEventListener('mousemove', (e) => {
    if (!commentMode || commentBox) return; // Don't highlight if comment box is open
    
    const element = document.elementFromPoint(e.clientX, e.clientY);
    if (element && element !== hoveredElement && 
        !element.closest('.float-comment-box') && 
        !element.closest('.float-moat')) {
      hoveredElement = element;
      highlightElement(element);
    }
  });

  // Click handler
  document.addEventListener('click', (e) => {
    if (!commentMode) return;
    
    const element = e.target;
    if (element.closest('.float-comment-box') || element.closest('.float-moat')) {
      return;
    }
    
    e.preventDefault();
    e.stopPropagation();
    
    createCommentBox(element, e.clientX, e.clientY);
  }, true);

  // Listen for keyboard events
  document.addEventListener('keydown', (e) => {
    // Enter comment mode with 'f' key
    if (e.key === 'f' && !commentMode && !e.target.matches('input, textarea')) {
      e.preventDefault();
      enterCommentMode();
    }
    
    // Exit comment mode with Escape
    if (e.key === 'Escape' && commentMode) {
      e.preventDefault();
      exitCommentMode();
    }
    
    // Toggle sidebar with Cmd+Shift+F
    if (e.key === 'f' && e.metaKey && e.shiftKey) {
      e.preventDefault();
      window.dispatchEvent(new CustomEvent('moat:toggle-moat'));
    }
    
    // Export annotations with Cmd+Shift+E
    if (e.key === 'e' && e.metaKey && e.shiftKey) {
      e.preventDefault();
      exportAnnotations();
    }
    
    // Connect to project with Cmd+Shift+P
    if (e.key === 'p' && e.metaKey && e.shiftKey) {
      e.preventDefault();
      setupProject();
    }
  });

  // Initialize Moat extension on page load
  initializeExtension();
  
  // Add Moat badge to indicate active status
  const badge = document.createElement('div');
  badge.className = 'float-badge';
  badge.innerHTML = `
    <div class="float-badge-content">
      <span class="float-badge-icon">🎯</span>
      <span class="float-badge-status">File</span>
    </div>
  `;
  document.body.appendChild(badge);

  console.log('Moat Chrome Extension loaded (AG-UI disabled)');

  // Task 4.10: Export debugging functions for manual testing
  window.moatDebug = {
    exportAnnotations,
    getQueue: () => JSON.parse(localStorage.getItem('moat.queue') || '[]'),
    clearQueue: () => localStorage.removeItem('moat.queue'),
    testAnnotationCaptureFlow,
    runEndToEndTest: runEndToEndTestWhenReady,
    // Migration debugging functions
    triggerMigration: triggerManualMigration,
    rollbackMigration: triggerMigrationRollback,
    checkLegacyFiles: async () => {
      if (migrator) {
        return await migrator.detectLegacyFiles();
      }
      return { error: 'Migration system not available' };
    },
    getMigrationReport: () => {
      if (migrator) {
        return migrator.getMigrationReport();
      }
      return window.moatMigrationReport || { error: 'No migration report available' };
    },
    // Task system debugging
    getTaskStore: () => taskStore,
    getMarkdownGenerator: () => markdownGenerator,
    getMigrator: () => migrator,
    testMigrationWithRealData: async () => {
      console.log('🧪 Testing migration with demo-page data...');
      if (!migrator) {
        console.error('Migration system not available');
        return { success: false, error: 'Migration system not available' };
      }
      
      try {
        const result = await migrator.performMigration();
        console.log('🧪 Migration test result:', result);
        return result;
      } catch (error) {
        console.error('🧪 Migration test failed:', error);
        return { success: false, error: error.message };
      }
    },
    // NEW: Debug functions for current issue
    checkSystemStatus: () => {
      console.log('🔧 === MOAT SYSTEM STATUS ===');
      console.log('TaskStore available:', !!taskStore);
      console.log('MarkdownGenerator available:', !!markdownGenerator);
      console.log('DirectoryHandle available:', !!window.directoryHandle);
      console.log('Can use new system:', canUseNewTaskSystem());
      console.log('MoatTaskStore on window:', !!window.MoatTaskStore);
      console.log('MoatMarkdownGenerator on window:', !!window.MoatMarkdownGenerator);
      return {
        taskStore: !!taskStore,
        markdownGenerator: !!markdownGenerator,
        directoryHandle: !!window.directoryHandle,
        canUseNewSystem: canUseNewTaskSystem(),
        windowTaskStore: !!window.MoatTaskStore,
        windowMarkdownGenerator: !!window.MoatMarkdownGenerator
      };
    },
    verifyFiles: verifyFilesWritten,
    testTaskSave: async (testComment = 'Debug test task') => {
      console.log('🧪 Testing task save with comment:', testComment);
      const annotation = {
        id: `debug-${Date.now()}`,
        elementLabel: 'Debug Test Element',
        content: testComment,
        target: 'body',
        boundingRect: { x: 0, y: 0, width: 100, height: 100 },
        pageUrl: window.location.href,
        timestamp: Date.now()
      };
      
      try {
        await addToQueue(annotation);
        console.log('🧪 Test task save completed');
        return { success: true, annotation };
      } catch (error) {
        console.error('🧪 Test task save failed:', error);
        return { success: false, error: error.message };
      }
    },
    reinitialize: () => {
      console.log('🔧 Reinitializing utilities...');
      initializeUtilities();
      return window.moatDebug.checkSystemStatus();
    }
  };

  // Listen for messages from popup
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'toggleMoat') {
      window.dispatchEvent(new CustomEvent('moat:toggle-moat'));
      sendResponse({ success: true });
    } else if (request.action === 'getQueueStatus') {
      const queue = JSON.parse(localStorage.getItem('moat.queue') || '[]');
      sendResponse({ 
        count: queue.length,
        protocol: 'file',
        projectConnected: !!markdownFileHandle
      });
    } else if (request.action === 'exportAnnotations') {
      exportAnnotations();
      sendResponse({ success: true });
    }
    
    return true; // Keep message channel open for async response
  });

  // Listen for project setup requests from Moat
  window.addEventListener('moat:setup-project', (e) => {
    console.log('Moat: Received moat:setup-project event');
    setupProject();
  });
  




  // Initialize extension
  async function initializeExtension() {
    try {
      console.log('🚀 Initializing Moat Chrome Extension...');
      
      // Clear any existing directory handle on extension reload
      console.log('🔧 Moat: Clearing existing connections on extension reload...');
      window.directoryHandle = null;
      
      // Clear any stored project connections to force fresh connection
      const projectKey = `moat.project.${window.location.origin}`;
      if (localStorage.getItem(projectKey)) {
        console.log('🔧 Moat: Clearing stored project connection');
        localStorage.removeItem(projectKey);
      }
      
      // Initialize utilities first
      const utilitiesReady = await initializeUtilities();
      if (utilitiesReady) {
        console.log('✅ New task system ready');
      } else {
        console.log('⚠️ Falling back to legacy system');
      }
      
      // Initialize UI
      initializeUI();
      
      // Test annotation capture flow after 2 seconds
      setTimeout(testAnnotationCaptureFlow, 2000);
      
      console.log('✅ Moat extension initialized');
      console.log('🔧 Moat: To connect to project, press Cmd+Shift+P or run setupProject()');
      
    } catch (error) {
      console.error('❌ Extension initialization failed:', error);
    }
  }

  // Initialize UI components
  function initializeUI() {
    // Initialize queue
    initializeQueue();
    
    // Run end-to-end test to verify new system functionality (Task 2.8)
    setTimeout(runEndToEndTestWhenReady, 2000); // Wait 2 seconds for full initialization
  }
})(); 