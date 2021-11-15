import React from 'react';
import { render, screen } from '@testing-library/react';
import { ConfigSelect, ConfigSelectProps } from './ConfigSelect';
import { mockDatasourceOptions } from './__mocks__/datasource';
import { select } from 'react-select-event';

const props: ConfigSelectProps = {
  ...mockDatasourceOptions,
  jsonDataPath: 'foo',
  fetch: jest.fn(),
  saveOptions: jest.fn(),
};

describe('SQLTextInput', () => {
  it('should update jsonData', async () => {
    const fetch = jest.fn().mockResolvedValue(['bar']);
    const onOptionsChange = jest.fn();
    const label = 'foo-id';
    render(<ConfigSelect {...props} label={label} fetch={fetch} onOptionsChange={onOptionsChange} />);

    const selectEl = screen.getByLabelText(label);
    expect(selectEl).toBeInTheDocument();
    await select(selectEl, 'bar', { container: document.body });
    expect(fetch).toHaveBeenCalled();
    expect(onOptionsChange).toHaveBeenCalledWith({
      ...props.options,
      jsonData: {
        ...props.options.jsonData,
        foo: 'bar',
      },
    });
  });

  it('should call deep nested jsonData value', async () => {
    const onOptionsChange = jest.fn();
    const fetch = jest.fn().mockResolvedValue(['foobar']);
    const label = 'foo-id';
    render(
      <ConfigSelect {...props} label={label} jsonDataPath="foo.bar" fetch={fetch} onOptionsChange={onOptionsChange} />
    );
    const selectEl = screen.getByLabelText(label);
    expect(selectEl).toBeInTheDocument();
    await select(selectEl, 'foobar', { container: document.body });
    expect(fetch).toHaveBeenCalled();
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
