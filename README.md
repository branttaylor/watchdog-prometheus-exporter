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

You are required to set 5 environment variables for the app:

| Variable      | Example                       |
|---------------|-------------------------------|
| PORT          | 8000                          |
| HOST          | 0.0.0.0                       |
| METRICS_PATH  | /metrics                      |
| HEALTH_PATH   | /healthz                      |
| WATCHDOG_PATH | http://192.168.10.10/data.xml |

### Examples

Example Kubernetes manifests and a Grafana dashboard are provided in this repo.
