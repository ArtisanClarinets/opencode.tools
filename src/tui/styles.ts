import { TextProps } from 'ink';

export const COLORS = {
  primary: '#00BFFF', // DeepSkyBlue
  secondary: '#FF69B4', // HotPink
  success: '#32CD32', // LimeGreen
  warning: '#FFD700', // Gold
  error: '#FF4500', // OrangeRed
  text: '#FFFFFF',
  muted: '#808080',
  border: '#444444',
  highlight: '#1E90FF',
};

export const STYLES = {
  header: {
    color: COLORS.primary,
    bold: true,
  },
  label: {
    color: COLORS.secondary,
    bold: true,
  },
  value: {
    color: COLORS.text,
  },
  border: {
    borderStyle: 'round',
    borderColor: COLORS.border,
  },
};
