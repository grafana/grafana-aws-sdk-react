import type { DataSourceJsonData, DataSourcePluginOptionsEditorProps, DataSourceSettings } from '@grafana/data';

export enum AwsAuthType {
  Keys = 'keys',
  Credentials = 'credentials',
  Default = 'default', // was 'arn',
  EC2IAMRole = 'ec2_iam_role',
  /**
   * @deprecated use default
   */
  ARN = 'arn',
  GrafanaAssumeRole = 'grafana_assume_role',
}

export interface AwsAuthDataSourceJsonData extends DataSourceJsonData {
  authType?: AwsAuthType;
  assumeRoleArn?: string;
  externalId?: string;
  profile?: string; // Credentials profile name, as specified in ~/.aws/credentials
  defaultRegion?: string; // region if it is not defined by your credentials file
  endpoint?: string;
  proxyType?: 'none' | 'env' | 'url';
  proxyUrl?: string;
  proxyUsername?: string;
}

export interface AwsAuthDataSourceSecureJsonData {
  accessKey?: string;
  secretKey?: string;
  proxyPassword?: string;
  sessionToken?: string;
}

export type AwsAuthDataSourceSettings = DataSourceSettings<AwsAuthDataSourceJsonData, AwsAuthDataSourceSecureJsonData>;

export interface ConnectionConfigProps<
  J extends AwsAuthDataSourceJsonData = AwsAuthDataSourceJsonData,
  S = AwsAuthDataSourceSecureJsonData,
> extends DataSourcePluginOptionsEditorProps<J, S> {
  standardRegions?: string[];
  loadRegions?: () => Promise<string[]>;
  defaultEndpoint?: string;
  skipHeader?: boolean;
  skipEndpoint?: boolean;
  children?: React.ReactNode;
  labelWidth?: number;
  inExperimentalAuthComponent?: boolean;
  externalId?: string;
  hideAssumeRoleArn?: boolean;
}
