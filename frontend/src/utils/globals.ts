import { ApiDataFetcher, DataFetcher } from "../data/DataFetcher";
import { DataCache } from "../data/useDatasetStore";
import FakeDataFetcher from "../testing/FakeDataFetcher";
import { createEnvironment, Environment } from "./Environment";
import Logger from "./Logger";

interface Globals {
  initialized: boolean;
  environment: Environment;
  logger: Logger;
  dataFetcher: DataFetcher;
  cache: DataCache;
}

// TODO consider using interfaces for the various globals so they can have
// default Noop variants instead of relying on a typecast.
const globals = { initialized: false } as Globals;

function assertInitialized() {
  if (!globals.initialized) {
    throw new Error("Cannot use globals before initialization");
  }
}

export function resetCacheDebug() {
  if (globals.environment.deployContext !== "test") {
    throw new Error(
      "resetCacheDebug must only be called from the test environment"
    );
  }
  globals.cache = new DataCache();
}

export function initGlobals(
  environment: Environment,
  logger: Logger,
  dataFetcher: DataFetcher,
  cache: DataCache
) {
  if (globals.initialized) {
    throw new Error("Cannot initialize globals multiple times");
  }

  globals.environment = environment;
  globals.logger = logger;
  globals.dataFetcher = dataFetcher;
  globals.cache = cache;
  globals.initialized = true;
  logger.debugLog(
    "Initialized globals for context: " + environment.deployContext
  );
}

/**
 * Automatically initializes globals based on environment variables. This may
 * not work for all unit tests, for example if you want to directly test one of
 * the globals. In such cases, use initGlobals instead.
 */
export function autoInitGlobals() {
  const environment = createEnvironment();
  const logger = new Logger(
    environment.getEnableServerLogging(),
    environment.getEnableConsoleLogging()
  );
  // Unit tests shouldn't do any real data fetches. All other deploy contexts
  // rely on real data fetches to function properly.
  const dataFetcher =
    environment.deployContext === "test"
      ? new FakeDataFetcher()
      : new ApiDataFetcher(environment);
  const cache = new DataCache();
  initGlobals(environment, logger, dataFetcher, cache);
}

export function getEnvironment(): Environment {
  assertInitialized();
  return globals.environment;
}

export function getLogger(): Logger {
  assertInitialized();
  return globals.logger;
}

export function getDataFetcher(): DataFetcher {
  assertInitialized();
  return globals.dataFetcher;
}

export function getCache(): DataCache {
  assertInitialized();
  return globals.cache;
}
