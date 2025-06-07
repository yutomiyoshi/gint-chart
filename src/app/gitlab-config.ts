declare global {
  interface Window {
    electronAPI: {
      readConfig: () => Promise<GitLabConfig>;
    };
  }
}

export interface GitLabConfig {
  gitlabUrl: string;
  accessToken: string;
}
