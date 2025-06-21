import { Milestone } from './milestone.model';

export const SAMPLE_MILESTONES: Milestone[] = [
  {
    id: 6,
    iid: 1,
    project_id: 144,
    title: 'サンプルマイルストーン',
    description: 'これはサンプルです。',
    state: 'active',
    created_at: '2025-06-16T23:59:56.492Z',
    updated_at: '2025-06-16T23:59:56.492Z',
    due_date: '2025-06-20',
    start_date: '2025-06-17',
    expired: false,
    web_url: 'http://10.20.65.8/gitlab/project/7024000250/-/milestones/1',
  },
  {
    id: 7,
    iid: 2,
    project_id: 144,
    title: '次のバージョンのマイルストーン',
    description: '次のバージョンの開発に向けたマイルストーンです。',
    state: 'active',
    created_at: '2025-06-21T00:00:00.000Z',
    updated_at: '2025-06-21T00:00:00.000Z',
    due_date: '2025-07-20',
    start_date: '2025-06-21',
    expired: false,
    web_url: 'http://10.20.65.8/gitlab/project/7024000250/-/milestones/2',
  },
];
