import React, { FC, useEffect, useMemo, useState } from 'react';
import {
  Input,
  Select,
  ButtonGroup,
  ToolbarButton,
  Collapse,
  useStyles2,
  Field,
  Label,
  Tooltip,
  Icon,
} from '@grafana/ui';
import {
  DataSourcePluginOptionsEditorProps,
  onUpdateDatasourceJsonDataOptionSelect,
  onUpdateDatasourceResetOption,
  onUpdateDatasourceJsonDataOption,
  onUpdateDatasourceSecureJsonDataOption,
} from '@grafana/data';
import { config } from '@grafana/runtime';
import { standardRegions } from './regions';
import { AwsAuthDataSourceJsonData, AwsAuthDataSourceSecureJsonData, AwsAuthType } from './types';
import { awsAuthProviderOptions } from './providers';
import { css } from '@emotion/css';
import { ConfigSection, Stack } from '@grafana/experimental';

export const DEFAULT_LABEL_WIDTH = 28;
const DS_TYPES_THAT_SUPPORT_TEMP_CREDS = ['cloudwatch'];
const toOption = (value: string) => ({ value, label: value });
const isAwsAuthType = (value: any): value is AwsAuthType => {
  return typeof value === 'string' && awsAuthProviderOptions.some((opt) => opt.value === value);
};
export interface ConnectionConfigProps<
  J extends AwsAuthDataSourceJsonData = AwsAuthDataSourceJsonData,
  S = AwsAuthDataSourceSecureJsonData
> extends DataSourcePluginOptionsEditorProps<J, S> {
  standardRegions?: string[];
  loadRegions?: () => Promise<string[]>;
  defaultEndpoint?: string;
  skipHeader?: boolean;
  skipEndpoint?: boolean;
  children?: React.ReactNode;
  labelWidth?: number;
  inExperimentalAuthComponent?: boolean;
  externalId?: string;
}

export const ConnectionConfig: FC<ConnectionConfigProps> = (props: ConnectionConfigProps) => {
  const [isARNInstructionsOpen, setIsARNInstructionsOpen] = useState(false);
  const [regions, setRegions] = useState((props.standardRegions || standardRegions).map(toOption));
  const { loadRegions, onOptionsChange, skipHeader = false, skipEndpoint = false } = props;
  const { options, inExperimentalAuthComponent } = props;
  let profile = options.jsonData.profile;
  if (profile === undefined) {
    profile = options.database;
  }
  const tempCredsFeatureEnabled =
    // @ts-ignore
    config.featureToggles.awsDatasourcesTempCredentials && DS_TYPES_THAT_SUPPORT_TEMP_CREDS.includes(options.type);
  const awsAssumeRoleEnabled = config.awsAssumeRoleEnabled ?? true;
  const awsAllowedAuthProviders = useMemo(
    () =>
      config.awsAllowedAuthProviders
        .filter((provider) => (provider === AwsAuthType.GrafanaAssumeRole ? tempCredsFeatureEnabled : true))
        .filter(isAwsAuthType),
    [tempCredsFeatureEnabled]
  );

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

  const inputWidth = inExperimentalAuthComponent ? 'width-20' : 'width-30';
  const styles = useStyles2(getStyles);

  return (
    <>
      <ConfigSection title={skipHeader ? '' : 'Connection Details'} data-testid="connection-config">
        <Field
          label="Authentication Provider"
          description="Specify which AWS credentials chain to use."
          // labelWidth={labelWidth}
          // tooltip="Specify which AWS credentials chain to use."
        >
          <Select
            aria-label="Authentication Provider"
            className={inputWidth}
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
            // labelWidth={labelWidth}
            description="Credentials profile name, as specified in ~/.aws/credentials, leave blank for default."
          >
            <Input
              aria-label="Credentials Profile Name"
              className={inputWidth}
              placeholder="default"
              value={profile}
              onChange={onUpdateDatasourceJsonDataOption(props, 'profile')}
            />
          </Field>
        )}
        {options.jsonData.authType === 'keys' && (
          <>
            <Field label="Access Key ID">
              {props.options.secureJsonFields?.accessKey ? (
                <ButtonGroup className={inputWidth}>
                  <Input disabled placeholder="Configured" />
                  <ToolbarButton
                    icon="edit"
                    tooltip="Edit Access Key ID"
                    type="button"
                    onClick={onUpdateDatasourceResetOption(props as any, 'accessKey')}
                  />
                </ButtonGroup>
              ) : (
                <Input
                  aria-label="Access Key ID"
                  className={inputWidth}
                  value={options.secureJsonData?.accessKey ?? ''}
                  onChange={onUpdateDatasourceSecureJsonDataOption(props, 'accessKey')}
                />
              )}
            </Field>

            <Field label="Secret Access Key">
              {props.options.secureJsonFields?.secretKey ? (
                <ButtonGroup className={inputWidth}>
                  <Input disabled placeholder="Configured" />
                  <ToolbarButton
                    icon="edit"
                    type="button"
                    tooltip="Edit Secret Access Key"
                    onClick={onUpdateDatasourceResetOption(props as any, 'secretKey')}
                  />
                </ButtonGroup>
              ) : (
                <Input
                  aria-label="Secret Access Key"
                  className={inputWidth}
                  value={options.secureJsonData?.secretKey ?? ''}
                  onChange={onUpdateDatasourceSecureJsonDataOption(props, 'secretKey')}
                />
              )}
            </Field>
          </>
        )}

        {options.jsonData.authType === AwsAuthType.GrafanaAssumeRole && (
          <div className={styles.assumeRoleInstructions}>
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
                    4. Add any required permissions you would like Grafana to be able to access on your behalf. For more
                    details on our permissions please{' '}
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
              label={
                <LabelWithTooltip
                  htmlFor="assumeRoleArn"
                  label="Assume Role ARN"
                  tooltip={
                    <p>
                      Optionally, specify the ARN of a role to assume. Specifying a role here will ensure that the
                      selected authentication provider is used to assume the specified role rather than using the
                      credentials directly. Leave blank if you don't need to assume a role at all{' '}
                    </p>
                  }
                />
              }
            >
              <Input
                id="assumeRoleArn"
                aria-label="Assume Role ARN"
                className={inputWidth}
                placeholder="arn:aws:iam:*"
                value={options.jsonData.assumeRoleArn || ''}
                onChange={onUpdateDatasourceJsonDataOption(props, 'assumeRoleArn')}
              />
            </Field>
            {options.jsonData.authType !== AwsAuthType.GrafanaAssumeRole && (
              <Field
                label="External ID"
                description="If you are assuming a role in another account, that has been created with an external ID, specify the external ID here."
              >
                <Input
                  aria-label="External ID"
                  className={inputWidth}
                  placeholder="External ID"
                  value={options.jsonData.externalId || ''}
                  onChange={onUpdateDatasourceJsonDataOption(props, 'externalId')}
                />
              </Field>
            )}
          </>
        )}
        {!skipEndpoint && options.jsonData.authType !== AwsAuthType.GrafanaAssumeRole && (
          <Field
            label="Endpoint"
            //labelWidth={labelWidth}
            description="Optionally, specify a custom endpoint for the service"
          >
            <Input
              aria-label="Endpoint"
              className={inputWidth}
              placeholder={props.defaultEndpoint ?? 'https://{service}.{region}.amazonaws.com'}
              value={options.jsonData.endpoint || ''}
              onChange={onUpdateDatasourceJsonDataOption(props, 'endpoint')}
            />
          </Field>
        )}

        <Field
          label="Default Region"
          // labelWidth={labelWidth}
          description="Specify the region, such as for US West (Oregon) use ` us-west-2 ` as the region."
        >
          <Select
            aria-label="Default Region"
            className={inputWidth}
            value={regions.find((region) => region.value === options.jsonData.defaultRegion)}
            options={regions}
            defaultValue={options.jsonData.defaultRegion}
            allowCustomValue={true}
            onChange={onUpdateDatasourceJsonDataOptionSelect(props, 'defaultRegion')}
            formatCreateLabel={(r) => `Use region: ${r}`}
            menuShouldPortal={true}
          />
        </Field>
        {props.children}
      </ConfigSection>
    </>
  );
};

function LabelWithTooltip({
  label,
  tooltip,
  htmlFor,
}: {
  label: string;
  tooltip: string | JSX.Element;
  htmlFor?: string;
}) {
  return (
    <Label htmlFor={htmlFor}>
      <Stack gap={0.5}>
        <span>{label}</span>
        <Tooltip content={<div>{tooltip}</div>}>
          <Icon name="info-circle" size="sm" />
        </Tooltip>
      </Stack>
    </Label>
  );
}

function getStyles() {
  return {
    assumeRoleInstructions: css({
      maxWidth: '715px',
    }),
  };
}
