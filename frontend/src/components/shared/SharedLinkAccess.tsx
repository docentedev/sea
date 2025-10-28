import { useState } from 'react';
import { getSharedLink } from '../../services/sharedLinks';

interface SharedLinkAccessProps {
  token: string;
}

export function SharedLinkAccess({ token }: SharedLinkAccessProps) {
  const [password, setPassword] = useState('');
  const [file, setFile] = useState<{ id: number; name: string; mime_type: string; size: number } | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAccess = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getSharedLink(token, password);
      setFile(res.file);
    } catch (e) {
      setError((e as Error).message || 'Error al acceder al link');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="shared-access">
      <h2>Acceso a archivo compartido</h2>
      <label>
        Contraseña (si requiere):
        <input type="text" value={password} onChange={e => setPassword(e.target.value)} />
      </label>
      <button onClick={handleAccess} disabled={loading}>Acceder</button>
      {error && <div className="error">{error}</div>}
      {file && <div className="file-info">Archivo: {file.name}</div>}
    </div>
  );
}
