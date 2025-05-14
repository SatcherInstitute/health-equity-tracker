type DeployContext =
  // Production environment in GCP
  | 'prod'

  // The "dev" GCP environment that gets auto-deployed from main branch to dev.healthequitytracker.org
  | 'dev'

  // Deploy previews. Currently, all netlify deploys are considered deploy
  // previews.
  | 'deploy_preview'

  // When running npm run dev, or when running Docker locally
  | 'local'

  // Unit or integration tests
  | 'test'

  // Unknown deploy context. This generally shouldn't happen.
  | 'unknown'

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
   * directory.
   *
   * This should only be used for local development or in-progress datasets. In
   * production, all datasets should be fetched from the data server.
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
    // If the API url isn't provided, requests are relative to current domain.
    const apiBaseUrl = this.getEnvVariable('BASE_API_URL')
    if (!apiBaseUrl && this.deployContext === 'local') {
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

  if (import.meta.env.NODE_ENV === 'local') {
    return 'local'
  }

  const deployContextVar = import.meta.env.VITE_DEPLOY_CONTEXT
  if (deployContextVar) {
    const expectedContexts = ['prod', 'dev', 'deploy_preview', 'local']
    if (!expectedContexts.includes(deployContextVar)) {
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
