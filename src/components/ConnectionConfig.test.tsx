import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
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
    },
    namespace: '',
  },
}));

describe('ConnectionConfig', () => {
  afterEach(() => {
    config.awsAllowedAuthProviders = [AwsAuthType.EC2IAMRole, AwsAuthType.Keys, AwsAuthType.Credentials];
    config.featureToggles.awsDatasourcesTempCredentials = false;
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
  it('should not render externalId field if GrafanaAssumeRole auth type is selected and the auth type is enabled', async () => {
    config.featureToggles.awsDatasourcesTempCredentials = true;
    const props = getProps({ options: { jsonData: { authType: AwsAuthType.GrafanaAssumeRole } } });
    render(<ConnectionConfig {...props} />);

    await waitFor(() => expect(screen.queryByLabelText('External ID')).not.toBeInTheDocument());
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
  it('should render GrafanaAssumeRole as auth type if the feature flag is enabled and auth providers has GrafanaAssumeRole and the datasource supports temp credentials', async () => {
    config.featureToggles.awsDatasourcesTempCredentials = true;
    config.awsAllowedAuthProviders = [AwsAuthType.GrafanaAssumeRole, AwsAuthType.Credentials];
    const props = getProps();
    const overwriteOptions = { ...props.options, type: 'cloudwatch' };
    render(<ConnectionConfig {...props} options={overwriteOptions} />);
    await selectEvent.openMenu(screen.getByLabelText('Authentication Provider'));
    expect(screen.getByText('Credentials file')).toBeInTheDocument();
    expect(screen.queryByText('Grafana Assume Role')).toBeInTheDocument();
  });
  it('should not render GrafanaAssumeRole as auth type if the feature flag is not enabled', async () => {
    config.featureToggles.awsDatasourcesTempCredentials = false;
    const props = getProps();
    render(<ConnectionConfig {...props} />);
    await selectEvent.openMenu(screen.getByLabelText('Authentication Provider'));
    expect(screen.getByText('Credentials file')).toBeInTheDocument();
    expect(screen.queryByText('Grafana Assume Role')).not.toBeInTheDocument();
  });
  it('should not render GrafanaAssumeRole if the datasource is not a supported datasource type', async () => {
    config.featureToggles.awsDatasourcesTempCredentials = true;
    config.awsAllowedAuthProviders = [AwsAuthType.GrafanaAssumeRole, AwsAuthType.Credentials];
    const props = getProps();
    const overwriteOptions = { ...props.options, type: 'grafana-redshift-datasource' };
    render(<ConnectionConfig {...props} options={overwriteOptions} />);
    await selectEvent.openMenu(screen.getByLabelText('Authentication Provider'));
    expect(screen.queryByText('Grafana Assume Role')).not.toBeInTheDocument();
  });

  it('should show url fields if http proxy type is url', async () => {
    // @ts-ignore ignore feature toggle type error
    config.featureToggles.awsDatasourcesHttpProxy = true;
    const props = getProps({ options: { jsonData: { proxyType: 'url' } } });
    render(<ConnectionConfig {...props} />);
    await waitFor(() => expect(screen.getByTestId('connection-config')).toBeInTheDocument());

    expect(screen.getByText('Proxy Username')).toBeInTheDocument();
    expect(screen.getByText('Proxy URL')).toBeInTheDocument();
    expect(screen.getByText('Proxy Password')).toBeInTheDocument();
  });

  it('should not show url fields if http proxy type is none', async () => {
    // @ts-ignore ignore feature toggle type error
    config.featureToggles.awsDatasourcesHttpProxy = true;
    const props = getProps({ options: { jsonData: { proxyType: 'none' } } });
    render(<ConnectionConfig {...props} />);
    await waitFor(() => expect(screen.getByTestId('connection-config')).toBeInTheDocument());

    expect(screen.queryByText('Proxy URL')).not.toBeInTheDocument();
    expect(screen.queryByText('Proxy Username')).not.toBeInTheDocument();
    expect(screen.queryByText('Proxy Password')).not.toBeInTheDocument();
  });
});
