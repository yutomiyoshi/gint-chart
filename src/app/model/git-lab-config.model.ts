declare global {
  interface Window {
    electronAPI: {
      readConfig: () => Promise<GitLabConfig>;
    };
  }
}

export interface GitLabProject {
  url: string;
  projectId: number;
}

export interface GitLabConfig {
  projects: GitLabProject[];
  accessToken: string;
}
