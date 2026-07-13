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
 * Generates a short datasource UID suitable for pre-save ID construction.
 * Grafana assigns UIDs on create in the normal UI flow; this covers edge cases.
 */
export function generateDatasourceUid(): string {
  const bytes = new Uint8Array(8);
  crypto.getRandomValues(bytes);
  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
  // Must start with a letter (k8s name / Grafana short UID convention).
  return `a${hex}`;
}
