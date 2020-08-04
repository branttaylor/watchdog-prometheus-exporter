const xml = require('xml2js');
const prom = require('prom-client');
const got = require('got');
const express = require('express');

const config = {
  healthPath: '/healthz',
  metricsPath: '/metrics',
  port: 8000,
  host: '0.0.0.0'
};

const watchdog_tempF = new prom.Gauge({
  name: 'watchdog_tempF',
  help: 'Temperature'
});

const watchdog_humidity = new prom.Gauge({
  name: 'watchdog_humidity',
  help: 'Relative Humidity'
});

const watchdog_airflow = new prom.Gauge({
  name: 'watchdog_airflow',
  help: 'Airflow'
});

const watchdog_sound = new prom.Gauge({
  name: 'watchdog_sound',
  help: 'Sound'
});

async function getAll() {
  // Fetch XML from device
  const response = await got('http://192.168.1.40/data.xml');

  // Convert XML to JSON
  const json = await xml.parseStringPromise(response.body);

  return json
}

async function getMetrics() {
  const json = await getAll();

  prom.register.resetMetrics();

  watchdog_tempF.set(Number(json.server.devices[0].device[0].field[1].$.value));
  watchdog_humidity.set(Number(json.server.devices[0].device[0].field[2].$.value));
  watchdog_airflow.set(Number(json.server.devices[0].device[0].field[3].$.value));
  watchdog_sound.set(Number(json.server.devices[0].device[0].field[5].$.value));

  return prom.register.metrics();
}

function main() {
  const app = express();

  app.get(config.healthPath, (req, res) => res.send({status: 'up'}));

  app.get(config.metricsPath, async (req, res) => {
    let metrics;
    try {
      metrics = await getMetrics();
    } catch (e) {
      console.error('Error getting metrics!!!');
      throw e;
    }
    res.send(metrics);
  });

  app.listen(config.port, config.host, () => console.log('Server is running!!!'));
}

try {
  main();
} catch (e) {
  console.error('Error during startup!!!');
  console.error(e.message, e.stack);
  process.exit(1);
}
