declare global {
  interface Window {
    electronAPI: {
      readConfig: (filePath: string) => Promise<GitLabConfig>;
    };
  }
}

export interface GitLabConfig {
  gitlabUrl: string;
  accessToken: string;
}
