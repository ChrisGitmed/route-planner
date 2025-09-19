import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

import { config } from '../config.js';
// import { router } from './router/index.js';


class Application {
  /// HTTP Server
  static server = null;

  /// Application
  static app = express()
    .use(express.json({ limit: '50mb' }))
    .use(express.urlencoded({ extended: true }));
    // .use('/api', router) // TODO

  /// Start Application
  static async start (port) {
    // On any uncaught exception, log the error to the console
    process.on('uncaughtException', (err) => console.error('Top-Level exception', err, err.stack));

    // TODO: Establish connection with the database

    // Begin listening for HTTP requests
    return new Promise((resolve, reject) => {
      this.server = this.app.listen(port, async (err) => {
        if (err) {
          console.log(err);
          reject(err);
        }
        console.info(`Route Planner API listening on port: ${port}\n`);
        resolve();
      });
    });
  }
}


(async () => {
  // If invoked directly from the command line, start the Application
  const modulePath = path.resolve(fileURLToPath(import.meta.url));
  const mainScriptPath = path.resolve(process.argv[1]);
  const isInvokedViaCommandLine = modulePath === mainScriptPath;
  if (isInvokedViaCommandLine) await Application.start(config.port || 5300);
})();


export const { app } = Application;
