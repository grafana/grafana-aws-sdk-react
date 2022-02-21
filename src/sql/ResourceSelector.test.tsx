import { render, screen } from '@testing-library/react';
import React from 'react';
import { select } from 'react-select-event';

import { ResourceSelector, ResourceSelectorProps } from './ResourceSelector';
import { defaultKey } from './types';

const props: ResourceSelectorProps = {
  value: null,
  label: 'resource',
  fetch: jest.fn(),
  onChange: jest.fn(),
};

describe('ResourceSelector', () => {
  it('should include a default option', () => {
    render(<ResourceSelector {...props} default="foo" value={defaultKey} />);
    expect(screen.queryByText('default (foo)')).toBeInTheDocument();
  });

  it('should select a new option', async () => {
    const onChange = jest.fn();
    const fetch = jest.fn().mockResolvedValue(['foo', 'bar']);
    render(<ResourceSelector {...props} default="foo" value={defaultKey} fetch={fetch} onChange={onChange} />);
    expect(screen.queryByText('default (foo)')).toBeInTheDocument();

    const selectEl = screen.getByLabelText(props.label);
    expect(selectEl).toBeInTheDocument();

    await select(selectEl, 'bar', { container: document.body });
    expect(fetch).toHaveBeenCalled();
    expect(onChange).toHaveBeenCalledWith({ label: 'bar', value: 'bar' });
  });

  it('should select pre-loaded resource', async () => {
    const onChange = jest.fn();
    const resources = ['foo', 'bar'];
    render(<ResourceSelector {...props} fetch={undefined} onChange={onChange} resources={resources} />);

    const selectEl = screen.getByLabelText(props.label);
    expect(selectEl).toBeInTheDocument();

    await select(selectEl, 'bar', { container: document.body });
    expect(onChange).toHaveBeenCalledWith({ label: 'bar', value: 'bar' });
  });
});
