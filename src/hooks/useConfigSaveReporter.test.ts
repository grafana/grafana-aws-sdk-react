import { renderHook } from '@testing-library/react-hooks';
import { useConfigSaveReporter } from './useConfigSaveReporter';
import { AwsAuthType } from '../types';

const mockReport = jest.fn();
const mockUnsubscribeSuccess = jest.fn();
const mockUnsubscribeFailure = jest.fn();

let subscribedHandlers: Record<string, () => void> = {};

jest.mock('@grafana/runtime', () => ({
  usePluginInteractionReporter: () => mockReport,
  getAppEvents: () => ({
    subscribe: (_eventType: any, handler: () => void) => {
      const name = _eventType.type;
      subscribedHandlers[name] = handler;
      if (name === 'data-source-test-succeeded') {
        return { unsubscribe: mockUnsubscribeSuccess };
      }
      return { unsubscribe: mockUnsubscribeFailure };
    },
  }),
}));

jest.mock('@grafana/data', () => ({
  DataSourceTestSucceeded: { type: 'data-source-test-succeeded' },
  DataSourceTestFailed: { type: 'data-source-test-failed' },
}));

beforeEach(() => {
  jest.clearAllMocks();
  subscribedHandlers = {};
});

describe('useConfigSaveReporter', () => {
  it('subscribes to success and failure events on mount', () => {
    renderHook(() => useConfigSaveReporter('cloudwatch', AwsAuthType.Keys));

    expect(subscribedHandlers['data-source-test-succeeded']).toBeDefined();
    expect(subscribedHandlers['data-source-test-failed']).toBeDefined();
  });

  it('reports with correct properties on success', () => {
    renderHook(() => useConfigSaveReporter('grafana-athena-datasource', AwsAuthType.Default));

    subscribedHandlers['data-source-test-succeeded']();

    expect(mockReport).toHaveBeenCalledWith('grafana_plugin_aws_save', {
      auth_type: AwsAuthType.Default,
      result: 'succeeded',
    });
  });

  it('reports with correct properties on failure', () => {
    renderHook(() => useConfigSaveReporter('cloudwatch', AwsAuthType.Credentials));

    subscribedHandlers['data-source-test-failed']();

    expect(mockReport).toHaveBeenCalledWith('grafana_plugin_aws_save', {
      auth_type: AwsAuthType.Credentials,
      result: 'failed',
    });
  });

  it('unsubscribes on unmount', () => {
    const { unmount } = renderHook(() => useConfigSaveReporter('cloudwatch', AwsAuthType.Keys));

    unmount();

    expect(mockUnsubscribeSuccess).toHaveBeenCalled();
    expect(mockUnsubscribeFailure).toHaveBeenCalled();
  });

  it('re-subscribes when authType changes', () => {
    const { rerender } = renderHook(({ authType }) => useConfigSaveReporter('cloudwatch', authType), {
      initialProps: { authType: AwsAuthType.Keys as AwsAuthType | undefined },
    });

    expect(mockUnsubscribeSuccess).not.toHaveBeenCalled();

    rerender({ authType: AwsAuthType.Default });

    // Old subscriptions should be cleaned up
    expect(mockUnsubscribeSuccess).toHaveBeenCalled();
    expect(mockUnsubscribeFailure).toHaveBeenCalled();

    // New subscription should report with updated authType
    subscribedHandlers['data-source-test-succeeded']();
    expect(mockReport).toHaveBeenCalledWith('grafana_plugin_aws_save', {
      auth_type: AwsAuthType.Default,
      result: 'succeeded',
    });
  });
});
