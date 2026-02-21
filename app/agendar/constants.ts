import { Sun, CloudSun, Moon } from 'lucide-react';

export const PERIODS = [
  { id: 'manhã', label: 'Manhã', icon: Sun },
  { id: 'tarde', label: 'Tarde', icon: CloudSun },
  { id: 'noite', label: 'Noite', icon: Moon },
] as const;
