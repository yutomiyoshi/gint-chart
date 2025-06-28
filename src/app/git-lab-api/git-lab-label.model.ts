export interface GitLabLabel {
  id: number;
  name: string;
  description: string | null;
  description_html: string;
  text_color: string;
  color: string;
  subscribed: boolean;
  priority: number | null;
  is_project_label: boolean;
}
