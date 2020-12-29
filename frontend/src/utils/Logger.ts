export type Severity = "INFO" | "WARNING" | "ERROR";

class Logger {
  isDebug: boolean;

  constructor(isDebug: boolean) {
    this.isDebug = isDebug;
  }

  /**
   * If in debug mode, logs a message to the console. Otherwise this is a noop.
   */
  debugLog(message: string, context?: Record<string, string>) {
    if (this.isDebug) {
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
    if (this.isDebug) {
      console.log("Error Reported", error, severity, context);
    } else {
      // TODO replace with real reporting.
      console.log("Error Reported", error, severity, context);
    }
  }
}

export default Logger;
