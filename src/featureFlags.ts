import { useBooleanFlagValue } from '@openfeature/react-sdk';
import { MultiProvider, OpenFeature } from '@openfeature/web-sdk';
import { createOpenFeatureLocalStorageProvider, createOpenFeatureOFREPWebProvider } from '@grafana/runtime';

// Plugins must not share Grafana core's domain, so the SDK registers its own proxy under this one.
export const AWS_SDK_OPEN_FEATURE_DOMAIN = '@grafana/aws-sdk';

const PER_DATASOURCE_EXTERNAL_ID_FLAG = 'awsAssumeRolePerDatasourceExternalId';

export function initAwsFeatureFlags(): void {
  // These helpers ship with Grafana 13.3+. Older hosts get no provider, so the flag reads as off instead of throwing.
  if (
    typeof createOpenFeatureLocalStorageProvider !== 'function' ||
    typeof createOpenFeatureOFREPWebProvider !== 'function'
  ) {
    return;
  }
  if (OpenFeature.getProvider(AWS_SDK_OPEN_FEATURE_DOMAIN) !== OpenFeature.getProvider()) {
    return;
  }
  OpenFeature.setProvider(
    AWS_SDK_OPEN_FEATURE_DOMAIN,
    new MultiProvider([
      { provider: createOpenFeatureLocalStorageProvider() },
      { provider: createOpenFeatureOFREPWebProvider() },
    ])
  );
}

export function usePerDatasourceExternalIdEnabled(): boolean {
  return useBooleanFlagValue(PER_DATASOURCE_EXTERNAL_ID_FLAG, false);
}
