import { DataSourcePluginOptionsEditorProps } from '@grafana/data';
import { AwsAuthDataSourceJsonData, AwsAuthDataSourceSecureJsonData } from 'types';

export const mockDatasourceOptions: DataSourcePluginOptionsEditorProps<
  AwsAuthDataSourceJsonData,
  AwsAuthDataSourceSecureJsonData
> = {
  options: {
    id: 1,
    uid: 'redshift-id',
    orgId: 1,
    name: 'Redshift',
    typeLogoUrl: '',
    type: '',
    typeName: '',
    access: '',
    url: '',
    user: '',
    basicAuth: false,
    basicAuthUser: '',
    database: '',
    isDefault: false,
    jsonData: {
      defaultRegion: 'us-east-2',
    },
    secureJsonFields: {},
    readOnly: false,
    withCredentials: false,
  },
  onOptionsChange: jest.fn(),
};
