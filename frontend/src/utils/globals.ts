import DataFetcher from "../data/DataFetcher";
import Logger from "./Logger";

interface Globals {
  initialized: boolean;
  logger: Logger;
  dataFetcher: DataFetcher;
}

// TODO consider using interfaces for the various globals so they can have
// default Noop variants instead of relying on a typecast.
const globals = { initialized: false } as Globals;

function assertInitialized() {
  if (!globals.initialized) {
    throw new Error("Cannot use globals before initialization");
  }
}

export function initGlobals(logger: Logger, dataFetcher: DataFetcher) {
  globals.logger = logger;
  globals.dataFetcher = dataFetcher;
  globals.initialized = true;
}

export function getLogger(): Logger {
  assertInitialized();
  return globals.logger;
}

export function getDataFetcher(): DataFetcher {
  assertInitialized();
  return globals.dataFetcher;
}
