import React, { useEffect, useState } from 'react';
import { useRouteError, useNavigate } from 'react-router-dom';

export default function ErrorBoundary() {
  const error: any = useRouteError();
  const navigate = useNavigate();
  const [errorInfo, setErrorInfo] = useState<{
    message: string;
    stack?: string;
    componentStack?: string;
  }>({ message: 'Unknown error' });
  
  // Extract useful information from the error
  useEffect(() => {
    let message = 'Unknown error';
    let stack = undefined;
    
    // Handle different error types
    if (error) {
      if (typeof error === 'string') {
        message = error;
      } else if (error instanceof Error) {
        message = error.message || 'An error occurred';
        stack = error.stack;
      } else if (error.statusText) {
        message = `${error.status || ''} ${error.statusText}`;
      } else if (error.message) {
        message = error.message;
        stack = error.stack;
      } else if (error.data && error.data.message) {
        message = error.data.message;
      }
      
      // Log for debugging
      console.error('Error caught by boundary:', error);
    }
    
    setErrorInfo({ message, stack });
  }, [error]);
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-gray-900 to-purple-950 text-white p-4">
      <div className="max-w-lg w-full bg-black/30 backdrop-blur-sm border border-gray-800 rounded-lg p-8">
        <h1 className="text-3xl font-bold text-red-500 mb-4">Oops!</h1>
        <p className="text-lg mb-4">Sorry, an unexpected error has occurred.</p>
        
        <div className="bg-gray-900 p-4 rounded-md mb-6 overflow-auto">
          <p className="font-mono text-sm text-red-400">
            {errorInfo.message}
          </p>
          {errorInfo.stack && (
            <details className="mt-2">
              <summary className="cursor-pointer text-gray-400 text-sm">Stack trace</summary>
              <pre className="mt-2 text-xs text-gray-500 overflow-auto">
                {errorInfo.stack}
              </pre>
            </details>
          )}
          {errorInfo.componentStack && (
            <details className="mt-2">
              <summary className="cursor-pointer text-gray-400 text-sm">Component stack</summary>
              <pre className="mt-2 text-xs text-gray-500 overflow-auto">
                {errorInfo.componentStack}
              </pre>
            </details>
          )}
        </div>
        
        <div className="flex space-x-4">
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-700 hover:bg-blue-600 text-white rounded-md transition-colors"
          >
            Reload Page
          </button>
          <button 
            onClick={() => navigate('/')}
            className="px-4 py-2 bg-purple-700 hover:bg-purple-600 text-white rounded-md transition-colors"
          >
            Return to Home
          </button>
        </div>
      </div>
    </div>
  );
}
