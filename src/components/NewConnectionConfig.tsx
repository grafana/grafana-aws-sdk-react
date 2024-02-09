import React from 'react';
import { Input, Select, ButtonGroup, ToolbarButton, Collapse, Field } from '@grafana/ui';
import {
  onUpdateDatasourceJsonDataOptionSelect,
  onUpdateDatasourceResetOption,
  onUpdateDatasourceJsonDataOption,
  onUpdateDatasourceSecureJsonDataOption,
  SelectableValue,
} from '@grafana/data';
import { AwsAuthType } from '../types';
import { awsAuthProviderOptions } from '../providers';
import { ConfigSection, ConfigSubSection } from '@grafana/experimental';
import { ConnectionConfigProps, assumeRoleInstructionsStyle } from './ConnectionConfig';

interface NewConnectionConfigProps extends ConnectionConfigProps {
  currentProvider?: SelectableValue<AwsAuthType> | undefined;
  awsAllowedAuthProviders: string[];
  isARNInstructionsOpen: boolean;
  setIsARNInstructionsOpen: (isOpen: boolean) => void;
  awsAssumeRoleEnabled: boolean;
  regions: SelectableValue[];
}

export const NewConnectionConfig = ({
  isARNInstructionsOpen,
  setIsARNInstructionsOpen,
  awsAssumeRoleEnabled,
  currentProvider,
  awsAllowedAuthProviders,
  skipHeader,
  regions,
  ...props
}: NewConnectionConfigProps) => {
  const options = props.options;
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
              id="authProvider"
              aria-label="Authentication Provider"
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

        <ConfigSubSection title="Assume Role">
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
        <ConfigSubSection title="Additional Settings">
          {!props.skipEndpoint && options.jsonData.authType !== AwsAuthType.GrafanaAssumeRole && (
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
              id="defaultRegion"
              aria-label="Default Region"
              value={regions.find((region) => region.value === options.jsonData.defaultRegion)}
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
