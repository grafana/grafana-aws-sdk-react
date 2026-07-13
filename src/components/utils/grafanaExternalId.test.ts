import { buildGrafanaExternalId, generateDatasourceUid, isValidGrafanaExternalId } from './grafanaExternalId';

describe('grafanaExternalId', () => {
  it('builds stack-uid format', () => {
    expect(buildGrafanaExternalId('stackABC', 'dsUid1')).toBe('stackABC-dsUid1');
    expect(isValidGrafanaExternalId('stackABC-dsUid1', 'stackABC', 'dsUid1')).toBe(true);
    expect(isValidGrafanaExternalId('stackABC-dsUid1', 'other', 'dsUid1')).toBe(false);
    expect(isValidGrafanaExternalId('stackABC-dsUid1', 'stackABC', 'other')).toBe(false);
  });

  it('generates uid starting with a letter', () => {
    const uid = generateDatasourceUid();
    expect(uid[0]).toMatch(/[a-f]/);
    expect(uid.length).toBeGreaterThan(8);
  });
});
