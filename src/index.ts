import { saveObjectInfoToCache } from "./objectInfoFetcher";
import * as path from 'path';
import { getConfig } from "./config";
import logger from "./logger";

async function main() {
  try {
    const config = await getConfig();
    saveObjectInfoToCache();
  } catch (error) {
    logger.error(error);
  }
}

main();