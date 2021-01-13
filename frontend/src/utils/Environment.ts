export type DeployContext =
  // Production environment in GCP
  | "prod"

  // The "test" GCP environment that gets auto-deployed from master branch.
  | "staging"

  // Deploy previews. Currently, all netlify deploys are considered deploy
  // previews.
  | "deploy_preview"

  // Storybook deploys and storybook deploy previews.
  | "storybook"

  // Unit or integration tests
  | "test"

  // When running npm start or npm run storybook
  | "development"

  // For example personal GCP deployment or local Dockerfile. Treat this
  // similarly to development.
  | "other";

export interface Environment {
  readonly deployContext: DeployContext;
  getBaseApiUrl(): string;
  getEnableServerLogging(): boolean;
  getEnableConsoleLogging(): boolean;
  isUserFacingEnvironment(): boolean;
}

export class HetEnvironment implements Environment {
  readonly deployContext: DeployContext;

  constructor(deployContext: DeployContext) {
    this.deployContext = deployContext;
  }

  isUserFacingEnvironment() {
    return this.deployContext === "prod" || this.deployContext === "staging";
  }

  getBaseApiUrl() {
    // If the API url isn't provided, requests are relative to current domain.
    return process.env.REACT_APP_BASE_API_URL || "";
  }

  getEnableServerLogging() {
    return this.isUserFacingEnvironment();
  }

  getEnableConsoleLogging() {
    return !this.isUserFacingEnvironment() && this.deployContext !== "test";
  }
}

export class StorybookEnvironment extends HetEnvironment {
  getBaseApiUrl() {
    return process.env.STORYBOOK_BASE_API_URL || "";
  }
}

function getDeployContext(): DeployContext {
  if (process.env.NODE_ENV === "test") {
    return "test";
  }

  if (process.env.NODE_ENV === "development") {
    return "development";
  }

  const deployContextVar =
    process.env.REACT_APP_DEPLOY_CONTEXT ||
    process.env.STORYBOOK_DEPLOY_CONTEXT;
  if (deployContextVar) {
    const expectedContexts = ["prod", "staging", "deploy_preview", "storybook"];
    if (!expectedContexts.includes(deployContextVar)) {
      throw new Error("Invalid value for deploy context environment variable");
    }
    // Temporary workaround, until staging and prod are set up to deploy with
    // correct environment variables.
    if (process.env.NODE_ENV === "production" && !deployContextVar) {
      return "staging";
    }
    return deployContextVar as DeployContext;
  }

  return "other";
}

export function createEnvironment(): Environment {
  const deployContext = getDeployContext();

  if (deployContext === "storybook") {
    return new StorybookEnvironment(deployContext);
  }

  return new HetEnvironment(deployContext);
}
