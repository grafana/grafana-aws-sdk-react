import React from 'react';
import { DataQuery, SelectableValue } from '@grafana/data';
import { Select } from '@grafana/ui';

export type FormatSelectProps<TQuery extends DataQuery, FormatOptions> = {
  newFormStylingEnabled?: boolean;
  id?: string;
  query: TQuery;
  options: Array<SelectableValue<FormatOptions>>;
  onChange: (value: TQuery) => void;
  onRunQuery?: () => void;
};

export function FormatSelect<TQuery extends DataQuery & Record<string, any>, FormatOptions>(
  props: FormatSelectProps<TQuery, FormatOptions>
) {
  const onChangeFormat = (e: SelectableValue<FormatOptions>) => {
    props.onChange({
      ...props.query,
      format: e.value || 0,
    });
    props.onRunQuery?.();
  };
  return (
    <>
      {props.newFormStylingEnabled ? (
        <Select
          aria-label="Format dataframes as"
          id={props.id ?? 'formatAs'}
          options={props.options}
          value={props.query.format}
          onChange={onChangeFormat}
          menuShouldPortal={true}
        />
      ) : (
        <InlineField label="Format as" labelWidth={11}>
          <Select
            aria-label="Format as"
            options={props.options}
            value={props.query.format}
            onChange={onChangeFormat}
            className="width-12"
            menuShouldPortal={true}
          />
        </InlineField>
      )}
    </>
  );
}
