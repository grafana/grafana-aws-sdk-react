import React from 'react';
import { DataSourcePluginOptionsEditorProps, SelectableValue } from '@grafana/data';
import { AwsAuthDataSourceJsonData, AwsAuthDataSourceSecureJsonData } from '../../types';
import { ResourceSelector } from '../ResourceSelector';

export type SelectorInput = {
  id: string;
  fetch: () => Promise<Array<string | SelectableValue<string>>>;
  dependencies?: string[];
  label?: string;
  'data-testid'?: string;
  hidden?: boolean;
  disabled?: boolean;
  onChange?: (e: SelectableValue<string>) => void;
  value?: string;
};

type SQLDataSourceJsonData<T extends AwsAuthDataSourceJsonData> = T & {
  [n: string]: any;
};

export interface SelectorProps
  extends DataSourcePluginOptionsEditorProps<SQLDataSourceJsonData<{}>, AwsAuthDataSourceSecureJsonData> {
  input: SelectorInput;
  saveOptions: () => Promise<void>;
}

export function Selector(props: SelectorProps) {
  const { jsonData } = props.options;
  const commonProps = {
    title: jsonData.defaultRegion ? '' : 'select a default region',
    disabled: !jsonData.defaultRegion,
    labelWidth: 28,
    className: 'width-30',
  };

  // The input is a selector
  const { input } = props;
  const onChange = (e: SelectableValue<string> | null) => {
    if (input.onChange) {
      input.onChange(e);
    } else {
      props.onOptionsChange({
        ...props.options,
        jsonData: {
          ...props.options.jsonData,
          [input.id]: e ? e.value || '' : e,
        },
      });
    }
  };
  const dependencies: string[] = [];
  if (input.dependencies) {
    input.dependencies.forEach((dep) => dependencies.push(props.options.jsonData[dep]));
  }
  return (
    <ResourceSelector
      key={input.id}
      label={input.label}
      data-testid={input['data-testid']}
      onChange={onChange}
      fetch={input.fetch}
      value={input.value || props.options.jsonData[input.id]}
      saveOptions={props.saveOptions}
      dependencies={dependencies}
      hidden={input.hidden}
      disabled={input.disabled}
      {...commonProps}
    />
  );
}
