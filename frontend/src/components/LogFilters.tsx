import React, { useState } from "react";

export interface LogFiltersState {
  level?: string;
  service?: string;
  userId?: number;
  startDate?: string;
  endDate?: string;
}

export interface LogFiltersProps {
  filters: LogFiltersState;
  onChange: (filters: LogFiltersState) => void;
}

const LEVEL_OPTIONS = ["", "info", "warn", "error", "debug"];

const LogFilters: React.FC<LogFiltersProps> = ({ filters, onChange }) => {
  const [localFilters, setLocalFilters] = useState<LogFiltersState>(filters);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setLocalFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleUserIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLocalFilters((prev) => ({ ...prev, userId: value ? Number(value) : undefined }));
  };

  const handleApply = () => {
    onChange(localFilters);
  };

  return (
    <div className="flex flex-wrap gap-4 items-end mb-4">
      <div>
        <label className="block text-sm font-medium">Nivel</label>
        <select name="level" value={localFilters.level || ""} onChange={handleChange} className="border rounded px-2 py-1">
          {LEVEL_OPTIONS.map((opt) => (
            <option key={opt} value={opt}>{opt ? opt : "Todos"}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium">Servicio</label>
        <input name="service" value={localFilters.service || ""} onChange={handleChange} className="border rounded px-2 py-1" placeholder="service" />
      </div>
      <div>
        <label className="block text-sm font-medium">Usuario ID</label>
        <input name="userId" type="number" value={localFilters.userId || ""} onChange={handleUserIdChange} className="border rounded px-2 py-1" placeholder="userId" />
      </div>
      <div>
        <label className="block text-sm font-medium">Desde</label>
        <input name="startDate" type="date" value={localFilters.startDate || ""} onChange={handleChange} className="border rounded px-2 py-1" />
      </div>
      <div>
        <label className="block text-sm font-medium">Hasta</label>
        <input name="endDate" type="date" value={localFilters.endDate || ""} onChange={handleChange} className="border rounded px-2 py-1" />
      </div>
      <button type="button" className="bg-blue-600 text-white px-4 py-1 rounded" onClick={handleApply}>Filtrar</button>
    </div>
  );
};

export default LogFilters;
