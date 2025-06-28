import { GitLabMember } from '@src/app/git-lab-api/git-lab-member.model';

export interface Member {
  /**
   * id
   * @type {number}
   */
  id: number;

  /**
   * username
   * @type {string}
   */
  username: string;

  /**
   * name
   * @type {string}
   */
  name: string;
}

/**
 * GitLab APIのメンバーデータをアプリケーション用のメンバーデータに変換
 * @param gitlabMember GitLab APIのメンバーデータ
 * @returns アプリケーション用のメンバーデータ
 */
export function convertGitLabMemberToMember(
  gitlabMember: GitLabMember
): Member {
  return {
    id: gitlabMember.id,
    username: gitlabMember.username,
    name: gitlabMember.name,
  };
}
