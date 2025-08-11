import { HttpErrorResponse } from '@angular/common/http';

export class SafeErrorLogger {
  /**
   * Safely logs HTTP errors by extracting only serializable properties
   */
  static logHttpError(context: string, error: HttpErrorResponse | any): void {
    const safeError = this.extractSafeErrorInfo(error);
    
    console.error(`🚨 ${context}:`, safeError);
    
    // Show helpful context based on error type
    if (safeError.status === 0 || safeError.status === '0') {
      console.warn('💡 Connection failed - Backend server may not be running');
    } else if (safeError.status >= 500) {
      console.warn('💡 Server error - Check backend logs');
    } else if (safeError.status >= 400) {
      console.warn('💡 Client error - Check request parameters');
    }
  }

  /**
   * Extracts safe, serializable properties from an error object
   */
  private static extractSafeErrorInfo(error: any): any {
    const safeError: any = {
      timestamp: new Date().toISOString(),
      type: 'Unknown Error'
    };

    // Handle HttpErrorResponse
    if (error && typeof error === 'object') {
      safeError.status = error.status || 'No status';
      safeError.statusText = error.statusText || 'No status text';
      safeError.url = error.url || 'No URL';
      safeError.message = error.message || 'No message';
      safeError.name = error.name || 'Unknown';
      
      // Safely extract error body
      if (error.error) {
        if (typeof error.error === 'string') {
          safeError.errorBody = error.error;
        } else if (typeof error.error === 'object') {
          try {
            // Try to stringify, but fallback if circular
            safeError.errorBody = JSON.stringify(error.error);
          } catch (e) {
            safeError.errorBody = '[Complex object - cannot stringify]';
            // Extract basic properties if available
            if (error.error.message) {
              safeError.errorMessage = error.error.message;
            }
            if (error.error.type) {
              safeError.errorType = error.error.type;
            }
          }
        } else {
          safeError.errorBody = String(error.error);
        }
      }
    } else {
      // Handle primitive errors
      safeError.message = String(error || 'Unknown error');
    }

    return safeError;
  }

  /**
   * Safely logs general application errors
   */
  static logError(context: string, error: any): void {
    const safeError = {
      context: context,
      timestamp: new Date().toISOString(),
      message: error?.message || String(error) || 'Unknown error',
      name: error?.name || 'Unknown',
      stack: error?.stack ? error.stack.split('\n').slice(0, 5).join('\n') : 'No stack trace'
    };

    console.error(`🚨 ${context}:`, safeError);
  }
}
