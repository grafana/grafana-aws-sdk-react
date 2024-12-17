# Grafana AWS SDK

This is a common package that can be used for all amazon plugins.

## Compatibility

@grafana/aws-sdk-react version >=0.7.0 is not compatible with Grafana versions <=10.3.x

## Frontend configuration

see the ./src folder

## Drone configuration

Drone signs the Drone configuration file. This needs to be run every time the drone.yml file is modified. See https://github.com/grafana/deployment_tools/blob/master/docs/infrastructure/drone/signing.md for more info.

### Update drone build

If you have not installed drone CLI follow [these instructions](https://docs.drone.io/cli/install/)

To sign the `.drone.yml` file:

```bash
# Get your drone token from https://drone.grafana.net/account
export DRONE_TOKEN=<Your DRONE_TOKEN>

drone --server https://drone.grafana.net sign --save grafana/grafana-aws-sdk-react
```

### Local Development

For local development instructions, please see the [contributing guide](https://github.com/grafana/grafana-aws-sdk-react/blob/main/CONTRIBUTING.md).
