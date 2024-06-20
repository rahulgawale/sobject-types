import { exec } from 'child_process';
import * as path from 'path';
import { getConfig } from './config';
import { createDirectoryRecursive, ensureDirectoryExists, saveToFile } from './utils';
import { Config, SObjectSchema } from './types';
import { generateTypes } from './generator';
import logger from './logger';
import { scriptName } from './types';
import { BaseTypes, BaseTypesFileName, IndexFileName } from './data/ftypesc';

interface CommandOutPut {
  status: number;
  result: any;
  warning: any;
}

/**
 * Safe wrapper function to run a command using exec.
 * @param command - The command to run.
 * @returns A Promise that resolves with the command's stdout and stderr.
 */
function runCommand(command: string): Promise<any> {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        logger.error("runCommand error: " + error);
        if (error.message.includes('is not recognized as an internal or external command')) {
          logger.warn('⚠️  Make sure you have installed Salesforce CLI and PATH is set for that!');
        }
        reject(`Salesforce CLI (SF) command error, install Salesforce CLI and verify you have put correctly authorized (using "sf org login" command) "target-org-name" in config.\nRun the below command to see the config.\n\n\t--->${scriptName} config`);
        return;
      }

      if (stderr) {
        logger.error("runCommand stderr: " + stderr);
      }

      const data = JSON.parse(stdout) as CommandOutPut;
      if (data.status !== 0) {
        logger.error("runCommand: command status is " + data.status);
        logger.warning(data.warning);
        reject(null)
      }
      resolve(data.result);
    });
  });
}

export async function describeSObject(sObjectName: string): Promise<SObjectSchema> {
  const config = await getConfig();
  const cmd = `${config.sfPath} sobject describe --json --sobject ${sObjectName} --target-org ${config.defaultusername}`;
  logger.info("command: " + cmd);
  const schema = await runCommand(cmd);
  return schema;
}

export async function generateSobjectTypes(config: Config, obj: string) {
  try {
    const objMetadata = await describeSObject(obj);

    if (objMetadata) {
      logger.info("Fetching Metadata: " + obj);
      logger.info("name: " + objMetadata.name);
      logger.info("#fields: " + objMetadata.fields.length);

      const filename = path.resolve(config.outputDir, obj + '.ts');
      const types = generateTypes(objMetadata, config);
      // create output folder if not exists
      await ensureDirectoryExists(config.outputDir);
      await saveToFile(filename, types);
      return { success: true, message: `Successfully processed ${obj}` };
    } else {
      logger.error(`Could not fetch metadata for the object ${obj}, make sure the API Name is correct!`);
      return { success: false, message: `Could not fetch metadata for ${obj}` };
    }
  } catch (err) {
    logger.error(`Error while getting metadata for: ${obj}\nError: ${err}`);
    return { success: false, message: `⚠️  Error fetching ${obj}, verify API Name` };
  }
}

export async function generateAllTypesParallel() {
  try {
    const config = await getConfig();


    if (config) {
      await createDirectoryRecursive(config.outputDir, true);

      const promises = config.sObjects.map(async (obj) => {
        return generateSobjectTypes(config, obj);
      });

      const results = await Promise.all(promises);
      results.forEach(result => {
        if (result.success) {
          logger.info(result.message);
        } else {
          logger.error(result.message);
        }
      });

      // generate base types
      await generateBaseTypes(config);
      await generateIndex(config);
    }
  } catch (error) {
    logger.error(`Error listing sObjects: ${(error as Error).message}`);
  }
}

async function generateBaseTypes(config: Config) {
  const file = path.resolve(config.outputDir, BaseTypesFileName);
  await saveToFile(file, BaseTypes);
}

async function generateIndex(config: Config) {
  let index = `export * from './BaseTypes';\n`;
  config.sObjects.forEach(obj => {
    index += `export * from './${obj}';\n`
  })
  const indexFile = path.resolve(config.outputDir, IndexFileName);
  await saveToFile(indexFile, index);
}