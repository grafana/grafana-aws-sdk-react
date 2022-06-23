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
