import { SelectableValue } from '@grafana/data';
import { InlineField, Select } from '@grafana/ui';
import { SelectCommonProps } from '@grafana/ui';
import { isEqual } from 'lodash';
import React, { useEffect, useMemo, useState } from 'react';

import { defaultKey } from './types';

export interface ResourceSelectorProps extends SelectCommonProps<string> {
  value: string | null;
  dependencies?: Array<string | null | undefined>;
  tooltip?: string;
  label?: string;
  'data-testid'?: string;
  hidden?: boolean;
  // Options only needed for QueryEditor
  default?: string;
  // Options only needed for the ConfigEditor
  title?: string;
  labelWidth?: number;
  saveOptions?: () => Promise<void>;
  // Either set a way of fetching resources or the resource list
  fetch?: () => Promise<Array<string | SelectableValue<string>>>;
  resources?: string[];
  onChange: (e: SelectableValue<string> | null) => void;
}

export function ResourceSelector(props: ResourceSelectorProps) {
  const [resource, setResource] = useState<string | null>(props.value || props.default || null);
  const [resources, setResources] = useState<Array<string | SelectableValue>>(resource ? [resource] : []);
  const [dependencies, setDependencies] = useState(props.dependencies);
  const [isLoading, setIsLoading] = useState(false);
  const [fetched, setFetched] = useState(false);
  const defaultOpts = useMemo(() => {
    const opts: Array<SelectableValue<string>> = [
      {
        label: `default (${props.default})`,
        value: defaultKey,
        description: `Default value set in the data source`,
      },
    ];
    if (props.value && props.value !== defaultKey) {
      opts.push({ label: props.value, value: props.value });
    }
    return opts;
  }, [props.default, props.value]);
  const [options, setOptions] = useState<Array<SelectableValue<string>>>(props.default ? defaultOpts : []);
  useEffect(() => {
    if (props.resources !== undefined) {
      setResources(props.resources);
    }
  }, [props.resources]);
  useEffect(() => {
    const newOptions: Array<SelectableValue<string>> = props.default ? defaultOpts : [];
    if (resources.length) {
      resources.forEach((r) => {
        const value = typeof r === 'string' ? r : r.value;
        if (!newOptions.find((o) => o.value === value)) {
          typeof r === 'string' ? newOptions.push({ label: r, value: r }) : newOptions.push(r);
        }
      });
      setOptions(newOptions);
    } else {
      setOptions([]);
    }
  }, [resources, defaultOpts, props.default]);

  useEffect(() => {
    // A change in the dependencies cause a state clean-up
    if (!isEqual(props.dependencies, dependencies)) {
      setFetched(false);
      setResource(null);
      props.onChange(null);
      setDependencies(props.dependencies);
    }
  }, [props, dependencies]);

  const fetch = async () => {
    if (fetched) {
      return;
    }
    if (props.saveOptions) {
      await props.saveOptions();
    }
    try {
      const resources = await props.fetch();
      setResources(resources);
    } finally {
      setFetched(true);
    }
  };

  const onChange = (e: SelectableValue<string>) => {
    props.onChange(e);
    if (e.value) {
      setResource(e.value);
    }
  };
  const onClick = async () => {
    setIsLoading(true);
    try {
      await fetch();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <InlineField label={props.label} labelWidth={props.labelWidth} tooltip={props.tooltip} hidden={props.hidden}>
      <div data-testid={props['data-testid']} title={props.title}>
        <Select
          {...props}
          aria-label={props.label}
          options={options}
          onChange={onChange}
          isLoading={isLoading}
          className={props.className || 'min-width-6'}
          onOpenMenu={() => props.fetch && onClick()}
          menuShouldPortal={true}
        />
      </div>
    </InlineField>
  );
}
