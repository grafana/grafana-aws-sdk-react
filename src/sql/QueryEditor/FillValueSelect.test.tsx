import '@testing-library/jest-dom/extend-expect';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { mockQuery } from './__mocks__/query';
import { FillValueSelect, FillValueSelectProps, FillValueOptions } from './FillValueSelect';
import { select } from 'react-select-event';
import { SQLQuery } from '../types';

const defaultProps: FillValueSelectProps<SQLQuery> = {
  query: mockQuery,
  newFormStylingEnabled: false,
  onChange: jest.fn(),
  onRunQuery: jest.fn(),
};

describe('FillValueSelect', () => {
  function run(testName: string, props: FillValueSelectProps<SQLQuery>) {
    describe(testName, () => {
      it('should change the fill value mode', async () => {
        render(<FillValueSelect {...props} />);
        expect(screen.getByText('Previous Value')).toBeInTheDocument();

        const selectEl = screen.getByLabelText(props.newFormStylingEnabled ? 'Fill with' : 'Fill value');
        expect(selectEl).toBeInTheDocument();
        await select(selectEl, 'NULL', { container: document.body });

        expect(props.onChange).toHaveBeenCalledWith({ ...props.query, fillMode: { mode: FillValueOptions.Null } });
        expect(props.onRunQuery).toHaveBeenCalled();
      });

      it('should change the fill value for a custom value', async () => {
        render(<FillValueSelect {...props} query={{ ...mockQuery, fillMode: { mode: FillValueOptions.Value } }} />);

        const input = screen.getByLabelText('Value');
        fireEvent.change(input, { target: { value: '2', valueAsNumber: 2 } });

        expect(props.onChange).toHaveBeenCalledWith({
          ...props.query,
          fillMode: { mode: FillValueOptions.Value, value: 2 },
        });
        expect(props.onRunQuery).toHaveBeenCalled();
      });
    });
  }
  run('FillValueSelect with newFormStylingEnabled=false', defaultProps);
  run('FillValueSelect with newFormStylingEnabled=true', { ...defaultProps, newFormStylingEnabled: true });
});
