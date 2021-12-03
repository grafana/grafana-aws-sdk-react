import React from 'react';
import { render, screen } from '@testing-library/react';
import { ConfigSelect, ConfigSelectProps } from './ConfigSelect';
import { mockDatasourceOptions } from './__mocks__/datasource';
import { select } from 'react-select-event';

const props: ConfigSelectProps = {
  ...mockDatasourceOptions,
  value: 'foo',
  onChange: jest.fn(),
  fetch: jest.fn(),
  saveOptions: jest.fn(),
};

describe('SQLTextInput', () => {
  it('should call onChange with the new value', async () => {
    const fetch = jest.fn().mockResolvedValue(['bar']);
    const onChange = jest.fn();
    const label = 'foo-id';
    render(<ConfigSelect {...props} label={label} fetch={fetch} onChange={onChange} />);

    const selectEl = screen.getByLabelText(label);
    expect(selectEl).toBeInTheDocument();
    await select(selectEl, 'bar', { container: document.body });
    expect(fetch).toHaveBeenCalled();
    expect(onChange).toHaveBeenCalledWith({ label: 'bar', value: 'bar' });
  });
});
