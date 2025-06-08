import { GanttItem } from '@worktile/gantt/class/item';
import { GitLabApiIssue } from '@src/app/git-lab-api/git-lab-issue.model';

export interface Issue extends GanttItem<GitLabApiIssue> {
  // GanttItemに含まれない独自プロパティがあればここに追加
}

// GitLab APIのissueレスポンス型からIssue型へ変換する関数
export function convertJsonToIssue(apiIssue: GitLabApiIssue): Issue | null {
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
    id: String(apiIssue.id), // GanttItemのidはstring型
    title: apiIssue.title,
    origin: apiIssue,
    // 必要に応じて他のGanttItemプロパティもここでセット
  };
}
