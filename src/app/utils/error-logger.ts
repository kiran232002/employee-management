import { HttpErrorResponse } from '@angular/common/http';

export class ErrorLogger {
  /**
   * Logs HTTP errors in a consistent, readable format
   * @param context - Context where the error occurred (e.g., 'Loading employees')
   * @param error - The error object to log
   */
  static logHttpError(context: string, error: any): void {
    const errorInfo = {
      context: context,
      timestamp: new Date().toISOString(),
      status: error.status || 'Unknown',
      statusText: error.statusText || 'Unknown',
      url: error.url || 'No URL',
      message: error.message || 'No message',
      type: error.name || 'Unknown Error Type'
    };

    console.error(`🚨 ${context}:`, errorInfo);

    // If it's a connection error (status 0), show helpful message
    if (error.status === 0) {
      console.warn('💡 This appears to be a connection error. The backend server may not be running.');
    }
  }

  /**
   * Logs general application errors
   * @param context - Context where the error occurred
   * @param error - The error to log
   */
  static logError(context: string, error: any): void {
    console.error(`🚨 ${context}:`, {
      context: context,
      timestamp: new Date().toISOString(),
      message: error?.message || error?.toString() || 'Unknown error',
      stack: error?.stack || 'No stack trace'
    });
  }
}
