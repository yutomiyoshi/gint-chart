// GitLab APIのissueレスポンス型（必要なフィールドのみ例示）
export interface GitLabUser {
  id: number;
  username: string;
  name: string;
  state: string;
  avatar_url: string | null;
  web_url: string;
}

export interface GitLabMilestone {
  id: number;
  iid: number;
  project_id: number;
  title: string;
  description: string;
  state: string;
  created_at: string;
  updated_at: string;
  due_date: string | null;
  closed_at: string | null;
}

export interface GitLabReferences {
  short: string;
  relative: string;
  full: string;
}

export interface GitLabTimeStats {
  time_estimate: number;
  total_time_spent: number;
  human_time_estimate: string | null;
  human_total_time_spent: string | null;
}

export interface GitLabLinks {
  self: string;
  notes: string;
  award_emoji: string;
  project: string;
  closed_as_duplicate_of?: string;
}

export interface GitLabTaskCompletionStatus {
  count: number;
  completed_count: number;
}

export interface GitLabIteration {
  id: number;
  iid: number;
  sequence: number;
  group_id: number;
  title: string | null;
  description: string | null;
  state: number;
  created_at: string;
  updated_at: string;
  start_date: string;
  due_date: string;
  web_url: string;
}

export interface GitLabEpic {
  id: number;
  iid: number;
  title: string;
  url: string;
  group_id: number;
}

export interface GitLabApiIssue {
  id: number;
  iid: number;
  project_id: number;
  title: string;
  description: string | null;
  state: string;
  created_at: string;
  updated_at: string;
  closed_at: string | null;
  closed_by: GitLabUser | null;
  labels: string[];
  milestone: GitLabMilestone | null;
  assignees: GitLabUser[];
  assignee?: GitLabUser | null; // deprecated
  author: GitLabUser;
  web_url: string;
  due_date?: string | null;
  upvotes: number;
  downvotes: number;
  merge_requests_count: number;
  user_notes_count: number;
  subscribed: boolean;
  imported: boolean;
  imported_from?: string | null;
  confidential: boolean;
  discussion_locked: boolean | null;
  issue_type: string;
  severity: string;
  references: GitLabReferences;
  time_stats: GitLabTimeStats;
  has_tasks: boolean;
  task_status: string;
  _links: GitLabLinks;
  task_completion_status: GitLabTaskCompletionStatus;
  weight?: number | null;
  health_status?: string | null;
  iteration?: GitLabIteration | null;
  epic?: GitLabEpic | null;
  moved_to_id?: number | null;
  service_desk_reply_to?: string | null;
  blocking_issues_count?: number;
}
