import * as React from 'react';
import { Box, Text } from 'ink';
import TextInput from 'ink-text-input';
import { COLORS } from '../styles';

interface Props {
  onSubmit: (value: string) => void;
  prompt?: string;
  placeholder?: string;
}

export const InputArea: React.FC<Props> = ({ onSubmit, prompt = '> ', placeholder }) => {
  const [value, setValue] = React.useState('');

  return (
    <Box borderStyle="round" borderColor={COLORS.highlight} flexDirection="row" width="100%">
      <Text color={COLORS.success}>{prompt}</Text>
      <TextInput
        value={value}
        onChange={setValue}
        onSubmit={(val: string) => {
          onSubmit(val);
          setValue('');
        }}
        placeholder={placeholder}
      />
    </Box>
  );
};
