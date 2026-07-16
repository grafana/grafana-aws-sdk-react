/**
 * Builds a Grafana Assume Role external ID bound to stack + datasource UID.
 * Format: `{stackExternalId}-{datasourceUid}`
 * Must match server validation in Grafana's datasource service.
 */
export function buildGrafanaExternalId(stackExternalId: string, datasourceUid: string): string {
  return `${stackExternalId}-${datasourceUid}`;
}
