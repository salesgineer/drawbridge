# 📋 Moat Rules - Streamlined System

This directory contains the remaining reference rules for Moat development. **Most users won't need these files** - the streamlined workflow is now built into the Chrome extension.

## 🚀 For End Users (GitHub Release)

When you install Moat and connect it to your project, the extension **automatically creates** a `.moat/` directory with these files:

- **`process-moat-tasks.mdc`** - Main command for processing UI tasks
- **`moat-workflow.mdc`** - Advanced workflow and batch processing  
- **`README.md`** - Project-specific instructions and examples

### Primary User Command:
```
Use @.moat/process-moat-tasks.mdc
```

## 📁 What's In This Directory

### Active Rules (For Development)
- **`moat-rules.mdc`** - Core automation patterns (used for Moat development)
- **`process-moat-tasks.mdc`** - Reference implementation

### Archived Rules (Legacy)
- **`rules-archive/`** - Contains the old complex rules system
  - `moat-enhanced-schema.mdc` - Complex schema (replaced by streamlined version)
  - `generate-moat-tasks.mdc` - Task generation (now embedded in extension)
  - `project-rules.mdc` - Redundant rules (consolidated into workflow)
  - `moat-auto-fix.mdc` - Too simple approach (replaced by human-approval workflow)

## 🎯 Design Philosophy

### Old System (Complex)
❌ Required users to manually install .mdc files in their Cursor rules  
❌ Multiple overlapping rule files with redundant content  
❌ Complex schemas that were overwhelming for simple UI changes  
❌ Dependence on global Cursor configuration  

### New System (Streamlined)
✅ **Zero Setup** - Rules auto-deploy when extension connects to project  
✅ **Two Core Files** - Streamlined workflow focused on essential patterns  
✅ **Project-Specific** - Rules live in the project, not global settings  
✅ **Human Approval** - AI processes one task at a time with user verification  
✅ **Self-Contained** - Everything works immediately after GitHub install  

## 🛠 For Moat Developers

If you're working on Moat itself, you can still use the development rules:

### Development Workflow:
```bash
# For processing Moat development tasks
Use @.cursor/rules/process-moat-tasks.mdc

# For core automation patterns  
Use @.cursor/rules/moat-rules.mdc
```

### Updating User Templates:
The user-facing templates are embedded in `moat-chrome/content_script.js` in the `deployRuleTemplates()` function. Update them there, not in separate .mdc files.

## 📊 Benefits of Streamlined System

### For Users:
- **Instant Setup** - No manual configuration required
- **Clear Instructions** - Project-specific README with examples
- **Familiar Pattern** - Follows ai-dev-tasks methodology
- **Version Control** - Rules are part of their project repository

### For Maintainers:
- **Single Source** - Templates are embedded in extension code
- **Easy Updates** - Update templates through extension updates
- **No Confusion** - Clear separation between dev rules and user rules
- **Better Testing** - Can test the exact user experience

## 🎯 Success Metrics

✅ **User Experience** - Zero setup required for GitHub users  
✅ **Maintainability** - Single source of truth for user rules  
✅ **Scalability** - Works for any project type automatically  
✅ **Professional** - Clean, focused workflow like other dev tools  

---

**The new system is ready for GitHub release!** 🚀 