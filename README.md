# なんだかんだ手軽に使えるタスク管理ツールがない

Redmine はなんだか使いにくいし、BackLog はお金かかる。

GitLab は Premium にしないとガントチャートが使えない。

Github のプロジェクトは便利だけど、会社から使っちゃダメって言われた。

# サーバーレスなタスク管理：Gint-Chart

特別なサーバーなし、GitLab に情報を集約してタスク管理する。

GitLab のリポジトリにチケットのデータを push して、更新して commit する。

![1](./asset/system-configuration1.png)

GitLab のグループがあれば、メンバー間でタスク管理できる。

![2](./asset/system-configuration2.png)

必要なのは、GitLab のリポジトリ 1 つと各メンバーの PC に gint-chart のネイティブアプリ。

![3](./asset/system-configuration3.png)

将来的には、Google Chat みたいなコミュニケーションツールに、チケットの更新を通知する。

![4](./asset/system-configuration4.png)

## 使い方

GitLab の Issue の description に

```
$start-date:yyyy-mm-dd
$end-date:yyyy-mm-dd
```

---

## うみだしたい

- シンプル

- 指先の感覚になじむ

- アジャイル

- 特別なサーバーは不要

- 無料

## 技術要素

- TypeScript

- Angular

- Electron

## 個人的な野望

- 最速（MVP）

- 横着（AI 駆動）

- UI にはこだわる

- CI/CD

## 開発立ち上げ

コンソールにて以下を実行する。

```
npm run electron-dev
```
