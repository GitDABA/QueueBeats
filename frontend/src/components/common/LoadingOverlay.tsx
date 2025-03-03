import React from 'react';
import LoadingIndicator from './LoadingIndicator';

interface LoadingOverlayProps {
  show: boolean;
  message?: string;
  fullScreen?: boolean;
}

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  show,
  message = 'Loading...',
  fullScreen = false,
}) => {
  if (!show) return null;

  const containerClasses = fullScreen
    ? 'fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center'
    : 'absolute inset-0 bg-white bg-opacity-80 z-10 flex items-center justify-center';

  return (
    <div className={containerClasses}>
      <div className="text-center p-6 bg-white rounded-lg shadow-lg">
        <LoadingIndicator size="lg" />
        <p className="mt-4 text-lg font-medium text-gray-700">{message}</p>
      </div>
    </div>
  );
};

export default LoadingOverlay;
