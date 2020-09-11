const xml = require('xml2js');
const prom = require('prom-client');
const got = require('got');
const express = require('express');

const watchdog_tempF = new prom.Gauge({
  name: 'watchdog_tempF',
  help: 'Temperature',
  labelNames: [
    'deviceName'
  ]
});

const watchdog_humidity = new prom.Gauge({
  name: 'watchdog_humidity',
  help: 'Relative Humidity',
  labelNames: [
    'deviceName'
  ]
});

const watchdog_airflow = new prom.Gauge({
  name: 'watchdog_airflow',
  help: 'Airflow',
  labelNames: [
    'deviceName'
  ]
});

const watchdog_light = new prom.Gauge({
  name: 'watchdog_light',
  help: 'Light',
  labelNames: [
    'deviceName'
  ]
});

const watchdog_sound = new prom.Gauge({
  name: 'watchdog_sound',
  help: 'Sound',
  labelNames: [
    'deviceName'
  ]
});

async function getAll() {
  // Fetch XML from device
  const response = await got(process.env.WATCHDOG_PATH);

  // Convert XML to JSON
  const json = await xml.parseStringPromise(response.body);

  return json
}

async function getMetrics() {
  const json = await getAll();

  prom.register.resetMetrics();

  watchdog_tempF.set({
      deviceName: json.server.$.host
    }, Number(json.server.devices[0].device[0].field[1].$.value)
  );

  watchdog_humidity.set({
      deviceName: json.server.$.host
    }, Number(json.server.devices[0].device[0].field[2].$.value)
  );

  if (process.env.WATCHDOG_VER == 1){
    watchdog_airflow.set({
        deviceName: json.server.$.host
      }, Number(json.server.devices[0].device[0].field[3].$.value)
    );

    watchdog_light.set({
        deviceName: json.server.$.host
      }, Number(json.server.devices[0].device[0].field[4].$.value)
    );
  } else {
    watchdog_airflow.set({
        deviceName: json.server.$.host
      }, Number(json.server.devices[0].device[0].field[4].$.value)
    );

    watchdog_light.set({
        deviceName: json.server.$.host
      }, Number(json.server.devices[0].device[0].field[3].$.value)
    );
  };

  watchdog_sound.set({
      deviceName: json.server.$.host
    }, Number(json.server.devices[0].device[0].field[5].$.value)
  );

  return prom.register.metrics();
}

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
