import { GitLabProject } from '@src/app/git-lab-api/git-lab-project.model';

export interface Project {
  /**
   * id
   * @type {number}
   */
  id: number;

  /**
   * 説明
   * @type {string}
   */
  description: string;

  /**
   * プロジェクト名
   * @type {string}
   */
  name: string;
}

export function convertJsonToProject(apiProject: GitLabProject): Project {
  return {
    id: apiProject.id,
    name: apiProject.name,
    description: apiProject.description,
  };
}
