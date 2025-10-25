import React from 'react';
import { Card } from '../layout/Card';

export interface DataGridProps<T> {
  data: T[];
  keyField: keyof T;
  renderCard: (item: T) => React.ReactNode;
  loading?: boolean;
  emptyMessage?: string;
  columns?: number;
  gap?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const gapClasses = {
  sm: 'gap-4',
  md: 'gap-6',
  lg: 'gap-8',
  xl: 'gap-10'
};

const columnsClasses = {
  1: 'grid-cols-1',
  2: 'grid-cols-1 md:grid-cols-2',
  3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
  4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
  5: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5',
  6: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6'
};

export function DataGrid<T>({
  data,
  keyField,
  renderCard,
  loading = false,
  emptyMessage = 'No hay datos disponibles',
  columns = 3,
  gap = 'md',
  className = ''
}: DataGridProps<T>) {
  if (loading) {
    return (
      <div className={`grid ${columnsClasses[columns as keyof typeof columnsClasses]} ${gapClasses[gap]} ${className}`}>
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className={`grid ${columnsClasses[columns as keyof typeof columnsClasses]} ${gapClasses[gap]} ${className}`}>
      {data.map((item) => (
        <div key={String(item[keyField])}>
          {renderCard(item)}
        </div>
      ))}
    </div>
  );
}