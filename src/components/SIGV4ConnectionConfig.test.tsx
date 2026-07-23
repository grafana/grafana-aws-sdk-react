import { DataSourcePluginOptionsEditorProps, DataSourceSettings } from '@grafana/data';
import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import selectEvent from 'react-select-event';
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
      awsAssumeRolePerDatasourceExternalId: false,
    },
    namespace: '',
  },
  usePluginInteractionReporter: () => jest.fn(),
  getAppEvents: () => ({
    subscribe: () => ({ unsubscribe: jest.fn() }),
  }),
}));

interface SetupOptions {
  optionsOverrides?: Partial<DataSourceSettings<any, any>> & { jsonData?: Record<string, any> };
  /** Stack ID via Cloud-style config.namespace (`stacks-<id>`). */
  stackIdViaNamespace?: string;
  onOptionsChange?: (options: DataSourceSettings<any, any>) => void;
}

describe('SIGV4ConnectionConfig', () => {
  beforeEach(() => {
    config.awsAllowedAuthProviders = [AwsAuthType.Credentials, AwsAuthType.Keys];
    config.awsAssumeRoleEnabled = true;
    config.featureToggles.awsDatasourcesTempCredentials = false;
    // @ts-ignore not yet in published @grafana/data FeatureToggles
    config.featureToggles.awsAssumeRolePerDatasourceExternalId = false;
    config.namespace = '';
  });

  const setup = (setupOptions: SetupOptions = {}) => {
    const { optionsOverrides = {}, stackIdViaNamespace, onOptionsChange = jest.fn() } = setupOptions;
    const { jsonData: jsonDataOverrides, ...restOverrides } = optionsOverrides;

    // ConnectionConfig derives stack external ID from config.namespace (Cloud / SigV4 path).
    if (stackIdViaNamespace !== undefined) {
      config.namespace = `stacks-${stackIdViaNamespace}`;
    }

    const props: DataSourcePluginOptionsEditorProps<any, any> = {
      options: {
        typeName: '',
        id: 449,
        uid: 'oIoBsD_Mz',
        orgId: 1,
        name: 'OpenSearch',
        type: 'grafana-opensearch-datasource',
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
          ...jsonDataOverrides,
        },
        secureJsonFields: { sigV4AccessKey: true, sigV4SecretKey: true },
        version: 6,
        readOnly: false,
        ...restOverrides,
      },
      onOptionsChange,
    };

    render(<SIGV4ConnectionConfig {...props} />);

    return { onOptionsChange };
  };

  it('should map incoming props correctly', () => {
    setup();
    expect(screen.getByText('Credentials file')).toBeInTheDocument();
    expect(screen.getByLabelText(/Assume Role ARN/)).toHaveValue('arn:test');
    expect(screen.getByLabelText(/External ID/)).toHaveValue('test-id');
  });

  it('should map changed fields correctly', async () => {
    const onOptionsChange = jest.fn();
    setup({ onOptionsChange });

    const labelElement = screen.getByLabelText(/Assume Role ARN/);
    expect(labelElement).toBeInTheDocument();
    fireEvent.change(labelElement, { target: { value: 'changed-arn' } });

    expect(onOptionsChange).toHaveBeenLastCalledWith(
      expect.objectContaining({
        jsonData: expect.objectContaining({
          sigV4AssumeRoleArn: 'changed-arn',
          // Non-auth OpenSearch fields preserved; unprefixed auth aliases never written.
          esVersion: '7.10.0',
          timeField: '@timestamp',
        }),
      })
    );
    const afterArnChange = onOptionsChange.mock.calls.at(-1)[0].jsonData;
    expect(afterArnChange.assumeRoleArn).toBeUndefined();
    expect(afterArnChange.authType).toBeUndefined();
    expect(afterArnChange.grafanaExternalId).toBeUndefined();
    expect(afterArnChange.usePerDatasourceExternalId).toBeUndefined();

    const externalIdElement = screen.getByLabelText(/External ID/);
    expect(externalIdElement).toBeInTheDocument();
    fireEvent.change(externalIdElement, { target: { value: 'changed-test-id' } });

    expect(onOptionsChange).toHaveBeenLastCalledWith(
      expect.objectContaining({
        jsonData: expect.objectContaining({
          sigV4ExternalId: 'changed-test-id',
        }),
      })
    );

    const authTypeElement = screen.getByLabelText('Authentication Provider');
    expect(authTypeElement).toBeInTheDocument();
    await selectEvent.select(authTypeElement, 'Access & secret key', { container: document.body });

    expect(onOptionsChange).toHaveBeenLastCalledWith(
      expect.objectContaining({
        jsonData: expect.objectContaining({
          sigV4AuthType: 'keys',
        }),
      })
    );
    const afterAuthType = onOptionsChange.mock.calls.at(-1)[0].jsonData;
    expect(afterAuthType.authType).toBeUndefined();
  });

  it('should map sigV4 per-datasource external ID fields into ConnectionConfig', async () => {
    config.featureToggles.awsDatasourcesTempCredentials = true;
    // @ts-ignore not yet in published @grafana/data FeatureToggles
    config.featureToggles.awsAssumeRolePerDatasourceExternalId = true;
    config.awsAllowedAuthProviders = [AwsAuthType.GrafanaAssumeRole, AwsAuthType.Credentials];

    setup({
      optionsOverrides: {
        type: 'grafana-opensearch-datasource',
        uid: 'dsUid1',
        jsonData: {
          sigV4Auth: true,
          sigV4AuthType: AwsAuthType.GrafanaAssumeRole,
          sigV4AssumeRoleArn: 'arn:aws:iam::123:role/test',
          sigV4GrafanaExternalId: 'stackABC-dsUid1',
          sigV4UsePerDatasourceExternalId: true,
          sigV4Region: 'us-east-2',
        },
      },
      stackIdViaNamespace: 'stackABC',
    });

    expect(screen.getByTestId('per-ds-external-id-toggle')).toBeChecked();
    expect(screen.getByDisplayValue('stackABC-dsUid1')).toBeInTheDocument();
  });

  it('should persist minted per-datasource external ID under sigV4-prefixed keys only', async () => {
    config.featureToggles.awsDatasourcesTempCredentials = true;
    // @ts-ignore not yet in published @grafana/data FeatureToggles
    config.featureToggles.awsAssumeRolePerDatasourceExternalId = true;
    config.awsAllowedAuthProviders = [AwsAuthType.GrafanaAssumeRole, AwsAuthType.Credentials];
    config.namespace = 'stacks-stackABC';

    const onOptionsChange = jest.fn();
    setup({
      onOptionsChange,
      optionsOverrides: {
        type: 'grafana-opensearch-datasource',
        uid: 'dsUid1',
        jsonData: {
          sigV4Auth: true,
          // no sigV4AuthType yet — ConnectionConfig defaults to GAR when allowed
          sigV4AuthType: undefined,
          sigV4AssumeRoleArn: undefined,
          sigV4ExternalId: undefined,
        },
      },
    });

    await waitFor(() => expect(onOptionsChange).toHaveBeenCalled());
    const update = onOptionsChange.mock.calls.find((call) => call[0]?.jsonData?.sigV4GrafanaExternalId)?.[0];

    expect(update.jsonData.sigV4GrafanaExternalId).toBe('stackABC-dsUid1');
    expect(update.jsonData.sigV4UsePerDatasourceExternalId).toBe(true);
    expect(update.jsonData.sigV4AuthType).toBe(AwsAuthType.GrafanaAssumeRole);
    expect(update.jsonData.grafanaExternalId).toBeUndefined();
    expect(update.jsonData.usePerDatasourceExternalId).toBeUndefined();
  });

  it('should write sigV4UsePerDatasourceExternalId false when per-DS toggle is disabled', async () => {
    config.featureToggles.awsDatasourcesTempCredentials = true;
    // @ts-ignore not yet in published @grafana/data FeatureToggles
    config.featureToggles.awsAssumeRolePerDatasourceExternalId = true;
    config.awsAllowedAuthProviders = [AwsAuthType.GrafanaAssumeRole, AwsAuthType.Credentials];
    config.namespace = 'stacks-stackABC';

    const onOptionsChange = jest.fn();
    setup({
      onOptionsChange,
      optionsOverrides: {
        type: 'grafana-opensearch-datasource',
        uid: 'dsUid1',
        jsonData: {
          sigV4Auth: true,
          sigV4AuthType: AwsAuthType.GrafanaAssumeRole,
          sigV4AssumeRoleArn: 'arn:aws:iam::123:role/test',
          sigV4GrafanaExternalId: 'stackABC-dsUid1',
          sigV4UsePerDatasourceExternalId: true,
        },
      },
    });

    fireEvent.click(screen.getByTestId('per-ds-external-id-toggle'));

    await waitFor(() =>
      expect(onOptionsChange).toHaveBeenCalledWith(
        expect.objectContaining({
          jsonData: expect.objectContaining({
            sigV4UsePerDatasourceExternalId: false,
            sigV4GrafanaExternalId: 'stackABC-dsUid1',
          }),
        })
      )
    );
    const last = onOptionsChange.mock.calls.at(-1)[0];
    expect(last.jsonData.usePerDatasourceExternalId).toBeUndefined();
    expect(last.jsonData.grafanaExternalId).toBeUndefined();
  });
});
