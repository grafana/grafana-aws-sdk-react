import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { InlineInputProps, InlineInput } from './InlineInput';
import { mockDatasourceOptions } from './__mocks__/datasource';

const props: InlineInputProps = {
  ...mockDatasourceOptions,
  value: 'foo',
  onChange: jest.fn(),
};

describe('InlineInput', () => {
  it('should show value', () => {
    render(<InlineInput {...props} value={'bar'} />);
    expect(screen.queryByDisplayValue('bar')).toBeInTheDocument();
  });

  it('should call onChange with the new value', async () => {
    const testID = 'foo-id';
    const onChange = jest.fn();
    render(<InlineInput {...props} data-testid={testID} onChange={onChange} />);
    fireEvent.change(screen.getByTestId(testID), { target: { value: 'bar' } });
    expect(onChange).toHaveBeenCalled();
  });
});
