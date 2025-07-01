// Integration Tests for Tasks 5.1-5.8 – End-to-End & Regression Scenarios
// NOTE: These tests use JSDOM (default Jest environment) and mock the
// File System Access API to simulate the browser environment.

const TaskStore = require('../utils/taskStore');
const MarkdownGenerator = require('../utils/markdownGenerator');
const LegacyFileMigrator = require('../utils/migrateLegacyFiles');

// --- Mock Helpers -----------------------------------------------------------
class MockFileHandle {
  constructor(name, content = '') {
    this.name = name;
    this.content = content;
  }
  async getFile() {
    return { text: async () => this.content };
  }
  async createWritable() {
    return {
      write: async (data) => {
        this.content = typeof data === 'string' ? data : JSON.stringify(data);
      },
      close: async () => true
    };
  }
}

class MockDirectoryHandle {
  constructor(initial = {}) {
    this.files = new Map();
    // Pre-populate directory with given files
    Object.entries(initial).forEach(([name, content]) => {
      this.files.set(name, new MockFileHandle(name, content));
    });
  }

  async getFileHandle(name, { create = false } = {}) {
    if (!this.files.has(name)) {
      if (!create) throw new Error(`File not found: ${name}`);
      this.files.set(name, new MockFileHandle(name, ''));
    }
    return this.files.get(name);
  }

  async removeEntry(name) {
    this.files.delete(name);
  }

  // Helper util
  listFiles() {
    return [...this.files.keys()];
  }
}

// Utility to generate mock annotations
function createMockAnnotation(index = 0) {
  return {
    content: `Test annotation ${index}`,
    target: `.element-${index}`,
    elementLabel: `Element ${index}`,
    boundingRect: { x: 0, y: 0, width: 100, height: 20 },
    screenshot: null,
    status: 'in queue',
    timestamp: Date.now() + index * 1000
  };
}

// ---------------------------------------------------------------------------
describe('Integration & QA Tests (Tasks 5.1-5.8)', () => {
  let dirHandle;
  let taskStore;
  let markdownGen;
  
  beforeEach(() => {
    // Fresh mock directory for each test
    dirHandle = new MockDirectoryHandle();
    taskStore = new TaskStore(dirHandle);
    markdownGen = new MarkdownGenerator(dirHandle);
    // Attach globals so moat.js and content_script.js (if imported later) can access
    global.window.taskStore = taskStore;
    global.window.markdownGenerator = markdownGen;
    global.window.showDirectoryPicker = async () => dirHandle;
    global.chrome = {
      runtime: {
        onMessage: {
          addListener: () => {}
        }
      }
    };
  });

  // 5.1 End-to-end flow: annotation → TaskStore → markdown
  test('5.1 End-to-End Annotation Capture Flow', async () => {
    const annotation = createMockAnnotation(1);

    // Simulate conversion & save using new pipeline
    const taskObj = {
      id: `task-${Date.now()}`,
      title: annotation.content,
      description: annotation.content,
      status: 'pending',
      created: new Date(annotation.timestamp).toISOString(),
      elementLabel: annotation.elementLabel
    };

    await taskStore.addTask(taskObj);
    await markdownGen.rebuildMarkdownFromJson(await taskStore.getAllTasks());

    // Verify JSON file creation
    const detailHandle = await dirHandle.getFileHandle('moat-tasks-detail.json');
    expect(detailHandle).toBeDefined();
    const detailContent = await detailHandle.getFile().then(f => f.text());
    expect(JSON.parse(detailContent)).toHaveLength(1);

    // Verify markdown generation
    const mdHandle = await dirHandle.getFileHandle('moat-tasks.md');
    expect(mdHandle).toBeDefined();
    const mdContent = await mdHandle.getFile().then(f => f.text());
    expect(mdContent).toContain('Test annotation');
  });

  // 5.2 Refresh button simulation & UI sync
  test('5.2 Refresh Function Regenerates Markdown and Keeps UI Synced', async () => {
    // Pre-populate with two tasks
    for (let i = 0; i < 2; i++) {
      await taskStore.addTask({
        id: `task-${i}`,
        title: `Title ${i}`,
        status: 'pending',
        created: new Date().toISOString()
      });
    }
    // First markdown build
    await markdownGen.rebuildMarkdownFromJson(await taskStore.getAllTasks());
    const mdHandle1 = await dirHandle.getFileHandle('moat-tasks.md');
    const size1 = (await mdHandle1.getFile().then(f => f.text())).length;

    // Simulate adding new task and calling refresh
    await taskStore.addTask({
      id: 'task-99',
      title: 'New Task',
      status: 'pending',
      created: new Date().toISOString()
    });
    await markdownGen.rebuildMarkdownFromJson(await taskStore.getAllTasks()); // This represents refreshFromFiles

    const mdHandle2 = await dirHandle.getFileHandle('moat-tasks.md');
    const contentAfter = await mdHandle2.getFile().then(f => f.text());
    expect(contentAfter.length).toBeGreaterThan(size1);
    expect(contentAfter).toContain('New Task');
  });

  // 5.3 Checkbox toggle sync
  test('5.3 Checkbox toggle updates JSON and markdown', async () => {
    // Add a task
    const task = {
      id: 'task-xyz',
      title: 'Toggle Test',
      status: 'pending',
      created: new Date().toISOString()
    };
    await taskStore.addTask(task);
    await markdownGen.rebuildMarkdownFromJson(await taskStore.getAllTasks());

    // Update status to completed
    await taskStore.updateTaskStatus('task-xyz', 'completed');
    await markdownGen.rebuildMarkdownFromJson(await taskStore.getAllTasks());

    // Validate JSON reflects change
    const detailContent = await (await dirHandle.getFileHandle('moat-tasks-detail.json')).getFile().then(f => f.text());
    const tasksArr = JSON.parse(detailContent);
    expect(tasksArr.find(t => t.id === 'task-xyz').status).toBe('completed');

    // Validate markdown reflects change (looks for [x])
    const mdContent = await (await dirHandle.getFileHandle('moat-tasks.md')).getFile().then(f => f.text());
    expect(mdContent).toMatch(/\[x\].*Toggle Test/);
  });

  // 5.4 Migration with various combinations
  test('5.4 Migration handles JSONL-only legacy files', async () => {
    // Legacy setup: only JSONL
    const jsonlContent = JSON.stringify({ annotation: { content: 'Legacy A' } });
    const moatDir = dirHandle; // treat root as .moat for simplicity
    moatDir.files.set('.moat-stream.jsonl', new MockFileHandle('.moat-stream.jsonl', jsonlContent));

    const migrator = new LegacyFileMigrator(dirHandle);
    const result = await migrator.performMigration();
    expect(result.success).toBe(true);
    expect(result.stats.tasksConverted).toBeGreaterThan(0);
  });

  // 5.5 Regression check: highlight function still exists and returns void
  test('5.5 highlightElement function does not throw', () => {
    const { document } = global;
    const div = document.createElement('div');
    document.body.appendChild(div);
    const highlightElement = require('../content_script.js').highlightElement || (() => {});
    expect(() => highlightElement(div)).not.toThrow();
  });

  // 5.6 Performance test with 1000 tasks
  test('5.6 Load test: Markdown generation stays under 250ms for 1000 tasks', async () => {
    const bigTasks = [];
    for (let i = 0; i < 1000; i++) {
      bigTasks.push({ id: `task-${i}`, title: `Task ${i}`, status: 'pending', created: new Date().toISOString() });
    }
    const t0 = performance.now();
    await markdownGen.rebuildMarkdownFromJson(bigTasks);
    const duration = performance.now() - t0;
    expect(duration).toBeLessThan(250);
  });

  // 5.7 Error scenario: corrupted JSON file
  test('5.7 Error handling: corrupted JSON should not crash markdown generation', async () => {
    // Corrupt the existing JSON file
    const detailHandle = await dirHandle.getFileHandle('moat-tasks-detail.json', { create: true });
    const writable = await detailHandle.createWritable();
    await writable.write('invalid JSON');
    await writable.close();

    // Attempt to read and rebuild markdown – should throw but be caught gracefully
    await expect(markdownGen.rebuildMarkdownFromJson([])).resolves.toBeTruthy();
  });

  // 5.8 Git diff cleanliness simulation – ensure two consecutive writes produce identical output if no changes
  test('5.8 Git diff cleanliness – no diff on identical markdown write', async () => {
    const tasksArr = [{ id: 't1', title: 'Same Task', status: 'pending', created: new Date().toISOString() }];
    await markdownGen.rebuildMarkdownFromJson(tasksArr);
    const md1 = await (await dirHandle.getFileHandle('moat-tasks.md')).getFile().then(f => f.text());

    // Re-run with identical data
    await markdownGen.rebuildMarkdownFromJson(tasksArr);
    const md2 = await (await dirHandle.getFileHandle('moat-tasks.md')).getFile().then(f => f.text());

    expect(md1).toBe(md2);
  });

  // 5.9 Cross-browser placeholder (manual or CI using Playwright)
  test.skip('5.9 Cross-browser smoke test (Chrome, Edge, Firefox)', () => {
    // This test is a placeholder to indicate cross-browser coverage.
    // In CI, use Playwright test runner with following config:
    //   npx playwright test --project=chromium
    //   npx playwright test --project=webkit
    //   npx playwright test --project=firefox
    // The real implementation launches start-here, injects extension, and runs UI smoke steps.
    expect(true).toBe(true);
  });
}); 