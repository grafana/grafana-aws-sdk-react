import React from 'react';
import { render, screen } from '@testing-library/react';
import { SQLConfigEditor } from './ConfigEditor';
import { mockDatasourceOptions } from './__mocks__/datasource';
import { SelectorInput } from './Selector';
import { TextInput } from './InlineText';
import { AwsAuthType } from '../../types';

const props = {
  ...mockDatasourceOptions,
  inputs: [] as Array<SelectorInput | TextInput | JSX.Element>,
};

const resetWindow = () => {
  (window as any).grafanaBootData = {
    settings: {
      awsAllowedAuthProviders: [AwsAuthType.EC2IAMRole, AwsAuthType.Keys],
      awsAssumeRoleEnabled: false,
    },
  };
};

describe('SQLConfigEditor', () => {
  beforeEach(() => resetWindow());
  afterEach(() => resetWindow());

  it('should render a custom component', () => {
    render(<SQLConfigEditor {...props} inputs={[<div key="hello">hello!</div>]} />);
    expect(screen.queryByText('hello!')).toBeInTheDocument();
  });

  it('should render a selector', () => {
    const input: SelectorInput = {
      id: 'foo',
      fetch: jest.fn(),
    };
    render(<SQLConfigEditor {...props} options={{ ...props.options, jsonData: { foo: 'bar' } }} inputs={[input]} />);
    expect(screen.queryByText('bar')).toBeInTheDocument();
  });

  it('should render a text input', () => {
    const input: TextInput = {
      id: 'foo',
    };
    render(<SQLConfigEditor {...props} options={{ ...props.options, jsonData: { foo: 'bar' } }} inputs={[input]} />);
    expect(screen.queryByDisplayValue('bar')).toBeInTheDocument();
  });
});
