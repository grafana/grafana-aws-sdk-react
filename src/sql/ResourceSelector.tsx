import { SelectableValue } from '@grafana/data';
import { Select, SelectCommonProps } from '@grafana/ui';
import { isEqual } from 'lodash';
import React, { useEffect, useMemo, useState, DependencyList, useRef } from 'react';

import { defaultKey } from './types';

export interface ResourceSelectorProps extends SelectCommonProps<string> {
  // props for old form styling
  tooltip?: string;
  hidden?: boolean;

  value: string | null;
  dependencies?: DependencyList;
  id: string;
  label: string;
  'data-testid'?: string;
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
  const propsDependencies = props.dependencies;
  const propsOnChange = props.onChange;

  const dependencies = useRef(props.dependencies);
  const fetched = useRef<boolean>(false);
  const resource = useRef<string | null>(props.value || props.default || null);

  const [fetchedResources, setFetchedResources] = useState<Array<string | SelectableValue>>(() => {
    const initialResource = props.value || props.default || null;
    return initialResource ? [initialResource] : [];
  });
  const [isLoading, setIsLoading] = useState(false);

  // Resources come either from the `resources` prop (controlled) or from `fetch()` results.
  const resources = props.resources !== undefined ? props.resources : fetchedResources;

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

  const options = useMemo(() => {
    if (!resources.length) {
      return [];
    }
    const newOptions: Array<SelectableValue<string>> = props.default ? defaultOpts : [];
    resources.forEach((r) => {
      const value = typeof r === 'string' ? r : r.value;
      if (!newOptions.find((o) => o.value === value)) {
        typeof r === 'string' ? newOptions.push({ label: r, value: r }) : newOptions.push(r);
      }
    });
    return newOptions;
  }, [resources, defaultOpts, props.default]);

  useEffect(() => {
    // A change in the dependencies cause a state clean-up
    if (!isEqual(propsDependencies, dependencies.current)) {
      fetched.current = false;
      resource.current = null;
      dependencies.current = propsDependencies;
      propsOnChange(null);
    }
  }, [propsDependencies, propsOnChange]);

  const fetch = async () => {
    if (fetched.current) {
      return;
    }
    if (props.saveOptions) {
      await props.saveOptions();
    }
    try {
      const resources = (await props.fetch?.()) || [];
      setFetchedResources(resources);
    } finally {
      fetched.current = true;
    }
  };

  const onChange = (e: SelectableValue<string>) => {
    propsOnChange(e);
    if (e.value) {
      resource.current = e.value;
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
    <Select
      {...props}
      id={props.id}
      inputId={props.id}
      aria-label={props.label}
      options={options}
      onChange={onChange}
      isLoading={isLoading}
      className={props.className || 'min-width-6'}
      onOpenMenu={() => props.fetch && onClick()}
      menuShouldPortal={true}
    />
  );
}
