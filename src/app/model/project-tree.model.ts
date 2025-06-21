import { Project } from './project.model';
import { Milestone } from './milestone.model';
import { Issue } from './issue.model';

/**
 * プロジェクトツリー構造を表現するインターフェース
 */
export interface ProjectTree {
  /**
   * プロジェクト情報
   */
  project: Project;

  /**
   * プロジェクトに属するマイルストーンのツリー配列
   */
  milestones: MilestoneTree[];
}

/**
 * マイルストーンツリー構造を表現するインターフェース
 */
export interface MilestoneTree {
  /**
   * マイルストーン情報
   */
  milestone: Milestone;

  /**
   * マイルストーンに属するイシューの配列
   */
  issues: Issue[];
}

/**
 * フラットなデータからツリー構造を構築する関数
 *
 * 注意: この関数では引数の構造体（Project, Milestone, Issue）を新しくインスタンス化していません。
 * 理由:
 * 1. これらのオブジェクトは既にストアで一元管理されており、参照の共有が意図的な設計
 * 2. メモリ効率性の向上（同じデータの重複を避ける）
 * 3. ストアの変更通知が自動的にツリー構造に反映される
 * 4. 通常のベストプラクティス（引数の構造体を新しくインスタンス化）とは異なるが、
 *    この場合はストアパターンと組み合わせた特殊な設計
 */
export function buildProjectTree(
  projects: Project[],
  milestones: Milestone[],
  issues: Issue[]
): ProjectTree[] {
  return projects.map((project) => {
    // プロジェクトに属するマイルストーンを取得
    const projectMilestones = milestones.filter(
      (m) => m.project_id === project.id
    );

    // マイルストーンツリーを構築
    const milestoneTrees: MilestoneTree[] = projectMilestones.map(
      (milestone) => {
        // マイルストーンに属するイシューを取得
        const milestoneIssues = issues.filter(
          (i) => i.milestone_id === milestone.id
        );

        return {
          milestone,
          issues: milestoneIssues,
        };
      }
    );

    return {
      project,
      milestones: milestoneTrees,
    };
  });
}

/**
 * ツリー構造からフラットなデータを抽出する関数
 */
export function extractFlatData(tree: ProjectTree[]): {
  projects: Project[];
  milestones: Milestone[];
  issues: Issue[];
} {
  const projects: Project[] = [];
  const milestones: Milestone[] = [];
  const issues: Issue[] = [];

  tree.forEach((projectTree) => {
    projects.push(projectTree.project);

    projectTree.milestones.forEach((milestoneTree) => {
      milestones.push(milestoneTree.milestone);
      issues.push(...milestoneTree.issues);
    });
  });

  return { projects, milestones, issues };
}
