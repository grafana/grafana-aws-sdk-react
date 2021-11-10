import React from 'react';
import { DataSourcePluginOptionsEditorProps, SelectableValue } from '@grafana/data';
import { AwsAuthDataSourceJsonData, AwsAuthDataSourceSecureJsonData } from '../../types';
import { InlineField, Input } from '@grafana/ui';
import { FormEvent } from 'react-dom/node_modules/@types/react';

export type TextInput = {
  id: string;
  label?: string;
  tooltip?: string;
  placeholder?: string;
  'data-testid'?: string;
  hidden?: boolean;
  disabled?: boolean;
  value?: string;
  onChange?: (e: SelectableValue<string>) => void;
};

type SQLDataSourceJsonData<T extends AwsAuthDataSourceJsonData> = T & {
  [n: string]: any;
};

export interface TextProps
  extends DataSourcePluginOptionsEditorProps<SQLDataSourceJsonData<{}>, AwsAuthDataSourceSecureJsonData> {
  input: TextInput;
}

export function InlineText(props: TextProps) {
  const { input } = props;

  const onChange = (e: FormEvent<HTMLInputElement>) => {
    if (input.onChange) {
      input.onChange(e);
    } else {
      props.onOptionsChange({
        ...props.options,
        jsonData: {
          ...props.options.jsonData,
          [input.id]: e.currentTarget.value || '',
        },
      });
    }
  };
  return (
    <InlineField
      label={input.label}
      labelWidth={28}
      tooltip={input.tooltip}
      key={input.id}
      hidden={input.hidden}
      disabled={input.disabled}
    >
      <Input
        data-testid={input['data-testid']}
        className="width-30"
        value={input.value || props.options.jsonData[input.id] || ''}
        onChange={onChange}
        placeholder={input.placeholder}
        disabled={input.disabled}
      />
    </InlineField>
  );
}
