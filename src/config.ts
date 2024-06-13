import * as fs from 'fs/promises';
import * as path from 'path';
import { Config, SfdxConfig } from './types';

// Define the path to the configuration file
const configFilePath = path.resolve(__dirname, 'config.json');
const sfdxConfigPath = path.resolve(__dirname, '.sfdx', 'sfdx-config.json');

let config: Config;
async function readConfigFile(filePath: string): Promise<Config> {
  const data = await fs.readFile(filePath, 'utf8');
  config = JSON.parse(data) as Config;
  return config;
}

export async function getConfig() {
  if (!config)
    return await readConfigFile(configFilePath);
  return config;
};

// sfdx config
let sfdxConfig: SfdxConfig;

async function readSfdxConfigFile(filePath: string): Promise<SfdxConfig> {
  const data = await fs.readFile(filePath, 'utf8');
  sfdxConfig = JSON.parse(data) as SfdxConfig;
  return sfdxConfig;
}

export async function getSfdxConfig() {
  if (!sfdxConfig)
    return await readSfdxConfigFile(sfdxConfigPath);
  return sfdxConfig;
};


