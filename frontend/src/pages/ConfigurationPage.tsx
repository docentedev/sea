import React, { useState } from 'react';
import { ConfigurationPanel } from '../components/ConfigurationPanel';
import { Button } from '../components/Button';
import { Plus } from 'lucide-react';

const ConfigurationPage: React.FC = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <div className="bg-gray-800 shadow-sm border-b border-gray-700">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-100">System Configuration</h1>
              <p className="mt-1 text-sm text-gray-400">
                Manage system settings and configurations
              </p>
            </div>
            <Button
              onClick={() => setShowCreateModal(true)}
              variant="primary"
              size="lg"
              className="flex items-center space-x-2"
            >
              <Plus className="w-5 h-5" />
              <span>New Configuration</span>
            </Button>
          </div>
        </div>
      </div>

            {/* Content */}
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        <ConfigurationPanel
          showCreateModal={showCreateModal}
          onCloseCreateModal={() => setShowCreateModal(false)}
        />
      </div>
    </div>
  );
};

export default ConfigurationPage;