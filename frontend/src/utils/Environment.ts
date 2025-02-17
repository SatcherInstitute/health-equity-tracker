type DeployContext =
  // Production environment in GCP
  | 'prod'

  // The "test" GCP environment that gets auto-deployed from master branch.
  | 'staging'

  // Deploy previews. Currently, all netlify deploys are considered deploy
  // previews.
  | 'deploy_preview'

  // Storybook deploys and storybook deploy previews.
  | 'storybook'

  // Unit or integration tests
  | 'test'

  // When running npm start or npm run storybook, or when running Docker locally
  // or deploying to a personal GCP project.
  | 'development'

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
    return this.deployContext === 'prod' || this.deployContext === 'staging'
  }

  getBaseApiUrl() {
    // If the API url isn't provided, requests are relative to current domain.
    const apiBaseUrl = this.getEnvVariable('BASE_API_URL')
    if (!apiBaseUrl && this.deployContext === 'development') {
      console.warn(
        '\n\n.ENV MISSING\n\n\nBASE_API_URL environment variable is not set. Did you forget to copy the .env.example into an .env.development file? See the repo README for more information.',
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

  if (import.meta.env.NODE_ENV === 'development') {
    return 'development'
  }

  const deployContextVar =
    import.meta.env.VITE_DEPLOY_CONTEXT ||
    import.meta.env.STORYBOOK_DEPLOY_CONTEXT
  if (deployContextVar) {
    const expectedContexts = [
      'prod',
      'staging',
      'deploy_preview',
      'storybook',
      'development',
    ]
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
