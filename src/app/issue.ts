import { GanttItem } from '@worktile/gantt/class/item';
import { GitLabApiIssue } from '@src/app/git-lab-api/git-lab-issue.model';
import { isUndefined } from './utils';

export interface Issue extends GanttItem<GitLabApiIssue> {
  /**
   * IssueのID
   * @type {string}
   */
  id: string;

  /**
   * Issueのタイトル
   * @type {string}
   */
  title: string;

  /**
   * 開始日
   * @type {Date | undefined}
   */
  start: Date | undefined;

  /**
   * 終了日
   * @type {Date | undefined}
   */
  end: Date | undefined;

  /**
   * 担当者
   * @type {number | undefined}
   */
  assignee_id: number | undefined;

  /**
   * 説明
   * @type {string}
   */
  description: string;

  /**
   * プロジェクトID
   * @type {number}
   */
  project_id: number;

  /**
   * マイルストーンID
   * @type {number | undefined}
   */
  milestone_id: number | undefined;

  /**
   * オリジナル
   * @type {GitLabApiIssue}
   */
  origin: GitLabApiIssue;
}

// GitLab APIのissueレスポンス型からIssue型へ変換する関数
export function convertJsonToIssue(apiIssue: GitLabApiIssue): Issue | null {
  // 必須フィールドのバリデーション
  if (
    typeof apiIssue.id !== 'number' ||
    typeof apiIssue.project_id !== 'number' ||
    typeof apiIssue.title !== 'string' ||
    typeof apiIssue.description !== 'string'
  ) {
    return null;
  }

  // descriptionから$start-date:yyyy-mm-dd, $end-date:yyyy-mm-ddを抽出
  let start: Date | undefined = undefined;
  let end: Date | undefined = undefined;
  if (typeof apiIssue.description === 'string') {
    /**
     * 開始日の取得
     */
    const startMatch = apiIssue.description.match(
      /\$start-date:([0-9]{4}-[0-9]{2}-[0-9]{2})/
    );
    if (startMatch) {
      start = new Date(startMatch[1]);
    }

    /**
     * 終了日の取得
     * 開始日より前の場合は無効とする
     */
    const endMatch = apiIssue.description.match(
      /\$end-date:([0-9]{4}-[0-9]{2}-[0-9]{2})/
    );
    if (endMatch) {
      const endDate = new Date(endMatch[1]);
      // 開始日が設定されており、終了日が開始日より前の場合は無効
      if (!isUndefined(start) && endDate >= start) {
        end = endDate;
      }
    }
  }

  // assignee_idは最初のassignees配列のidを使う（なければundefined）
  const assignee_id =
    Array.isArray(apiIssue.assignees) && apiIssue.assignees.length > 0
      ? apiIssue.assignees[0].id
      : undefined;

  return {
    id: String(apiIssue.id),
    title: apiIssue.title,
    start,
    end,
    assignee_id,
    description: apiIssue.description,
    project_id: apiIssue.project_id,
    milestone_id: apiIssue.milestone ? apiIssue.milestone.id : undefined,
    origin: apiIssue,
    // GanttItemの他のプロパティは必要に応じて追加
  };
}
