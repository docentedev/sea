interface LoadingSpinnerProps {
  message?: string;
}

export function LoadingSpinner({ message = 'Loading...' }: LoadingSpinnerProps) {
  return (
    <div className="flex flex-col items-center justify-center p-10 font-sans">
      <div className="w-10 h-10 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin mb-5" />
      <div className="text-gray-600">{message}</div>
    </div>
  );
}

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
}

export function ErrorMessage({ message, onRetry }: ErrorMessageProps) {
  return (
    <div className="p-5 bg-red-50 border border-red-200 rounded text-red-700 font-sans">
      <h3 className="font-semibold mb-2">Error</h3>
      <p className="mb-3">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-4 py-2 bg-blue-500 text-white border-none rounded hover:bg-blue-600 cursor-pointer transition-colors"
        >
          Retry
        </button>
      )}
    </div>
  );
}