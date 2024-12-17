import React from 'react';

import { DataQuery, DataSourceApi, DataSourceJsonData, LoadingState, QueryEditorProps } from '@grafana/data';
import { EditorHeader, FlexItem } from '@grafana/plugin-ui';
import { Button } from '@grafana/ui';
import { RunQueryButtons } from '@grafana/async-query-data';

export interface Props<
  Datasource extends DataSourceApi<TQuery, JsonData>,
  TQuery extends DataQuery,
  JsonData extends DataSourceJsonData,
> extends QueryEditorProps<Datasource, TQuery, JsonData> {
  showAsyncQueryButtons?: boolean;
  extraHeaderElementLeft?: React.JSX.Element;
  extraHeaderElementRight?: React.JSX.Element;
  enableRunButton: boolean;
  cancel?: (target: TQuery) => void;
  onRunQuery: () => void;
}

export function QueryEditorHeader<
  Datasource extends DataSourceApi<TQuery, JsonData>,
  TQuery extends DataQuery,
  JsonData extends DataSourceJsonData,
>({
  query,
  showAsyncQueryButtons,
  extraHeaderElementLeft,
  extraHeaderElementRight,
  enableRunButton,
  onRunQuery,
  data,
  cancel,
}: Props<Datasource, TQuery, JsonData>): React.JSX.Element {
  return (
    <EditorHeader>
      {extraHeaderElementLeft}
      <FlexItem grow={1} />
      {showAsyncQueryButtons ? (
        <RunQueryButtons
          onRunQuery={onRunQuery}
          enableRun={enableRunButton}
          query={query}
          onCancelQuery={(target: TQuery) => {
            cancel?.(target);
          }}
          state={data?.state}
        />
      ) : (
        <Button
          variant={enableRunButton ? 'primary' : 'secondary'}
          size="sm"
          onClick={onRunQuery}
          icon={data?.state === LoadingState.Loading ? 'fa fa-spinner' : undefined}
          disabled={data?.state === LoadingState.Loading || !enableRunButton}
        >
          Run queries
        </Button>
      )}
      {extraHeaderElementRight}
    </EditorHeader>
  );
}
