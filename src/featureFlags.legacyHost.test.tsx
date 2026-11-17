import React from 'react';
import { OpenFeatureProvider } from '@openfeature/react-sdk';
import { renderHook } from '@testing-library/react';

import { AWS_SDK_OPEN_FEATURE_DOMAIN, initAwsFeatureFlags, usePerDatasourceExternalIdEnabled } from './featureFlags';

jest.mock('@grafana/runtime', () => ({
  ...jest.requireActual('@grafana/runtime'),
  createOpenFeatureLocalStorageProvider: undefined,
  createOpenFeatureOFREPWebProvider: undefined,
}));

describe('featureFlags on a Grafana host without the OpenFeature helpers', () => {
  it('does not throw and reads the flag as off', () => {
    expect(() => initAwsFeatureFlags()).not.toThrow();

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <OpenFeatureProvider domain={AWS_SDK_OPEN_FEATURE_DOMAIN}>{children}</OpenFeatureProvider>
    );
    const { result } = renderHook(() => usePerDatasourceExternalIdEnabled(), { wrapper });

    expect(result.current).toBe(false);
  });
});
