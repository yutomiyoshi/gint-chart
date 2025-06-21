declare global {
  interface Window {
    electronAPI: {
      readConfig: () => Promise<GitLabConfig>;
    };
  }
}

export interface GitLabProjectConfig {
  url: string;
  projectId: number;
}

export interface GitLabConfig {
  projects: GitLabProjectConfig[];
  accessToken: string;
}
