import React from 'react';
import { render, screen } from '@testing-library/react';
import { Selector, SelectorInput } from './Selector';
import { mockDatasourceOptions } from './__mocks__/datasource';
import { select } from 'react-select-event';

const props = {
  ...mockDatasourceOptions,
  saveOptions: jest.fn(),
};

describe('SQLTextInput', () => {
  it('should show jsonData value', () => {
    const input: SelectorInput = {
      id: 'foo',
      fetch: jest.fn(),
    };
    render(<Selector {...props} options={{ ...props.options, jsonData: { foo: 'bar' } }} input={input} />);
    expect(screen.queryByText('bar')).toBeInTheDocument();
  });

  it('should show a custom value', () => {
    const input: SelectorInput = {
      id: 'foo',
      value: 'foobar',
      fetch: jest.fn(),
    };
    render(<Selector {...props} input={input} />);
    expect(screen.queryByText('foobar')).toBeInTheDocument();
  });

  it('should update jsonData', async () => {
    const input: SelectorInput = {
      id: 'foo',
      label: 'foo-id',
      fetch: jest.fn().mockResolvedValue(['bar']),
    };
    const onOptionsChange = jest.fn();
    render(<Selector {...props} input={input} onOptionsChange={onOptionsChange} />);

    const selectEl = screen.getByLabelText(input.label);
    expect(selectEl).toBeInTheDocument();
    await select(selectEl, 'bar', { container: document.body });
    expect(input.fetch).toHaveBeenCalled();
    expect(onOptionsChange).toHaveBeenCalledWith({
      ...props.options,
      jsonData: {
        ...props.options.jsonData,
        foo: 'bar',
      },
    });
  });

  it('should call custom onChange', async () => {
    const onChange = jest.fn();
    const input: SelectorInput = {
      id: 'foo',
      label: 'foo-id',
      fetch: jest.fn().mockResolvedValue(['bar']),
      onChange,
    };
    render(<Selector {...props} input={input} />);
    const selectEl = screen.getByLabelText(input.label);
    expect(selectEl).toBeInTheDocument();
    await select(selectEl, 'bar', { container: document.body });
    expect(input.fetch).toHaveBeenCalled();
    expect(onChange).toHaveBeenCalled();
  });
});
