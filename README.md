# watchdog-prometheus-exporter

A Prometheus exporter for the I.T. Watchdogs WxGoos-1 Climate Monitor

### Metrics

This exporter provides the following metrics:

- Temperature (F)
- Humidity
- Airflow
- Light
- Sound

### Environment Variables

| Variable      | Default      | Required? |
|---------------|--------------|-----------|
| PORT          | 8000         |           |
| HOST          | 0.0.0.0      |           |
| METRICS_PATH  | /metrics     |           |
| HEALTH_PATH   | /healthz     |           |
| WATCHDOG_PATH | {no default} | X         |

The `WATCHDOG_PATH` variable should include the full path to the device's `data.xml`.

- Example: `http://10.0.0.100/data.xml`

### Examples

Example Kubernetes manifests and a Grafana dashboard are provided in this repo.
