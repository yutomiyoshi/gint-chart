import { GitLabConfig } from '@src/app/model/git-lab-config.model';
import { ViewConfig } from '@src/app/model/view-config.model';

declare global {
  interface Window {
    electronAPI: {
      readConfig: () => Promise<GitLabConfig>;
      readViewConfig: () => Promise<ViewConfig | null>;
      writeViewConfig: (config: ViewConfig) => Promise<boolean>;
      shell: {
        openExternal: (url: string) => Promise<void>;
      };
    };
  }
}
