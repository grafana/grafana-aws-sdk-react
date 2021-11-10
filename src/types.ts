import { DataSourceJsonData, DataSourceSettings } from '@grafana/data';

export enum AwsAuthType {
  Keys = 'keys',
  Credentials = 'credentials',
  Default = 'default', // was 'arn',
  EC2IAMRole = 'ec2_iam_role',
  /**
   * @deprecated use default
   */
  ARN = 'arn',
}

export interface AwsAuthDataSourceJsonData extends DataSourceJsonData {
  authType?: AwsAuthType;
  assumeRoleArn?: string;
  externalId?: string;
  profile?: string; // Credentials profile name, as specified in ~/.aws/credentials
  defaultRegion?: string; // region if it is not defined by your credentials file
  endpoint?: string;
}

export interface AwsAuthDataSourceSecureJsonData {
  accessKey?: string;
  secretKey?: string;
  sessionToken?: string;
}

export type AwsAuthDataSourceSettings = DataSourceSettings<AwsAuthDataSourceJsonData, AwsAuthDataSourceSecureJsonData>;
