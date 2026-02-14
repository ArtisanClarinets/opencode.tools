import * as React from 'react';
import { Box, Text } from 'ink';
import { COLORS, STYLES } from '../styles';

export const Header: React.FC = () => (
  <Box borderStyle="round" borderColor={COLORS.primary} paddingX={1} marginBottom={1} justifyContent="center">
    <Text color={COLORS.primary} bold>OPENCODE TOOLS</Text>
    <Text color={COLORS.muted}> | </Text>
    <Text color={COLORS.secondary}>Interactive TUI</Text>
  </Box>
);
