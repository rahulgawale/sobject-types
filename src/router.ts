#!/usr/bin/env node
import yargs, { command } from 'yargs';
import { hideBin } from 'yargs/helpers';
import logger from './logger';
import { getConfig, saveConfig } from './config';
import { createDirectoryRecursive, saveToFile } from './utils';

import { generateAllTypesParallel, generateSobjectTypes } from './objectInfoFetcher';
import { cmdName } from './types';

// Command handlers
async function listCommandHandler() {
  const config = await getConfig();
  console.log('Selected Object:');
  console.log(config.sObjects.join('\n'));
}

async function configCommandHandler() {
  const config = await getConfig();
  console.log('Current Configuration:', config);
}

async function setTargetOrgHandler(orgName: string | undefined) {
  if (orgName) {
    const config = await getConfig();
    config.defaultusername = orgName;
    saveConfig(config);
    console.log(`Default username set to ${orgName}`);
  } else {
    logger.error('Target Org Name can\'t be blank!');
  }
}

async function addCommandHandler(objName: string | undefined) {
  const config = await getConfig();
  await createDirectoryRecursive(config.outputDir);

  if (!objName) {
    logger.error('Object Name can\'t be blank!');
    return;
  }

  if (!config.sObjects.includes(objName)) {
    config.sObjects.push(objName);
    saveConfig(config);
  }

  generateSobjectTypes(config, objName);
}

async function refreshCommandHandler(objName: string | undefined) {
  const config = await getConfig();
  await createDirectoryRecursive(config.outputDir);

  if (!objName) {
    logger.error('Object Name can\'t be blank!');
    return;
  }

  if (!config.sObjects.includes(objName)) {
    logger.error(`The object "${objName}" is not present, please run below command to add.\n\n--->\t ${cmdName} add ${objName}`);
    return;
  }

  generateSobjectTypes(config, objName);
}


export function router() {
  // Define the yargs configuration
  const argv = yargs(hideBin(process.argv))
    .usage('Usage: $0 <command> [options]')

    // Command: list
    .command('list', 'List all sObjects from config.json file', () => { listCommandHandler() })
    .alias('l', 'list')
    .example('$0 list', 'List all sObjects from config.json file')

    // Command: config
    .command('config', 'Show config.json contents', () => { configCommandHandler() })
    .alias('c', 'config')
    .example('$0 config', 'Show config.json contents')

    // Command: set-target-org
    .command('set-target-org <orgname>', 'Set default username in config.json', (yargs) => {
      return yargs.positional('orgname', {
        describe: 'The name of the target org',
        type: 'string',
      });
    }, (argv) => {
      setTargetOrgHandler(argv.orgname);
    })
    .alias('org', 'set-target-org')
    .example('$0 set-target-org myOrg', 'Set the default username to myOrg')

    // Command: add
    .command('add <objname>', 'Add type definitions for a specific object', (yargs) => {
      return yargs.positional('objname', {
        describe: 'The name of the sObject',
        type: 'string',
      });
    }, (argv) => {
      addCommandHandler(argv.objname);
    })
    .example('$0 add Account', 'add type definitions for the Account sObject')

    // Command: refresh
    .command('refresh <objname>', 'Add type definitions for a specific object', (yargs) => {
      return yargs.positional('objname', {
        describe: 'The name of the sObject',
        type: 'string',
      });
    }, (argv) => {
      refreshCommandHandler(argv.objname);
    })
    .example('$0 refresh Account', 'Refresh type definitions for the Account sObject')

    //  default
    .command('$0', 'Generate Typings for all SObjects from config.json', () => { generateAllTypesParallel() })
    .example('$0', 'Generate Typings for all SObjects from config.json')

    .help('h')
    .alias('h', 'help')
    .epilog('copyright @forcetrais.com 2024')
    .argv;
}
