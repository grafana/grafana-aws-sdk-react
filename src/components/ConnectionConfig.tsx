import React, { FC, useEffect, useMemo, useState } from 'react';
import { Input, Select, ButtonGroup, ToolbarButton, Text, TextLink, Collapse, Field } from '@grafana/ui';
import {
  onUpdateDatasourceJsonDataOptionSelect,
  onUpdateDatasourceResetOption,
  onUpdateDatasourceJsonDataOption,
  onUpdateDatasourceSecureJsonDataOption,
} from '@grafana/data';
import { config } from '@grafana/runtime';
import { standardRegions } from '../regions';
import { AwsAuthType, ConnectionConfigProps } from '../types';
import { awsAuthProviderOptions } from '../providers';
import { assumeRoleInstructionsStyle } from './ConnectionConfig.styles';
import { ConfigSection, ConfigSubSection } from '@grafana/plugin-ui';

export const DEFAULT_LABEL_WIDTH = 28;
const DS_TYPES_THAT_SUPPORT_TEMP_CREDS = [
  'cloudwatch',
  'grafana-athena-datasource',
  'grafana-amazonprometheus-datasource',
];
const RFC_2396_WARNING =
  'This functionality should only be used with legacy web sites. RFC 2396 warns that interpreting Userinfo this way "is NOT RECOMMENDED, because the passing of authentication information in clear text (such as URI) has proven to be a security risk in almost every case where it has been used."';
const toOption = (value: string) => ({ value, label: value });
const isAwsAuthType = (value: any): value is AwsAuthType => {
  return typeof value === 'string' && awsAuthProviderOptions.some((opt) => opt.value === value);
};

export const ConnectionConfig: FC<ConnectionConfigProps> = (props: ConnectionConfigProps) => {
  const [isARNInstructionsOpen, setIsARNInstructionsOpen] = useState(false);
  const [regions, setRegions] = useState((props.standardRegions || standardRegions).map(toOption));
  const {
    loadRegions,
    onOptionsChange,
    skipHeader = false,
    skipEndpoint = false,
    options,
    hideAssumeRoleArn = false,
  } = props;
  let profile = options.jsonData.profile;
  if (profile === undefined) {
    profile = options.database;
  }
  const tempCredsFeatureEnabled =
    config.featureToggles.awsDatasourcesTempCredentials && DS_TYPES_THAT_SUPPORT_TEMP_CREDS.includes(options.type);
  // @ts-ignore ignore feature toggle type error
  const httpProxyFeatureEnabled = config.featureToggles.awsDatasourcesHttpProxy ?? false;
  const awsAssumeRoleEnabled = config.awsAssumeRoleEnabled ?? true;
  const awsAllowedAuthProviders = useMemo(
    () =>
      config.awsAllowedAuthProviders
        .filter((provider) => (provider === AwsAuthType.GrafanaAssumeRole ? tempCredsFeatureEnabled : true))
        .filter(isAwsAuthType),
    [tempCredsFeatureEnabled]
  );
  if (tempCredsFeatureEnabled && options.jsonData.authType === AwsAuthType.GrafanaAssumeRole) {
    if (config.namespace.startsWith('stacks-')) {
      props.externalId = config.namespace.substring(config.namespace.indexOf('-') + 1);
    }
  }
  const currentProvider = awsAuthProviderOptions.find((p) => p.value === options.jsonData.authType);

  useEffect(() => {
    // Make sure a authType exists in the current model
    if (!currentProvider && awsAllowedAuthProviders.length) {
      onOptionsChange({
        ...options,
        jsonData: {
          ...options.jsonData,
          authType: awsAllowedAuthProviders[0],
        },
      });
    }
  }, [currentProvider, options, onOptionsChange, awsAllowedAuthProviders]);

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
              onChange={(option) => {
                onUpdateDatasourceJsonDataOptionSelect(props, 'authType')(option);
              }}
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
                        3. Enter the following external ID:{' '}
                        <code>{props.externalId || 'External Id is currently unavailable'}</code> and click{' '}
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
        {httpProxyFeatureEnabled && (
          <ConfigSubSection title="Proxy Configuration">
            <Field label="Proxy Type" description="Specify the type of proxy to use" htmlFor="proxyType">
              <Select
                inputId="proxyType"
                value={options.jsonData.proxyType}
                options={[
                  { label: 'None', value: 'none' },
                  { label: 'Environment', value: 'env' },
                  { label: 'URL', value: 'url' },
                ]}
                onChange={onUpdateDatasourceJsonDataOptionSelect(props, 'proxyType')}
              />
            </Field>
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
