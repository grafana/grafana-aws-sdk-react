import {
  buildGrafanaExternalId,
  isValidGrafanaExternalId,
  stackExternalIdFromGrafanaExternalId,
} from './grafanaExternalId';

describe('grafanaExternalId', () => {
  it('builds stack-uid format', () => {
    expect(buildGrafanaExternalId('stackABC', 'dsUid1')).toBe('stackABC-dsUid1');
    expect(isValidGrafanaExternalId('stackABC-dsUid1', 'stackABC', 'dsUid1')).toBe(true);
    expect(isValidGrafanaExternalId('stackABC-dsUid1', 'other', 'dsUid1')).toBe(false);
    expect(isValidGrafanaExternalId('stackABC-dsUid1', 'stackABC', 'other')).toBe(false);
  });

  it('derives stack external ID from per-datasource ID', () => {
    expect(stackExternalIdFromGrafanaExternalId('stackABC-dsUid1', 'dsUid1')).toBe('stackABC');
    expect(stackExternalIdFromGrafanaExternalId('stackABC-dsUid1', 'other')).toBeUndefined();
    expect(stackExternalIdFromGrafanaExternalId(undefined, 'dsUid1')).toBeUndefined();
  });
});
