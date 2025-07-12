import { Label } from '@src/app/model/label.model';

export const SAMPLE_LABELS: Label[] = [
  {
    id: 1,
    name: '$$category: テストケース作成',
    description:
      'テスト仕様書およびケース表を作成します。デバッグソフト、デバッグファイルの作成を含みます。',
    color: '#3498db',
  },
  {
    id: 2,
    name: '$$category: テスト実施',
    description: 'テストケースに基づいて、テスト合否を判定しています。',
    color: '#2ecc71',
  },
  {
    id: 3,
    name: '$$category: フォロー',
    description: '他の開発者のドメイン理解や技術習得を支援します。',
    color: '#9b59b6',
  },
  {
    id: 4,
    name: '$$category: 実装',
    description: 'ソースコードや基盤に手を加えて、仕様を実現します。',
    color: '#1abc9c',
  },
  {
    id: 5,
    name: '$$category: 管理',
    description: 'チケットの整理やスケジュール調整をします。',
    color: '#34495e',
  },
  {
    id: 6,
    name: '$$category: 納品物確認',
    description: '納品物の品質を評価します。',
    color: '#8e44ad',
  },
  {
    id: 7,
    name: '$$priority: 緊急',
    description: '顧客から今すぐに対応してほしいと要望されています。',
    color: '#e74c3c',
  },
  {
    id: 8,
    name: '$$priority: 遅延',
    description: '納期までに成果物が完成せず、納期調整できませんでした。',
    color: '#f39c12',
  },
  {
    id: 9,
    name: '$$resource: CTチェッカー1',
    description: 'ユース模貸与物',
    color: '#8d6e63',
  },
  {
    id: 10,
    name: '$$resource: CTチェッカー2',
    description: 'ユース模貸与物',
    color: '#a1887f',
  },
  {
    id: 11,
    name: '$$resource: D3チェッカー1',
    description: 'ユース模貸与物',
    color: '#6d4c41',
  },
  {
    id: 12,
    name: '$$resource: D3チェッカー2',
    description: 'ユース模貸与物',
    color: '#795548',
  },
  {
    id: 13,
    name: '$$resource: ITM',
    description: 'ユース模貸与物',
    color: '#607d8b',
  },
  {
    id: 14,
    name: '$$resource: ブレーカー1',
    description: 'RTU側のブレーカーです。',
    color: '#546e7a',
  },
  {
    id: 15,
    name: '$$resource: ブレーカー2',
    description: 'RTU側のブレーカーです。',
    color: '#78909c',
  },
  {
    id: 16,
    name: '$$status: 未着手',
    description: '未着手のイシューです。',
    color: '#bdc3c7',
  },
  {
    id: 17,
    name: '$$status: 進行中',
    description: '進行中のイシューです。',
    color: '#f1c40f',
  },
  {
    id: 18,
    name: '$$status: 完了',
    description: '完了のイシューです。',
    color: '#27ae60',
  },
  {
    id: 19,
    name: '$$status: 保留',
    description: '保留のイシューです。',
    color: '#95a5a6',
  },
  {
    id: 20,
    name: '$$status: キャンセル',
    description: 'キャンセルのイシューです。',
    color: '#7f8c8d',
  },
];
