import { ApiDataFetcher, type DataFetcher } from '../data/loading/DataFetcher'
import DataManager from '../data/loading/DataManager'
import FakeDataFetcher from '../testing/FakeDataFetcher'
import { type Environment, createEnvironment } from './Environment'
import Logger from './Logger'

interface Globals {
  initialized: boolean
  environment: Environment
  logger: Logger
  dataFetcher: DataFetcher
  dataManager: DataManager
}

// TODO: consider using interfaces for the various globals so they can have
// default Noop variants instead of relying on a typecast.
const globals: Partial<Globals> = { initialized: false }

function assertInitialized() {
  if (!globals.initialized) {
    throw new Error('Cannot use globals before initialization')
  }
}

export function resetCacheDebug() {
  if (globals?.environment?.deployContext !== 'test') {
    throw new Error(
      'resetCacheDebug must only be called from the test environment',
    )
  }
  globals.dataManager = new DataManager()
}

export function initGlobals(
  environment: Environment,
  logger: Logger,
  dataFetcher: DataFetcher,
  dataManager: DataManager,
) {
  if (globals.initialized && !import.meta.env.PROD) {
    // throw new Error('Cannot initialize globals multiple times')
    console.error('Cannot initialize globals multiple times')
  }

  globals.environment = environment
  globals.logger = logger
  globals.dataFetcher = dataFetcher
  globals.dataManager = dataManager
  globals.initialized = true
  logger.debugLog(
    'Initialized globals for context: ' + environment.deployContext,
  )
}

/**
 * Automatically initializes globals based on environment variables. This may
 * not work for all unit tests, for example if you want to directly test one of
 * the globals. In such cases, use initGlobals instead.
 */
export function autoInitGlobals() {
  const environment = createEnvironment()
  const logger = new Logger(
    environment.getEnableServerLogging(),
    environment.getEnableConsoleLogging(),
  )
  // Unit tests shouldn't do any real data fetches. All other deploy contexts
  // rely on real data fetches to function properly.
  const dataFetcher =
    environment.deployContext === 'test'
      ? new FakeDataFetcher()
      : new ApiDataFetcher(environment)
  const cache = new DataManager()

  initGlobals(environment, logger, dataFetcher, cache)
}

export function getEnvironment(): Environment {
  assertInitialized()
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  return globals.environment!
}

export function getLogger(): Logger {
  assertInitialized()
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  return globals.logger!
}

export function getDataFetcher(): DataFetcher {
  assertInitialized()
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  return globals.dataFetcher!
}

export function getDataManager(): DataManager {
  assertInitialized()
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  return globals.dataManager!
}
