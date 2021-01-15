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

  // When running npm start or npm run storybook, or when running Docker locally
  // or deploying to a personal GCP project.
  | "development"

  // Unknown deploy context. This generally shouldn't happen.
  | "unknown";

export interface Environment {
  readonly deployContext: DeployContext;
  getBaseApiUrl(): string;
  getEnableServerLogging(): boolean;
  getEnableConsoleLogging(): boolean;
  isUserFacingEnvironment(): boolean;
  // TODO delete this after launch.
  enableFullSiteContent(): boolean;
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

  enableFullSiteContent() {
    return process.env.REACT_APP_ENABLE_FULL_SITE_CONTENT === "true";
  }
}

export class StorybookEnvironment extends HetEnvironment {
  getBaseApiUrl() {
    return process.env.STORYBOOK_BASE_API_URL || "";
  }

  enableFullSiteContent() {
    // Storybook doesn't use this currently, but just in case, set to true since
    // storybook should always show full site content.
    return true;
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
    const expectedContexts = [
      "prod",
      "staging",
      "deploy_preview",
      "storybook",
      "development",
    ];
    if (!expectedContexts.includes(deployContextVar)) {
      throw new Error("Invalid value for deploy context environment variable");
    }
    return deployContextVar as DeployContext;
  }

  return "unknown";
}

export function createEnvironment(): Environment {
  const deployContext = getDeployContext();

  if (deployContext === "storybook") {
    return new StorybookEnvironment(deployContext);
  }

  return new HetEnvironment(deployContext);
}
