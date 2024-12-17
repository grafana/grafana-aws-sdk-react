import React from 'react';
import { SelectableValue } from '@grafana/data';
import { DataQuery } from '@grafana/schema';
import { Input, Select } from '@grafana/ui';
import { EditorField } from '@grafana/plugin-ui';

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
      <EditorField label="Fill with" tooltip="value to fill missing points" htmlFor="fillWith">
        <Select
          id="fillWith"
          aria-label="Fill with"
          data-testid="table-fill-with-select"
          options={SelectableFillValueOptions}
          value={props.query.fillMode?.mode ?? FillValueOptions.Previous}
          onChange={({ value }) => {
            props.onChange({
              ...props.query,
              // Keep the fillMode.value in case FillValueOptions.Value mode is selected back
              fillMode: { ...props.query.fillMode, mode: value },
            });
            props.onRunQuery?.();
          }}
          menuShouldPortal={true}
        />
      </EditorField>
      {props.query.fillMode?.mode === FillValueOptions.Value && (
        <EditorField label="Value" htmlFor="valueToFill" width={6}>
          <Input
            id="valueToFill"
            aria-label="Value"
            type="number"
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
        </EditorField>
      )}
    </>
  );
}
