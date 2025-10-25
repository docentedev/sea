import React, { useState } from 'react';
import { apiService } from '../services/api';
import type { CreateUserRequest, UpdateUserRequest, Role, User } from '../types/api';
import { Button } from './Button';
import Input from './Input';
import Select from './Select';
import PasswordInput from './PasswordInput';
import FormField from './FormField';
import { User as UserIcon, X, AlertTriangle, Mail, Lock, Check, Loader } from 'lucide-react';

interface UserFormProps {
  onSuccess: () => void;
  onCancel: () => void;
  roles?: Role[];
  user?: User; // Para edición
}

const UserForm: React.FC<UserFormProps> = ({ onSuccess, onCancel, roles = [], user }) => {
  const isEditing = !!user;

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: undefined as number | undefined,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);

  // Inicializar formulario cuando se monta o cambia el usuario
  React.useEffect(() => {
    if (isEditing && user) {
      setFormData({
        username: user.username,
        email: user.email,
        password: '', // No mostrar contraseña existente
        role: typeof user.role === 'object' ? user.role.id : undefined,
      });
    } else {
      setFormData({
        username: '',
        email: '',
        password: '',
        role: undefined,
      });
    }
    setErrors({});
    setTouched({});
  }, [isEditing, user]);

  const validateField = (name: string, value: string | number | undefined) => {
    const newErrors = { ...errors };

    switch (name) {
      case 'username':
        if (!value || String(value).trim().length === 0) {
          newErrors.username = 'El nombre de usuario es obligatorio';
        } else if (String(value).length < 3) {
          newErrors.username = 'El nombre de usuario debe tener al menos 3 caracteres';
        } else if (!/^[a-zA-Z0-9_]+$/.test(String(value))) {
          newErrors.username = 'El nombre de usuario solo puede contener letras, números y guiones bajos';
        } else {
          delete newErrors.username;
        }
        break;

      case 'email':
        if (!value || String(value).trim().length === 0) {
          newErrors.email = 'El email es obligatorio';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value))) {
          newErrors.email = 'Ingresa un email válido';
        } else {
          delete newErrors.email;
        }
        break;

      case 'password':
        if (!isEditing) {
          if (!value || String(value).length === 0) {
            newErrors.password = 'La contraseña es obligatoria';
          } else if (String(value).length < 8) {
            newErrors.password = 'La contraseña debe tener al menos 8 caracteres';
          } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(String(value))) {
            newErrors.password = 'La contraseña debe contener mayúsculas, minúsculas y números';
          } else {
            delete newErrors.password;
          }
        }
        break;

      case 'role':
        if (!value) {
          newErrors.role = 'Debes seleccionar un rol';
        } else {
          delete newErrors.role;
        }
        break;
    }

    setErrors(newErrors);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const processedValue = name === 'role' ? (value ? parseInt(value, 10) : undefined) : value;

    setFormData(prev => ({
      ...prev,
      [name]: processedValue,
    }));

    if (touched[name]) {
      validateField(name, processedValue);
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    validateField(name, formData[name as keyof typeof formData]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Marcar todos los campos como tocados para mostrar errores
    const allTouched = Object.keys(formData).reduce((acc, key) => {
      acc[key] = true;
      return acc;
    }, {} as Record<string, boolean>);
    setTouched(allTouched);

    // Validar todos los campos
    Object.keys(formData).forEach(key => {
      validateField(key, formData[key as keyof typeof formData]);
    });

    // Si hay errores, no continuar
    if (Object.keys(errors).length > 0) {
      return;
    }

    setLoading(true);

    try {
      if (isEditing && user) {
        // Para edición
        const updateData: UpdateUserRequest = {
          username: formData.username,
          email: formData.email,
          role: formData.role,
        };
        await apiService.updateUser(user.id, updateData);
      } else {
        // Para creación
        const createData: CreateUserRequest = {
          username: formData.username,
          email: formData.email,
          password: formData.password,
          role: formData.role,
        };
        await apiService.createUser(createData);
      }

      onSuccess();
    } catch (err) {
      console.error('Error saving user:', err);
      const errorMessage = err instanceof Error ? err.message : 'Error al guardar el usuario';
      setErrors({ submit: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-hidden border border-gray-700">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <UserIcon className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-100">
                  {isEditing ? 'Editar Usuario' : 'Crear Nuevo Usuario'}
                </h2>
                <p className="text-sm text-gray-400">
                  {isEditing ? 'Modifica la información del usuario' : 'Agrega un nuevo usuario al sistema'}
                </p>
              </div>
            </div>
            <button
              onClick={onCancel}
              className="text-gray-400 hover:text-gray-300 transition-colors duration-200 p-1 rounded-full hover:bg-gray-700"
              aria-label="Close modal"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Form */}
        <div className="px-6 py-6 overflow-y-auto max-h-[calc(90vh-8rem)]">
          {errors.submit && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <AlertTriangle className="h-5 w-5 text-red-400" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-800">{errors.submit}</p>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Username Field */}
            <FormField
              label="Nombre de usuario"
              required
              error={errors.username && touched.username ? errors.username : undefined}
            >
              <Input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Ingresa el nombre de usuario"
                error={!!(errors.username && touched.username)}
                startIcon={
                  <UserIcon className="h-5 w-5 text-gray-400" />
                }
                required
              />
            </FormField>

            {/* Email Field */}
            <FormField
              label="Correo electrónico"
              required
              error={errors.email && touched.email ? errors.email : undefined}
            >
              <Input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="usuario@ejemplo.com"
                error={!!(errors.email && touched.email)}
                startIcon={
                  <Mail className="h-5 w-5 text-gray-400" />
                }
                required
              />
            </FormField>

            {/* Password Field */}
            {!isEditing && (
              <FormField
                label="Contraseña"
                required
                error={errors.password && touched.password ? errors.password : undefined}
                helpText="La contraseña debe tener al menos 8 caracteres con mayúsculas, minúsculas y números"
              >
                <PasswordInput
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Mínimo 8 caracteres"
                  error={!!(errors.password && touched.password)}
                  startIcon={
                    <Lock className="h-5 w-5 text-gray-400" />
                  }
                  required
                />
              </FormField>
            )}

            {/* Role Field */}
            {roles.length > 0 && (
              <FormField
                label="Rol"
                required
                error={errors.role && touched.role ? errors.role : undefined}
              >
                <Select
                  id="role"
                  name="role"
                  value={formData.role || ''}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={!!(errors.role && touched.role)}
                  startIcon={
                    <Check className="h-5 w-5 text-gray-400" />
                  }
                  required
                >
                  <option value="">Selecciona un rol</option>
                  {roles.map((role) => (
                    <option key={role.id} value={role.id}>
                      {role.display_name}
                    </option>
                  ))}
                </Select>
              </FormField>
            )}

            {/* Actions */}
            <div className="flex space-x-3 pt-6 border-t border-gray-200">
              <Button
                type="button"
                onClick={onCancel}
                variant="outline"
                className="flex-1"
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                variant="primary"
                className="flex-1"
                disabled={loading || Object.keys(errors).length > 0}
              >
                {loading ? (
                  <div className="flex items-center space-x-2">
                    <Loader className="animate-spin h-4 w-4" />
                    <span>{isEditing ? 'Guardando...' : 'Creando...'}</span>
                  </div>
                ) : (
                  <span>{isEditing ? 'Guardar Cambios' : 'Crear Usuario'}</span>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UserForm;