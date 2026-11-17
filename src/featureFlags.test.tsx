import React from 'react';
import { OpenFeatureProvider } from '@openfeature/react-sdk';
import { InMemoryProvider, OpenFeature } from '@openfeature/web-sdk';
import { renderHook, waitFor } from '@testing-library/react';

import { AWS_SDK_OPEN_FEATURE_DOMAIN, initAwsFeatureFlags, usePerDatasourceExternalIdEnabled } from './featureFlags';

const FLAG = 'awsAssumeRolePerDatasourceExternalId';

const flagConfig = (enabled: boolean) => ({
  [FLAG]: {
    variants: { on: true, off: false },
    defaultVariant: enabled ? 'on' : 'off',
    disabled: false,
  },
});

jest.mock('@grafana/runtime', () => {
  const { InMemoryProvider } = jest.requireActual('@openfeature/web-sdk');
  return {
    ...jest.requireActual('@grafana/runtime'),
    createOpenFeatureLocalStorageProvider: jest.fn(() => new InMemoryProvider({})),
    createOpenFeatureOFREPWebProvider: jest.fn(() => new InMemoryProvider({})),
  };
});

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <OpenFeatureProvider domain={AWS_SDK_OPEN_FEATURE_DOMAIN}>{children}</OpenFeatureProvider>
);

describe('usePerDatasourceExternalIdEnabled', () => {
  afterEach(async () => {
    await OpenFeature.clearProviders();
  });

  it('is false when the flag is off for this domain', async () => {
    await OpenFeature.setProviderAndWait(AWS_SDK_OPEN_FEATURE_DOMAIN, new InMemoryProvider(flagConfig(false)));

    const { result } = renderHook(() => usePerDatasourceExternalIdEnabled(), { wrapper });

    expect(result.current).toBe(false);
  });

  it('becomes true once the flag resolves to on', async () => {
    await OpenFeature.setProviderAndWait(AWS_SDK_OPEN_FEATURE_DOMAIN, new InMemoryProvider(flagConfig(true)));

    const { result } = renderHook(() => usePerDatasourceExternalIdEnabled(), { wrapper });

    await waitFor(() => expect(result.current).toBe(true));
  });
});

describe('initAwsFeatureFlags', () => {
  afterEach(async () => {
    await OpenFeature.clearProviders();
  });

  it('registers a provider for the domain once', () => {
    initAwsFeatureFlags();
    const registered = OpenFeature.getProvider(AWS_SDK_OPEN_FEATURE_DOMAIN);
    initAwsFeatureFlags();

    expect(registered).not.toBe(OpenFeature.getProvider());
    expect(OpenFeature.getProvider(AWS_SDK_OPEN_FEATURE_DOMAIN)).toBe(registered);
  });

  it('keeps a provider already registered for the domain', async () => {
    const existing = new InMemoryProvider(flagConfig(true));
    await OpenFeature.setProviderAndWait(AWS_SDK_OPEN_FEATURE_DOMAIN, existing);

    initAwsFeatureFlags();

    expect(OpenFeature.getProvider(AWS_SDK_OPEN_FEATURE_DOMAIN)).toBe(existing);
  });
});
