import * as fs from 'fs/promises';
import * as path from 'path';
import { Config, SfdxConfig } from './types';
import { saveToFile } from './utils';
import logger from './logger';

export const configFileName = 'ftypesc.json';
export const rootDir = '.ftypes'

// Define the path to the configuration file
export function getConfigPath() {
  return path.join(process.cwd(), rootDir, configFileName);
}

export async function checkInitialization() {
  try {
    await getConfig();
  } catch (error) {
    logger.error(`ftypes is not initialized. Please run "ftypes init" to set up the configuration.`);
    // Exit the process if not initialized
    process.exit(1);
  }
}

const getConfig = (() => {
  let config: Config | null = null;

  return async (): Promise<Config> => {
    if (config) {
      return config;
    }
    try {
      const configData = await fs.readFile(getConfigPath(), 'utf-8');
      config = JSON.parse(configData) as Config;
      return config;
    } catch (error) {
      logger.error(`Error reading configuration file at ${getConfigPath()}:`, error);
      throw new Error('Failed to read configuration file');
    }
  };
})();

// update config
export async function saveConfig(config: Config) {
  await saveToFile(getConfigPath(), JSON.stringify(config));
  await getConfig();
}

const getSfdxConfig = (() => {
  let sfdxConfig: SfdxConfig | null = null;

  return async (): Promise<SfdxConfig> => {
    if (sfdxConfig) {
      return sfdxConfig;
    }

    try {
      const config = await getConfig();
      const sfdxcPath = path.resolve(process.cwd(), config.sfdxDir);
      const data = await fs.readFile(sfdxcPath, 'utf8');
      return JSON.parse(data) as SfdxConfig;
    } catch (error) {
      logger.error(`Error reading SFDX configuration file:`, error);
      throw new Error('Failed to read SFDX configuration file');
    }
  };
})();

export { getConfig, getSfdxConfig }


