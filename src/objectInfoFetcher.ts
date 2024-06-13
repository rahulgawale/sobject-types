import { exec } from 'child_process';
import * as path from 'path';
import { getConfig } from './config';
import { createDirectoryRecursive, saveToFile } from './utils';
import { SObjectSchema } from './types';
import { generateTypes } from './generator';
import logger from './logger';

interface CommandOutPut {
  status: number,
  result: any,
  warning: any
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
        logger.error(error);
        reject(new Error(`Command failed: ${error.message}`));
        return;
      }

      const data = JSON.parse(stdout) as CommandOutPut;
      if (data.status !== 0) {
        logger.error("command status is " + data.status);
        logger.warning(data.warning);
      }
      resolve(data.result);
    });
  });
}

async function describeSObject(sObjectName: string): Promise<SObjectSchema> {
  const config = await getConfig();
  const cmd = `${config.sfPath} sobject describe --json --sobject ${sObjectName} --target-org ${config.defaultusername}`;
  logger.info("command: " + cmd);

  const schema = await runCommand(cmd) as SObjectSchema;
  const filename = path.resolve(__dirname, config.outputDir, sObjectName + '.json');
  // saveToFile(filename, JSON.stringify(schema));
  return schema;
}


export async function saveObjectInfoToCache() {
  try {

    const config = await getConfig();
    await createDirectoryRecursive(config.outputDir);

    config.sObjects.forEach(async (obj) => {
      try {
        logger.info("Fetching Metadata: " + obj);
        const objMetadata = await describeSObject(obj);
        logger.info("name: " + objMetadata.name);
        logger.info("#fields: " + objMetadata.fields.length);
        const filename = path.resolve(__dirname, config.outputDir, obj + '.ts');
        const types = generateTypes(objMetadata);
        await saveToFile(filename, types);
      } catch (err) {
        console.log("Error while getting metadata for: " + obj + "\n", err)
      }
    })
  } catch (error) {
    console.error(`Error listing sObjects: ${(error as Error).message}`);
  }
}