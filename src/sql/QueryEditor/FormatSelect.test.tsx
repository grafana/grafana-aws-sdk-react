import React from 'react';
import { render, screen } from '@testing-library/react';
import { mockQuery, SQLOptions } from './__mocks__/query';
import { select } from 'react-select-event';
import { FormatSelect, FormatSelectProps } from './FormatSelect';
import { SQLQuery } from '../types';

const props: FormatSelectProps<SQLQuery, SQLOptions> = {
  query: mockQuery,
  options: [
    {
      label: 'Table',
      value: SQLOptions.Table,
    },
    {
      label: 'Time Series',
      value: SQLOptions.TimeSeries,
    },
  ],
  onChange: jest.fn(),
  onRunQuery: jest.fn(),
};

describe('FormatSelect', () => {
  it('should change the format mode', async () => {
    render(<FormatSelect {...props} />);
    expect(screen.getByText('Table')).toBeInTheDocument();

    const selectEl = screen.getByLabelText('Format data frames as');
    expect(selectEl).toBeInTheDocument();
    await select(selectEl, 'Time Series', { container: document.body });

    expect(props.onChange).toHaveBeenCalledWith({ ...props.query, format: SQLOptions.TimeSeries });
    expect(props.onRunQuery).toHaveBeenCalled();
  });
});
