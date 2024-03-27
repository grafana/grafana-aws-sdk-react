# Contributing Docs

## Local Dev

Want to install this repo locally?

- In the terminal where this repo is installed: `yarn run dev` or `yarn run build`
- In a terminal navigate to your consumer directory (ex athena) and run `yarn --version`
  - if you get a yarn version <2:
    - back in aws-sdk run `yarn link` copy the instructions
    - run those instructions in the external consumer (athena)
  - if you get a yarn version >2:
    - in consumer package (ex grafana) `yarn link path-to-sdk` it should add a portal resolution to your package.json

## How to Release

Ready to release a new version?

To release a new version of the package, commit the updated "version" field into main, which will trigger the [Release action](https://github.com/grafana/grafana-aws-sdk-react/blob/main/.github/workflows/publish-npm.yml) which publishes to npm and creates a github release with release notes.
