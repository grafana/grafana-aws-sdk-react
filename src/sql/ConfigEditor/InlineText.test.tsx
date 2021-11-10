import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { InlineText, TextInput } from './InlineText';
import { mockDatasourceOptions } from './__mocks__/datasource';

const props = {
  ...mockDatasourceOptions,
};

describe('SQLTextInput', () => {
  it('should show jsonData value', () => {
    const input: TextInput = {
      id: 'foo',
    };
    render(<InlineText {...props} options={{ ...props.options, jsonData: { foo: 'bar' } }} input={input} />);
    expect(screen.queryByDisplayValue('bar')).toBeInTheDocument();
  });

  it('should show a custom value', () => {
    const input: TextInput = {
      id: 'foo',
      value: 'foobar',
    };
    render(<InlineText {...props} input={input} />);
    expect(screen.queryByDisplayValue('foobar')).toBeInTheDocument();
  });

  it('should update jsonData', () => {
    const input: TextInput = {
      id: 'foo',
      'data-testid': 'foo-id',
    };
    const onOptionsChange = jest.fn();
    render(<InlineText {...props} input={input} onOptionsChange={onOptionsChange} />);
    fireEvent.change(screen.getByTestId('foo-id'), { target: { value: 'bar' } });
    expect(onOptionsChange).toHaveBeenCalledWith({
      ...props.options,
      jsonData: {
        ...props.options.jsonData,
        foo: 'bar',
      },
    });
  });

  it('should call custom onChange', () => {
    const onChange = jest.fn();
    const input: TextInput = {
      id: 'foo',
      'data-testid': 'foo-id',
      onChange,
    };
    render(<InlineText {...props} input={input} />);
    fireEvent.change(screen.getByTestId('foo-id'), { target: { value: 'bar' } });
    expect(onChange).toHaveBeenCalled();
  });
});
