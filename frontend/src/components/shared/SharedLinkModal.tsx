import { useState } from 'react';
import { createSharedLink } from '../../services/sharedLinks';
import { Modal } from '../Modal';

interface SharedLinkModalProps {
    fileId: number;
    onClose: () => void;
    onCreated: (link: { token: string }) => void;
    isOpen: boolean;
}

export function SharedLinkModal({ fileId, onClose, onCreated, isOpen }: SharedLinkModalProps) {
    const [password, setPassword] = useState('');
    const [expiresAt, setExpiresAt] = useState('');
    const [maxAccessCount, setMaxAccessCount] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [link, setLink] = useState<string | null>(null);

    const handleCreate = async () => {
        setLoading(true);
        setError('');
        setLink(null);
        try {
            const data = {
                file_id: fileId,
                password: password || undefined,
                expires_at: expiresAt || undefined,
                max_access_count: maxAccessCount ? Number(maxAccessCount) : undefined
            };
            const res = await createSharedLink(data);
            setLink(`${window.location.origin}/public/shared/${res.token}`);
            onCreated(res);
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Error al crear link');
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setPassword('');
        setExpiresAt('');
        setMaxAccessCount('');
        setError('');
        setLink(null);
        onClose();
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            title="Compartir archivo"
            size="md"
        >
            <div className="space-y-4">
                <div className="space-y-3">
                    <label className="block text-gray-300 text-sm">
                        Contraseña (opcional):
                        <input
                            type="text"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            className="mt-1 w-full px-3 py-2 rounded bg-gray-700 text-gray-100 border border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                            placeholder="Deja vacío para acceso público"
                        />
                    </label>
                    <label className="block text-gray-300 text-sm">
                        Expiración (opcional):
                        <input
                            type="datetime-local"
                            value={expiresAt}
                            onChange={e => setExpiresAt(e.target.value)}
                            className="mt-1 w-full px-3 py-2 rounded bg-gray-700 text-gray-100 border border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                        />
                    </label>
                    <label className="block text-gray-300 text-sm">
                        Máximo de accesos (opcional):
                        <input
                            type="number"
                            min="1"
                            value={maxAccessCount}
                            onChange={e => setMaxAccessCount(e.target.value)}
                            className="mt-1 w-full px-3 py-2 rounded bg-gray-700 text-gray-100 border border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                            placeholder="Sin límite"
                        />
                    </label>
                </div>

                {error && (
                    <div className="p-3 bg-red-900/50 border border-red-700 rounded text-red-300 text-sm">
                        {error}
                    </div>
                )}

                {link && (
                    <div className="p-3 bg-green-900/50 border border-green-700 rounded">
                        <div className="text-green-300 text-sm font-medium mb-2">Link generado exitosamente:</div>
                        <a
                            href={link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-400 hover:text-blue-300 break-all underline text-sm"
                        >
                            {link}
                        </a>
                    </div>
                )}

                <div className="flex justify-end space-x-3 pt-4">
                    <button
                        onClick={handleClose}
                        className="px-4 py-2 rounded bg-gray-700 text-gray-200 hover:bg-gray-600 transition-colors"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleCreate}
                        disabled={loading}
                        className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        {loading ? 'Creando...' : 'Crear link'}
                    </button>
                </div>
            </div>
        </Modal>
    );
}
