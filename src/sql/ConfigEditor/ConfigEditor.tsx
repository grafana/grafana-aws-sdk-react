import React, { useState } from 'react';
import { DataSourcePluginOptionsEditorProps, DataSourceSettings } from '@grafana/data';
import { AwsAuthDataSourceJsonData, AwsAuthDataSourceSecureJsonData, AwsAuthDataSourceSettings } from '../../types';
import { getBackendSrv } from '@grafana/runtime';
import { Selector, SelectorInput } from './Selector';
import { InlineText, TextInput } from './InlineText';
import { ConnectionConfig } from 'ConnectionConfig';

type SQLDataSourceJsonData<T extends AwsAuthDataSourceJsonData> = T & {
  [n: string]: any;
};

export interface SQLConfigEditorProps
  extends DataSourcePluginOptionsEditorProps<SQLDataSourceJsonData<{}>, AwsAuthDataSourceSecureJsonData> {
  inputs: Array<SelectorInput | TextInput | JSX.Element>;
}

export function SQLConfigEditor(props: SQLConfigEditorProps) {
  const baseURL = `/api/datasources/${props.options.id}`;
  const [saved, setSaved] = useState(!!props.options.jsonData.defaultRegion);
  const saveOptions = async () => {
    if (saved) {
      return;
    }
    await getBackendSrv()
      .put(baseURL, props.options)
      .then((result: { datasource: AwsAuthDataSourceSettings }) => {
        props.onOptionsChange({
          ...props.options,
          version: result.datasource.version,
        });
      });
    setSaved(true);
  };

  const inputElements = props.inputs.map((i) => {
    const elem = i as JSX.Element;
    if (elem.type) {
      return elem;
    }
    if ('fetch' in i) {
      // The input is a selector
      return <Selector key={i.id} {...props} input={i as SelectorInput} saveOptions={saveOptions} />;
    } else {
      // The input is a text field
      const input = i as TextInput;
      return <InlineText key={input.id} {...props} input={input} />;
    }
  });

  const onOptionsChange = (options: DataSourceSettings<AwsAuthDataSourceJsonData, AwsAuthDataSourceSecureJsonData>) => {
    setSaved(false);
    props.onOptionsChange(options);
  };

  return (
    <div className="gf-form-group">
      <ConnectionConfig {...props} onOptionsChange={onOptionsChange} />
      <h3>Data Source Details</h3>
      {inputElements}
    </div>
  );
}
