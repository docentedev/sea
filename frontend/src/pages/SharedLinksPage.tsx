import { useState } from 'react';
import { SharedLinkModal } from '../components/shared/SharedLinkModal';
import { SharedLinkAccess } from '../components/shared/SharedLinkAccess';
import { revokeSharedLink } from '../services/sharedLinks';

type CreatedLink = {
  url: string;
  token: string;
};

export function SharedLinksPage() {
  const [showModal, setShowModal] = useState(false);
  const [createdLink, setCreatedLink] = useState<CreatedLink | null>(null);
  const [accessToken, setAccessToken] = useState('');
  const [accessMode, setAccessMode] = useState(false);

  return (
    <div className="shared-links-page">
      <h1>Compartir archivos</h1>
      <button onClick={() => setShowModal(true)}>Crear link público</button>
      {showModal && (
        <SharedLinkModal
          fileId={1} // Reemplaza por el id del archivo seleccionado
          onClose={() => setShowModal(false)}
          onCreated={(link) => setCreatedLink({ url: `${window.location.origin}/public/shared/${link.token}`, token: link.token })}
          isOpen={showModal}
        />
      )}
      {createdLink && (
        <div className="created-link">
          <p>Link generado:</p>
          <input type="text" value={createdLink.url} readOnly />
          <button onClick={() => revokeSharedLink(createdLink.token)}>Revocar</button>
        </div>
      )}
      <hr />
      <h2>Acceder a un archivo compartido</h2>
      <input
        type="text"
        placeholder="Token del link público"
        value={accessToken}
        onChange={e => setAccessToken(e.target.value)}
      />
      <button onClick={() => setAccessMode(true)}>Acceder</button>
      {accessMode && <SharedLinkAccess token={accessToken} />}
    </div>
  );
}
