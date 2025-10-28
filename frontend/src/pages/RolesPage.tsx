import React, { useEffect, useState } from 'react';
import { useNotifications } from '../components/notifications';
import { apiService } from '../services/api';
import { Button } from '../components/Button';
import Container from '../components/Container';
import Input from '../components/Input';
import RoleList from '../components/roles/RoleList';
import type { Role, Permission } from '../types/api';

const RolesPage: React.FC = () => {
  const { addNotification } = useNotifications();
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  // @ts-expect-error - loading is used via setLoading but not read directly
  const [loading, setLoading] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [form, setForm] = useState({ name: '', display_name: '', max_storage_gb: 10, permissions: [] as string[] });
  const [showModal, setShowModal] = useState(false);
  const [newRole, setNewRole] = useState({ name: '', display_name: '', max_storage_gb: 10, permissions: [] as string[] });

  useEffect(() => {
    setLoading(true);
    Promise.all([
      apiService.getRoles(),
      apiService.getPermissions()
    ]).then(([rolesRes, permsRes]) => {
      setRoles(rolesRes.roles);
      setPermissions(permsRes.data.permissions);
      setLoading(false);
    });
  }, []);

  const handleEdit = (role: Role) => {
    setEditingRole(role);
    setForm({
      name: role.name,
      display_name: role.display_name,
      max_storage_gb: role.max_storage_gb || 10,
      permissions: role.permissions || []
    });
  };

  const handleDeleteRole = async (roleId: number) => {
    setLoading(true);
    try {
      await apiService.deleteRole(roleId);
      addNotification('success', 'Rol eliminado', 'El rol ha sido eliminado correctamente.');
      const res = await apiService.getRoles();
      setRoles(res.roles);
      if (editingRole?.id === roleId) setEditingRole(null);
    } catch (err) {
      addNotification('error', 'Error al eliminar rol', (err as Error)?.message || 'No se pudo eliminar el rol.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handlePermissionToggle = (permName: string) => {
    setForm(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permName)
        ? prev.permissions.filter(p => p !== permName)
        : [...prev.permissions, permName]
    }));
  };

  const handleSave = async () => {
    if (!editingRole) return;
    setLoading(true);
    await apiService.updateRole(editingRole.id, form);
    setEditingRole(null);
    const res = await apiService.getRoles();
    setRoles(res.roles);
    setLoading(false);
  };

  // Modal handlers
  const handleNewRoleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setNewRole(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };
  const handleNewPermissionToggle = (permName: string) => {
    setNewRole(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permName)
        ? prev.permissions.filter(p => p !== permName)
        : [...prev.permissions, permName]
    }));
  };
  const handleCreateRole = async () => {
    setLoading(true);
    try {
      await apiService.createRole(newRole);
      addNotification('success', 'Rol creado', 'El nuevo rol ha sido creado correctamente.');
      setNewRole({ name: '', display_name: '', max_storage_gb: 10, permissions: [] });
      setShowModal(false);
      const res = await apiService.getRoles();
      setRoles(res.roles);
    } catch (err: unknown) {
      const errorMessage = typeof err === 'object' && err !== null && 'message' in err
        ? (err as { message?: string }).message
        : 'No se pudo crear el rol.';
      addNotification('error', 'Error al crear rol', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container header="Administrador de Roles" description="Crea, edita y elimina roles, y gestiona sus permisos.">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-gray-800 rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-lg">Lista de Roles</h3>
            <Button variant="primary" onClick={() => setShowModal(true)}>Crear nuevo rol</Button>
          </div>
          <RoleList roles={roles} onEdit={handleEdit} onDelete={handleDeleteRole} />
        </div>
        <div className="bg-gray-800 rounded-lg shadow p-6">
          <h3 className="font-semibold mb-4 text-lg">{editingRole ? 'Editar Rol' : 'Selecciona un rol'}</h3>
          {editingRole && (
            <form onSubmit={e => { e.preventDefault(); handleSave(); }} className="space-y-4">
              <label className="block text-sm font-medium mb-1">Nombre
                <Input name="name" value={form.name} onChange={handleChange} required />
              </label>
              <label className="block text-sm font-medium mb-1">Nombre para mostrar
                <Input name="display_name" value={form.display_name} onChange={handleChange} required />
              </label>
              <label className="block text-sm font-medium mb-1">Almacenamiento máximo (GB)
                <Input name="max_storage_gb" type="number" value={form.max_storage_gb} onChange={handleChange} min={1} required />
              </label>
              <div className="mb-2">
                <span className="block text-sm font-medium mb-1">Permisos</span>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {permissions.map(perm => (
                    <li key={perm.name} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={form.permissions.includes(perm.name)}
                        onChange={() => handlePermissionToggle(perm.name)}
                        className="form-checkbox h-5 w-5 text-blue-600 rounded focus:ring-blue-500"
                        id={`perm-edit-${perm.name}`}
                      />
                      <label htmlFor={`perm-edit-${perm.name}`} className="text-gray-100 cursor-pointer">
                        {perm.name}
                      </label>
                    </li>
                  ))}
                </ul>
              </div>
              <Button type="submit" variant="primary" className="w-full">Guardar cambios</Button>
            </form>
          )}
        </div>
      </div>
      {/* Modal de creación de rol */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-gray-900 rounded-lg shadow-lg p-8 w-full max-w-lg">
            <h3 className="font-semibold text-lg mb-4">Crear nuevo rol</h3>
            <form onSubmit={e => { e.preventDefault(); handleCreateRole(); }} className="space-y-4">
              <label className="block text-sm font-medium mb-1">Nombre
                <Input name="name" value={newRole.name} onChange={handleNewRoleChange} required />
              </label>
              <label className="block text-sm font-medium mb-1">Nombre para mostrar
                <Input name="display_name" value={newRole.display_name} onChange={handleNewRoleChange} required />
              </label>
              <label className="block text-sm font-medium mb-1">Almacenamiento máximo (GB)
                <Input name="max_storage_gb" type="number" value={newRole.max_storage_gb} onChange={handleNewRoleChange} min={1} required />
              </label>
              <div className="mb-2">
                <span className="block text-sm font-medium mb-1">Permisos</span>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {permissions.map(perm => (
                    <li key={perm.name} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={newRole.permissions.includes(perm.name)}
                        onChange={() => handleNewPermissionToggle(perm.name)}
                        className="form-checkbox h-5 w-5 text-blue-600 rounded focus:ring-blue-500"
                        id={`perm-create-${perm.name}`}
                      />
                      <label htmlFor={`perm-create-${perm.name}`} className="text-gray-100 cursor-pointer">
                        {perm.name}
                      </label>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex gap-2">
                <Button type="submit" variant="primary" className="flex-1">Crear rol</Button>
                <Button type="button" variant="secondary" className="flex-1" onClick={() => setShowModal(false)}>Cancelar</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Container>
  );
};

export default RolesPage;
