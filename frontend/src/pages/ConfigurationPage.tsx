import React, { useState } from 'react';
import { ConfigurationPanel } from '../components/ConfigurationPanel';
import Container from '../components/Container';

const ConfigurationPage: React.FC = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);

  return (
    <Container
      header="Configuration Management"
      description="Manage your application configurations here."
      onCreate={() => setShowCreateModal(true)}
    >
      <ConfigurationPanel
        showCreateModal={showCreateModal}
        onCloseCreateModal={() => setShowCreateModal(false)}
      />
    </Container>
  );
};

export default ConfigurationPage;