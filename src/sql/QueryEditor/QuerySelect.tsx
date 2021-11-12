import React from 'react';
import { DataQuery, SelectableValue } from '@grafana/data';
import { ResourceSelector } from '../ResourceSelector';
import { set, get, cloneDeep } from 'lodash';

export type QuerySelectProps<TQuery extends DataQuery> = {
  query: TQuery;
  queryPropertyPath: string;
  fetch: () => Promise<Array<string | SelectableValue<string>>>;
  onChange: (value: TQuery) => void;
  onRunQuery?: () => void;
  default?: string;
  queryPropertyPathLabel?: string;
  dependencies?: string[];
  label?: string;
  'data-testid'?: string;
  hidden?: boolean;
  disabled?: boolean;
  tooltip?: string;
};

export function QuerySelect<TQuery extends DataQuery>(props: QuerySelectProps<TQuery>) {
  const onChange = (e: SelectableValue<string> | null) => {
    const newQuery = cloneDeep(props.query);
    set(newQuery, props.queryPropertyPath, e ? e.value || '' : e);
    if (props.queryPropertyPathLabel) {
      set(newQuery, props.queryPropertyPathLabel, e ? e.label || '' : e);
    }
    props.onChange(newQuery);
    if (props.onRunQuery) {
      props.onRunQuery();
    }
  };
  return (
    <ResourceSelector
      label={props.label}
      data-testid={props['data-testid']}
      onChange={onChange}
      fetch={props.fetch}
      value={get(props.query, props.queryPropertyPath)}
      dependencies={props.dependencies}
      hidden={props.hidden}
      disabled={props.disabled}
      default={props.default}
      tooltip={props.tooltip}
      labelWidth={11}
      className="width-12"
    />
  );
}
