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

- create a pr and update the package.json and changelog to be how you'd like
- merge the pr, that's it! (get's published to npm via https://github.com/grafana/grafana-aws-sdk-react/blob/main/.github/workflows/publish-npm.yml)
- a note we don't currently make tags/releases on github, but perhaps in the future we can do so
