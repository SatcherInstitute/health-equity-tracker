import { ApiDataFetcher, DataFetcher } from "../data/DataFetcher";
import FakeDataFetcher from "../testing/FakeDataFetcher";
import { createEnvironment, Environment } from "./Environment";
import Logger from "./Logger";

interface Globals {
  initialized: boolean;
  environment: Environment;
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

export function initGlobals(
  environment: Environment,
  logger: Logger,
  dataFetcher: DataFetcher
) {
  if (globals.initialized) {
    throw new Error("Cannot initialize globals multiple times");
  }

  globals.environment = environment;
  globals.logger = logger;
  globals.dataFetcher = dataFetcher;
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
      : new ApiDataFetcher(
          environment.getBaseApiUrl(),
          environment.deployContext
        );
  initGlobals(environment, logger, dataFetcher);
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
