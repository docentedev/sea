interface LoadingSpinnerProps {
  message?: string;
}

import { Button } from './Button';

export function LoadingSpinner({ message = 'Loading...' }: LoadingSpinnerProps) {
  return (
    <div className="flex flex-col items-center justify-center p-10 font-sans">
      <div className="w-10 h-10 border-4 border-gray-600 border-t-blue-500 rounded-full animate-spin mb-5" />
      <div className="text-gray-400">{message}</div>
    </div>
  );
}

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
}

export function ErrorMessage({ message, onRetry }: ErrorMessageProps) {
  return (
    <div className="p-5 bg-red-900/20 border border-red-800 rounded text-red-400 font-sans">
      <h3 className="font-semibold mb-2">Error</h3>
      <p className="mb-3">{message}</p>
      {onRetry && (
        <Button
          onClick={onRetry}
          variant="primary"
        >
          Retry
        </Button>
      )}
    </div>
  );
}