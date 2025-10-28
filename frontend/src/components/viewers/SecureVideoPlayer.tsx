import React, { useState, useEffect, useRef } from 'react';

/**
 * Propiedades del componente SecureVideoPlayer.
 */
interface SecureVideoPlayerProps {
    /** La URL del archivo de video (ej: 'https://cdn.com/video.mp4') */
    videoUrl: string;
    /** El token de autorización (ej: JWT o de sesión) */
    token: string;
}

const SecureVideoPlayer: React.FC<SecureVideoPlayerProps> = ({ videoUrl, token }) => {
    // Referencia al elemento <video> en el DOM
    const videoRef = useRef<HTMLVideoElement>(null);
    // Estado para manejar la URL temporal de Blob
    const [blobUrl, setBlobUrl] = useState<string | null>(null);
    // Estado para manejar el estado de carga y errores
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // Al montar o si cambian la URL/Token, iniciamos la carga
        const loadVideo = async () => {
            setLoading(true);
            setError(null);

            // Si ya hay una URL de Blob antigua, la revocamos para liberar memoria
            if (blobUrl) {
                URL.revokeObjectURL(blobUrl);
            }

            try {
                // 1. Petición con el Token en el Header
                const response = await fetch(videoUrl, {
                    method: 'GET',
                    headers: {
                        // El estándar es usar "Bearer" para tokens de acceso
                        'Authorization': `Bearer ${token}`,
                    },
                });

                if (!response.ok) {
                    throw new Error(`Error ${response.status}: No se pudo cargar el video.`);
                }

                // 2. Obtener los datos como un Blob (datos binarios)
                const videoBlob = await response.blob();

                // 3. Crear un Object URL (Blob URL) temporal
                const newBlobUrl = URL.createObjectURL(videoBlob);

                // 4. Actualizar el estado con la nueva URL de Blob
                setBlobUrl(newBlobUrl);

            } catch (err) {
                // Manejo de errores de red o del servidor
                const errorMessage = (err instanceof Error) ? err.message : 'Error desconocido al cargar el video.';
                setError(errorMessage);
                console.error('Error al cargar el video seguro:', err);
                setBlobUrl(null); // Asegurar que no haya URL si falla
            } finally {
                setLoading(false);
            }
        };

        loadVideo();

        // Función de limpieza al desmontar el componente o antes de un nuevo fetch.
        // Revoca la URL de Blob para que el navegador libere la memoria asociada.
        return () => {
            if (blobUrl) {
                URL.revokeObjectURL(blobUrl);
            }
        };
    }, [videoUrl, token]); // Dependencias: se ejecuta si la URL o el token cambian

    // --- Renderizado del Componente ---

    if (loading) {
        return <div className="video-player-loading">Cargando video...</div>;
    }

    if (error) {
        return <div className="video-player-error" style={{ color: 'red' }}>Error al cargar: {error}</div>;
    }

    if (!blobUrl) {
        // En caso de que loading sea false pero blobUrl sea nulo (ej: después de un error)
        return <div className="video-player-no-content">No hay contenido de video disponible.</div>;
    }

    // El elemento <video> que usa la URL de Blob temporal
    return (
        <video
            ref={videoRef}
            src={blobUrl} // Usamos la URL de Blob generada por JS
            controls // Controles nativos de video (play, pausa, volumen)
            className="w-full max-h-[60vh] bg-black"
        >
            Tu navegador no soporta el elemento de video.
        </video>
    );
};

export default SecureVideoPlayer;
