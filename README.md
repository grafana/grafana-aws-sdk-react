# Grafana AWS SDK

This is a common package that can be used for all amazon plugins.

## Frontend configuration

see the ./src folder

## Drone configuration

Drone signs the Drone configuration file. This needs to be run everytime the drone.yml file is modified. See https://github.com/grafana/deployment_tools/blob/master/docs/infrastructure/drone/signing.md for more info.

To update the drone file run (note that you need to export your `DRONE_TOKEN` before):

```
drone --server https://drone.grafana.net sign --save grafana/grafana-aws-sdk-react
```
