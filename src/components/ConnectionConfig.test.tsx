import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  AwsAuthDataSourceJsonData,
  AwsAuthDataSourceSecureJsonData,
  AwsAuthType,
  ConnectionConfigProps,
} from '../types';
import { ConnectionConfig } from './ConnectionConfig';
import selectEvent from 'react-select-event';
import { config } from '@grafana/runtime';

const getProps = (propOverrides?: object) => {
  const props: ConnectionConfigProps<AwsAuthDataSourceJsonData, AwsAuthDataSourceSecureJsonData> = {
    options: {
      id: 21,
      typeName: 'aws',
      uid: '',
      orgId: 1,
      name: 'aws-plugin-name',
      type: 'aws-plugin-id',
      basicAuth: false,
      basicAuthUser: '',
      withCredentials: false,
      isDefault: false,
      version: 1,
      readOnly: false,
      typeLogoUrl: '',
      url: '',
      access: '',
      database: '',
      user: '',
      jsonData: {
        authType: undefined,
        profile: '',
        assumeRoleArn: '',
        externalId: '',
        defaultRegion: '',
        endpoint: '',
      },
      secureJsonFields: {
        accessKey: false,
        secretKey: false,
        sessionToken: false,
      },
      secureJsonData: {
        accessKey: '',
        secretKey: '',
        sessionToken: '',
      },
    },
    onOptionsChange: jest.fn(),
  };

  Object.assign(props, propOverrides);

  return props;
};

jest.mock('@grafana/runtime', () => ({
  ...jest.requireActual('@grafana/runtime'),
  config: {
    awsAllowedAuthProviders: [AwsAuthType.EC2IAMRole, AwsAuthType.Keys, AwsAuthType.Credentials],
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

describe('ConnectionConfig', () => {
  const renderWithDataSourceType = (type: string) => {
    const props = getProps();
    const options = { ...props.options, type };

    render(<ConnectionConfig {...props} options={options} />);
  };

  afterEach(() => {
    config.awsAllowedAuthProviders = [AwsAuthType.EC2IAMRole, AwsAuthType.Keys, AwsAuthType.Credentials];
    config.featureToggles.awsDatasourcesTempCredentials = false;
    config.featureToggles.awsAssumeRolePerDatasourceExternalId = false;
    //@ts-ignore
    config.awsAssumeRoleEnabled = undefined;
  });
  it('should use auth type from props if its set', async () => {
    const onOptionsChange = jest.fn();
    const props = getProps({ onOptionsChange, options: { jsonData: { authType: AwsAuthType.Keys } } });
    render(<ConnectionConfig {...props} />);
    await waitFor(() => expect(screen.getByTestId('connection-config')).toBeInTheDocument());
    expect(screen.getByText('Access & secret key')).toBeInTheDocument();
    expect(onOptionsChange).not.toHaveBeenCalledWith();
  });

  it('should auto select first auth type if its not set', async () => {
    const onOptionsChange = jest.fn();
    const props = getProps({ onOptionsChange });
    render(<ConnectionConfig {...props} />);
    await waitFor(() => expect(screen.getByTestId('connection-config')).toBeInTheDocument());

    const optionsConfig = props.options;
    expect(onOptionsChange).toHaveBeenCalledWith({
      ...optionsConfig,
      jsonData: {
        ...optionsConfig.jsonData,
        authType: AwsAuthType.EC2IAMRole,
      },
    });
  });

  it('should auto select GrafanaAssumeRole if it is enabled and set as an allowed auth provider', async () => {
    config.featureToggles.awsDatasourcesTempCredentials = true;
    config.awsAllowedAuthProviders = [AwsAuthType.Credentials, AwsAuthType.GrafanaAssumeRole];
    const onOptionsChange = jest.fn();
    const props = getProps({ onOptionsChange });
    const overwriteOptions = { ...props.options, type: 'cloudwatch' };
    render(<ConnectionConfig {...props} options={overwriteOptions} />);
    await waitFor(() => expect(screen.getByTestId('connection-config')).toBeInTheDocument());
    expect(onOptionsChange).toHaveBeenCalledWith({
      ...overwriteOptions,
      jsonData: {
        ...overwriteOptions.jsonData,
        authType: AwsAuthType.GrafanaAssumeRole,
      },
    });
  });

  it('should show secret field if auth type is keys', async () => {
    const props = getProps({ options: { jsonData: { authType: AwsAuthType.Keys } } });
    render(<ConnectionConfig {...props} />);
    await waitFor(() => expect(screen.getByTestId('connection-config')).toBeInTheDocument());

    expect(screen.getByText('Access Key ID')).toBeInTheDocument();
    expect(screen.getByText('Secret Access Key')).toBeInTheDocument();
  });

  it('should render endpoint if skipEndpoint prop is missing', async () => {
    const props = getProps();
    render(<ConnectionConfig {...props} />);
    await waitFor(() => expect(screen.getByTestId('connection-config')).toBeInTheDocument());
    expect(screen.getByText('Endpoint')).toBeInTheDocument();
  });

  it('should render endpoint if skipEndpoint prop is set to false', async () => {
    const props = getProps({ skipEndpoint: false });
    render(<ConnectionConfig {...props} />);
    await waitFor(() => expect(screen.getByTestId('connection-config')).toBeInTheDocument());
    expect(screen.queryByText('Endpoint')).toBeInTheDocument();
  });

  it('should not render endpoint if skipEndpoint prop is set to true', async () => {
    const props = getProps({ skipEndpoint: true });
    render(<ConnectionConfig {...props} />);
    await waitFor(() => expect(screen.getByTestId('connection-config')).toBeInTheDocument());
    expect(screen.queryByText('Endpoint')).not.toBeInTheDocument();
  });

  it('should render default header if skipHeader prop is missing', async () => {
    const props = getProps();
    render(<ConnectionConfig {...props} />);
    await waitFor(() => expect(screen.getByTestId('connection-config')).toBeInTheDocument());
    expect(screen.queryByText('Connection Details')).toBeInTheDocument();
  });

  it('should render default header if skipHeader prop is set to false', async () => {
    const props = getProps({ skipHeader: false });
    render(<ConnectionConfig {...props} />);
    await waitFor(() => expect(screen.getByTestId('connection-config')).toBeInTheDocument());
    expect(screen.queryByText('Connection Details')).toBeInTheDocument();
  });

  it('should not render default header if skipHeader prop is set to true', async () => {
    const props = getProps({ skipHeader: true });
    render(<ConnectionConfig {...props} />);
    await waitFor(() => expect(screen.getByTestId('connection-config')).toBeInTheDocument());
    expect(screen.queryByText('Connection Details')).not.toBeInTheDocument();
  });

  it('should not render assume role if awsAssumeRoleEnabled was set to false', async () => {
    config.awsAssumeRoleEnabled = false;
    const props = getProps();
    render(<ConnectionConfig {...props} />);
    await waitFor(() => expect(screen.getByTestId('connection-config')).toBeInTheDocument());
    expect(screen.queryByText('Assume Role ARN')).not.toBeInTheDocument();
  });

  it('should not render assume role input if hideAssumeRoleArn set to true', () => {
    const props = getProps();
    render(<ConnectionConfig {...props} hideAssumeRoleArn />);
    expect(screen.queryByText('Assume Role ARN')).not.toBeInTheDocument();
  });

  it('should render assume role input by default if awsAssumeRoleEnabled is not defined in the config', () => {
    const props = getProps();
    render(<ConnectionConfig {...props} />);
    expect(screen.queryByText('Assume Role ARN')).toBeInTheDocument();
  });

  it('should render assume role if awsAssumeRoleEnabled was set to true', async () => {
    config.awsAssumeRoleEnabled = true;
    const props = getProps();
    render(<ConnectionConfig {...props} />);
    await waitFor(() => expect(screen.getByTestId('connection-config')).toBeInTheDocument());
    expect(screen.queryByText('Assume Role ARN')).toBeInTheDocument();
  });
  it('should not render editable externalId field if GrafanaAssumeRole auth type is selected', async () => {
    config.featureToggles.awsDatasourcesTempCredentials = true;
    const props = getProps({ options: { jsonData: { authType: AwsAuthType.GrafanaAssumeRole } } });
    render(<ConnectionConfig {...props} />);

    await waitFor(() => expect(screen.queryByPlaceholderText('External ID')).not.toBeInTheDocument());
  });

  it('should mint a per-datasource external ID when defaulting to GrafanaAssumeRole', async () => {
    config.featureToggles.awsDatasourcesTempCredentials = true;
    config.featureToggles.awsAssumeRolePerDatasourceExternalId = true;
    config.awsAllowedAuthProviders = [AwsAuthType.GrafanaAssumeRole, AwsAuthType.Credentials];
    const onOptionsChange = jest.fn();
    const props = getProps({
      onOptionsChange,
      externalId: 'stackABC',
      options: {
        id: 21,
        uid: 'dsUid1',
        type: 'cloudwatch',
        jsonData: { authType: undefined },
      },
    });
    render(<ConnectionConfig {...props} />);
    await waitFor(() => expect(onOptionsChange).toHaveBeenCalled());
    const update = onOptionsChange.mock.calls.find((call) => call[0]?.jsonData?.grafanaExternalId)?.[0];
    expect(update.jsonData.grafanaExternalId).toBe('stackABC-dsUid1');
  });

  it('should not mint a per-datasource external ID when the feature toggle is off', async () => {
    config.featureToggles.awsDatasourcesTempCredentials = true;
    config.featureToggles.awsAssumeRolePerDatasourceExternalId = false;
    config.awsAllowedAuthProviders = [AwsAuthType.GrafanaAssumeRole, AwsAuthType.Credentials];
    const onOptionsChange = jest.fn();
    const props = getProps({
      onOptionsChange,
      externalId: 'stackABC',
      options: {
        id: 21,
        uid: 'dsUid1',
        type: 'cloudwatch',
        jsonData: { authType: undefined },
      },
    });
    render(<ConnectionConfig {...props} />);
    await waitFor(() => expect(onOptionsChange).toHaveBeenCalled());
    expect(onOptionsChange).not.toHaveBeenCalledWith(
      expect.objectContaining({
        jsonData: expect.objectContaining({ grafanaExternalId: expect.any(String) }),
      })
    );
  });

  it('should not mint a per-datasource external ID when datasource uid is missing', async () => {
    config.featureToggles.awsDatasourcesTempCredentials = true;
    config.featureToggles.awsAssumeRolePerDatasourceExternalId = true;
    config.awsAllowedAuthProviders = [AwsAuthType.GrafanaAssumeRole, AwsAuthType.Credentials];
    const onOptionsChange = jest.fn();
    const props = getProps({
      onOptionsChange,
      externalId: 'stackABC',
      options: {
        id: 21,
        uid: '',
        type: 'cloudwatch',
        jsonData: { authType: undefined },
      },
    });
    render(<ConnectionConfig {...props} />);
    await waitFor(() => expect(onOptionsChange).toHaveBeenCalled());
    expect(onOptionsChange).not.toHaveBeenCalledWith(
      expect.objectContaining({
        jsonData: expect.objectContaining({ grafanaExternalId: expect.any(String) }),
      })
    );
  });

  it('should mint per-datasource external ID after stack external ID loads asynchronously', async () => {
    config.featureToggles.awsDatasourcesTempCredentials = true;
    config.featureToggles.awsAssumeRolePerDatasourceExternalId = true;
    config.awsAllowedAuthProviders = [AwsAuthType.GrafanaAssumeRole, AwsAuthType.Credentials];

    const Stateful = () => {
      const [externalId, setExternalId] = React.useState('');
      const [options, setOptions] = React.useState(
        getProps({
          options: {
            id: 21,
            uid: 'dsUid1',
            type: 'cloudwatch',
            jsonData: { authType: undefined },
          },
        }).options
      );

      React.useEffect(() => {
        const t = window.setTimeout(() => setExternalId('stackABC'), 10);
        return () => window.clearTimeout(t);
      }, []);

      return (
        <ConnectionConfig
          {...getProps()}
          options={options}
          externalId={externalId}
          onOptionsChange={(next) => setOptions(next)}
        />
      );
    };

    render(<Stateful />);
    await waitFor(() => expect(screen.getByDisplayValue('stackABC-dsUid1')).toBeInTheDocument());
    expect(screen.getByText(/Unique to this data source/i)).toBeInTheDocument();
  });

  it('should show per-datasource external ID when grafanaExternalId is set', async () => {
    config.featureToggles.awsDatasourcesTempCredentials = true;
    config.featureToggles.awsAssumeRolePerDatasourceExternalId = true;
    config.awsAllowedAuthProviders = [AwsAuthType.GrafanaAssumeRole, AwsAuthType.Credentials];
    const perDsId = 'stackABC-dsUid1';
    const props = getProps({
      options: {
        id: 21,
        uid: 'dsUid1',
        type: 'cloudwatch',
        jsonData: {
          authType: AwsAuthType.GrafanaAssumeRole,
          grafanaExternalId: perDsId,
        },
      },
      externalId: 'stack-should-not-win',
    });
    render(<ConnectionConfig {...props} />);
    await waitFor(() => expect(screen.getByDisplayValue(perDsId)).toBeInTheDocument());
    expect(screen.queryByDisplayValue('stack-should-not-win')).not.toBeInTheDocument();
  });

  it('should fall back to stack external ID for legacy GrafanaAssumeRole datasources', async () => {
    config.featureToggles.awsDatasourcesTempCredentials = true;
    config.featureToggles.awsAssumeRolePerDatasourceExternalId = true;
    config.awsAllowedAuthProviders = [AwsAuthType.GrafanaAssumeRole, AwsAuthType.Credentials];
    const props = getProps({
      options: {
        id: 21,
        uid: 'abc123',
        type: 'cloudwatch',
        jsonData: { authType: AwsAuthType.GrafanaAssumeRole },
      },
      externalId: 'stack-external-id',
    });
    render(<ConnectionConfig {...props} />);
    await waitFor(() => expect(screen.getByDisplayValue('stack-external-id')).toBeInTheDocument());
    expect(screen.getByText(/Shared stack external ID \(legacy\)/i)).toBeInTheDocument();
    await userEvent.click(screen.getByText(/How to create an IAM role for grafana to assume/i));
    expect(screen.getByText(/shared stack external ID — legacy/i)).toBeInTheDocument();
    expect(screen.queryByText(/unique to this data source/i)).not.toBeInTheDocument();
  });

  it('should describe per-datasource external ID as unique in IAM instructions', async () => {
    config.featureToggles.awsDatasourcesTempCredentials = true;
    config.featureToggles.awsAssumeRolePerDatasourceExternalId = true;
    config.awsAllowedAuthProviders = [AwsAuthType.GrafanaAssumeRole, AwsAuthType.Credentials];
    const perDsId = 'stackABC-dsUid1';
    const props = getProps({
      options: {
        id: 21,
        uid: 'dsUid1',
        type: 'cloudwatch',
        jsonData: {
          authType: AwsAuthType.GrafanaAssumeRole,
          grafanaExternalId: perDsId,
        },
      },
      externalId: 'stack-should-not-win',
    });
    render(<ConnectionConfig {...props} />);
    await waitFor(() => expect(screen.getByDisplayValue(perDsId)).toBeInTheDocument());
    await userEvent.click(screen.getByText(/How to create an IAM role for grafana to assume/i));
    expect(screen.getAllByText(/unique to this data source/i).length).toBeGreaterThan(0);
    expect(screen.queryByText(/shared stack external ID — legacy/i)).not.toBeInTheDocument();
  });

  it('should not auto-migrate legacy GrafanaAssumeRole datasources on load', async () => {
    config.featureToggles.awsDatasourcesTempCredentials = true;
    config.featureToggles.awsAssumeRolePerDatasourceExternalId = true;
    config.awsAllowedAuthProviders = [AwsAuthType.GrafanaAssumeRole, AwsAuthType.Credentials];
    const onOptionsChange = jest.fn();
    const props = getProps({
      onOptionsChange,
      externalId: 'stackABC',
      options: {
        id: 21,
        uid: 'dsUid1',
        type: 'cloudwatch',
        jsonData: { authType: AwsAuthType.GrafanaAssumeRole },
      },
    });
    render(<ConnectionConfig {...props} />);
    await waitFor(() => expect(screen.getByDisplayValue('stackABC')).toBeInTheDocument());
    expect(onOptionsChange).not.toHaveBeenCalledWith(
      expect.objectContaining({
        jsonData: expect.objectContaining({ grafanaExternalId: expect.any(String) }),
      })
    );
  });

  it('should warn when switching to GrafanaAssumeRole mints a new external ID', async () => {
    config.featureToggles.awsDatasourcesTempCredentials = true;
    config.featureToggles.awsAssumeRolePerDatasourceExternalId = true;
    config.awsAllowedAuthProviders = [AwsAuthType.Keys, AwsAuthType.GrafanaAssumeRole];
    const onOptionsChange = jest.fn();
    const props = getProps({
      onOptionsChange,
      externalId: 'stackABC',
      options: {
        id: 21,
        uid: 'dsUid1',
        type: 'cloudwatch',
        jsonData: { authType: AwsAuthType.Keys },
      },
    });
    render(<ConnectionConfig {...props} />);
    await waitFor(() => expect(screen.getByLabelText('Authentication Provider')).toBeInTheDocument());
    await selectEvent.select(screen.getByLabelText('Authentication Provider'), 'Grafana Assume Role', {
      container: document.body,
    });
    expect(screen.getByTestId('grafana-external-id-change-warning')).toBeInTheDocument();
    expect(screen.getByText(/External ID will change on save/i)).toBeInTheDocument();
    expect(onOptionsChange).toHaveBeenCalledWith(
      expect.objectContaining({
        jsonData: expect.objectContaining({
          authType: AwsAuthType.GrafanaAssumeRole,
          grafanaExternalId: 'stackABC-dsUid1',
        }),
      })
    );
  });

  it('should not warn when switching to GrafanaAssumeRole while the feature toggle is off', async () => {
    config.featureToggles.awsDatasourcesTempCredentials = true;
    config.featureToggles.awsAssumeRolePerDatasourceExternalId = false;
    config.awsAllowedAuthProviders = [AwsAuthType.Keys, AwsAuthType.GrafanaAssumeRole];
    const onOptionsChange = jest.fn();
    const props = getProps({
      onOptionsChange,
      externalId: 'stackABC',
      options: {
        id: 21,
        uid: 'dsUid1',
        type: 'cloudwatch',
        jsonData: { authType: AwsAuthType.Keys },
      },
    });
    render(<ConnectionConfig {...props} />);
    await waitFor(() => expect(screen.getByLabelText('Authentication Provider')).toBeInTheDocument());
    await selectEvent.select(screen.getByLabelText('Authentication Provider'), 'Grafana Assume Role', {
      container: document.body,
    });
    expect(screen.queryByTestId('grafana-external-id-change-warning')).not.toBeInTheDocument();
    expect(onOptionsChange).not.toHaveBeenCalledWith(
      expect.objectContaining({
        jsonData: expect.objectContaining({ grafanaExternalId: expect.any(String) }),
      })
    );
  });

  it('should not warn when GrafanaAssumeRole already has a per-datasource external ID', async () => {
    config.featureToggles.awsDatasourcesTempCredentials = true;
    config.featureToggles.awsAssumeRolePerDatasourceExternalId = true;
    config.awsAllowedAuthProviders = [AwsAuthType.Keys, AwsAuthType.GrafanaAssumeRole];
    const onOptionsChange = jest.fn();
    const props = getProps({
      onOptionsChange,
      externalId: 'stackABC',
      options: {
        id: 21,
        uid: 'dsUid1',
        type: 'cloudwatch',
        jsonData: {
          authType: AwsAuthType.Keys,
          grafanaExternalId: 'stackABC-dsUid1',
        },
      },
    });
    render(<ConnectionConfig {...props} />);
    await waitFor(() => expect(screen.getByLabelText('Authentication Provider')).toBeInTheDocument());
    await selectEvent.select(screen.getByLabelText('Authentication Provider'), 'Grafana Assume Role', {
      container: document.body,
    });
    expect(screen.queryByTestId('grafana-external-id-change-warning')).not.toBeInTheDocument();
  });
  it('should render "Learn more about Grafana Assume Role" link when GrafanaAssumeRole is selected', async () => {
    config.featureToggles.awsDatasourcesTempCredentials = true;
    config.awsAllowedAuthProviders = [AwsAuthType.GrafanaAssumeRole, AwsAuthType.Credentials];
    const props = getProps({ options: { jsonData: { authType: AwsAuthType.GrafanaAssumeRole } } });
    const overwriteOptions = { ...props.options, type: 'cloudwatch' };
    render(<ConnectionConfig {...props} options={overwriteOptions} />);
    await waitFor(() => expect(screen.getByTestId('connection-config')).toBeInTheDocument());
    expect(screen.getByText(/Learn more about/i)).toBeInTheDocument();
    const link = screen.getByRole('link', { name: 'Grafana Assume Role' });
    expect(link).toBeInTheDocument();
  });
  it.each([
    'cloudwatch',
    'grafana-amazonprometheus-datasource',
    'grafana-athena-datasource',
    'grafana-aurora-datasource',
    'grafana-dynamodb-datasource',
    'grafana-iot-sitewise-datasource',
    'grafana-opensearch-datasource',
    'grafana-redshift-datasource',
    'grafana-timestream-datasource',
    'grafana-x-ray-datasource',
  ])(
    'should render GrafanaAssumeRole as an auth type for %s when temp credentials are enabled',
    async (dataSourceType) => {
      config.featureToggles.awsDatasourcesTempCredentials = true;
      config.awsAllowedAuthProviders = [AwsAuthType.GrafanaAssumeRole, AwsAuthType.Credentials];
      renderWithDataSourceType(dataSourceType);

      await selectEvent.openMenu(screen.getByLabelText('Authentication Provider'));
      expect(screen.getByText('Grafana Assume Role')).toBeInTheDocument();
    }
  );

  it('should not render GrafanaAssumeRole as an auth type for TwinMaker because it does not support temp credentials', async () => {
    config.featureToggles.awsDatasourcesTempCredentials = true;
    config.awsAllowedAuthProviders = [AwsAuthType.GrafanaAssumeRole, AwsAuthType.Credentials];
    renderWithDataSourceType('grafana-iot-twinmaker-datasource');

    await selectEvent.openMenu(screen.getByLabelText('Authentication Provider'));
    expect(screen.getByText('Credentials file')).toBeInTheDocument();
    expect(screen.queryByText('Grafana Assume Role')).not.toBeInTheDocument();
  });

  it('should not render GrafanaAssumeRole as an auth type if the feature flag is not enabled', async () => {
    config.featureToggles.awsDatasourcesTempCredentials = false;
    config.awsAllowedAuthProviders = [AwsAuthType.GrafanaAssumeRole, AwsAuthType.Credentials];
    renderWithDataSourceType('cloudwatch');

    await selectEvent.openMenu(screen.getByLabelText('Authentication Provider'));
    expect(screen.getByText('Credentials file')).toBeInTheDocument();
    expect(screen.queryByText('Grafana Assume Role')).not.toBeInTheDocument();
  });

  it('should not render GrafanaAssumeRole as an auth type if it is not an allowed auth provider', async () => {
    config.featureToggles.awsDatasourcesTempCredentials = true;
    config.awsAllowedAuthProviders = [AwsAuthType.Credentials];
    renderWithDataSourceType('cloudwatch');

    await selectEvent.openMenu(screen.getByLabelText('Authentication Provider'));
    expect(screen.queryByText('Grafana Assume Role')).not.toBeInTheDocument();
  });

  it('should show url fields if http proxy type is url', async () => {
    // @ts-ignore ignore setting type error
    config.awsPerDatasourceHTTPProxyEnabled = true;
    const props = getProps({ options: { jsonData: { proxyType: 'url' } } });
    render(<ConnectionConfig {...props} showHttpProxySettings />);
    await waitFor(() => expect(screen.getByTestId('connection-config')).toBeInTheDocument());

    expect(screen.getByText('Proxy Username')).toBeInTheDocument();
    expect(screen.getByText('Proxy URL')).toBeInTheDocument();
    expect(screen.getByText('Proxy Password')).toBeInTheDocument();
  });

  it('should not show url fields if http proxy setting is not enabled', async () => {
    // @ts-ignore ignore setting type error
    config.awsPerDatasourceHTTPProxyEnabled = true;
    const props = getProps({ options: { jsonData: { proxyType: 'url' } } });
    render(<ConnectionConfig {...props} />);
    await waitFor(() => expect(screen.getByTestId('connection-config')).toBeInTheDocument());

    expect(screen.queryByText('Proxy Username')).not.toBeInTheDocument();
    expect(screen.queryByText('Proxy URL')).not.toBeInTheDocument();
    expect(screen.queryByText('Proxy Password')).not.toBeInTheDocument();
  });

  it('should not show url fields if http proxy type is none', async () => {
    // @ts-ignore ignore setting type error
    config.awsPerDatasourceHTTPProxyEnabled = true;
    const props = getProps({ options: { jsonData: { proxyType: 'none' } } });
    render(<ConnectionConfig {...props} showHttpProxySettings />);
    await waitFor(() => expect(screen.getByTestId('connection-config')).toBeInTheDocument());

    expect(screen.queryByText('Proxy URL')).not.toBeInTheDocument();
    expect(screen.queryByText('Proxy Username')).not.toBeInTheDocument();
    expect(screen.queryByText('Proxy Password')).not.toBeInTheDocument();
  });
});
