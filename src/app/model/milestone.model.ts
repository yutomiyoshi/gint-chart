import { GitLabApiMilestone } from '../git-lab-api/git-lab-milestone.model';
import { isNull, isUndefined } from '../utils/utils';

export interface Milestone {
  /**
   * id
   * @type {number}
   */
  id: number;

  /**
   * 所属プロジェクトのid
   * @type {number}
   */
  project_id: number;

  /**
   * タイトル
   * @type {string}
   */
  title: string;

  /**
   * 説明
   * @type {string}
   */
  description: string;

  /**
   * 状態
   * @type {string}
   */
  state: string;

  /**
   * 期限日
   * @type {Date | undefined}
   */
  due_date: Date | undefined;
}

/**
 * GitLab APIのmilestoneレスポンス型からMilestone型へ変換する関数
 * @param apiMilestone GitLab APIのmilestoneレスポンス型
 * @returns Milestone型
 */
export function convertJsonToMilestone(
  apiMilestone: GitLabApiMilestone
): Milestone {
  return {
    id: apiMilestone.id,
    project_id: apiMilestone.project_id,
    title: apiMilestone.title,
    description: apiMilestone.description,
    state: apiMilestone.state,
    due_date:
      isUndefined(apiMilestone.due_date) || isNull(apiMilestone.due_date)
        ? undefined
        : new Date(apiMilestone.due_date),
  };
}
