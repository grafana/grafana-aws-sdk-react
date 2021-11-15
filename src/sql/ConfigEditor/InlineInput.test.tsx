import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { InlineInputProps, InlineInput } from './InlineInput';
import { mockDatasourceOptions } from './__mocks__/datasource';

const props: InlineInputProps = {
  ...mockDatasourceOptions,
  jsonDataPath: 'foo',
};

describe('InlineInput', () => {
  it('should show jsonData value', () => {
    render(<InlineInput {...props} options={{ ...props.options, jsonData: { foo: 'bar' } }} />);
    expect(screen.queryByDisplayValue('bar')).toBeInTheDocument();
  });

  it('should update jsonData', () => {
    const testID = 'foo-id';
    const onOptionsChange = jest.fn();
    render(<InlineInput {...props} data-testid={testID} onOptionsChange={onOptionsChange} />);
    fireEvent.change(screen.getByTestId(testID), { target: { value: 'bar' } });
    expect(onOptionsChange).toHaveBeenCalledWith({
      ...props.options,
      jsonData: {
        ...props.options.jsonData,
        foo: 'bar',
      },
    });
  });

  it('should update deep nested jsonData value', () => {
    const onOptionsChange = jest.fn();
    const testID = 'foo-id';
    render(<InlineInput {...props} data-testid={testID} onOptionsChange={onOptionsChange} jsonDataPath="foo.bar" />);
    fireEvent.change(screen.getByTestId(testID), { target: { value: 'foobar' } });
    expect(onOptionsChange).toHaveBeenCalledWith({
      ...props.options,
      jsonData: {
        ...props.options.jsonData,
        foo: {
          bar: 'foobar',
        },
      },
    });
  });
});
