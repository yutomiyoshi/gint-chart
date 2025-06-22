import { GitLabApiIssue } from '@src/app/git-lab-api/git-lab-issue.model';
import { isUndefined } from '@src/app/utils/utils';

// $$start_date:yyyy-mm-dd$$や$$end_date:yyyy-mm-dd$$のパターンは不変なので関数外で定義
const startDatePattern = /\$\$start-date:(\d{4}-\d{2}-\d{2})\$\$/;
const endDatePattern = /\$\$end-date:(\d{4}-\d{2}-\d{2})\$\$/;

export interface Issue {
  /**
   * id（グローバルID）
   * @type {number}
   */
  id: number;

  /**
   * iid（内部ID、プロジェクト内での連番）
   * @type {number}
   */
  iid: number;

  /**
   * project_id
   * @type {number}
   */
  project_id: number;

  /**
   * milestone_id
   * @type {number | null}
   */
  milestone_id: number | null;

  /**
   * title
   * @type {string}
   */
  title: string;

  /**
   * description
   * @type {string}
   */
  description: string;

  /**
   * start_date
   * @type {Date | undefined}
   */
  start_date: Date | undefined;

  /**
   * end_date
   * @type {Date | undefined}
   */
  end_date: Date | undefined;

  /**
   * state
   * @type {string}
   */
  state: 'opened' | 'closed' | string;

  /**
   * label
   * @type {string[]}
   */
  labels: string[];

  /**
   * assignee
   * @type {string | undefined}
   */
  assignee: string | undefined;
}

// GitLab APIのissueレスポンス型からIssue型へ変換する関数
export function convertJsonToIssue(apiIssue: GitLabApiIssue): Issue | null {
  // 必須フィールドのバリデーション
  if (
    typeof apiIssue.id !== 'number' ||
    typeof apiIssue.iid !== 'number' ||
    typeof apiIssue.project_id !== 'number' ||
    typeof apiIssue.title !== 'string' ||
    typeof apiIssue.state !== 'string' ||
    !Array.isArray(apiIssue.labels)
  ) {
    return null;
  }

  // milestone_idの取得
  const milestone_id = apiIssue.milestone ? apiIssue.milestone.id : null;

  let description =
    typeof apiIssue.description === 'string' ? apiIssue.description : '';

  // start_date, end_dateの取得（description内の記法のみ使用）
  let start_date: Date | undefined = undefined;
  let end_date: Date | undefined = undefined;

  const startMatch = description.match(startDatePattern);
  if (startMatch) {
    const d = new Date(startMatch[1]);
    if (!isNaN(d.getTime())) {
      start_date = d;
      // start_dateが取得できた場合はdescriptionから該当部分を削除
      description = description.replace(startDatePattern, '');
    }
  }

  const endMatch = description.match(endDatePattern);
  if (endMatch) {
    const d = new Date(endMatch[1]);
    if (!isNaN(d.getTime())) {
      end_date = d;
      // end_dateが取得できた場合はdescriptionから該当部分を削除
      description = description.replace(endDatePattern, '');
    }
  }
  if (
    !isUndefined(start_date) &&
    !isUndefined(end_date) &&
    end_date < start_date
  ) {
    end_date = undefined;
  }

  const assignee = apiIssue.assignee ? apiIssue.assignee.name : undefined;

  return {
    id: apiIssue.id,
    iid: apiIssue.iid,
    project_id: apiIssue.project_id,
    milestone_id,
    title: apiIssue.title,
    description: description,
    start_date,
    end_date,
    state: apiIssue.state,
    labels: apiIssue.labels,
    assignee,
  };
}
