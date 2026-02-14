import * as React from 'react';
import { Box, Text } from 'ink';
import Gradient from 'ink-gradient';
import { COLORS } from '../styles';

export const Header: React.FC = () => (
  <Box borderStyle="round" borderColor={COLORS.primary} paddingX={1} marginBottom={0} justifyContent="space-between">
    <Gradient name="atlas">
        <Text bold>  OPENCODE TOOLS - ENTERPRISE AI  </Text>
    </Gradient>
    <Box>
        <Text color={COLORS.muted}>Status: </Text>
        <Text color={COLORS.success}>OPERATIONAL</Text>
    </Box>
  </Box>
);
