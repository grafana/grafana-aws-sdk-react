import React from 'react';
import { DataSourcePluginOptionsEditorProps, SelectableValue } from '@grafana/data';
import { AwsAuthDataSourceJsonData, AwsAuthDataSourceSecureJsonData } from '../../types';
import { ResourceSelector } from '../ResourceSelector';

export interface ConfigSelectProps
  extends DataSourcePluginOptionsEditorProps<AwsAuthDataSourceJsonData, AwsAuthDataSourceSecureJsonData> {
  value: string;
  fetch: () => Promise<Array<string | SelectableValue<string>>>;
  onChange: (e: SelectableValue<string> | null) => void;
  dependencies?: string[];
  label?: string;
  'data-testid'?: string;
  hidden?: boolean;
  disabled?: boolean;
  jsonDataPathLabel?: string;
  saveOptions: () => Promise<void>;
}

export function ConfigSelect(props: ConfigSelectProps) {
  const { jsonData } = props.options;
  const commonProps = {
    title: jsonData.defaultRegion ? '' : 'select a default region',
    disabled: !jsonData.defaultRegion,
    labelWidth: 28,
    className: 'width-30',
  };
  // Any change in the AWS connection details will affect selectors
  const dependencies: string[] = [
    props.options.jsonData.assumeRoleArn,
    props.options.jsonData.authType,
    props.options.jsonData.defaultRegion,
    props.options.jsonData.endpoint,
    props.options.jsonData.externalId,
    props.options.jsonData.profile,
  ].concat(props.dependencies);
  return (
    <ResourceSelector
      label={props.label}
      data-testid={props['data-testid']}
      onChange={props.onChange}
      fetch={props.fetch}
      value={props.value}
      saveOptions={props.saveOptions}
      dependencies={dependencies}
      hidden={props.hidden}
      disabled={props.disabled}
      {...commonProps}
    />
  );
}
