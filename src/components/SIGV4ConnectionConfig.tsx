import React from 'react';
import { DataSourcePluginOptionsEditorProps, DataSourceSettings } from '@grafana/data';
import { ConnectionConfig } from '../components/ConnectionConfig';

import { AwsAuthDataSourceSecureJsonData, AwsAuthDataSourceJsonData, ConnectionConfigProps } from '../types';

export interface SIGV4ConnectionConfigProps extends DataSourcePluginOptionsEditorProps<any, any> {
  inExperimentalAuthComponent?: boolean;
}

export const SIGV4ConnectionConfig: React.FC<SIGV4ConnectionConfigProps> = (props: SIGV4ConnectionConfigProps) => {
  const { onOptionsChange, options } = props;

  const connectionConfigProps: ConnectionConfigProps<AwsAuthDataSourceJsonData, AwsAuthDataSourceSecureJsonData> = {
    onOptionsChange: (awsDataSourceSettings) => {
      const awsJson = awsDataSourceSettings.jsonData;
      const dataSourceSettings: DataSourceSettings<any, any> = {
        ...options,
        jsonData: {
          ...options.jsonData,
          sigV4AuthType: awsJson.authType,
          sigV4Profile: awsJson.profile,
          sigV4AssumeRoleArn: awsJson.assumeRoleArn,
          sigV4ExternalId: awsJson.externalId,
          sigV4Region: awsJson.defaultRegion,
          sigV4Endpoint: awsJson.endpoint,
          sigV4GrafanaExternalId: awsJson.grafanaExternalId,
          sigV4UsePerDatasourceExternalId: awsJson.usePerDatasourceExternalId,
        },
        secureJsonFields: {
          sigV4AccessKey: awsDataSourceSettings.secureJsonFields?.accessKey,
          sigV4SecretKey: awsDataSourceSettings.secureJsonFields?.secretKey,
        },
        secureJsonData: {
          sigV4AccessKey: awsDataSourceSettings.secureJsonData?.accessKey,
          sigV4SecretKey: awsDataSourceSettings.secureJsonData?.secretKey,
        },
      };
      onOptionsChange(dataSourceSettings);
    },
    options: {
      ...options,
      jsonData: {
        authType: options.jsonData.sigV4AuthType,
        profile: options.jsonData.sigV4Profile,
        assumeRoleArn: options.jsonData.sigV4AssumeRoleArn,
        externalId: options.jsonData.sigV4ExternalId,
        defaultRegion: options.jsonData.sigV4Region,
        endpoint: options.jsonData.sigV4Endpoint,
        grafanaExternalId: options.jsonData.sigV4GrafanaExternalId,
        usePerDatasourceExternalId: options.jsonData.sigV4UsePerDatasourceExternalId,
      },
      secureJsonFields: {
        accessKey: options.secureJsonFields?.sigV4AccessKey,
        secretKey: options.secureJsonFields?.sigV4SecretKey,
      },
      secureJsonData: {
        accessKey: options.secureJsonData?.sigV4AccessKey,
        secretKey: options.secureJsonData?.sigV4SecretKey,
      },
    },
    inExperimentalAuthComponent: props.inExperimentalAuthComponent,
  };

  return (
    <>
      <div className="gf-form">
        <h6>SigV4 Auth Details</h6>
      </div>
      <ConnectionConfig {...connectionConfigProps} skipHeader skipEndpoint></ConnectionConfig>
    </>
  );
};
