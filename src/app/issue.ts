export interface GitlabIssue {
  id: number; // グローバルID
  iid: number; // プロジェクト内ID
  project_id: number;
  title: string;
  description: string | null;
  state: 'opened' | 'closed' | string;
  created_at: string; // ISO8601
  updated_at: string; // ISO8601
  closed_at: string | null; // ISO8601 or null
  labels: string[];
  milestone?: number | null;
  assignees: number[];
  author: number;
  web_url: string;
  due_date?: string | null;
}
