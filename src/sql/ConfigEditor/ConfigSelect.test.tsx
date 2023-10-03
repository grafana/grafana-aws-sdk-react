import React from 'react';
import { render, screen } from '@testing-library/react';
import { ConfigSelect, ConfigSelectProps } from './ConfigSelect';
import { mockDatasourceOptions } from './__mocks__/datasource';
import { select } from 'react-select-event';

const props: ConfigSelectProps = {
  ...mockDatasourceOptions,
  id: 'foo-id',
  ['aria-label']: 'foo-label',
  value: 'foo',
  onChange: jest.fn(),
  fetch: jest.fn(),
  saveOptions: jest.fn(),
};

describe('SQLTextInput', () => {
  it('should call onChange with the new value', async () => {
    const fetch = jest.fn().mockResolvedValue(['bar']);
    const onChange = jest.fn();
    render(<ConfigSelect {...props} fetch={fetch} onChange={onChange} />);

    const selectEl = screen.getByLabelText(props['aria-label']);
    expect(selectEl).toBeInTheDocument();
    expect(selectEl).not.toBeDisabled();
    await select(selectEl, 'bar', { container: document.body });
    expect(fetch).toHaveBeenCalled();
    expect(onChange).toHaveBeenCalledWith({ label: 'bar', value: 'bar' });
  });

  it('should show disabled select if passed disabled as prop', () => {
    render(<ConfigSelect {...props} disabled={true} aria-label={props['aria-label']} />);
    const selectEl = screen.getByLabelText(props['aria-label']);

    expect(selectEl).toBeDisabled();
  });

  it('should show disabled select if passed disabled=false as prop but jsonData.defaultRegion is not set', () => {
    const propsWithoutDefaultRegion = { ...props };
    propsWithoutDefaultRegion.options.jsonData = {};
    render(<ConfigSelect {...propsWithoutDefaultRegion} disabled={false} aria-label={props['aria-label']} />);
    const selectEl = screen.getByLabelText(props['aria-label']);

    expect(selectEl).toBeDisabled();
  });
});
