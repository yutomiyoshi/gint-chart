/**
 * GitLab APIのissueレスポンス型
 * @see https://docs.gitlab.com/ee/api/issues.html
 */
export interface GitLabApiIssue {
  id: number;
  iid: number;
  project_id: number;
  title: string;
  description: string | null;
  state: 'opened' | 'closed';
  created_at: string; // ISO 8601 datetime string
  updated_at: string; // ISO 8601 datetime string
  closed_at: string | null; // ISO 8601 datetime string
  closed_by: any | null; // This field's structure is not fully visible, could be a User object
  labels: string[]; // Array of strings for labels
  milestone: {
    id: number;
    iid: number;
    title: string;
    description: string;
    state: 'active' | 'closed';
    created_at: string;
    updated_at: string;
    due_date: string | null; // YYYY-MM-DD
    start_date: string | null; // YYYY-MM-DD
    web_url: string;
  } | null;
  assignees: User[]; // Array of User objects
  author: User;
  type: 'ISSUE'; // Based on the observed value
  assignee: User | null; // Single assignee for older GitLab versions, or if only one is assigned
  user_notes_count: number;
  upvotes: number;
  downvotes: number;
  due_date: string | null; // YYYY-MM-DD
  confidential: boolean;
  discussion_locked: boolean;
  web_url: string;
  time_stats: {
    time_estimate: number; // in seconds
    total_time_spent: number; // in seconds
    human_time_estimate: string | null;
    human_total_time_spent: string | null;
  };
  task_completion_status: {
    count: number;
    completed_count: number;
  };
  has_tasks: boolean;
  _links: {
    self: string;
    notes: string;
    award_emoji: string;
    project: string;
  };
  references: {
    short: string;
    relative: string;
    full: string;
  };
  subscribed: boolean; // Not explicitly visible, but typical for issues
  moved_to_id: number | null;
  duplicated_from_id: number | null; // Not explicitly visible, but typical
  service_desk_reply_to: string | null;
  severity: string; // Based on the observed "UNKNOWN"
}

export interface User {
  id: number;
  name: string;
  username: string;
  state: 'active' | 'locked' | 'blocked';
  avatar_url: string;
  web_url: string;
}
