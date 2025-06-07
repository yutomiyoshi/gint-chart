export interface Issue {
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

// GitLab APIのissueレスポンス型からIssue型へ変換する関数
export function convertJsonToIssue(apiIssue: any): Issue | null {
  if (
    typeof apiIssue.id !== 'number' ||
    typeof apiIssue.iid !== 'number' ||
    typeof apiIssue.project_id !== 'number' ||
    typeof apiIssue.title !== 'string' ||
    typeof apiIssue.state !== 'string' ||
    typeof apiIssue.created_at !== 'string' ||
    typeof apiIssue.updated_at !== 'string' ||
    !Array.isArray(apiIssue.labels) ||
    !Array.isArray(apiIssue.assignees) ||
    typeof apiIssue.author !== 'number' ||
    typeof apiIssue.web_url !== 'string'
  ) {
    return null;
  }
  return {
    id: apiIssue.id,
    iid: apiIssue.iid,
    project_id: apiIssue.project_id,
    title: apiIssue.title,
    description: apiIssue.description,
    state: apiIssue.state,
    created_at: apiIssue.created_at,
    updated_at: apiIssue.updated_at,
    closed_at: apiIssue.closed_at,
    labels: apiIssue.labels,
    milestone: apiIssue.milestone,
    assignees: apiIssue.assignees,
    author: apiIssue.author,
    web_url: apiIssue.web_url,
    due_date: apiIssue.due_date,
  };
}
