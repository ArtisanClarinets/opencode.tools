# OpenCode TUI Integration

This document explains how to integrate the OpenCode Tools Research Agent into the OpenCode TUI system.

## 🔗 Integration Points

The Research Agent is designed to be **exclusively** accessible through the OpenCode TUI. There are no standalone CLI commands.

### 1. Main Integration Module

**File:** `src/index.ts`

```typescript
import { registerTUITools, researchTools } from 'opencode-tools';

// Get all available TUI tools
const tools = registerTUITools();

// Execute a specific tool
const result = await executeTool('research-agent', {
  mode: 'interactive'
});
```

### 2. TUI Command Registration

**File:** `src/tui-commands.ts`

This module provides ready-to-use TUI command registration:

```typescript
import { registerResearchAgentWithTUI, tuiIntegration } from 'opencode-tools/src/tui-commands';

// Method 1: Register with TUI registry
registerResearchAgentWithTUI(tuiRegistry);

// Method 2: Direct TUI integration
tuiIntegration.initialize(tuiContext);
```

## 🎯 Usage Patterns

### Pattern 1: Interactive Research (Full TUI Experience)

```typescript
import { researchTools } from 'opencode-tools';

// Launch interactive research with TUI prompts
await researchTools.interactive();
```

### Pattern 2: Research from Brief File

```typescript
import { researchTools } from 'opencode-tools';

// Research using a client brief file
const result = await researchTools.fromBrief(
  'path/to/client-brief.json',
  'artifacts/output.json'
);
```

### Pattern 3: Quick Research

```typescript
import { researchTools } from 'opencode-tools';

// Quick research with minimal parameters
const result = await researchTools.quick(
  'AcmeCorp',
  'Healthcare',
  'A healthcare technology company'
);
```

## 🔧 TUI Menu Integration

The Research Agent provides a structured menu for TUI integration:

```typescript
const researchMenu = {
  title: 'Research Agent',
  description: 'Generate comprehensive research dossiers',
  options: [
    {
      key: '1',
      label: '🔄 Interactive Research',
      description: 'Guided research with TUI prompts',
      action: () => researchTools.interactive()
    },
    {
      key: '2', 
      label: '📄 Research from Brief',
      description: 'Research using client brief file',
      action: () => researchTools.fromBrief(briefPath, outputPath)
    },
    {
      key: '3',
      label: '⚡ Quick Research',
      description: 'Fast research with minimal input',
      action: () => researchTools.quick(company, industry, description)
    }
  ]
};
```

## 📋 TUI Implementation Requirements

To integrate the Research Agent into your TUI:

### 1. Import the Integration Module

```typescript
import { tuiIntegration } from 'opencode-tools/src/tui-commands';
```

### 2. Initialize in TUI Context

```typescript
// In your TUI initialization
function initializeTUI() {
  const tuiContext = createTUIContext();
  
  // Register Research Agent
  tuiIntegration.initialize(tuiContext);
  
  // The Research Agent is now available in TUI menus
}
```

### 3. Access Research Results

```typescript
// Research results are automatically saved to artifacts/
const results = {
  dossier: 'artifacts/CompanyName-research-2024-01-23-dossier.json',
  sources: 'artifacts/CompanyName-research-2024-01-23-sources.json',
  meta: 'artifacts/CompanyName-research-2024-01-23-meta.json'
};
```

## 🚫 What NOT to Do

❌ **Do NOT create standalone CLI commands**  
❌ **Do NOT register global npm binaries**  
❌ **Do NOT allow direct command-line access**  

✅ **ONLY access through TUI interface**  
✅ **ONLY use TUI-provided prompts and menus**  
✅ **ONLY execute within TUI context**  

## 🔄 Data Flow

1. **TUI Launch** → User selects Research Agent from menu
2. **Parameter Collection** → TUI collects parameters via prompts/file picker
3. **Agent Execution** → Research Agent runs within TUI context
4. **Progress Updates** → TUI displays progress and status
5. **Result Delivery** → Results saved to artifacts/ and displayed in TUI

## 📊 Output Structure

Research results are saved in structured format:

```
artifacts/
├── CompanyName-research-timestamp.json          # Complete results
├── CompanyName-research-timestamp-dossier.json  # Research dossier
├── CompanyName-research-timestamp-sources.json  # Citations
└── CompanyName-research-timestamp-meta.json     # Provenance
```

## 🔒 Security Considerations

- No direct file system access outside TUI context
- All paths validated through TUI file picker
- Results automatically organized in artifacts/
- Provenance metadata for audit trail
- No standalone execution capability

## 🎯 Next Steps

1. **Integrate with TUI** - Import and initialize in your TUI application
2. **Test Research Agent** - Verify it works within TUI context
3. **Add Documentation Agent** - Extend with additional agents
4. **Build Workflows** - Create multi-agent TUI workflows

The Research Agent is now ready for **exclusive TUI access** - no CLI hijacking possible!