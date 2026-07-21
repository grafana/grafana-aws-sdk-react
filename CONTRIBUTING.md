# Contributing Docs

## Local Dev

Want to install this repo locally?

- In the terminal where this repo is installed: `npm run dev` or `npm run build`
- In the terminal where this repo is installed, run `npm link`
- In a terminal navigate to your consumer directory (ex athena) and run `npm link @grafana/aws-sdk`

## How to Release

Ready to release a new version?

To release a new version of the package, commit the updated "version" field into main, which will trigger the [Release action](https://github.com/grafana/grafana-aws-sdk-react/blob/main/.github/workflows/publish-npm.yml) which publishes to npm and creates a github release with release notes.
