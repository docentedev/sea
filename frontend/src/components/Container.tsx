import Header from "./Header";
import { LoadingSpinner } from "./LoadingAndError";

interface ContainerProps {
  header: string;
  description: string;
  onCreate?: () => void;
  onCreateLabel?: string;
  children: React.ReactNode;
  loading?: boolean;
  error?: string | null;
  success?: string | null;
}

const Container: React.FC<ContainerProps> = ({ header, description, onCreate, children, loading, error, onCreateLabel }) => {
  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <Header
        title={header}
        description={description}
        onCreate={onCreate}
        onCreateLabel={onCreateLabel}
      />
  
      {/* Loading, Error, Success Messages */}
      {loading && (
        <div className="px-4 sm:px-6 lg:px-8 py-4">
          <LoadingSpinner />
        </div>
      )}
      {error && (
        <div className="px-4 sm:px-6 lg:px-8 py-4">
          <div className="bg-red-500 text-white p-4 rounded">
            {error}
          </div>
        </div>
      )}
      {/* Content */}
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </div>
    </div>
  );
};

export default Container;
