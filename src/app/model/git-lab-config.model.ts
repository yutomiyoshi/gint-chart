declare global {
  interface Window {
    electronAPI: {
      readConfig: () => Promise<GitLabConfig>;
    };
  }
}

export interface GitLabConfig {
  url: string;
  projectId: number[];
  accessToken: string;
}
