import { useEffect, useState } from 'react';
import { Button } from '../components/Button';

interface SharedFile {
    id: number;
    name: string;
    mime_type: string;
    size: number;
}
interface SharedLink {
    token: string;
    expires_at?: string;
    max_access_count?: number;
    access_count: number;
    revoked: boolean;
}

interface PublicSharedFilePageProps {
    token: string;
}

export default function PublicSharedFilePage({ token }: PublicSharedFilePageProps) {
    const [file, setFile] = useState<SharedFile | null>(null);
    const [link, setLink] = useState<SharedLink | null>(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchShared() {
            setLoading(true);
            setError('');
            try {
                const res = await fetch(`/api/shared/${token}`);
                if (!res.ok) throw new Error('No se pudo obtener el archivo compartido');
                const data = await res.json();
                setFile(data.file);
                setLink(data.link);
            } catch (e) {
                setError((e as Error).message || 'Error desconocido');
            } finally {
                setLoading(false);
            }
        }
        fetchShared();
    }, [token]);

    if (loading) return <div className="p-8 text-center text-gray-400">Cargando archivo compartido...</div>;
    if (error) return <div className="p-8 text-center text-red-400">{error}</div>;
    if (!file || !link) return <div className="p-8 text-center text-gray-400">Archivo no disponible.</div>;

    const isImage = file.mime_type.startsWith('image/');
    const isVideo = file.mime_type.startsWith('video/');
    const downloadUrl = `/api/shared/${token}/download`;

    return (
        <div className="min-h-screen bg-gray-800 p-4 flex justify-center items-start">
            <div className="w-full max-w-2xl mx-auto bg-gray-900 rounded-lg shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-100 mb-4">Archivo compartido</h2>
                <div className="mb-4">
                    <div className="text-gray-300 font-medium">{file.name}</div>
                    <div className="text-xs text-gray-400">Tipo: {file.mime_type} | Tamaño: {file.size} bytes</div>
                    {link.expires_at && (
                        <div className="text-xs text-yellow-400">Expira: {new Date(link.expires_at).toLocaleString()}</div>
                    )}
                    {link.max_access_count && (
                        <div className="text-xs text-yellow-400">Accesos: {link.access_count} / {link.max_access_count}</div>
                    )}
                    {link.revoked && (
                        <div className="text-xs text-red-400">Este link ha sido revocado.</div>
                    )}
                </div>
                {isImage && (
                    <img src={downloadUrl} alt={file.name} className="max-w-[80vw] max-h-[60vh] object-contain mb-4 rounded-lg shadow-lg" />
                )}
                {isVideo && (
                    <video controls src={downloadUrl} className="w-full max-w-[80vw] max-h-[60vh] object-contain bg-black rounded-lg shadow-lg mb-4" />
                )}
                {!isImage && !isVideo && (
                    <div className="mb-4 text-gray-400">No se puede previsualizar este tipo de archivo.</div>
                )}
                <a href={downloadUrl} download className="block w-full">
                    <Button className="w-full">Descargar archivo</Button>
                </a>
            </div>
        </div>
    );
}
