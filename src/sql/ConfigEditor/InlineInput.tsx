import React, { FormEvent } from 'react';
import { DataSourcePluginOptionsEditorProps } from '@grafana/data';
import { AwsAuthDataSourceSecureJsonData } from '../../types';
import { InlineField, Input } from '@grafana/ui';
import { DEFAULT_LABEL_WIDTH } from '../../components/ConnectionConfig';

export interface InlineInputProps extends DataSourcePluginOptionsEditorProps<{}, AwsAuthDataSourceSecureJsonData> {
  value: string;
  onChange: (e: FormEvent<HTMLInputElement>) => void;
  label?: string;
  tooltip?: string;
  placeholder?: string;
  'data-testid'?: string;
  hidden?: boolean;
  disabled?: boolean;
  labelWidth?: number;
}

export function InlineInput(props: InlineInputProps) {
  return (
    <InlineField
      label={props.label}
      labelWidth={props.labelWidth ?? DEFAULT_LABEL_WIDTH}
      tooltip={props.tooltip}
      hidden={props.hidden}
      disabled={props.disabled}
    >
      <Input
        data-testid={props['data-testid']}
        className="width-30"
        value={props.value}
        onChange={props.onChange}
        placeholder={props.placeholder}
        disabled={props.disabled}
      />
    </InlineField>
  );
}
