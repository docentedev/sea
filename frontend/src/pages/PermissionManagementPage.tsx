import React, { useEffect, useState } from 'react';
import { Button } from '../components/Button';
import Input from '../components/Input';
import { DataTable } from '../components/data/DataTable';
import { Modal } from '../components/Modal';
import { apiService } from '../services/api';
import Container from '../components/Container';
import { FormField } from '../components';

interface Permission {
    id: number;
    name: string;
    description: string;
    created_at: string;
}

export const PermissionManagementPage: React.FC = () => {
    const [permissions, setPermissions] = useState<Permission[]>([]);
    const [modalOpen, setModalOpen] = useState(false);
    const [form, setForm] = useState({ name: '', description: '' });
    const [editingId, setEditingId] = useState<number | null>(null);

    const fetchPermissions = async () => {
        const res = await apiService.getPermissions();
        setPermissions(res.data.permissions);
    };

    useEffect(() => {
        fetchPermissions();
    }, []);

    const handleOpenModal = (permission?: Permission) => {
        if (permission) {
            setForm({ name: permission.name, description: permission.description });
            setEditingId(permission.id);
        } else {
            setForm({ name: '', description: '' });
            setEditingId(null);
        }
        setModalOpen(true);
    };

    const handleSave = async () => {
        if (editingId) {
            await apiService.put(`/api/permissions/${editingId}`, form);
        } else {
            await apiService.post('/api/permissions', form);
        }
        setModalOpen(false);
        fetchPermissions();
    };

    const handleDelete = async (id: number) => {
        await apiService.delete(`/api/permissions/${id}`);
        fetchPermissions();
    };

    // Definir columnas para DataTable
    const columns = [
        { key: 'id', header: 'ID' },
        { key: 'name', header: 'Nombre' },
        { key: 'description', header: 'Descripción' },
        {
            key: 'actions',
            header: 'Acciones',
            render: (_: unknown, p: Permission) => (
                <>
                    <Button onClick={() => handleOpenModal(p)} size="sm">Editar</Button>{' '}
                    <Button onClick={() => handleDelete(p.id)} variant="danger" size="sm">Eliminar</Button>
                </>
            )
        }
    ];

    return (
        <Container
            header="Gestión de Permisos"
            description="Administra los permisos de tu aplicación aquí."
            onCreate={() => handleOpenModal()}
            onCreateLabel="Nuevo Permiso"
        >
            <DataTable
                data={permissions}
                columns={columns}
                keyField="id"
            />
            <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? 'Editar Permiso' : 'Nuevo Permiso'}>
                <div className="p-6">
                    <div className="space-y-4">
                        <FormField label="Nombre" required>
                            <Input
                                placeholder="Nombre"
                                value={form.name}
                                onChange={e => setForm(f => ({ ...f, name: (e.target as HTMLInputElement).value }))}
                            />
                        </FormField>
                        <FormField label="Descripción">
                            <Input
                                placeholder="Descripción"
                                value={form.description}
                                onChange={e => setForm(f => ({ ...f, description: (e.target as HTMLInputElement).value }))}
                            />
                        </FormField>
                    </div>
                    <div className="flex justify-end space-x-3 mt-6">
                        <Button onClick={handleSave}>{editingId ? 'Guardar Cambios' : 'Crear Permiso'}</Button>
                    </div>
                </div>
            </Modal>
        </Container>
    );
};
