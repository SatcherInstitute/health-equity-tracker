export type Severity = "INFO" | "WARNING" | "ERROR";

class Logger {
  enableServerLogging: boolean;
  enableConsoleLogging: boolean;

  constructor(enableServerLogging: boolean, enableConsoleLogging: boolean) {
    this.enableServerLogging = enableServerLogging;
    this.enableConsoleLogging = enableConsoleLogging;
  }

  /**
   * If console logging is enabled, logs a message to the console. Otherwise
   * this is a noop.
   */
  debugLog(message: string, context?: Record<string, string>) {
    if (this.enableConsoleLogging) {
      const logInfo: any[] = [message];
      if (context) {
        logInfo.push(context);
      }
      console.log(...logInfo);
    }
  }

  /** Logs an error to the server or to the console if in debug mode. */
  async logError(
    error: Error,
    severity: Severity,
    context: Record<string, string>
  ) {
    if (this.enableConsoleLogging) {
      console.log("Error Reported", error, severity, context);
    }

    if (this.enableServerLogging) {
      // TODO: implement server logging
      console.log("TODO: implement server logging");
    }
  }
}

export default Logger;
