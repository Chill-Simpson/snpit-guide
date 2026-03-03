# SNPIT 攻略ガイド - プロジェクト設定

## プロジェクト概要
- SNPITアプリ（Snap to Earn）の攻略サイト
- チュートリアル動画を載せて使い方を説明するシンプルな1ページサイト
- 公開URL: https://snpit-guide.pages.dev/

## 技術スタック
- HTML/CSSのみ（フレームワークなし）
- ホスティング: Cloudflare Pages
- フォント: Noto Sans JP（Google Fonts）

## デプロイ
```bash
npx wrangler pages deploy . --project-name snpit-guide
```
- プロジェクト作成済みなので上記コマンドだけでOK
- 初回デプロイ時にエラーが出ることがある（リトライで解決）

## ファイル構成
```
C:\dev\snpit_guide\
├── index.html          # メインページ
├── styles.css          # スタイルシート
├── CLAUDE.md           # このファイル（プロジェクト設定）
├── HANDOFF.md          # 引き継ぎ情報
├── videos/             # チュートリアル動画
│   ├── basic_tutorial.mp4      # 基本チュートリアル（22MB）
│   └── camera_purchase.mp4     # カメラ購入チュートリアル（19MB）
└── images/             # 画像フォルダ
```

## デザインルール

### カラーパレット（SNPITアプリ準拠）
- 背景: `#1A2B2B`
- カード背景: `#243838`
- カード内側: `#2D4545`
- アクセント（ターコイズ）: `#4ECDC4`
- テキスト: `#FFFFFF`
- テキスト薄: `#8CA8A8`

### カラー参照元
- SNPITアプリ本体: `C:\dev\snpit_app\lib\constants\app_colors.dart`

## 制約事項（重要）

### 動画ファイルサイズ
- **Cloudflare Pagesは25MB以下のファイルのみ対応**
- 動画は必ず圧縮してから配置すること
- FreeConvert.comなどで60%程度に圧縮すれば十分

### ファイル名
- Cloudflare Pages（Linux環境）は大文字小文字を区別する
- 拡張子は `.mp4`（小文字）に統一すること

## チュートリアル動画の追加手順
1. 動画ファイルを `videos/` フォルダに配置（25MB以下に圧縮）
2. `index.html` に新しい `<section class="tutorial-section">` を追加
3. 既存セクションのHTMLをコピーして、タイトル・説明・ステップを書き換える
4. デプロイコマンドを実行

## 関連プロジェクト
- SNPITアプリ本体: `C:\dev\snpit_app`（Flutter Web）
- SNPITアプリ公開URL: https://snpit.pages.dev/
- BillyBox（広告実装の参考）: `C:\Users\ukeda\OneDrive\Desktop\BillyBox`

## 今後の予定
- 詳細はHANDOFF.mdを参照
