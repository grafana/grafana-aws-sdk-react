import { DataSourcePluginOptionsEditorProps } from '@grafana/data';
import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { AwsAuthType } from '../types';
import { SIGV4ConnectionConfig } from './SIGV4ConnectionConfig';
import { config } from '@grafana/runtime';

jest.mock('@grafana/runtime', () => ({
  ...jest.requireActual('@grafana/runtime'),
  config: {
    awsAllowedAuthProviders: [AwsAuthType.Credentials, AwsAuthType.Keys],
    awsAssumeRoleEnabled: true,
    featureToggles: {
      awsDatasourcesTempCredentials: false,
    },
  },
}));

describe('SIGV4ConnectionConfig', () => {
  beforeEach(() => {
    config.awsAllowedAuthProviders = [AwsAuthType.Credentials, AwsAuthType.Keys];
    config.awsAssumeRoleEnabled = true;
    config.featureToggles.awsDatasourcesTempCredentials = false;
  });
  const setup = (onOptionsChange?: () => {}) => {
    const props: DataSourcePluginOptionsEditorProps<any, any> = {
      options: {
        typeName: '',
        id: 449,
        uid: 'oIoBsD_Mz',
        orgId: 1,
        name: 'Elasticsearch',
        type: 'elasticsearch',
        typeLogoUrl: '',
        access: 'proxy',
        url: 'http://test.ts',
        user: '',
        database: '',
        basicAuth: false,
        basicAuthUser: '',
        withCredentials: false,
        isDefault: false,
        jsonData: {
          esVersion: '7.10.0',
          includeFrozen: false,
          logLevelField: '',
          logMessageField: '',
          maxConcurrentShardRequests: 5,
          sigV4AssumeRoleArn: 'arn:test',
          sigV4Auth: true,
          sigV4AuthType: 'credentials',
          sigV4ExternalId: 'test-id',
          sigV4Profile: 'profile',
          sigV4Region: 'us-east-2',
          timeField: '@timestamp',
        },
        secureJsonFields: { sigV4AccessKey: true, sigV4SecretKey: true },
        version: 6,
        readOnly: false,
      },
      onOptionsChange: onOptionsChange ?? jest.fn(),
    };

    render(<SIGV4ConnectionConfig {...props} />);
  };

  it('should map incoming props correctly', () => {
    setup();
    expect(screen.getByText('Credentials file')).toBeInTheDocument();
    expect(screen.getByLabelText(/Assume Role ARN/)).toHaveValue('arn:test');
    expect(screen.getByLabelText(/External ID/)).toHaveValue('test-id');
  });

  it('should map changed fields correctly', async () => {
    const onOptionsChange = jest.fn();
    setup(onOptionsChange);

    const labelElement = screen.getByLabelText(/Assume Role ARN/);
    expect(labelElement).toBeInTheDocument();
    fireEvent.change(labelElement, { target: { value: 'changed-arn' } });

    const externalIdElement = screen.getByLabelText(/External ID/);
    expect(externalIdElement).toBeInTheDocument();
    fireEvent.change(externalIdElement, { target: { value: 'changed-test-id' } });

    const authTypeElement = screen.getByLabelText('Authentication Provider');
    expect(authTypeElement).toBeInTheDocument();
    fireEvent.change(authTypeElement, { target: { value: 'keys' } });

    expect.objectContaining({
      options: expect.objectContaining({
        jsonData: expect.objectContaining({
          sigV4AssumeRoleArn: 'changed-arn',
          sigV4ExternalId: 'changed-test-id',
          sigV4AuthType: 'keys',
        }),
      }),
    });
  });
});
