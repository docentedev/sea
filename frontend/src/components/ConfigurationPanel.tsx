import React, { useState, useEffect } from 'react';
import { useConfiguration } from '../hooks/useConfiguration';
import type { Configuration } from '../types/api';
import { Button } from './Button';
import { Settings } from 'lucide-react';
import { useNotifications } from './notifications';
import { Modal } from './Modal';
import { DataTable } from './data';
import type { Column } from './data';
import Input from './Input';
import FormField from './FormField';

interface ConfigurationPanelProps {
    className?: string;
    showCreateModal?: boolean;
    onCloseCreateModal?: () => void;
}

export const ConfigurationPanel: React.FC<ConfigurationPanelProps> = ({
    className = '',
    showCreateModal: externalShowCreateModal,
    onCloseCreateModal
}) => {
    const {
        configurations,
        loading,
        error,
        success,
        createConfiguration,
        updateConfiguration,
        deleteConfiguration,
        clearMessages
    } = useConfiguration();

    const { addNotification } = useNotifications();

    const [internalShowCreateModal, setInternalShowCreateModal] = useState(false);
    const showCreateModal = externalShowCreateModal !== undefined ? externalShowCreateModal : internalShowCreateModal;
    const closeCreateModal = externalShowCreateModal !== undefined ? onCloseCreateModal || (() => { }) : () => setInternalShowCreateModal(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedConfig, setSelectedConfig] = useState<Configuration | null>(null);
    const [formData, setFormData] = useState({ name: '', value: '' });

    // Handle notifications for error and success messages
    useEffect(() => {
        if (error) {
            addNotification('error', 'Error', error);
            clearMessages();
        }
    }, [error, addNotification, clearMessages]);

    useEffect(() => {
        if (success) {
            addNotification('success', 'Success', success);
            clearMessages();
        }
    }, [success, addNotification, clearMessages]);

    const handleCreate = async () => {
        try {
            await createConfiguration(formData);
            closeCreateModal();
            setFormData({ name: '', value: '' });
        } catch {
            // Error is handled by the hook
        }
    };

    const handleEdit = async () => {
        if (!selectedConfig) return;
        try {
            await updateConfiguration(selectedConfig.id, formData);
            setShowEditModal(false);
            setSelectedConfig(null);
            setFormData({ name: '', value: '' });
        } catch {
            // Error is handled by the hook
        }
    };

    const handleDelete = async () => {
        if (!selectedConfig) return;
        try {
            await deleteConfiguration(selectedConfig.id);
            setShowDeleteModal(false);
            setSelectedConfig(null);
        } catch {
            // Error is handled by the hook
        }
    };

    const openEditModal = (config: Configuration) => {
        setSelectedConfig(config);
        setFormData({ name: config.name, value: config.value });
        setShowEditModal(true);
    };

    const openDeleteModal = (config: Configuration) => {
        setSelectedConfig(config);
        setShowDeleteModal(true);
    };

    const closeModals = () => {
        closeCreateModal();
        setShowEditModal(false);
        setShowDeleteModal(false);
        setSelectedConfig(null);
        setFormData({ name: '', value: '' });
        clearMessages();
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const columns: Column<Configuration>[] = [
        {
            key: 'name',
            header: 'Nombre',
            render: (value, item) => (
                <div className="flex items-center">
                    <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center mr-3">
                        <Settings className="w-4 h-4 text-white" />
                    </div>
                    <div>
                        <div className="text-sm font-medium text-gray-300">{value}</div>
                        <div className="text-sm text-gray-400">ID: {item.id}</div>
                    </div>
                </div>
            )
        },
        {
            key: 'value',
            header: 'Valor',
            render: (value) => (
                <div className="max-w-xs truncate" title={String(value)}>
                    {String(value)}
                </div>
            )
        },
        {
            key: 'created_at',
            header: 'Creado',
            render: (value) => formatDate(String(value))
        },
        {
            key: 'actions',
            header: 'Acciones',
            render: (_, item) => (
                <div className="space-x-2">
                    <Button
                        onClick={() => openEditModal(item)}
                        variant="outline"
                        size="sm"
                    >
                        Editar
                    </Button>
                    <Button
                        onClick={() => openDeleteModal(item)}
                        variant="danger"
                        size="sm"
                    >
                        Eliminar
                    </Button>
                </div>
            )
        }
    ];

    if (loading && configurations.length === 0) {
        return (
            <div className={`flex items-center justify-center h-64 ${className}`}>
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-2 text-gray-300">Cargando configuraciones...</span>
            </div>
        );
    }

    return (
        <div className={className}>

            {/* Configurations Table */}
            {loading ? (
                <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
            ) : (
                <DataTable
                    data={configurations}
                    columns={columns}
                    keyField="id"
                    loading={false}
                    emptyMessage="No hay configuraciones disponibles"
                />
            )}

            {configurations.length === 0 && !loading && (
                <div className="text-center py-12">
                    <Settings className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-100">No hay configuraciones</h3>
                    <p className="mt-1 text-sm text-gray-400">Comienza creando tu primera configuración.</p>
                </div>
            )}

            {/* Create Modal */}
            <Modal
                isOpen={showCreateModal}
                onClose={closeModals}
                title="Nueva Configuración"
                size="md"
            >
                <div className="p-6">
                    <div className="space-y-4">
                        <FormField label="Nombre" required>
                            <Input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="ej: upload_path"
                            />
                        </FormField>
                        <FormField label="Valor" required>
                            <textarea
                                value={formData.value}
                                onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                                rows={3}
                                className="mt-1 block w-full border border-gray-600 rounded-lg shadow-sm py-3 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-800 text-gray-100 placeholder-gray-400 transition-colors duration-200"
                                placeholder="ej: /uploads"
                            />
                        </FormField>
                    </div>
                    <div className="flex justify-end space-x-3 mt-6">
                        <Button
                            onClick={closeModals}
                            variant="secondary"
                        >
                            Cancelar
                        </Button>
                        <Button
                            onClick={handleCreate}
                            disabled={loading || !formData.name.trim() || !formData.value.trim()}
                            variant="primary"
                        >
                            {loading ? 'Creando...' : 'Crear'}
                        </Button>
                    </div>
                </div>
            </Modal>

            {/* Edit Modal */}
            <Modal
                isOpen={showEditModal}
                onClose={closeModals}
                title="Editar Configuración"
                size="md"
            >
                <div className="p-6">
                    <div className="space-y-4">
                        <FormField label="Nombre" required>
                            <Input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            />
                        </FormField>
                        <FormField label="Valor" required>
                            <textarea
                                value={formData.value}
                                onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                                rows={3}
                                className="mt-1 block w-full border border-gray-600 rounded-lg shadow-sm py-3 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-800 text-gray-100 placeholder-gray-400 transition-colors duration-200"
                            />
                        </FormField>
                    </div>
                    <div className="flex justify-end space-x-3 mt-6">
                        <Button
                            onClick={closeModals}
                            variant="secondary"
                        >
                            Cancelar
                        </Button>
                        <Button
                            onClick={handleEdit}
                            disabled={loading || !formData.name.trim() || !formData.value.trim()}
                            variant="primary"
                        >
                            {loading ? 'Guardando...' : 'Guardar'}
                        </Button>
                    </div>
                </div>
            </Modal>

            {/* Delete Modal */}
            <Modal
                isOpen={showDeleteModal}
                onClose={closeModals}
                title="Eliminar Configuración"
                size="md"
            >
                <div className="p-6">
                    <p className="text-sm text-gray-400 mb-4">
                        ¿Estás seguro de que quieres eliminar la configuración <strong>{selectedConfig?.name}</strong>?
                        Esta acción no se puede deshacer.
                    </p>
                    <div className="flex justify-end space-x-3">
                        <Button
                            onClick={closeModals}
                            variant="secondary"
                        >
                            Cancelar
                        </Button>
                        <Button
                            onClick={handleDelete}
                            disabled={loading}
                            variant="danger"
                        >
                            {loading ? 'Eliminando...' : 'Eliminar'}
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};