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
