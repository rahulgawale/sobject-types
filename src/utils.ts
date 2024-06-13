import * as fs from 'fs/promises';

export async function createDirectoryRecursive(directoryPath: string) {
  try {
    await fs.mkdir(directoryPath, { recursive: true });
    console.log(`Directory "${directoryPath}" created (if necessary).`);
  } catch (error) {
    console.error('Error creating directory:', error);
  }
}

export async function saveToFile(filename: string, data: string): Promise<void> {
  try {
    await fs.writeFile(filename, data, 'utf-8');
    console.log(`File "${filename}" created successfully.`);
  } catch (error) {
    console.error(`Error creating file "${filename}":`, error);
  }
}