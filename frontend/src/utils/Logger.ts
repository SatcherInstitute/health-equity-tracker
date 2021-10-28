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
      // console.log(...logInfo);
    }
  }

  /** Logs an error to the server or to the console if in debug mode. */
  async logError(
    error: Error,
    severity: Severity,
    context?: Record<string, string>
  ) {
    const consoleFn = this.getConsoleFn(severity);
    if (this.enableConsoleLogging) {
      consoleFn("Error Reported", error, error.stack, severity, context);
    }

    if (this.enableServerLogging) {
      // TODO: implement server logging
      console.log("TODO: implement server logging");
    }
  }

  private getConsoleFn(severity: Severity): (...args: any[]) => any {
    switch (severity) {
      case "INFO":
        return console.info.bind(console);
      case "WARNING":
        return console.warn.bind(console);
      case "ERROR":
        return console.error.bind(console);
    }
  }
}

export default Logger;
