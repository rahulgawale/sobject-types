#!/usr/bin/env node
import yargs, { command } from 'yargs';
import { hideBin } from 'yargs/helpers';
import logger from './logger';
import { checkInitialization, getConfig, saveConfig } from './config';
import { createDirectoryRecursive } from './utils';

import { generateAllTypesParallel, generateSobjectTypes } from './objectInfoFetcher';
import { scriptName } from './types';
import { initCommand } from './commands/init';

// Command handlers
async function listCommandHandler() {
  const config = await getConfig();
  console.log('--- Selected Objects ---');
  console.log(config.sObjects);
}

async function configCommandHandler() {
  const config = await getConfig();
  console.log('--- Current Configuration ---')
  console.log(config);
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

  objName = (objName + "").trim();

  if (!config.sObjects.includes(objName)) {
    config.sObjects.push(objName);
    saveConfig(config);
  }

  generateSobjectTypes(config, objName);
}

async function refreshCommandHandler(objName: string | undefined) {
  const config = await getConfig();
  if (config) {
    await createDirectoryRecursive(config.outputDir);

    if (!objName) {
      logger.error('Object Name can\'t be blank!');
      return;
    }
    objName = ("" + objName).trim();

    if (!config.sObjects.includes(objName)) {
      logger.error(`The object "${objName}" is not present in config, please run below command to add.\n\n--->\t ${scriptName} add ${objName}\n`);
      return;
    }

    generateSobjectTypes(config, objName);
  }
}


export function router() {
  // Define the yargs configuration
  const argv = yargs(hideBin(process.argv))
    .scriptName(scriptName)
    .usage('Usage: $0 <command> [options]')

    // init command
    .command('init', `Initialize the ${scriptName} configuration`, async () => {
      await initCommand();
    })
    // .alias('i', 'init')

    // Command: list
    .command('list', 'List all sObjects from config file', async () => {
      await checkInitialization();
      listCommandHandler()
    })
    // .alias('l', 'list')
    .example('$0 list', 'List all sObjects from config file')

    // Command: config
    .command('config', 'Show config contents', async () => {
      await checkInitialization();
      configCommandHandler()
    })
    // .alias('c', 'config')
    .example('$0 config', 'Show config contents')

    // Command: set-target-org
    .command('set-target-org <orgname>', 'Set default username in config', (yargs) => {
      return yargs.positional('orgname', {
        describe: 'The name of the target org',
        type: 'string',
      });
    }, async (argv) => {
      await checkInitialization();
      setTargetOrgHandler(argv.orgname);
    })
    // .alias('org', 'set-target-org')
    .example('$0 set-target-org myOrg', 'Set the default username to myOrg')

    // Command: add
    .command('add <objname>', 'Add type definitions for a specific object', (yargs) => {
      return yargs.positional('objname', {
        describe: 'The name of the sObject',
        type: 'string',
      });
    }, async (argv) => {
      await checkInitialization();
      addCommandHandler(argv.objname);
    })
    // .alias('a', 'add')
    .example('$0 add Account', 'add type definitions for the Account sObject')

    // Command: refresh
    .command('refresh <objname...>', 'Add type definitions for a specific object(s)', (yargs) => {
      return yargs.positional('objname', {
        describe: 'The name of the sObject',
        type: 'string',
      });
    }, async (argv) => {
      await checkInitialization();
      refreshCommandHandler(argv.objname);
    })
    // .alias('r', 'refresh')
    .example('$0 refresh Account', 'Refresh type definitions for the Account sObject')


    //  default
    .command('$0', 'Generate Typings for all SObjects from config', async () => {
      await checkInitialization();
      generateAllTypesParallel()
    })
    .example('$0', 'Generate Typings for all SObjects from config')

    .help('h')
    .strict() // Add strict mode to ensure unknown commands/options throw an error
    .epilog('copyright @forcetrails.com 2024')
    .argv;
}
