import React from 'react';
import { DataSourcePluginOptionsEditorProps, SelectableValue } from '@grafana/data';
import { AwsAuthDataSourceJsonData, AwsAuthDataSourceSecureJsonData } from '../../types';
import { ResourceSelector } from '../ResourceSelector';
import { set, get } from 'lodash';

export interface ConfigSelectProps
  extends DataSourcePluginOptionsEditorProps<AwsAuthDataSourceJsonData, AwsAuthDataSourceSecureJsonData> {
  jsonDataPath: string;
  fetch: () => Promise<Array<string | SelectableValue<string>>>;
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
    title: jsonData.defaultRegion ? '' : 'save connection details to proceed',
    disabled: !jsonData.defaultRegion,
    labelWidth: 28,
    className: 'width-30',
  };
  const onChange = (e: SelectableValue<string> | null) => {
    const newOptions = {
      ...props.options,
    };
    set(newOptions.jsonData, props.jsonDataPath, e ? e.value || '' : e);
    if (props.jsonDataPathLabel) {
      set(newOptions.jsonData, props.jsonDataPathLabel, e ? e.label || '' : e);
    }
    props.onOptionsChange(newOptions);
  };
  // Any change in the AWS connection details will affect selectors
  const dependencies: string[] = [
    props.options.jsonData.assumeRoleArn,
    props.options.jsonData.authType,
    props.options.jsonData.defaultRegion,
    props.options.jsonData.endpoint,
    props.options.jsonData.externalId,
    props.options.jsonData.profile,
  ];
  if (props.dependencies) {
    props.dependencies.forEach((dep) => dependencies.push(get(props.options.jsonData, dep)));
  }
  return (
    <ResourceSelector
      label={props.label}
      data-testid={props['data-testid']}
      onChange={onChange}
      fetch={props.fetch}
      value={get(props.options.jsonData, props.jsonDataPath)}
      saveOptions={props.saveOptions}
      dependencies={dependencies}
      hidden={props.hidden}
      disabled={props.disabled}
      {...commonProps}
    />
  );
}
