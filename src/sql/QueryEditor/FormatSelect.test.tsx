import '@testing-library/jest-dom/extend-expect';
import React from 'react';
import { render, screen } from '@testing-library/react';
import { mockQuery, SQLOptions } from './__mocks__/query';
import { select } from 'react-select-event';
import { FormatSelect, FormatSelectProps } from './FormatSelect';
import { SQLQuery } from '../types';

const defaultProps: FormatSelectProps<SQLQuery, SQLOptions> = {
  newFormStylingEnabled: false,
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
  function run(testName: string, props: FormatSelectProps<SQLQuery, SQLOptions>) {
    describe(testName, () => {
      it('should change the format mode', async () => {
        render(<FormatSelect {...props} />);
        expect(screen.getByText('Table')).toBeInTheDocument();

        const selectEl = screen.getByLabelText(props.newFormStylingEnabled ? 'Format data frames as' : 'Format as');
        expect(selectEl).toBeInTheDocument();
        await select(selectEl, 'Time Series', { container: document.body });

        expect(props.onChange).toHaveBeenCalledWith({ ...props.query, format: SQLOptions.TimeSeries });
        expect(props.onRunQuery).toHaveBeenCalled();
      });
    });
  }
  run('FormatSelect with newFormStylingEnabled=false', defaultProps);
  run('FormatSelect with newFormStylingEnabled=true', { ...defaultProps, newFormStylingEnabled: true });
});
