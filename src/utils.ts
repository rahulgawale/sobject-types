import * as fs from 'fs/promises';
import * as path from 'path';
import logger from './logger';
import { constants } from 'fs';

export async function createDirectoryRecursive(directoryPath: string, overwrite = false) {
  try {
    // Check if the directory already exists
    await fs.access(directoryPath, constants.F_OK);
    if (overwrite) {
      // Remove the existing directory if overwrite is true
      await fs.rmdir(directoryPath, { recursive: true });
      logger.info(`Directory "${directoryPath}" overwritten and created.`);
    } else {
      logger.info(`Directory "${directoryPath}" already exists.`);
    }
  } catch (error) {
    // Directory does not exist, so create it
    try {
      await fs.mkdir(directoryPath, { recursive: true });
      logger.info(`Directory "${directoryPath}" created.`);
    } catch (mkdirError) {
      logger.error(`Error creating directory "${directoryPath}":`, mkdirError);
    }
  }
}

export async function saveToFile(filename: string, data: string): Promise<void> {
  try {
    await fs.writeFile(filename, data, 'utf-8');
    logger.info(`File "${filename}" created successfully.`);
  } catch (error) {
    logger.error(`Error creating file "${filename}":`, error);
  }
}

export async function ensureDirectoryExists(directoryPath: string): Promise<void> {
  const absolutePath = path.resolve(process.cwd(), directoryPath);

  try {
    // Check if the directory exists
    await fs.access(absolutePath, fs.constants.F_OK);
  } catch (err) {
    // Directory doesn't exist, create it
    try {
      await fs.mkdir(absolutePath, { recursive: true });
      console.log(`Directory "${absolutePath}" created.`);
    } catch (mkdirErr) {
      console.error(`Error creating directory "${absolutePath}":`, mkdirErr);
    }
  }
}