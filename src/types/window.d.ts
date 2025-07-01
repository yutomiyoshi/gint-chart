import { GitLabConfig } from '@src/app/model/git-lab-config.model';

declare global {
  interface Window {
    electronAPI: {
      readConfig: () => Promise<GitLabConfig>;
      shell: {
        openExternal: (url: string) => Promise<void>;
      };
    };
  }
}
