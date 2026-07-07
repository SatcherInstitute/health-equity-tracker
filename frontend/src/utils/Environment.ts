const DEPLOY_CONTEXTS = [
  'prod', // Production environment in GCP (healthequitytracker.org)
  'dev', // Dev environment, auto-deployed from main (dev.healthequitytracker.org)
  'deploy_preview', // Netlify PR previews
  'localhost', // Local development
  'test', // Unit/integration tests
  'unknown', // Fallback — should not occur in practice
] as const
type DeployContext = (typeof DEPLOY_CONTEXTS)[number]

export interface Environment {
  /** The context the frontend is currently running in. */
  readonly deployContext: DeployContext

  /**
   * The base url for API calls. Empty string if API calls are relative to the
   * current domain.
   */
  getBaseApiUrl: () => string

  /** Whether to enable sending error or metric data to the server. */
  getEnableServerLogging: () => boolean

  /** Whether to enable logging error and debug data to the dev console. */
  getEnableConsoleLogging: () => boolean

  /** Whether the environment is exposed to any real users. */
  isUserFacingEnvironment: () => boolean

  /**
   * Whether to fetch the dataset as a static file from the public/tmp/
   * directory. Should only be used for local development or in-progress
   * datasets not yet on the data server.
   */
  forceFetchDatasetAsStaticFile: (fileName: string) => boolean
}

class HetEnvironment implements Environment {
  readonly deployContext: DeployContext
  private readonly forceStaticFiles: string[]

  constructor(deployContext: DeployContext) {
    this.deployContext = deployContext
    const forceStatic = this.getEnvVariable('FORCE_STATIC')
    this.forceStaticFiles = forceStatic ? forceStatic.split(',') : []
  }

  private getEnvVariable(nonPrefixedName: string): string | undefined {
    const prefix = 'VITE_'
    return import.meta.env[prefix + nonPrefixedName]
  }

  isUserFacingEnvironment() {
    return this.deployContext === 'prod' || this.deployContext === 'dev'
  }

  getBaseApiUrl() {
    // Empty string means API calls are relative to the current domain.
    // NOTE: Vite always loads .env.local regardless of mode — use .env.localhost
    // for local dev to avoid contaminating prod builds.
    const apiBaseUrl = this.getEnvVariable('BASE_API_URL')
    if (!apiBaseUrl && this.deployContext === 'localhost') {
      console.warn(
        '\n\n.ENV MISSING\n\n\nBASE_API_URL environment variable is not set. See the repo README for more information.',
      )
    }
    return apiBaseUrl ?? ''
  }

  getEnableServerLogging() {
    return this.isUserFacingEnvironment()
  }

  getEnableConsoleLogging() {
    return !this.isUserFacingEnvironment() && this.deployContext !== 'test'
  }

  forceFetchDatasetAsStaticFile(fileName: string) {
    return this.forceStaticFiles.includes(fileName)
  }
}

function getDeployContext(): DeployContext {
  if (import.meta.env.NODE_ENV === 'test') {
    return 'test'
  }

  const deployContextVar = import.meta.env.VITE_DEPLOY_CONTEXT
  if (deployContextVar) {
    if (!DEPLOY_CONTEXTS.includes(deployContextVar as DeployContext)) {
      throw new Error('Invalid value for deploy context environment variable')
    }
    return deployContextVar as DeployContext
  }

  return 'unknown'
}

export function createEnvironment(): Environment {
  const deployContext = getDeployContext()
  return new HetEnvironment(deployContext)
}
