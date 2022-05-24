import React from 'react';
import { DataSourcePluginOptionsEditorProps, SelectableValue } from '@grafana/data';
import { InputActionMeta } from '@grafana/ui/components/Select/types';
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
  allowCustomValue?: boolean;
  saveOptions: () => Promise<void>;
  autoFocus?: boolean;
  backspaceRemovesValue?: boolean;
  className?: string;
  invalid?: boolean;
  isClearable?: boolean;
  isMulti?: boolean;
  inputId?: string;
  showAllSelectedWhenOpen?: boolean;
  maxMenuHeight?: number;
  minMenuHeight?: number;
  maxVisibleValues?: number;
  menuPlacement?: 'auto' | 'bottom' | 'top';
  menuPosition?: 'fixed' | 'absolute';
  noOptionsMessage?: string;
  onBlur?: () => void;
  onCreateOption?: (value: string) => void;
  onInputChange?: (value: string, actionMeta: InputActionMeta) => void;
  placeholder?: string;
  width?: number;
  isOptionDisabled?: () => boolean;
}

export function ConfigSelect(props: ConfigSelectProps) {
  const { jsonData } = props.options;
  const commonProps = {
    title: jsonData.defaultRegion ? '' : 'select a default region',
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
    props.options.secureJsonData?.accessKey,
    props.options.secureJsonData?.secretKey,
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
      disabled={props.disabled || !jsonData.defaultRegion}
      allowCustomValue={props.allowCustomValue}
      autoFocus={props.autoFocus}
      backspaceRemovesValue={props.backspaceRemovesValue}
      className={props.className}
      invalid={props.invalid}
      isClearable={props.isClearable}
      isMulti={props.isMulti}
      inputId={props.inputId}
      showAllSelectedWhenOpen={props.showAllSelectedWhenOpen}
      maxMenuHeight={props.maxMenuHeight}
      minMenuHeight={props.minMenuHeight}
      maxVisibleValues={props.maxVisibleValues}
      menuPlacement={props.menuPlacement}
      menuPosition={props.menuPosition}
      noOptionsMessage={props.noOptionsMessage}
      onBlur={props.onBlur}
      onCreateOption={props.onCreateOption}
      onInputChange={props.onInputChange}
      placeholder={props.placeholder}
      width={props.width}
      isOptionDisabled={props.isOptionDisabled}
      {...commonProps}
    />
  );
}
