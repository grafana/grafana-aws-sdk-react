import React from 'react';
import { DataQuery, SelectableValue } from '@grafana/data';
import { InlineField, Input, Select } from '@grafana/ui';

export enum FillValueOptions {
  Previous,
  Null,
  Value,
}

export const SelectableFillValueOptions: Array<SelectableValue<FillValueOptions>> = [
  {
    label: 'Previous Value',
    value: FillValueOptions.Previous,
  },
  {
    label: 'NULL',
    value: FillValueOptions.Null,
  },
  {
    label: 'Value',
    value: FillValueOptions.Value,
  },
];

export type FillValueSelectProps<TQuery extends DataQuery> = {
  query: TQuery;
  onChange: (value: TQuery) => void;
  onRunQuery?: () => void;
};

export function FillValueSelect<TQuery extends DataQuery & Record<string, any>>(props: FillValueSelectProps<TQuery>) {
  return (
    <>
      <InlineField label="Fill value" tooltip="value to fill missing points">
        <Select
          aria-label="Fill value"
          options={SelectableFillValueOptions}
          value={props.query.fillMode?.mode ?? FillValueOptions.Previous}
          onChange={({ value }) => {
            props.onChange({
              ...props.query,
              // Keep the fillMode.value in case FillValueOptions.Value mode is selected back
              fillMode: { ...props.query.fillMode, mode: value },
            });
            props?.onRunQuery?.();
          }}
          className="width-12"
          menuShouldPortal={true}
        />
      </InlineField>
      {props.query.fillMode?.mode === FillValueOptions.Value && (
        <InlineField label="Value" labelWidth={11}>
          <Input
            type="number"
            aria-label="Value"
            value={props.query.fillMode.value}
            onChange={({ currentTarget }: React.FormEvent<HTMLInputElement>) =>
              props.onChange({
                ...props.query,
                fillMode: {
                  mode: FillValueOptions.Value,
                  value: currentTarget.valueAsNumber,
                },
              })
            }
            onBlur={() => props.onRunQuery?.()}
          />
        </InlineField>
      )}
    </>
  );
}
