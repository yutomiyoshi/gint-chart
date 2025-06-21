import { Milestone } from './milestone.model';

export const SAMPLE_MILESTONES: Milestone[] = [
  {
    id: 6,
    project_id: 144,
    title: 'サンプルマイルストーン',
    description: 'これはサンプルです。',
    state: 'active',
    due_date: new Date('2025-06-30'),
  },
  {
    id: 7,
    project_id: 144,
    title: '次のバージョンのマイルストーン',
    description: '次のバージョンの開発に向けたマイルストーンです。',
    state: 'active',
    due_date: new Date('2025-07-20'),
  },
];
