export interface GitLabApiMilestone {
  id: number;
  iid: number;
  project_id: number;
  title: string;
  description: string;
  state: string;
  created_at: string;
  updated_at: string;
  due_date: string | null;
  start_date: string | null;
  expired: boolean;
  web_url: string;
}
