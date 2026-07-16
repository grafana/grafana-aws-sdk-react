/**
 * Builds a Grafana Assume Role external ID bound to stack + datasource UID.
 * Format: `{stackExternalId}-{datasourceUid}`
 * Must match server validation in Grafana's datasource service.
 */
export function buildGrafanaExternalId(stackExternalId: string, datasourceUid: string): string {
  return `${stackExternalId}-${datasourceUid}`;
}

/** True if id is bound to this stack + datasource UID. */
export function isValidGrafanaExternalId(id: string, stackExternalId: string, datasourceUid: string): boolean {
  if (!id || !stackExternalId || !datasourceUid) {
    return false;
  }
  return id === buildGrafanaExternalId(stackExternalId, datasourceUid);
}

/**
 * Extracts the stack external ID from a per-datasource ID (`{stack}-{uid}`).
 * Plugins often pass the resolved `/external-id` value as `props.externalId`,
 * which may be the per-DS ID — deriving from grafanaExternalId keeps stack mode display correct.
 */
export function stackExternalIdFromGrafanaExternalId(
  grafanaExternalId: string | undefined,
  datasourceUid: string | undefined
): string | undefined {
  if (!grafanaExternalId || !datasourceUid) {
    return undefined;
  }
  const suffix = `-${datasourceUid}`;
  if (!grafanaExternalId.endsWith(suffix)) {
    return undefined;
  }
  const stack = grafanaExternalId.slice(0, -suffix.length);
  return stack || undefined;
}
