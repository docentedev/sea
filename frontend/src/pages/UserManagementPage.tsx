import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import type { User, UsersResponse } from '../types/api';
import UserForm from '../components/UserForm';
import type { Role } from '../types/api';
import { Button } from '../components/Button';
import { LoadingSpinner, ErrorMessage } from '../components/LoadingAndError';
import { CardTableToggle } from '../components/ViewToggle';
import { Plus, Search, AlertTriangle, Clock, Edit, Trash2, Users, ChevronLeft, ChevronRight } from 'lucide-react';
import { DataTable } from '../components/data';
import type { Column } from '../components/data';

// example dateString: 2025-10-23 04:52:52
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const UserManagementPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [roles, setRoles] = useState<Role[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const usersPerPage = 12;

  const fetchUsers = React.useCallback(async (page: number = 1, searchQuery?: string) => {
    try {
      setLoading(true);
      setError(null);
      const response: UsersResponse = await apiService.getUsers(page, usersPerPage, searchQuery);
      setUsers(response.users);
      setTotalPages(response.pagination.totalPages);
      setTotalUsers(response.pagination.total);
      setCurrentPage(response.pagination.page);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  }, []);

  // Debounce search term
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch users when debounced search term changes
  React.useEffect(() => {
    fetchUsers(1, debouncedSearchTerm);
  }, [debouncedSearchTerm, fetchUsers]);

  const fetchRoles = async () => {
    try {
      const response = await apiService.getRoles();
      setRoles(response.roles);
    } catch (err) {
      console.error('Error fetching roles:', err);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchRoles();
  }, [fetchUsers]);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      fetchUsers(page);
    }
  };

  const handleDeleteUser = async (userId: number) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este usuario? Esta acción no se puede deshacer.')) {
      try {
        await apiService.deleteUser(userId);
        // Refresh the current page
        fetchUsers(currentPage);
      } catch (err) {
        console.error('Error deleting user:', err);
        setError(err instanceof Error ? err.message : 'Failed to delete user');
      }
    }
  };

  const handleCreateUserSuccess = () => {
    setShowCreateForm(false);
    // Refresh the users list
    fetchUsers(currentPage);
  };

  const handleCreateUserCancel = () => {
    setShowCreateForm(false);
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
  };

  const handleEditUserSuccess = () => {
    setEditingUser(null);
    // Refresh the users list
    fetchUsers(currentPage);
  };

  const handleEditUserCancel = () => {
    setEditingUser(null);
  };

  const getRoleBadgeColor = (roleName: string) => {
    switch (roleName.toLowerCase()) {
      case 'admin':
        return 'bg-red-900 text-red-100 border-red-700';
      case 'moderator':
        return 'bg-yellow-900 text-yellow-100 border-yellow-700';
      case 'user':
        return 'bg-green-900 text-green-100 border-green-700';
      default:
        return 'bg-gray-900 text-gray-200 border-gray-700';
    }
  };

  const userColumns: Column<User>[] = [
    {
      key: 'username',
      header: 'Usuario',
      render: (value, user) => (
        <div className="flex items-center">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mr-3">
            <span className="text-white font-semibold text-xs">
              {String(value).charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <div className="text-sm font-medium text-gray-100">{String(value)}</div>
            <div className="text-sm text-gray-400">ID: {user.id}</div>
          </div>
        </div>
      )
    },
    {
      key: 'email',
      header: 'Email',
      render: (value) => <span className="text-sm text-gray-100">{String(value)}</span>
    },
    {
      key: 'role',
      header: 'Rol',
      render: (value) => {
        const roleName = typeof value === 'object' ? (value as Role).name : String(value);
        const displayName = typeof value === 'object' ? (value as Role).display_name : String(value);
        return (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getRoleBadgeColor(roleName)}`}>
            {displayName}
          </span>
        );
      }
    },
    {
      key: 'created_at',
      header: 'Creado',
      render: (value) => (
        <span className="text-sm text-gray-400">
          {formatDate(String(value || ''))}
        </span>
      )
    },
    {
      key: 'actions',
      header: 'Acciones',
      render: (_, user) => (
        <div className="space-x-2">
          <Button
            onClick={() => handleEditUser(user)}
            variant="outline"
            size="sm"
          >
            Editar
          </Button>
          <Button
            onClick={() => handleDeleteUser(user.id)}
            variant="danger"
            size="sm"
          >
            Eliminar
          </Button>
        </div>
      )
    }
  ];

  if (loading && users.length === 0) {
    return <LoadingSpinner message="Cargando usuarios..." />;
  }

  if (error && users.length === 0) {
    return (
      <ErrorMessage
        message={error}
        onRetry={() => fetchUsers()}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      {/* Header */}
      <div className="bg-gray-800 shadow-sm border-b border-gray-700">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-100">User Management</h1>
              <p className="mt-1 text-sm text-gray-400">
                Manage users, roles, and permissions
              </p>
            </div>
            <Button
              onClick={() => setShowCreateForm(true)}
              variant="primary"
              size="lg"
              className="flex items-center space-x-2"
            >
              <Plus className="w-5 h-5" />
              <span>Nuevo Usuario</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        {/* Controls */}
        <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Buscar usuarios..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
            <CardTableToggle
              value={viewMode}
              onChange={setViewMode}
            />
          </div>
          <div className="text-sm text-gray-400">
            {totalUsers} usuario{totalUsers !== 1 ? 's' : ''} total
          </div>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <AlertTriangle className="h-5 w-5 text-yellow-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-800">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Users Display */}
        {viewMode === 'cards' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {users.map((user) => (
              <div key={user.id} className="bg-gray-800 rounded-lg shadow-sm border border-gray-700 hover:shadow-md transition-shadow duration-200">
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-semibold text-sm">
                          {user.username.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-100">{user.username}</h3>
                        <p className="text-sm text-gray-400">{user.email}</p>
                      </div>
                    </div>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getRoleBadgeColor(
                      typeof user.role === 'object' ? user.role.name : user.role
                    )}`}>
                      {typeof user.role === 'object' ? user.role.display_name : user.role}
                    </span>
                  </div>

                  <div className="mt-4 flex items-center text-sm text-gray-400">
                    <Clock className="w-4 h-4 mr-1" />
                    Creado {new Date(user.createdAt || user.created_at || '').toLocaleDateString('es-ES')}
                  </div>

                  <div className="mt-4 flex space-x-2">
                    <Button
                      onClick={() => handleEditUser(user)}
                      variant="outline"
                      size="sm"
                      className="flex-1 flex items-center justify-center space-x-1"
                    >
                      <Edit className="w-4 h-4" />
                      <span>Editar</span>
                    </Button>
                    <Button
                      onClick={() => handleDeleteUser(user.id)}
                      variant="danger"
                      size="sm"
                      className="flex-1 flex items-center justify-center space-x-1"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Eliminar</span>
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <DataTable
            data={users}
            columns={userColumns}
            keyField="id"
            loading={false}
            emptyMessage="No se encontraron usuarios"
          />
        )}

        {/* Empty State */}
        {users.length === 0 && !loading && (
          <div className="text-center py-12">
            <Users className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-100">No se encontraron usuarios</h3>
            <p className="mt-1 text-sm text-gray-400">
              {searchTerm ? 'Intenta con otros términos de búsqueda.' : 'Comienza creando un nuevo usuario.'}
            </p>
            {!searchTerm && (
              <div className="mt-6">
                <Button onClick={() => setShowCreateForm(true)} variant="primary">
                  Crear primer usuario
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-8 flex items-center justify-between">
            <div className="text-sm text-gray-300">
              Mostrando {((currentPage - 1) * usersPerPage) + 1} a {Math.min(currentPage * usersPerPage, totalUsers)} de {totalUsers} usuarios
            </div>
            <div className="flex items-center space-x-2">
              <Button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1 || loading}
                variant="outline"
                size="sm"
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Anterior
              </Button>

              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                return (
                  <Button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    disabled={loading}
                    variant={currentPage === pageNum ? 'primary' : 'outline'}
                    size="sm"
                  >
                    {pageNum}
                  </Button>
                );
              })}

              <Button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages || loading}
                variant="outline"
                size="sm"
              >
                Siguiente
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        )}

        {/* Modals */}
        {showCreateForm && (
          <UserForm
            onSuccess={handleCreateUserSuccess}
            onCancel={handleCreateUserCancel}
            roles={roles}
          />
        )}

        {editingUser && (
          <UserForm
            user={editingUser}
            onSuccess={handleEditUserSuccess}
            onCancel={handleEditUserCancel}
            roles={roles}
          />
        )}
      </div>
    </div>
  );
};

export default UserManagementPage;