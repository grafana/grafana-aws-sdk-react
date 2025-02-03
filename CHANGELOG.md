# Change Log

All notable changes to this project will be documented in this file.

## v.0.6.1

- Chore: Add precommit hook in [#112](https://github.com/grafana/grafana-aws-sdk-react/pull/112)
- Dependabot: 
  - Bump @eslint/plugin-kit from 0.2.2 to 0.2.3 in the npm_and_yarn group in [#105](https://github.com/grafana/grafana-aws-sdk-react/pull/105)
  - Bump the node group with 28 updates, ignore react major updates in dependabot in [#118](https://github.com/grafana/grafana-aws-sdk-react/pull/118)
  - Bump the all-dependencies group across 1 directory with 18 updates in [#121](https://github.com/grafana/grafana-aws-sdk-react/pull/121)
  - Bump the all-dependencies group across 1 directory with 18 updates in [#123](https://github.com/grafana/grafana-aws-sdk-react/pull/123)

## v.0.6.0

- Replace @grafana/experimental with @grafana/plugin-ui
- Chore: add dependabot in [#97](https://github.com/grafana/grafana-aws-sdk-react/pull/97)
- Dependency updates in [#98](https://github.com/grafana/grafana-aws-sdk-react/pull/9899), [#99](https://github.com/grafana/grafana-aws-sdk-react/pull/), [#102](https://github.com/grafana/grafana-aws-sdk-react/pull/102)
  - actions/checkout from 2 to 4
  - tibdex/github-app-token from 1.8.0 to 2.1.0
  - EndBug/version-check from 1 to 2
  - actions/setup-node from 3 to 4
  - actions/github-script from 6.2.0 to 7.0.1
  - @grafana/experimental from 2.1.1 to 2.1.2
  - @types/node from 22.7.4 to 22.7.5
  - @types/react-dom from 18.3.0 to 18.3.1
  - cspell from 8.14.4 to 8.15.2
  - @grafana/data from 11.2.2 to 11.3.0
  - @grafana/eslint-config from 7.0.0 to 8.0.0
  - @grafana/runtime from 11.2.2 to 11.3.0
  - @grafana/ui from 11.2.2 to 11.3.0
  - @swc/core from 1.7.28 to 1.8.0
  - @testing-library/jest-dom from 6.5.0 to 6.6.3
  - @types/jest from 29.5.13 to 29.5.14
  - @types/lodash from 4.17.10 to 4.17.13
  - @types/node from 22.7.5 to 22.8.7
  - @types/react from 18.3.11 to 18.3.12
  - cspell from 8.15.2 to 8.15.7
  - rollup from 4.24.0 to 4.24.4
  - @grafana/async-query-data 0.2.0 0.3.0
  - @eslint/js 9.13.0 9.14.0
  - @stylistic/eslint-plugin-ts 2.10.0 2.10.1
  - @swc/jest 0.2.36 0.2.37
  - eslint 9.13.0 9.14.0

## v0.5.0

- Chore: update dependencies in [#96](https://github.com/grafana/grafana-aws-sdk-react/pull/96)

## v0.4.2

- Bump fast-loops from 1.1.3 to 1.1.4 in [#94](https://github.com/grafana/grafana-aws-sdk-react/pull/94)

## v0.4.1

- Update grafana and react dependencies in [#91](https://github.com/grafana/grafana-aws-sdk-react/pull/92)
- Update regions and display custom region in config in [#92](https://github.com/grafana/grafana-aws-sdk-react/pull/92)

## v0.4.0

- Remove awsDatasourcesNewFormStyling feature toggle in [#90](https://github.com/grafana/grafana-aws-sdk-react/pull/90)

## v0.3.5

- Chore: associate label with input element of the `ResourceSelector` component and update applySQLTemplateVariables type in [#88](https://github.com/grafana/grafana-aws-sdk-react/pull/88)

## v0.3.4

- Associate label with input element in [#85](https://github.com/grafana/grafana-aws-sdk-react/pull/85)

## v0.3.3

- Fix: broken ESM imports due to `src` in ESM build output path
- Fix: circular dependencies in components
- Fix: ESM builds importing entire react, grafana/ui, grafana/data, and grafana/experimental
- Refactor: prefer named exports over asterisk in barrel files

## v0.3.2

- Change "Run query" button to "Run queries" in [#77](https://github.com/grafana/grafana-aws-sdk-react/pull/77)

## v0.3.1

- Add spellcheck script and drone step in [#67](https://github.com/grafana/grafana-aws-sdk-react/pull/67)

## v0.3.0

- Migrate aws sdk react components to the new form styling under feature flag awsDatasourcesNewFormStyling in [#62](https://github.com/grafana/grafana-aws-sdk-react/pull/62)

## v0.2.0

- Add support for temporary credentials in athena

## v0.1.3

- Fix style bug in temp credentials #59

## v0.1.2

- Only show grafana assume role on enabled datasources #58

## v0.1.1

- Set awsAssumeRoleEnabled to true if not defined in the config https://github.com/grafana/grafana-aws-sdk-react/pull/57

## v0.1.0

- Temp Credentials: Display External Id https://github.com/grafana/grafana-aws-sdk-react/pull/54
- Add Support for Experimental Auth Component https://github.com/grafana/grafana-aws-sdk-react/pull/52

## v0.0.48

- Add support for experimental Temporary Credentials feature behind feature flag https://github.com/grafana/grafana-aws-sdk-react/pull/49
- Use @grafana/runtime instead of grafanaBootData https://github.com/grafana/grafana-aws-sdk-react/pull/50

## v0.0.47

- Support numeric values when applying template variables to SQL queries https://github.com/grafana/grafana-aws-sdk-react/pull/47

## v0.0.46

- Fix: Move state variable from state to ref to prevent infinite loop https://github.com/grafana/grafana-aws-sdk-react/pull/46

## v0.0.45

- Chore: Move PublishConfig properties (https://github.com/grafana/grafana-aws-sdk-react/pull/41)
- Chore: Fix yarn dev script (https://github.com/grafana/grafana-aws-sdk-react/pull/40)

## v0.0.44

- Fix/disabled attribute on run query button (https://github.com/grafana/grafana-aws-sdk-react/pull/39)

## v0.0.43

- Query Editor: Add `QueryEditorHeader` component
- UI: Export default label width for Configs

## v0.0.42

- Export DEFAULT_LABEL_WIDTH for Config Editor components

## v0.0.41

- Update rollup bundling config https://github.com/grafana/grafana-aws-sdk-react/pull/33

## v0.0.40

- Add support for optional labelWidth prop in Config components

## v0.0.39

- Updated grafana/ dependencies to 9.2.3

## v0.0.38

- Make onRunQuery optional in SQL components `FillValueSelect` and `FormatSelect`

## v0.0.37

- Fix config selector bug for refetching credentials on dependency change.
- Start contributing docs

## v0.0.36

- Expose SIGV4 component
