import { reportInteraction } from '@grafana/runtime';
import { AwsAuthType } from '../types';

export const trackAwsSdkConfigAuthSelected = (props: { authType?: AwsAuthType; datasourceType?: string }) => {
  reportInteraction('aws-sdk-config-auth-selected', props);
};
