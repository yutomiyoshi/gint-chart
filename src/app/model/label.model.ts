import { GitLabLabel } from '@src/app/git-lab-api/git-lab-label.model';

export interface Label {
  /**
   * id
   * @type {number}
   */
  id: number;

  /**
   * name
   * @type {string}
   */
  name: string;

  /**
   * description
   * @type {string}
   */
  description: string;

  /**
   * color
   * @type {string}
   */
  color: string;
}

export function convertGitLabLabelToLabel(gitLabLabel: GitLabLabel): Label {
  return {
    id: gitLabLabel.id,
    name: gitLabLabel.name,
    description: gitLabLabel.description ?? '',
    color: gitLabLabel.color,
  };
}
