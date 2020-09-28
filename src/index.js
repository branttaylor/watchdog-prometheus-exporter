const xml = require('xml2js');
const prom = require('prom-client');
const got = require('got');
const express = require('express');

const watchdog_TempC = new prom.Gauge({
  name: 'watchdog_TempC',
  help: 'Temperature (C)',
  labelNames: [
    'deviceName'
  ]
});

const watchdog_TempF = new prom.Gauge({
  name: 'watchdog_TempF',
  help: 'Temperature (F)',
  labelNames: [
    'deviceName'
  ]
});

const watchdog_Humidity = new prom.Gauge({
  name: 'watchdog_Humidity',
  help: 'Relative Humidity',
  labelNames: [
    'deviceName'
  ]
});

const watchdog_Airflow = new prom.Gauge({
  name: 'watchdog_Airflow',
  help: 'Air Flow',
  labelNames: [
    'deviceName'
  ]
});

const watchdog_Light = new prom.Gauge({
  name: 'watchdog_Light',
  help: 'Light Level',
  labelNames: [
    'deviceName'
  ]
});

const watchdog_Sound = new prom.Gauge({
  name: 'watchdog_Sound',
  help: 'Sound',
  labelNames: [
    'deviceName'
  ]
});

const watchdog_IO1 = new prom.Gauge({
  name: 'watchdog_IO1',
  help: 'Analog-1',
  labelNames: [
    'deviceName'
  ]
});

const watchdog_IO2 = new prom.Gauge({
  name: 'watchdog_IO2',
  help: 'Analog-2',
  labelNames: [
    'deviceName'
  ]
});

const watchdog_IO3 = new prom.Gauge({
  name: 'watchdog_IO3',
  help: 'Analog-3',
  labelNames: [
    'deviceName'
  ]
});

async function getAll() {
  // Fetch XML from device
  const response = await got(process.env.WATCHDOG_PATH);

  // Convert XML to JSON
  const json = await xml.parseStringPromise(response.body);

  return json;
};

async function getMetrics() {
  const json = await getAll();

  for (const device of json.server.devices[0].device) {
    const deviceName = device.$.name;
    for (const field of device.field) {
      const metricName = 'watchdog_' + field.$.key;
      eval(metricName).set({
          deviceName: deviceName
        }, Number(field.$.value)
      );
    };
  };

  return prom.register.metrics();
};

function main() {
  const app = express();

  app.get(process.env.HEALTH_PATH || '/healthz', (req, res) => res.send({status: 'up'}));

  app.get(process.env.METRICS_PATH || '/metrics', async (req, res) => {
    let metrics;
    try {
      metrics = await getMetrics();
    } catch (e) {
      console.error('Error getting metrics!!!');
      throw e;
    }
    res.send(metrics);
  });

  app.listen(process.env.PORT || 8000, process.env.HOST || '0.0.0.0', () => console.log('Server is running!!!'));
}

try {
  if (typeof process.env.WATCHDOG_PATH == 'undefined'){
    console.log('Required environment variable WATCHDOG_PATH is undefined!!!');
    process.exit(1);
  }
  main();
} catch (e) {
  console.error('Error during startup!!!');
  console.error(e.message, e.stack);
  process.exit(1);
}
