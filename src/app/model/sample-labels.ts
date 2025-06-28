import { Label } from './label.model';

export const SAMPLE_LABELS: Label[] = [
  {
    id: 1,
    name: '$category: テストケース作成',
    description:
      'テスト仕様書およびケース表を作成します。デバッグソフト、デバッグファイルの作成を含みます。',
    color: '#36c97b',
  },
  {
    id: 2,
    name: '$category: テスト実施',
    description: 'テストケースに基づいて、テスト合否を判定しています。',
    color: '#36c97b',
  },
  {
    id: 3,
    name: '$category: フォロー',
    description: '他の開発者のドメイン理解や技術習得を支援します。',
    color: '#36c97b',
  },
  {
    id: 4,
    name: '$category: 実装',
    description: 'ソースコードや基盤に手を加えて、仕様を実現します。',
    color: '#36c97b',
  },
  {
    id: 5,
    name: '$category: 管理',
    description: 'チケットの整理やスケジュール調整をします。',
    color: '#36c97b',
  },
  {
    id: 6,
    name: '$category: 納品物確認',
    description: '納品物の品質を評価します。',
    color: '#36c97b',
  },
  {
    id: 7,
    name: '$priority: 緊急',
    description: '顧客から今すぐに対応してほしいと要望されています。',
    color: '#e34c4c',
  },
  {
    id: 8,
    name: '$priority: 遅延',
    description: '納期までに成果物が完成せず、納期調整できませんでした。',
    color: '#e34c4c',
  },
  {
    id: 9,
    name: '$$resource: CTチェッカー1',
    description: 'ユース模貸与物',
    color: '#f0ad4e',
  },
  {
    id: 10,
    name: '$$resource: CTチェッカー2',
    description: 'ユース模貸与物',
    color: '#f0ad4e',
  },
  {
    id: 11,
    name: '$$resource: D3チェッカー1',
    description: 'ユース模貸与物',
    color: '#f0ad4e',
  },
  {
    id: 12,
    name: '$$resource: D3チェッカー2',
    description: 'ユース模貸与物',
    color: '#f0ad4e',
  },
  {
    id: 13,
    name: '$$resource: ITM',
    description: 'ユース模貸与物',
    color: '#f0ad4e',
  },
  {
    id: 14,
    name: '$$resource: ブレーカー1',
    description: 'RTU側のブレーカーです。',
    color: '#f0ad4e',
  },
  {
    id: 15,
    name: '$$resource: ブレーカー2',
    description: 'RTU側のブレーカーです。',
    color: '#f0ad4e',
  },
];
