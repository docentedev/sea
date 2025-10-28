import React from 'react';
import { Button } from '../Button';
import type { Role } from '../../types/api';

interface RoleListProps {
  roles: Role[];
  onEdit: (role: Role) => void;
  onDelete: (roleId: number) => void;
}

const RoleList: React.FC<RoleListProps> = ({ roles, onEdit, onDelete }) => (
  <ul className="space-y-2 mb-6">
    {roles.map(role => (
      <li key={role.id} className="flex items-center gap-2">
        <Button onClick={() => onEdit(role)} variant="secondary" className="flex-1 text-left">
          {role.display_name} <span className="text-xs text-gray-400 ml-2">({role.name})</span>
        </Button>
        <Button onClick={() => onDelete(role.id)} variant="danger" size="sm">Eliminar</Button>
      </li>
    ))}
  </ul>
);

export default RoleList;
