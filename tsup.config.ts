import { defineConfig } from 'tsup';
import * as fs from 'fs';
import * as path from 'path';

export default defineConfig({
  format: ['cjs', 'esm'],
  entry: ['./src/index.ts'],
  dts: true,
  shims: true,
  skipNodeModulesBundle: true,
  clean: true,
  onSuccess: async () => {
    // Source and destination paths
    const sourcePath = path.resolve(__dirname, 'src', 'config.json');
    const destPath = path.resolve(__dirname, 'dist', 'config.json');

    // Copy config.json to dist directory
    fs.copyFileSync(sourcePath, destPath);
    console.log(`Copied config.json to ${destPath}`);
  }
});