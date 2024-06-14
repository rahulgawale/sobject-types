import path from 'path';
import fs from 'fs/promises';
import logger from '../logger';
import { configFileName, rootDir } from '../config';
import { config } from '../data/ftypesc';
import { scriptName } from '../types';

export async function initCommand() {
  try {
    const configDir = path.resolve(process.cwd(), './' + rootDir);
    const configFilePath = path.join(configDir, configFileName);

    // Ensure the directory exists
    await fs.mkdir(configDir, { recursive: true });

    // Write the default configuration file
    const defaultConfig = config;

    await fs.writeFile(configFilePath, JSON.stringify(defaultConfig, null, 2));
    await addToGitignoreIfNotPresent();
    logger.info(`Configuration initialized at ${configFilePath}, now run below command to generate types.\n\n--->\t${scriptName}\n`);
  } catch (error) {
    logger.error('Error initializing configuration:', error);
  }
}

export async function addToGitignoreIfNotPresent() {
  try {
    // Check if .gitignore file exists in the current directory
    const gitignorePath = path.resolve(process.cwd(), '.gitignore');
    const gitignoreExists = await fs.access(gitignorePath).then(() => true).catch(() => false);

    if (gitignoreExists) {
      // Read the contents of .gitignore
      let gitignoreContent = await fs.readFile(gitignorePath, 'utf8');

      // Check if rootDir is already listed in .gitignore
      if (!gitignoreContent.includes(rootDir)) {
        // Append rootDir to .gitignore
        gitignoreContent += `\n${rootDir}\n`;

        // Write back the updated content to .gitignore
        await fs.writeFile(gitignorePath, gitignoreContent, 'utf8');
        logger.info(`${rootDir} added to .gitignore`);
      } else {
        logger.info(`${rootDir} already exists in .gitignore`);
      }
    } else {
      logger.info('.gitignore file not found in the current directory');
    }
  } catch (error) {
    logger.error('Error modifying .gitignore:' + JSON.stringify(error));
  }
}