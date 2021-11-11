import React from 'react';
import { DataSourcePluginOptionsEditorProps } from '@grafana/data';
import { AwsAuthDataSourceSecureJsonData } from '../../types';
import { InlineField, Input } from '@grafana/ui';
import { FormEvent } from 'react-dom/node_modules/@types/react';
import { get, set } from 'lodash';

export interface InlineInputProps extends DataSourcePluginOptionsEditorProps<{}, AwsAuthDataSourceSecureJsonData> {
  jsonDataPath: string;
  label?: string;
  tooltip?: string;
  placeholder?: string;
  'data-testid'?: string;
  hidden?: boolean;
  disabled?: boolean;
}

export function InlineInput(props: InlineInputProps) {
  const onChange = (e: FormEvent<HTMLInputElement>) => {
    const newOptions = {
      ...props.options,
    };
    set(newOptions.jsonData, props.jsonDataPath, e.currentTarget.value || '');
    props.onOptionsChange(newOptions);
  };

  return (
    <InlineField
      label={props.label}
      labelWidth={28}
      tooltip={props.tooltip}
      hidden={props.hidden}
      disabled={props.disabled}
    >
      <Input
        data-testid={props['data-testid']}
        className="width-30"
        value={get(props.options.jsonData, props.jsonDataPath, '')}
        onChange={onChange}
        placeholder={props.placeholder}
        disabled={props.disabled}
      />
    </InlineField>
  );
}
