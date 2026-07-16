import React, { FC, useEffect, useMemo, useRef, useState } from 'react';
import {
  Input,
  Select,
  ButtonGroup,
  ToolbarButton,
  Text,
  TextLink,
  Collapse,
  Field,
  Space,
  Alert,
  Switch,
} from '@grafana/ui';
import {
  onUpdateDatasourceJsonDataOptionSelect,
  onUpdateDatasourceResetOption,
  onUpdateDatasourceJsonDataOption,
  onUpdateDatasourceSecureJsonDataOption,
} from '@grafana/data';
import { config } from '@grafana/runtime';
import { useConfigSaveReporter } from '../hooks/useConfigSaveReporter';
import { standardRegions } from '../regions';
import { AwsAuthType, ConnectionConfigProps } from '../types';
import { awsAuthProviderOptions } from '../providers';
import { assumeRoleInstructionsStyle } from './ConnectionConfig.styles';
import { buildGrafanaExternalId } from './utils/grafanaExternalId';
import { ConfigSection, ConfigSubSection } from '@grafana/plugin-ui';

export const DEFAULT_LABEL_WIDTH = 28;
const DS_TYPES_THAT_SUPPORT_TEMP_CREDS = [
  'cloudwatch',
  'grafana-amazonprometheus-datasource',
  'grafana-athena-datasource',
  'grafana-aurora-datasource',
  'grafana-dynamodb-datasource',
  'grafana-iot-sitewise-datasource',
  'grafana-opensearch-datasource',
  'grafana-redshift-datasource',
  'grafana-timestream-datasource',
  'grafana-x-ray-datasource',
];
const RFC_2396_WARNING =
  'This functionality should only be used with legacy web sites. RFC 2396 warns that interpreting Userinfo this way "is NOT RECOMMENDED, because the passing of authentication information in clear text (such as URI) has proven to be a security risk in almost every case where it has been used."';
const toOption = (value: string) => ({ value, label: value });
const isAwsAuthType = (value: any): value is AwsAuthType => {
  return typeof value === 'string' && awsAuthProviderOptions.some((opt) => opt.value === value);
};

export const ConnectionConfig: FC<ConnectionConfigProps> = (props: ConnectionConfigProps) => {
  const [isARNInstructionsOpen, setIsARNInstructionsOpen] = useState(false);
  const [showExternalIdChangeWarning, setShowExternalIdChangeWarning] = useState(false);
  const [regions, setRegions] = useState((props.standardRegions || standardRegions).map(toOption));
  // When true, mint grafanaExternalId as soon as stack external ID (props.externalId) is available.
  // Set on auth default / user select of Grafana Assume Role — not for legacy DS that already use stack ID.
  const pendingPerDsExternalIdRef = useRef(false);
  // Persisted/opened mode — warn only while the toggle differs from this value.
  const initialUsePerDatasourceExternalIdRef = useRef(props.options.jsonData.usePerDatasourceExternalId === true);
  const {
    loadRegions,
    onOptionsChange,
    skipHeader = false,
    skipEndpoint = false,
    options,
    hideAssumeRoleArn = false,
    showHttpProxySettings = false,
  } = props;
  useConfigSaveReporter(options.type, options.jsonData.authType);
  let profile = options.jsonData.profile;
  if (profile === undefined) {
    profile = options.database;
  }
  const tempCredsFeatureEnabled =
    config.featureToggles.awsDatasourcesTempCredentials && DS_TYPES_THAT_SUPPORT_TEMP_CREDS.includes(options.type);
  // @ts-ignore not yet in published @grafana/data FeatureToggles
  const perDsExternalIdFeatureEnabled = Boolean(config.featureToggles.awsAssumeRolePerDatasourceExternalId);
  // @ts-ignore ignore feature toggle type error
  const httpProxySettingEnabled = showHttpProxySettings && (config.awsPerDatasourceHTTPProxyEnabled ?? false);
  const awsAssumeRoleEnabled = config.awsAssumeRoleEnabled ?? true;
  const awsAllowedAuthProviders = useMemo(
    () =>
      config.awsAllowedAuthProviders
        .filter((provider) => (provider === AwsAuthType.GrafanaAssumeRole ? tempCredsFeatureEnabled : true))
        .filter(isAwsAuthType),
    [tempCredsFeatureEnabled]
  );
  const isGrafanaAssumeRole = options.jsonData.authType === AwsAuthType.GrafanaAssumeRole;
  const perDatasourceExternalId = options.jsonData.grafanaExternalId;
  // Only warn when an Assume Role ARN is already set — otherwise there is no trust policy
  // to update yet (covers Connections create-then-configure, where id is already assigned).
  const shouldWarnExternalIdChange = Boolean(options.jsonData.assumeRoleArn);
  // Stack ID from the plugin (e.g. CloudWatch /external-id → AWS_AUTH_EXTERNAL_ID).
  const stackExternalId = props.externalId;
  // Toggle reflects explicit bool only; unset (legacy) is stack mode.
  const usePerDatasourceExternalId = options.jsonData.usePerDatasourceExternalId === true;
  // Active ID for STS/display: per-DS when mode on, otherwise stack.
  const grafanaExternalIdDisplay = !isGrafanaAssumeRole
    ? undefined
    : usePerDatasourceExternalId && perDatasourceExternalId
      ? perDatasourceExternalId
      : stackExternalId || undefined;
  const currentProvider = awsAuthProviderOptions.find((p) => p.value === options.jsonData.authType);

  const applyGrafanaExternalId = (nextOptions = options) => {
    // Require a real datasource UID — never invent one client-side (collision risk; server mints on save).
    if (!perDsExternalIdFeatureEnabled || !stackExternalId || !nextOptions.uid) {
      return nextOptions;
    }
    // Explicit stack mode via boolean — do not mint.
    if (nextOptions.jsonData.usePerDatasourceExternalId === false) {
      return nextOptions;
    }
    return {
      ...nextOptions,
      jsonData: {
        ...nextOptions.jsonData,
        usePerDatasourceExternalId: true,
        grafanaExternalId:
          nextOptions.jsonData.grafanaExternalId || buildGrafanaExternalId(stackExternalId, nextOptions.uid),
      },
    };
  };

  const withPerDsMode = (base = options) =>
    applyGrafanaExternalId({
      ...base,
      jsonData: {
        ...base.jsonData,
        usePerDatasourceExternalId: true,
      },
    });

  const onPerDatasourceExternalIdToggle = (enabled: boolean) => {
    if (!perDsExternalIdFeatureEnabled || !isGrafanaAssumeRole) {
      return;
    }
    setShowExternalIdChangeWarning(
      shouldWarnExternalIdChange && enabled !== initialUsePerDatasourceExternalIdRef.current
    );
    if (enabled) {
      pendingPerDsExternalIdRef.current = true;
      onOptionsChange(withPerDsMode());
      return;
    }
    pendingPerDsExternalIdRef.current = false;
    onOptionsChange({
      ...options,
      jsonData: {
        ...options.jsonData,
        usePerDatasourceExternalId: false,
        // Keep grafanaExternalId dormant; aws-sdk uses the bool for STS mode.
      },
    });
  };

  const onAuthProviderChange = (option: { value?: AwsAuthType | null }) => {
    if (option.value !== AwsAuthType.GrafanaAssumeRole) {
      setShowExternalIdChangeWarning(false);
      onUpdateDatasourceJsonDataOptionSelect(props, 'authType')(option);
      return;
    }

    const previousAuthType = options.jsonData.authType;
    const hadPerDatasourceExternalId = Boolean(options.jsonData.grafanaExternalId);
    if (perDsExternalIdFeatureEnabled) {
      pendingPerDsExternalIdRef.current = true;
    }
    const next = applyGrafanaExternalId({
      ...options,
      jsonData: {
        ...options.jsonData,
        authType: AwsAuthType.GrafanaAssumeRole,
        // Keep explicit stack mode; otherwise default to per-DS for this auth switch.
        usePerDatasourceExternalId: options.jsonData.usePerDatasourceExternalId === false ? false : true,
      },
    });
    const willChangeExternalId =
      !hadPerDatasourceExternalId && (Boolean(next.jsonData.grafanaExternalId) || !stackExternalId || !options.uid);
    setShowExternalIdChangeWarning(
      Boolean(
        shouldWarnExternalIdChange &&
        perDsExternalIdFeatureEnabled &&
        willChangeExternalId &&
        previousAuthType &&
        previousAuthType !== AwsAuthType.GrafanaAssumeRole
      )
    );
    onOptionsChange(next);
  };

  useEffect(() => {
    // Make sure a authType exists in the current model
    if (!currentProvider && awsAllowedAuthProviders.length) {
      let defaultAuthType = awsAllowedAuthProviders[0];
      if (awsAllowedAuthProviders.includes(AwsAuthType.GrafanaAssumeRole)) {
        defaultAuthType = AwsAuthType.GrafanaAssumeRole;
      }
      let next: typeof options = {
        ...options,
        jsonData: {
          ...options.jsonData,
          authType: defaultAuthType,
        },
      };
      // New datasources (no authType yet): mint a per-DS ID when defaulting to Grafana Assume Role.
      // Legacy datasources already have authType set and are skipped by !currentProvider.
      if (defaultAuthType === AwsAuthType.GrafanaAssumeRole && perDsExternalIdFeatureEnabled) {
        pendingPerDsExternalIdRef.current = true;
        next = withPerDsMode(next);
      }
      onOptionsChange(next);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only when auth provider is missing
  }, [currentProvider, options, onOptionsChange, awsAllowedAuthProviders, perDsExternalIdFeatureEnabled]);

  // props.externalId is often loaded async (e.g. CloudWatch /external-id). Retry minting once it arrives.
  useEffect(() => {
    if (!perDsExternalIdFeatureEnabled || !pendingPerDsExternalIdRef.current) {
      return;
    }
    if (
      !isGrafanaAssumeRole ||
      options.jsonData.usePerDatasourceExternalId === false ||
      perDatasourceExternalId ||
      !stackExternalId ||
      !options.uid
    ) {
      return;
    }
    onOptionsChange(withPerDsMode());
    // eslint-disable-next-line react-hooks/exhaustive-deps -- retry minting when stack ID / uid become available
  }, [stackExternalId, options.uid, isGrafanaAssumeRole, perDatasourceExternalId, perDsExternalIdFeatureEnabled]);

  useEffect(() => {
    if (!loadRegions) {
      return;
    }

    loadRegions().then((regions) => setRegions(regions.map(toOption)));
  }, [loadRegions]);

  return (
    <div data-testid="connection-config">
      <ConfigSection title={skipHeader ? '' : 'Connection Details'} data-testid="connection-config">
        <ConfigSubSection title="Authentication">
          <Field
            label="Authentication Provider"
            description="Specify which AWS credentials chain to use."
            htmlFor="authProvider"
          >
            <Select
              aria-label="Authentication Provider"
              inputId="authProvider"
              value={currentProvider}
              options={awsAuthProviderOptions.filter((opt) => awsAllowedAuthProviders.includes(opt.value!))}
              defaultValue={options.jsonData.authType}
              onChange={onAuthProviderChange}
              menuShouldPortal={true}
            />
          </Field>
          {options.jsonData.authType === 'credentials' && (
            <Field
              label="Credentials Profile Name"
              description="Credentials profile name, as specified in ~/.aws/credentials, leave blank for default."
              htmlFor="credentialsProfileName"
            >
              <Input
                id="credentialsProfileName"
                placeholder="default"
                value={options.jsonData.profile}
                onChange={onUpdateDatasourceJsonDataOption(props, 'profile')}
              />
            </Field>
          )}
          {options.jsonData.authType === 'keys' && (
            <>
              <Field label="Access Key ID" htmlFor="accessKeyId">
                {props.options.secureJsonFields?.accessKey ? (
                  <ButtonGroup>
                    <Input disabled placeholder="Configured" id="accessKeyId" />
                    <ToolbarButton
                      icon="edit"
                      tooltip="Edit Access Key ID"
                      type="button"
                      onClick={onUpdateDatasourceResetOption(props as any, 'accessKey')}
                    />
                  </ButtonGroup>
                ) : (
                  <Input
                    id="accessKeyId"
                    value={options.secureJsonData?.accessKey ?? ''}
                    onChange={onUpdateDatasourceSecureJsonDataOption(props, 'accessKey')}
                  />
                )}
              </Field>

              <Field label="Secret Access Key" htmlFor="secretKey">
                {props.options.secureJsonFields?.secretKey ? (
                  <ButtonGroup>
                    <Input disabled placeholder="Configured" />
                    <ToolbarButton
                      id="secretKey"
                      icon="edit"
                      type="button"
                      tooltip="Edit Secret Access Key"
                      onClick={onUpdateDatasourceResetOption(props as any, 'secretKey')}
                    />
                  </ButtonGroup>
                ) : (
                  <Input
                    id="secretKey"
                    value={options.secureJsonData?.secretKey ?? ''}
                    onChange={onUpdateDatasourceSecureJsonDataOption(props, 'secretKey')}
                  />
                )}
              </Field>
            </>
          )}
        </ConfigSubSection>

        {!hideAssumeRoleArn && (
          <ConfigSubSection
            title="Assume Role"
            description={
              options.jsonData.authType === AwsAuthType.GrafanaAssumeRole ? (
                <Text>
                  Learn more about{' '}
                  <TextLink
                    inline
                    external
                    variant="bodySmall"
                    href="https://grafana.com/docs/plugins/cloudwatch/latest/aws-authentication/#use-grafana-assume-role"
                  >
                    Grafana Assume Role
                  </TextLink>
                  .
                </Text>
              ) : null
            }
          >
            {options.jsonData.authType === AwsAuthType.GrafanaAssumeRole && (
              <div className={assumeRoleInstructionsStyle}>
                <Collapse
                  label={'How to create an IAM role for grafana to assume:'}
                  collapsible={true}
                  isOpen={isARNInstructionsOpen}
                  onToggle={() => setIsARNInstructionsOpen(!isARNInstructionsOpen)}
                >
                  <ol>
                    <li>
                      <p>
                        1. Create a new IAM role in the AWS console, and select <code>Another AWS account</code> as the{' '}
                        <code>Trusted entity</code>.
                      </p>
                    </li>
                    <li>
                      <p>
                        2. Enter the account ID of the Grafana account that has permission to assume this role:
                        <code> 008923505280 </code> and check the <code>Require external ID</code> box.
                      </p>
                    </li>
                    <li>
                      <p>
                        3. Enter the following external ID (
                        {usePerDatasourceExternalId
                          ? 'unique to this data source'
                          : perDsExternalIdFeatureEnabled
                            ? 'shared stack external ID — legacy'
                            : 'shared stack external ID'}
                        ): <code>{grafanaExternalIdDisplay || 'External Id is currently unavailable'}</code> and click{' '}
                        <code>Next</code>.
                      </p>
                    </li>
                    <li>
                      <p>
                        4. Add any required permissions you would like Grafana to be able to access on your behalf. For
                        more details on our permissions please{' '}
                        <a
                          href="https://grafana.com/docs/grafana/latest/datasources/aws-cloudwatch/"
                          target="_blank"
                          rel="noreferrer"
                        >
                          read through our documentation
                        </a>
                        .
                      </p>
                    </li>
                    <li>
                      <p>
                        5. Give the role a name and description, and click <code>Create role</code>.
                      </p>
                    </li>
                    <li>
                      <p>
                        6. Copy the ARN of the role you just created and paste it into the <code>Assume Role ARN</code>{' '}
                        field below.
                      </p>
                    </li>
                  </ol>
                </Collapse>
              </div>
            )}
            {awsAssumeRoleEnabled && (
              <>
                <Field
                  htmlFor="assumeRoleArn"
                  label="Assume Role ARN"
                  description="Optional. Specifying the ARN of a role will ensure that the
                     selected authentication provider is used to assume the role rather than the
                     credentials directly."
                >
                  <Input
                    id="assumeRoleArn"
                    placeholder="arn:aws:iam:*"
                    value={options.jsonData.assumeRoleArn || ''}
                    onChange={onUpdateDatasourceJsonDataOption(props, 'assumeRoleArn')}
                  />
                </Field>
                {perDsExternalIdFeatureEnabled && isGrafanaAssumeRole && (
                  <Field
                    label="Per Data Source External ID"
                    description="When enabled, this data source uses a unique external ID. When disabled, it uses the shared stack external ID."
                  >
                    <Switch
                      data-testid="per-ds-external-id-toggle"
                      value={usePerDatasourceExternalId}
                      onChange={(e) => onPerDatasourceExternalIdToggle(e.currentTarget.checked)}
                    />
                  </Field>
                )}
                {options.jsonData.authType === AwsAuthType.GrafanaAssumeRole && grafanaExternalIdDisplay && (
                  <Field
                    htmlFor="grafanaExternalId"
                    label="External ID"
                    description={
                      usePerDatasourceExternalId
                        ? 'Unique to this data source. Paste this value into your IAM role trust policy.'
                        : perDsExternalIdFeatureEnabled
                          ? 'Shared stack external ID (legacy). New data sources get a unique ID per data source for stronger isolation.'
                          : 'Shared stack external ID. Paste this value into your IAM role trust policy.'
                    }
                  >
                    <Input id="grafanaExternalId" readOnly value={grafanaExternalIdDisplay} />
                  </Field>
                )}
                {showExternalIdChangeWarning && (
                  <Alert
                    severity="warning"
                    title="External ID will change on save"
                    data-testid="grafana-external-id-change-warning"
                  >
                    Saving will change the external ID used to assume this role (switching between the data
                    source-specific ID and the shared stack ID). Update your IAM role trust policy to match the new
                    external ID or Assume Role will fail.
                  </Alert>
                )}
                {options.jsonData.authType !== AwsAuthType.GrafanaAssumeRole && (
                  <Field
                    htmlFor="externalId"
                    label="External ID"
                    description="If you are assuming a role in another account, that has been created with an external ID, specify the external ID here."
                  >
                    <Input
                      id="externalId"
                      placeholder="External ID"
                      value={options.jsonData.externalId || ''}
                      onChange={onUpdateDatasourceJsonDataOption(props, 'externalId')}
                    />
                  </Field>
                )}
              </>
            )}
          </ConfigSubSection>
        )}
        {httpProxySettingEnabled && (
          <ConfigSubSection title="Proxy Configuration">
            <Field
              label="Proxy Type"
              description="Specify the type of proxy to use. This should not be set if Secure Socks Proxy is enabled."
              htmlFor="proxyType"
            >
              <Select
                inputId="proxyType"
                value={options.jsonData.proxyType || 'env'}
                options={[
                  { label: 'Environment (default)', value: 'env' },
                  { label: 'None', value: 'none' },
                  { label: 'URL', value: 'url' },
                ]}
                onChange={onUpdateDatasourceJsonDataOptionSelect(props, 'proxyType')}
              />
            </Field>
            {(options.jsonData.proxyType === 'env' || !options.jsonData.proxyType) && (
              <>
                <Text variant="bodySmall" color="secondary">
                  Proxy settings from environment variables will be used. Use <code>HTTP_PROXY</code> &amp;{' '}
                  <code>HTTPS_PROXY</code> environment variables. This will be skipped if no environment variables
                  found.
                </Text>
                <Space v={2} />
              </>
            )}
            {options.jsonData.proxyType === 'url' && (
              <>
                <Field
                  label="Proxy URL"
                  description="Proxy URL. Don't set the username or password here"
                  htmlFor="proxyUrl"
                >
                  <Input
                    id="proxyUrl"
                    placeholder="Example: https://localhost:3004"
                    value={options.jsonData.proxyUrl || ''}
                    onChange={onUpdateDatasourceJsonDataOption(props, 'proxyUrl')}
                  />
                </Field>
                <Field
                  label="Proxy Username"
                  description={`Optional: Proxy Username. ${RFC_2396_WARNING}`}
                  htmlFor="proxyUsername"
                >
                  <Input
                    id="proxyUsername"
                    value={options.jsonData.proxyUsername || ''}
                    onChange={onUpdateDatasourceJsonDataOption(props, 'proxyUsername')}
                  />
                </Field>
                <Field
                  label="Proxy Password"
                  description={`Optional: Proxy Password. ${RFC_2396_WARNING}`}
                  htmlFor="proxyPassword"
                >
                  <Input
                    id="proxyPassword"
                    value={options.secureJsonData?.proxyPassword ?? ''}
                    onChange={onUpdateDatasourceSecureJsonDataOption(props, 'proxyPassword')}
                  />
                </Field>
              </>
            )}
          </ConfigSubSection>
        )}
        <ConfigSubSection title="Additional Settings">
          {!skipEndpoint && options.jsonData.authType !== AwsAuthType.GrafanaAssumeRole && (
            <Field
              label="Endpoint"
              description="Optionally, specify a custom endpoint for the service"
              htmlFor="endpoint"
            >
              <Input
                id="endpoint"
                placeholder={props.defaultEndpoint ?? 'https://{service}.{region}.amazonaws.com'}
                value={options.jsonData.endpoint || ''}
                onChange={onUpdateDatasourceJsonDataOption(props, 'endpoint')}
              />
            </Field>
          )}

          <Field
            label="Default Region"
            description="Specify the region, such as for US West (Oregon) use ` us-west-2 ` as the region."
            htmlFor="defaultRegion"
          >
            <Select
              inputId="defaultRegion"
              value={
                regions.find((region) => region.value === options.jsonData.defaultRegion) ??
                (options.jsonData.defaultRegion
                  ? {
                      label: options.jsonData.defaultRegion,
                      value: options.jsonData.defaultRegion,
                    }
                  : undefined)
              }
              options={regions}
              defaultValue={options.jsonData.defaultRegion}
              allowCustomValue={true}
              onChange={onUpdateDatasourceJsonDataOptionSelect(props, 'defaultRegion')}
              formatCreateLabel={(r) => `Use region: ${r}`}
              menuShouldPortal={true}
            />
          </Field>
        </ConfigSubSection>
        {props.children}
      </ConfigSection>
    </div>
  );
};
