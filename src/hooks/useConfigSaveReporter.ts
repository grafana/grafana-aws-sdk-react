import { useEffect } from 'react';
import { DataSourceTestSucceeded, DataSourceTestFailed } from '@grafana/data';
import { usePluginInteractionReporter, getAppEvents } from '@grafana/runtime';
import { AwsAuthType } from '../types';

export function useConfigSaveReporter(pluginId: string, authType: AwsAuthType | undefined): void {
  const report = usePluginInteractionReporter();

  useEffect(() => {
    const appEvents = getAppEvents();

    const successSubscription = appEvents.subscribe<DataSourceTestSucceeded>(DataSourceTestSucceeded, () => {
      report('grafana_plugin_aws_save', {
        auth_type: authType,
        result: 'succeeded',
      });
    });

    const failSubscription = appEvents.subscribe<DataSourceTestFailed>(DataSourceTestFailed, () => {
      report('grafana_plugin_aws_save', {
        auth_type: authType,
        result: 'failed',
      });
    });

    return () => {
      successSubscription.unsubscribe();
      failSubscription.unsubscribe();
    };
  }, [pluginId, authType, report]);
}
