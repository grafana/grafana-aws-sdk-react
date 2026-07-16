import { buildGrafanaExternalId } from './grafanaExternalId';

describe('grafanaExternalId', () => {
  it('builds stack-uid format', () => {
    expect(buildGrafanaExternalId('stackABC', 'dsUid1')).toBe('stackABC-dsUid1');
  });
});
