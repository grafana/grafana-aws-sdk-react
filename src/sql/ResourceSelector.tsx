import { SelectableValue } from '@grafana/data';
import { InlineField, Select, SelectCommonProps } from '@grafana/ui';
import { isEqual } from 'lodash';
import React, { useEffect, useMemo, useState, DependencyList } from 'react';

import { defaultKey } from './types';

export interface ResourceSelectorProps extends SelectCommonProps<string> {
  /**
   * The Selected Resource
   */
  value: string | null;
  /**
   * when dependencies change, the options and selected option are sent to null
   */
  dependencies?: DependencyList;
  /**
   * side effect onChange (often used to update a query or configuration object for example)
   */
  onChange: (e: SelectableValue<string> | null) => void;
  /**
   * sometimes it is necessary to save the current settings before fetching (ex save auth before fetching a list of available datasets to choose from)
   */
  saveOptions?: () => Promise<void>;
  tooltip?: string;
  label?: string;
  'data-testid'?: string;
  hidden?: boolean;
  /**
   * represents a default option to show before loading other options
   */
  default?: string;
  title?: string;
  labelWidth?: number;
  // Either set a way of fetching resources or the resource list
  fetch?: () => Promise<Array<string | SelectableValue<string>>>;
  resources?: string[];
}

export function ResourceSelector(props: ResourceSelectorProps) {
  const [selectedResource, setSelectedResource] = useState(props.value);
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

  const { onChange: onChangeSideEffect, dependencies: propsDependencies } = props;
  useEffect(() => {
    let ignore = false;
    // A change in the dependencies cause a state clean-up
    if (!isEqual(propsDependencies, dependencies) && !ignore) {
      console.log('Resetting dropdown due to dependency change', propsDependencies, dependencies);
      setDependencies(propsDependencies);
      setFetched(false);
      setSelectedResource(null);
      onChangeSideEffect(null);
    }
    return () => {
      ignore = true;
    };
  }, [onChangeSideEffect, propsDependencies, dependencies]);

  const fetch = async () => {
    if (fetched) {
      return;
    }
    if (props.saveOptions) {
      await props.saveOptions();
    }
    try {
      const resources = (await props.fetch?.()) || [];
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
    } finally {
      setFetched(true);
    }
  };

  const onChange = (e: SelectableValue<string>) => {
    props.onChange(e);
    if (e.value) {
      setSelectedResource(e.value);
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
          value={selectedResource}
        />
      </div>
    </InlineField>
  );
}
