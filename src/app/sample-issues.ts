import { Issue } from './issue';
import { GitLabApiIssue, User } from './git-lab-api/git-lab-issue.model';

const SAMPLE_USERS: User[] = [
  {
    id: 1,
    name: 'User1',
    username: 'user1',
    state: 'active',
    avatar_url: '',
    web_url: '',
  },
  {
    id: 2,
    name: 'User2',
    username: 'user2',
    state: 'active',
    avatar_url: '',
    web_url: '',
  },
];

const SAMPLE_ISSUES_ORIGIN: GitLabApiIssue[] = [
  {
    id: 1,
    iid: 101,
    project_id: 144,
    title: 'サンプルIssue 1',
    description: 'これはデバッグ用のサンプルIssueです。',
    state: 'opened',
    created_at: '2024-06-01T10:00:00Z',
    updated_at: '2024-06-01T12:00:00Z',
    closed_at: null,
    closed_by: null,
    labels: ['bug', 'urgent'],
    milestone: null,
    assignees: [SAMPLE_USERS[0]],
    author: SAMPLE_USERS[0],
    type: 'ISSUE',
    assignee: SAMPLE_USERS[0],
    user_notes_count: 0,
    upvotes: 0,
    downvotes: 0,
    due_date: null,
    confidential: false,
    discussion_locked: false,
    web_url: 'https://gitlab.com/project/144/issues/101',
    time_stats: {
      time_estimate: 0,
      total_time_spent: 0,
      human_time_estimate: null,
      human_total_time_spent: null,
    },
    task_completion_status: {
      count: 0,
      completed_count: 0,
    },
    has_tasks: false,
    _links: {
      self: '',
      notes: '',
      award_emoji: '',
      project: '',
    },
    references: {
      short: '',
      relative: '',
      full: '',
    },
    subscribed: false,
    moved_to_id: null,
    duplicated_from_id: null,
    service_desk_reply_to: null,
    severity: '',
  },
  {
    id: 2,
    iid: 102,
    project_id: 145,
    title: 'サンプルIssue 2',
    description: '2件目のサンプルIssueです。',
    state: 'closed',
    created_at: '2024-06-02T09:00:00Z',
    updated_at: '2024-06-02T11:00:00Z',
    closed_at: '2024-06-03T08:00:00Z',
    closed_by: null,
    labels: ['feature'],
    milestone: null,
    assignees: [SAMPLE_USERS[1]],
    author: SAMPLE_USERS[1],
    type: 'ISSUE',
    assignee: SAMPLE_USERS[1],
    user_notes_count: 0,
    upvotes: 0,
    downvotes: 0,
    due_date: null,
    confidential: false,
    discussion_locked: false,
    web_url: 'https://gitlab.com/project/145/issues/102',
    time_stats: {
      time_estimate: 0,
      total_time_spent: 0,
      human_time_estimate: null,
      human_total_time_spent: null,
    },
    task_completion_status: {
      count: 0,
      completed_count: 0,
    },
    has_tasks: false,
    _links: {
      self: '',
      notes: '',
      award_emoji: '',
      project: '',
    },
    references: {
      short: '',
      relative: '',
      full: '',
    },
    subscribed: false,
    moved_to_id: null,
    duplicated_from_id: null,
    service_desk_reply_to: null,
    severity: '',
  },
];

for (let i = 6; i <= 20; i++) {
  const isClosed = i % 3 === 0;
  const hasMilestone = i % 4 === 0;
  const hasAssignee = i % 2 === 0;
  const userIdx = i % SAMPLE_USERS.length;
  const startDate = `2024-06-${(i + 10).toString().padStart(2, '0')}`;
  const endDate = `2024-06-${(i + 12).toString().padStart(2, '0')}`;
  SAMPLE_ISSUES_ORIGIN.push({
    id: i,
    iid: 100 + i,
    project_id: 140 + (i % 5),
    title: `サンプルIssue ${i}`,
    description: `自動生成Issue${i}です。\n$start-date:${startDate}\n$end-date:${endDate}`,
    state: isClosed ? 'closed' : 'opened',
    created_at: `${startDate}T09:00:00Z`,
    updated_at: `${endDate}T12:00:00Z`,
    closed_at: isClosed ? `${endDate}T18:00:00Z` : null,
    closed_by: isClosed ? SAMPLE_USERS[userIdx] : null,
    labels: [isClosed ? 'done' : 'todo', i % 2 === 0 ? 'backend' : 'frontend'],
    milestone: hasMilestone
      ? {
          id: i,
          iid: i,
          title: `マイルストーン${i}`,
          description: `リリース${i}`,
          state: 'active',
          created_at: '2024-06-01T00:00:00Z',
          updated_at: '2024-06-01T00:00:00Z',
          due_date: endDate,
          start_date: startDate,
          web_url: '',
        }
      : null,
    assignees: hasAssignee ? [SAMPLE_USERS[userIdx]] : [],
    author: SAMPLE_USERS[(userIdx + 1) % SAMPLE_USERS.length],
    type: 'ISSUE',
    assignee: hasAssignee ? SAMPLE_USERS[userIdx] : null,
    user_notes_count: i % 5,
    upvotes: i % 2,
    downvotes: i % 3,
    due_date: endDate,
    confidential: false,
    discussion_locked: false,
    web_url: `https://gitlab.com/project/${140 + (i % 5)}/issues/${100 + i}`,
    time_stats: {
      time_estimate: 3600 * (i % 4),
      total_time_spent: 1800 * (i % 3),
      human_time_estimate: i % 4 ? `${i % 4}h` : null,
      human_total_time_spent: i % 3 ? `${(i % 3) * 30}m` : null,
    },
    task_completion_status: {
      count: i % 6,
      completed_count: i % 4,
    },
    has_tasks: i % 2 === 0,
    _links: {
      self: '',
      notes: '',
      award_emoji: '',
      project: '',
    },
    references: {
      short: '',
      relative: '',
      full: '',
    },
    subscribed: i % 2 === 0,
    moved_to_id: null,
    duplicated_from_id: null,
    service_desk_reply_to: null,
    severity: isClosed ? 'low' : 'medium',
  });
}

export const SAMPLE_ISSUES: Issue[] = SAMPLE_ISSUES_ORIGIN.map((origin) => ({
  id: String(origin.id),
  title: origin.title,
  start: undefined,
  end: undefined,
  assignee_id:
    Array.isArray(origin.assignees) && origin.assignees.length > 0
      ? origin.assignees[0].id
      : undefined,
  description: origin.description ?? '',
  project_id: origin.project_id,
  milestone_id: origin.milestone ? origin.milestone.id : undefined,
  origin,
}));
