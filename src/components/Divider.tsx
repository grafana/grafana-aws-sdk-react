// copied from Azure Data Explorer plugin since there is not Divider component in G<10.1
import React from 'react';
import { useTheme2 } from '@grafana/ui';

export function Divider() {
  const theme = useTheme2();
  return (
    <div
      style={{ borderTop: `1px solid ${theme.colors.border.weak}`, margin: theme.spacing(2, 0), width: '100%' }}
    ></div>
  );
}
