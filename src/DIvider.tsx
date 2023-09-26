// copied from Azure Data Explorer plugin since there is not Divider component in G<10.1
import React from 'react';
import { useTheme2 } from '@grafana/ui';
// import { Divider as GrafanaDivider, useTheme2 } from '@grafana/ui';
// import { config } from '@grafana/runtime';
// import { isVersionGtOrEq } from 'version';

export function Divider() {
  //  TODO: include divider from grafana/ui when we update to 10
  //   if (isVersionGtOrEq(config.buildInfo.version, '10.1.0')) {
  //     return <GrafanaDivider />;
  //   }
  const theme = useTheme2();
  return (
    <div
      style={{ borderTop: `1px solid ${theme.colors.border.weak}`, margin: theme.spacing(2, 0), width: '100%' }}
    ></div>
  );
}
