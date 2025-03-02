import React from 'react';
import { useRouteError } from 'react-router-dom';

export default function ErrorBoundary() {
  const error: any = useRouteError();
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-gray-900 to-purple-950 text-white p-4">
      <div className="max-w-lg w-full bg-black/30 backdrop-blur-sm border border-gray-800 rounded-lg p-8">
        <h1 className="text-3xl font-bold text-red-500 mb-4">Oops!</h1>
        <p className="text-lg mb-4">Sorry, an unexpected error has occurred.</p>
        
        <div className="bg-gray-900 p-4 rounded-md mb-6 overflow-auto">
          <p className="font-mono text-sm text-red-400">
            {error?.message || "Unknown error"}
          </p>
          {error?.stack && (
            <details className="mt-2">
              <summary className="cursor-pointer text-gray-400 text-sm">Stack trace</summary>
              <pre className="mt-2 text-xs text-gray-500 overflow-auto">
                {error.stack}
              </pre>
            </details>
          )}
        </div>
        
        <button 
          onClick={() => window.location.href = '/'}
          className="px-4 py-2 bg-purple-700 hover:bg-purple-600 text-white rounded-md transition-colors"
        >
          Return to Home
        </button>
      </div>
    </div>
  );
}
