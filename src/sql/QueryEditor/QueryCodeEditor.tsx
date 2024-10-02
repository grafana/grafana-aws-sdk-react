import { defaults } from 'lodash';

import React, { useRef, useEffect } from 'react';
import { CodeEditor, CodeEditorSuggestionItem, CodeEditorMonacoOptions } from '@grafana/ui';
import { DataQuery } from '@grafana/schema';

type EditorProps = {
  width?: number | string;
  height?: number | string;
  readOnly?: boolean;
  showMiniMap?: boolean;
  showLineNumbers?: boolean;
  monacoOptions?: CodeEditorMonacoOptions;
};

type Props<TQuery extends DataQuery> = {
  query: TQuery;
  language: string;
  editorProps?: EditorProps;
  onChange: (value: TQuery) => void;
  onRunQuery: () => void;
  getSuggestions: (query: TQuery) => CodeEditorSuggestionItem[];
};

export function QueryCodeEditor<TQuery extends DataQuery>(props: Props<TQuery>) {
  const { getSuggestions, query } = props;
  const { rawSQL } = defaults(props.query, { rawSQL: '' });
  const onRawSqlChange = (rawSQL: string) => {
    const query = {
      ...props.query,
      rawSQL,
    };
    props.onChange(query);
    props.onRunQuery();
  };

  // Use a reference for suggestions because a bug in CodeEditor getSuggestions
  // https://github.com/grafana/grafana/issues/40121
  // It was been fixed in 8.3 but keeping the workaround here to support older
  // versions.
  const suggestionsRef = useRef<CodeEditorSuggestionItem[]>([]);
  useEffect(() => {
    suggestionsRef.current = getSuggestions(query);
  }, [getSuggestions, query]);

  return (
    <CodeEditor
      language={props.language}
      value={rawSQL}
      onBlur={onRawSqlChange}
      showMiniMap={false}
      showLineNumbers={true}
      getSuggestions={() => suggestionsRef.current}
      height="240px"
      {...props.editorProps}
    />
  );
}
