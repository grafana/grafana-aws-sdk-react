import React from 'react';
import { render, screen } from '@testing-library/react';
import { ConfigSelect, ConfigSelectProps } from './ConfigSelect';
import { mockDatasourceOptions } from './__mocks__/datasource';
import { select } from 'react-select-event';
import { config } from '@grafana/runtime';

const props: ConfigSelectProps = {
  ...mockDatasourceOptions,
  id: 'select',
  label: 'select-label',
  value: 'foo',
  onChange: jest.fn(),
  fetch: jest.fn(),
  saveOptions: jest.fn(),
};

describe('ConfigSelect', () => {
  it('should call onChange with the new value', async () => {
    const fetch = jest.fn().mockResolvedValue(['bar']);
    const onChange = jest.fn();
    const label = 'foo-id';
    render(<ConfigSelect {...props} label={label} fetch={fetch} onChange={onChange} />);

    const selectEl = screen.getByLabelText(label);
    expect(selectEl).toBeInTheDocument();
    expect(selectEl).not.toBeDisabled();
    await select(selectEl, 'bar', { container: document.body });
    expect(fetch).toHaveBeenCalled();
    expect(onChange).toHaveBeenCalledWith({ label: 'bar', value: 'bar' });
  });

  it('should show disabled select if passed disabled as prop', () => {
    const label = 'foo-id';
    render(<ConfigSelect {...props} disabled={true} label={label} />);
    const selectEl = screen.getByLabelText(label);

    expect(selectEl).toBeDisabled();
  });

  it('should show disabled select if passed disabled=false as prop but jsonData.defaultRegion is not set', () => {
    const propsWithoutDefaultRegion = {
      ...props,
      options: { ...props.options, jsonData: { ...props.options.jsonData } },
    };
    propsWithoutDefaultRegion.options.jsonData = {};
    const label = 'foo-id';
    render(<ConfigSelect {...propsWithoutDefaultRegion} disabled={false} label={label} />);
    const selectEl = screen.getByLabelText(label);

    expect(selectEl).toBeDisabled();
  });
});
