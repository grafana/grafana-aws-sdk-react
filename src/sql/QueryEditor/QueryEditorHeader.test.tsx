import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { mockQuery } from './__mocks__/query';
import { Props as QueryEditorHeaderProps, QueryEditorHeader } from './QueryEditorHeader';
import { DataSourceApi, DataSourceJsonData, LoadingState, PanelData } from '@grafana/data';
import { DataQuery } from '@grafana/schema';

const props: QueryEditorHeaderProps<DataSourceApi, DataQuery, DataSourceJsonData> = {
  query: mockQuery,
  onChange: jest.fn(),
  onRunQuery: jest.fn(),
  enableRunButton: false,
  datasource: {} as DataSourceApi,
};

describe('QueryEditorHeader', () => {
  it('should display RunQueryButtons if showAsyncQueryButtons prop is true', async () => {
    render(<QueryEditorHeader {...props} showAsyncQueryButtons={true} cancel={jest.fn()} />);
    const runButton = screen.getByRole('button', { name: 'Run query' });
    const stopButton = screen.getByRole('button', { name: 'Stop query' });
    expect(runButton).toBeInTheDocument();
    expect(stopButton).toBeInTheDocument();
  });
  it('should display just the run button if showAsyncQueryButtons prop is false', async () => {
    render(<QueryEditorHeader {...props} showAsyncQueryButtons={false} />);
    const runButton = screen.getByRole('button', { name: 'Run queries' });
    const stopButton = screen.queryByRole('button', { name: 'Stop query' });
    expect(runButton).toBeInTheDocument();
    expect(stopButton).not.toBeInTheDocument();
  });

  it('run button should be disabled if enableButton prop is false', () => {
    render(<QueryEditorHeader {...props} enableRunButton={false} showAsyncQueryButtons={false} />);
    const runButton = screen.getByRole('button', { name: 'Run queries' });
    expect(runButton).toBeDisabled();
  });

  it('run button should be disabled if query is loading', () => {
    render(
      <QueryEditorHeader
        {...props}
        enableRunButton={true}
        data={{ ...props.data, state: LoadingState.Loading } as PanelData}
        showAsyncQueryButtons={false}
      />
    );
    const runButton = screen.getByRole('button', { name: 'Run queries' });
    expect(runButton).toBeDisabled();
  });

  it('should run queries when the run button is clicked', () => {
    const onRunQuery = jest.fn();
    render(
      <QueryEditorHeader {...props} onRunQuery={onRunQuery} showAsyncQueryButtons={false} enableRunButton={true} />
    );
    const runButton = screen.getByRole('button', { name: 'Run queries' });
    expect(runButton).toBeInTheDocument();
    fireEvent.click(runButton);
    expect(onRunQuery).toHaveBeenCalledTimes(1);
  });
});
