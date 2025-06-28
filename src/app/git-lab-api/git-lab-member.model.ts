export interface GitLabMember {
  id: number;
  username: string;
  name: string;
  state: string;
  avatar_url: string | null;
  web_url: string;
  access_level: number;
  expires_at: string | null;
  group_saml_identity: GitLabGroupSamlIdentity | null;
}

export interface GitLabGroupSamlIdentity {
  extern_uid: string;
  provider: string;
  saml_provider_id: number;
}
