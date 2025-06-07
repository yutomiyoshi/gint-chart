// GitLab APIのissueレスポンス型（必要なフィールドのみ例示）
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
  labels: string[];
  milestone?: number | null;
  assignees: number[];
  author: number;
  web_url: string;
  due_date?: string | null;
}
