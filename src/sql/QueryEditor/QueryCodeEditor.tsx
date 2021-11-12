import { defaults } from 'lodash';

import React, { useRef, useEffect } from 'react';
import { CodeEditor, CodeEditorSuggestionItem } from '@grafana/ui';
import { DataQuery } from '@grafana/data';

type Props<TQuery extends DataQuery> = {
  query: TQuery;
  onChange: (value: TQuery) => void;
  onRunQuery: () => void;
  getSuggestions: (templateSrv: any, query: TQuery) => CodeEditorSuggestionItem[];
  getTemplateSrv: () => any;
};

export function QueryCodeEditor<TQuery extends DataQuery>(props: Props<TQuery>) {
  const { rawSQL } = defaults(props.query, { rawSQL: '' });
  const onRawSqlChange = (rawSQL: string) => {
    const query = {
      ...props.query,
      rawSQL,
    };
    props.onChange(query);
    props.onRunQuery();
  };
  const suggestionsRef = useRef<CodeEditorSuggestionItem[]>([]);
  useEffect(() => {
    suggestionsRef.current = props.getSuggestions(props.getTemplateSrv(), props.query);
  }, [props.query]);

  return (
    <CodeEditor
      height={'240px'}
      language={'sql'}
      value={rawSQL}
      onBlur={onRawSqlChange}
      showMiniMap={false}
      showLineNumbers={true}
      getSuggestions={() => suggestionsRef.current}
    />
  );
}
