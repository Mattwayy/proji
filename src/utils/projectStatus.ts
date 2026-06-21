import type { Project } from '../types';

export const STATUS_LABELS: Record<Project['status'], string> = {
  'Planning':    'Планирование',
  'In Progress': 'В работе',
  'Blocked':     'Заблокирован',
  'On Hold':     'На паузе',
  'Completed':   'Завершён',
};

export const STATUS_COLORS: Record<Project['status'], string> = {
  'Planning':    'bg-yellow-100 text-yellow-600',
  'In Progress': 'bg-blue-100 text-blue-600',
  'Blocked':     'bg-red-100 text-red-600',
  'On Hold':     'bg-slate-100 text-slate-500',
  'Completed':   'bg-green-100 text-green-600',
};

export const STATUS_DOT: Record<Project['status'], string> = {
  'Planning':    'bg-yellow-500',
  'In Progress': 'bg-blue-500',
  'Blocked':     'bg-red-500',
  'On Hold':     'bg-slate-400',
  'Completed':   'bg-green-500',
};

export const STATUS_OPTIONS = Object.keys(STATUS_LABELS) as Project['status'][];
