## 2026-02-14 - TUI Input Disabled State
**Learning:** `ink-text-input` lacks a native `disabled` prop, requiring manual conditional rendering of a static `Text` component to prevent user confusion during async operations.
**Action:** Always implement a `disabled` prop wrapper for `InputArea` components in TUI applications to provide visual feedback (e.g., greyed out text, spinner).
