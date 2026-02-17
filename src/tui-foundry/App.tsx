/**
 * Foundry TUI - Main Application Component
 * Consolidated TUI with all screens and features
 */

import React from 'react';
import { Box, Text, useInput } from 'ink';
import { useStore } from './store/store';
import { MainLayout } from './components/layout';
import { ChatPanel } from './components/chat';
import { Panel, Badge, ProgressBar, Spinner } from './components/common';
import { COLORS, TEXT_STYLES, getStatusColor, getStatusIcon } from './theme';
import type { FoundryScreen } from './types';
import { SCREEN_ORDER, SCREEN_LABELS } from './types';
import { selectDashboardMetrics } from './store/selectors';

// =============================================================================
// Dashboard Screen
// =============================================================================

function DashboardScreen(): React.ReactElement {
  const { state, dispatch } = useStore();
  const metrics = selectDashboardMetrics(state);

  return React.createElement(Box, { flexDirection: 'column', flexGrow: 1 },
    // Stats Row
    React.createElement(Box, { flexDirection: 'row', marginBottom: 1 },
      React.createElement(StatCard, {
        title: 'Projects',
        value: metrics.totalProjects.toString(),
        subtitle: `${metrics.activeProjects} active`,
        color: COLORS.primary,
      }),
      React.createElement(StatCard, {
        title: 'Agents',
        value: metrics.activeAgents.toString(),
        subtitle: `/${metrics.totalAgents} total`,
        color: COLORS.success,
      }),
      React.createElement(StatCard, {
        title: 'Gates',
        value: `${metrics.passedGates}/${metrics.totalGates}`,
        subtitle: `${metrics.failedGates} failed`,
        color: COLORS.warning,
      })
    ),

    // Main Content
    React.createElement(Box, { flexDirection: 'row', flexGrow: 1 },
      // Activity Feed
      React.createElement(Box, { flexDirection: 'column', width: '60%', marginRight: 1 },
        React.createElement(Panel, { title: 'Recent Activity' },
          state.feed.slice(0, 8).map((entry: typeof state.feed[0], idx: number) =>
            React.createElement(Box, { key: entry.id || idx, marginY: 0 },
              React.createElement(Text, { color: COLORS.muted },
                new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              ),
              React.createElement(Text, { color: COLORS.primary }, ` ${entry.actor} `),
              React.createElement(Text, null, entry.message)
            )
          )
        )
      ),

      // Quality Gates
      React.createElement(Box, { flexDirection: 'column', width: '40%' },
        React.createElement(Panel, { title: 'Quality Gates' },
          state.qualityGates.map((gate: typeof state.qualityGates[0], idx: number) =>
            React.createElement(Box, { key: gate.id || idx, marginY: 1 },
              React.createElement(Box, { flexDirection: 'row', justifyContent: 'space-between' },
                React.createElement(Text, { bold: true }, gate.name),
                React.createElement(Badge, { status: gate.status })
              ),
              React.createElement(Text, { color: COLORS.muted, wrap: 'truncate-end' }, gate.detail)
            )
          )
        )
      )
    )
  );
}

function StatCard({ title, value, subtitle, color }: { title: string; value: string; subtitle: string; color: string }): React.ReactElement {
  return React.createElement(Box, { flexDirection: 'column', borderStyle: 'round', borderColor: COLORS.border, paddingX: 1, marginRight: 1 },
    React.createElement(Text, { color }, title),
    React.createElement(Text, { bold: true, color }, value),
    React.createElement(Text, { color: COLORS.muted }, subtitle)
  );
}

// =============================================================================
// Project Screen
// =============================================================================

function ProjectScreen(): React.ReactElement {
  const { state, dispatch } = useStore();

  return React.createElement(Box, { flexDirection: 'column', flexGrow: 1 },
    React.createElement(Box, { flexDirection: 'row', flexGrow: 1 },
      // Project List
      React.createElement(Box, { flexDirection: 'column', width: '40%', marginRight: 1 },
        React.createElement(Panel, { title: 'Projects' },
          state.projects.length === 0 && React.createElement(Text, { color: COLORS.muted }, 'No projects yet'),
          state.projects.map((project: typeof state.projects[0], idx: number) =>
            React.createElement(Box, {
              key: project.id || idx,
              borderStyle: state.activeProjectId === project.id ? 'double' : undefined,
              borderColor: COLORS.highlight,
              paddingX: 1,
              marginY: 1,
            },
              React.createElement(Box, { flexDirection: 'row', justifyContent: 'space-between' },
                React.createElement(Text, { bold: true }, project.name),
                React.createElement(Badge, { status: project.status })
              ),
              React.createElement(Text, { color: COLORS.muted }, project.industry),
              React.createElement(Text, { color: COLORS.muted, wrap: 'truncate-end' }, project.description)
            )
          )
        )
      ),

      // Project Form
      React.createElement(Box, { flexDirection: 'column', width: '60%' },
        React.createElement(Panel, { title: 'New Project' },
          React.createElement(FormField, {
            label: 'Name',
            value: state.projectIntake.name,
            onChange: (v) => dispatch({ type: 'UPDATE_INTAKE_FIELD', field: 'name', value: v }),
          }),
          React.createElement(FormField, {
            label: 'Industry',
            value: state.projectIntake.industry,
            onChange: (v) => dispatch({ type: 'UPDATE_INTAKE_FIELD', field: 'industry', value: v }),
          }),
          React.createElement(FormField, {
            label: 'Description',
            value: state.projectIntake.description,
            onChange: (v) => dispatch({ type: 'UPDATE_INTAKE_FIELD', field: 'description', value: v }),
          }),
          React.createElement(FormField, {
            label: 'Completion Criteria',
            value: state.projectIntake.completionCriteria,
            onChange: (v) => dispatch({ type: 'UPDATE_INTAKE_FIELD', field: 'completionCriteria', value: v }),
          }),
          React.createElement(Box, { marginTop: 1 },
            React.createElement(Text, { 
              color: COLORS.success
            }, 'Press Enter to Submit')
          )
        )
      )
    )
  );
}

function FormField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }): React.ReactElement {
  // Simple form field - in production would use proper input handling
  return React.createElement(Box, { marginY: 1 },
    React.createElement(Text, { color: COLORS.muted }, label),
    React.createElement(Text, null, value || `Enter ${label.toLowerCase()}...`)
  );
}

// =============================================================================
// Agent Hub Screen
// =============================================================================

function AgentHubScreen(): React.ReactElement {
  const { state, dispatch } = useStore();

  return React.createElement(Box, { flexDirection: 'column', flexGrow: 1 },
    React.createElement(Box, { flexDirection: 'row', flexGrow: 1 },
      // Team Members
      React.createElement(Box, { flexDirection: 'column', width: '50%', marginRight: 1 },
        React.createElement(Panel, { title: 'Team Roster' },
          state.team.map((member: typeof state.team[0], idx: number) =>
            React.createElement(Box, { key: member.id || idx, marginY: 1 },
              React.createElement(Box, { flexDirection: 'row', justifyContent: 'space-between' },
                React.createElement(Text, { bold: true }, member.name),
                React.createElement(Badge, { status: member.status })
              ),
              React.createElement(Text, { color: COLORS.muted }, member.roleLabel),
              member.currentTask && React.createElement(Text, { color: COLORS.primary, wrap: 'truncate-end' }, member.currentTask)
            )
          )
        )
      ),

      // Active Agents
      React.createElement(Box, { flexDirection: 'column', width: '50%' },
        React.createElement(Panel, { title: 'Active Agents' },
          state.agents.length === 0 && React.createElement(Text, { color: COLORS.muted }, 'No active agents'),
          state.agents.map((agent: typeof state.agents[0], idx: number) =>
            React.createElement(Box, { key: agent.id || idx, marginY: 1 },
              React.createElement(Box, { flexDirection: 'row', justifyContent: 'space-between' },
                React.createElement(Text, { bold: true }, agent.name),
                React.createElement(Badge, { status: agent.status })
              ),
              React.createElement(Text, { color: COLORS.muted, wrap: 'truncate-end' }, agent.task || 'No task'),
              React.createElement(ProgressBar, { percent: agent.progress })
            )
          )
        )
      )
    )
  );
}

// =============================================================================
// Execution Screen
// =============================================================================

function ExecutionScreen(): React.ReactElement {
  const { state } = useStore();

  return React.createElement(Box, { flexDirection: 'column', flexGrow: 1 },
    React.createElement(Box, { flexDirection: 'column', flexGrow: 1, borderStyle: 'round', borderColor: COLORS.border, paddingX: 1 },
      React.createElement(Box, { marginBottom: 1 }, React.createElement(Text, { bold: true }, 'Execution Monitor')),
      state.executionStreams.length === 0 && React.createElement(Text, { color: COLORS.muted }, 'No active execution streams'),
      state.executionStreams.map((stream: typeof state.executionStreams[0], sIdx: number) =>
        React.createElement(Box, { key: stream.id || sIdx, marginY: 1 },
          React.createElement(Box, { flexDirection: 'row', justifyContent: 'space-between' },
            React.createElement(Text, { bold: true }, stream.name),
            React.createElement(Badge, { status: stream.status })
          ),
          React.createElement(ProgressBar, { percent: stream.progress }),
          React.createElement(Box, { marginTop: 1 },
            stream.logs.slice(-5).map((log: typeof stream.logs[0], lIdx: number) =>
              React.createElement(Text, { 
                key: log.id || lIdx,
                color: log.level === 'error' ? COLORS.error : COLORS.muted,
                wrap: 'truncate-end'
              }, `[${log.level.toUpperCase()}] ${log.message}`)
            )
          )
        )
      )
    ),

    // Errors
    state.executionErrors.length > 0 && React.createElement(Box, { flexDirection: 'column', marginTop: 1, borderStyle: 'round', borderColor: COLORS.border, paddingX: 1 },
      React.createElement(Box, { marginBottom: 1 },
        React.createElement(Text, { bold: true }, 'Errors')
      ),
      state.executionErrors.slice(0, 5).map((errorMsg: string, idx: number) =>
        React.createElement(Text, { key: idx, color: COLORS.error, wrap: 'truncate-end' }, errorMsg)
      )
    )
  );
}

// =============================================================================
// Chat Screen
// =============================================================================

function ChatScreen(): React.ReactElement {
  return React.createElement(Box, { flexDirection: 'column', flexGrow: 1 },
    React.createElement(ChatPanel)
  );
}

// =============================================================================
// Settings Screen
// =============================================================================

function SettingsScreen(): React.ReactElement {
  const { state, dispatch } = useStore();

  return React.createElement(Box, { flexDirection: 'column', flexGrow: 1 },
    React.createElement(Box, { flexDirection: 'row', flexGrow: 1 },
      // LLM Configuration
      React.createElement(Box, { flexDirection: 'column', width: '50%', marginRight: 1 },
        React.createElement(Panel, { title: 'LLM Configuration' },
          React.createElement(SettingItem, { label: 'Provider', value: state.llmConfig.provider }),
          React.createElement(SettingItem, { label: 'Model', value: state.llmConfig.model }),
          React.createElement(SettingItem, { 
            label: 'Temperature', 
            value: state.llmConfig.temperature.toString() 
          }),
          React.createElement(SettingItem, { 
            label: 'Enabled', 
            value: state.llmConfig.enabled ? 'Yes' : 'No' 
          })
        )
      ),

      // UI Settings
      React.createElement(Box, { flexDirection: 'column', width: '50%' },
        React.createElement(Panel, { title: 'UI Settings' },
          React.createElement(SettingItem, { 
            label: 'Notifications', 
            value: state.settings.showNotifications ? 'Enabled' : 'Disabled' 
          }),
          React.createElement(SettingItem, { 
            label: 'Auto Scroll', 
            value: state.settings.autoScroll ? 'Enabled' : 'Disabled' 
          }),
          React.createElement(SettingItem, { 
            label: 'Compact Mode', 
            value: state.settings.compactMode ? 'Enabled' : 'Disabled' 
          }),
          React.createElement(SettingItem, { 
            label: 'Theme', 
            value: state.settings.theme 
          })
        )
      )
    )
  );
}

function SettingItem({ label, value }: { label: string; value: string }): React.ReactElement {
  return React.createElement(Box, { marginY: 1 },
    React.createElement(Text, { color: COLORS.muted }, label),
    React.createElement(Text, null, value)
  );
}

// =============================================================================
// Main App Component
// =============================================================================

export function App(): React.ReactElement {
  const { state, dispatch } = useStore();

  // Global keyboard shortcuts
  useInput((input, key) => {
    // Number keys for screens
    if (!key.ctrl && !key.meta && input >= '1' && input <= '6') {
      const index = parseInt(input, 10) - 1;
      if (index >= 0 && index < SCREEN_ORDER.length) {
        dispatch({ type: 'SET_SCREEN', screen: SCREEN_ORDER[index] });
      }
      return;
    }

    // Arrow keys
    if (key.leftArrow) {
      const currentIndex = SCREEN_ORDER.indexOf(state.screen);
      const newIndex = currentIndex > 0 ? currentIndex - 1 : SCREEN_ORDER.length - 1;
      dispatch({ type: 'SET_SCREEN', screen: SCREEN_ORDER[newIndex] });
      return;
    }

    if (key.rightArrow) {
      const currentIndex = SCREEN_ORDER.indexOf(state.screen);
      const newIndex = currentIndex < SCREEN_ORDER.length - 1 ? currentIndex + 1 : 0;
      dispatch({ type: 'SET_SCREEN', screen: SCREEN_ORDER[newIndex] });
      return;
    }

    // Ctrl shortcuts
    if (key.ctrl) {
      switch (input.toLowerCase()) {
        case 'h':
        case 'k':
          dispatch({ type: 'TOGGLE_HELP' });
          return;
        case 'n':
          dispatch({ type: 'SET_SCREEN', screen: 'project' });
          return;
      }
    }

    // Escape
    if (key.escape) {
      if (state.isHelpVisible) {
        dispatch({ type: 'TOGGLE_HELP' });
      } else {
        dispatch({ type: 'NAVIGATE_BACK' });
      }
      return;
    }
  });

  // Render current screen
  const renderScreen = (): React.ReactElement => {
    switch (state.screen) {
      case 'dashboard':
        return React.createElement(DashboardScreen);
      case 'project':
        return React.createElement(ProjectScreen);
      case 'agentHub':
        return React.createElement(AgentHubScreen);
      case 'execution':
        return React.createElement(ExecutionScreen);
      case 'chat':
        return React.createElement(ChatScreen);
      case 'settings':
        return React.createElement(SettingsScreen);
      default:
        return React.createElement(DashboardScreen);
    }
  };

  return React.createElement(MainLayout, null, renderScreen());
}
