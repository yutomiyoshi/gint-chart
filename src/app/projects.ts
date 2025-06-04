// プロジェクト管理用の型定義と型アダプター関数

// コメント情報を表すインターフェース
export interface Comment {
    id:         number;     // コメントID
    content:    string;     // コメント本文
    author:     number;     // 作成者ID
    created_at: string;     // 作成日時（ISO文字列）
    updated_at: string;     // 更新日時（ISO文字列）
}

// 課題（Issue）情報を表すインターフェース
export interface Issue {
    id:          number;     // 課題ID
    title:       string;     // タイトル
    description: string;     // 詳細説明
    assignee:    number;     // 担当者ID
    created_at:  string;     // 作成日時
    updated_at:  string;     // 更新日時
    status:      string;     // ステータス
    start_date:  string;     // 開始日
    end_date:    string;     // 終了日
    comments:    Comment[];  // コメント一覧
}

// プロジェクト情報を表すインターフェース
export interface Project {
    id:          number;     // プロジェクトID
    title:       string;     // プロジェクト名
    description: string;     // プロジェクト説明
    assignee:    number;     // 担当者ID
    created_at:  string;     // 作成日時
    updated_at:  string;     // 更新日時
    issues:      Issue[];    // このプロジェクトに紐づく課題一覧
}

/**
 * 任意の入力データを Project[] 型の配列に変換する。
 * 不正なデータや不足プロパティはデフォルト値で補完する。
 * @param input 任意のJSONデータ
 * @returns Project[] 型の配列
 */
export function adaptProjects(input: any): Project[] {
  if (!Array.isArray(input)) return [];
  return input.map(adaptProject).filter((p: any): p is Project => !!p);
}

// Project型1件分への変換（内部利用）
function adaptProject(obj: any): Project | null {
  if (!obj || typeof obj !== 'object') return null;
  return {
    id:          typeof obj.id === 'number' ? obj.id : (typeof obj.project_id === 'number' ? obj.project_id : 0), // idまたはproject_id
    title:       typeof obj.title === 'string' ? obj.title : '',
    description: typeof obj.description === 'string' ? obj.description : '',
    assignee:    typeof obj.assignee === 'number' ? obj.assignee : 0,
    created_at:  typeof obj.created_at === 'string' ? obj.created_at : '',
    updated_at:  typeof obj.updated_at === 'string' ? obj.updated_at : '',
    issues:      Array.isArray(obj.issues) ? obj.issues.map(adaptIssue).filter((i: any): i is Issue => !!i) : [],
  };
}

// Issue型1件分への変換（内部利用）
function adaptIssue(obj: any): Issue | null {
  if (!obj || typeof obj !== 'object') return null;
  return {
    id:          typeof obj.id === 'number' ? obj.id : 0,
    title:       typeof obj.title === 'string' ? obj.title : '',
    description: typeof obj.description === 'string' ? obj.description : '',
    assignee:    typeof obj.assignee === 'number' ? obj.assignee : 0,
    created_at:  typeof obj.created_at === 'string' ? obj.created_at : '',
    updated_at:  typeof obj.updated_at === 'string' ? obj.updated_at : '',
    status:      typeof obj.status === 'string' ? obj.status : '',
    start_date:  typeof obj.start_date === 'string' ? obj.start_date : '',
    end_date:    typeof obj.end_date === 'string' ? obj.end_date : '',
    comments:    Array.isArray(obj.comments) ? obj.comments.map(adaptComment).filter((c: any): c is Comment => !!c) : [],
  };
}

// Comment型1件分への変換（内部利用）
function adaptComment(obj: any): Comment | null {
  if (!obj || typeof obj !== 'object') return null;
  return {
    id:         typeof obj.id === 'number' ? obj.id : 0,
    content:    typeof obj.content === 'string' ? obj.content : '',
    author:     typeof obj.author === 'number' ? obj.author : 0,
    created_at: typeof obj.created_at === 'string' ? obj.created_at : '',
    updated_at: typeof obj.updated_at === 'string' ? obj.updated_at : '',
  };
}