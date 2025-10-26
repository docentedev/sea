import { Button } from '../components/Button';
import { Plus } from 'lucide-react';

interface HeaderProps {
  title: string;
  description: string;
  onCreate?: () => void;
}

const Header: React.FC<HeaderProps> = ({ title, description, onCreate }) => {
  return (
    <div className="bg-gray-800 border-b border-gray-700">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-100">{title}</h1>
            <p className="mt-1 text-sm text-gray-400">{description}</p>
          </div>
          {onCreate && (
            <Button
              onClick={onCreate}
              variant="primary"
              size="lg"
              className="flex items-center space-x-2"
            >
              <Plus className="w-5 h-5" />
              <span>New Configuration</span>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Header;
