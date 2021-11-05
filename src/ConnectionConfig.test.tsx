import '@testing-library/jest-dom/extend-expect';
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { AwsAuthDataSourceJsonData, AwsAuthDataSourceSecureJsonData, AwsAuthType } from './types';
import { ConnectionConfig, ConnectionConfigProps } from './ConnectionConfig';

const getProps = (propOverrides?: object) => {
  const props: ConnectionConfigProps<AwsAuthDataSourceJsonData, AwsAuthDataSourceSecureJsonData> = {
    options: {
      id: 21,
      typeName: 'aws',
      uid: '',
      orgId: 1,
      name: 'aws-plugin-name',
      type: 'aws',
      basicAuth: false,
      basicAuthUser: '',
      basicAuthPassword: '',
      withCredentials: false,
      isDefault: false,
      version: 1,
      readOnly: false,
      typeLogoUrl: '',
      url: '',
      password: '',
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

const resetWindow = () => {
  (window as any).grafanaBootData = {
    settings: {
      awsAllowedAuthProviders: [AwsAuthType.EC2IAMRole, AwsAuthType.Keys],
      awsAssumeRoleEnabled: false,
    },
  };
};

describe('ConnectionConfig', () => {
  beforeEach(() => resetWindow());
  afterEach(() => resetWindow());

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

    const config = props.options;
    expect(onOptionsChange).toHaveBeenCalledWith({
      ...config,
      jsonData: {
        ...config.jsonData,
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

  it('should use default auth if awsAllowedAuthProviders was not found on window obj', async () => {
    (window as any).grafanaBootData = {
      settings: {},
    };
    const onOptionsChange = jest.fn();
    const props = getProps({ onOptionsChange });
    render(<ConnectionConfig {...props} />);
    await waitFor(() => expect(screen.getByTestId('connection-config')).toBeInTheDocument());

    const config = props.options;
    expect(onOptionsChange).toHaveBeenCalledWith({
      ...config,
      jsonData: {
        ...config.jsonData,
        authType: AwsAuthType.Default,
      },
    });
  });

  it('should render assume role if awsAssumeRoleEnabled was not found on window obj', async () => {
    (window as any).grafanaBootData = {
      settings: {},
    };
    const props = getProps();
    render(<ConnectionConfig {...props} />);
    await waitFor(() => expect(screen.getByTestId('connection-config')).toBeInTheDocument());
    expect(screen.queryByText('Assume Role ARN')).toBeInTheDocument();
  });

  it('should not render assume role if awsAssumeRoleEnabled was set to false', async () => {
    (window as any).grafanaBootData = {
      settings: {
        awsAssumeRoleEnabled: false,
      },
    };
    const props = getProps();
    render(<ConnectionConfig {...props} />);
    await waitFor(() => expect(screen.getByTestId('connection-config')).toBeInTheDocument());
    expect(screen.queryByText('Assume Role ARN')).not.toBeInTheDocument();
  });

  it('should render assume role if awsAssumeRoleEnabled was set to true', async () => {
    (window as any).grafanaBootData = {
      settings: {
        awsAssumeRoleEnabled: true,
      },
    };
    const props = getProps();
    render(<ConnectionConfig {...props} />);
    await waitFor(() => expect(screen.getByTestId('connection-config')).toBeInTheDocument());
    expect(screen.queryByText('Assume Role ARN')).toBeInTheDocument();
  });
});
