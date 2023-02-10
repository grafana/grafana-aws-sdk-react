import '@testing-library/jest-dom/extend-expect';
import React from 'react';
import { render } from '@testing-library/react';
import { mockQuery } from './__mocks__/query';
import { Props as QueryEditorHeaderProps, QueryEditorHeader } from './QueryEditorHeader';
import { DataQuery, DataSourceApi, DataSourceJsonData } from '@grafana/data';
import { RunQueryButtons } from '@grafana/async-query-data';
import { Button } from '@grafana/ui';

const props: QueryEditorHeaderProps<DataSourceApi, DataQuery, DataSourceJsonData> = {
  query: mockQuery,
  onChange: jest.fn(),
  onRunQuery: jest.fn(),
  enableRunButton: false,
  datasource: {} as DataSourceApi,
};
jest.mock('@grafana/async-query-data', () => ({
  RunQueryButtons: jest.fn(() => <div>Buttons</div>),
}));
jest.mock('@grafana/ui', () => ({
  ...jest.requireActual('@grafana/ui'),
  Button: jest.fn(() => <div>Button</div>),
}));

describe('QueryEditorHeader', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });
  it('should display RunQueryButtons if showAsyncQueryButtons prop is true', async () => {
    render(<QueryEditorHeader {...props} showAsyncQueryButtons={true} />);
    expect(RunQueryButtons).toHaveBeenCalled();
  });
  it('should display the run button if showAsyncQueryButtons prop is false', async () => {
    render(<QueryEditorHeader {...props} showAsyncQueryButtons={false} />);
    expect(Button).toHaveBeenCalled();
    expect(RunQueryButtons).not.toHaveBeenCalled();
  });
});
