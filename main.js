// main.js (TypeScriptで書く場合は、tscでJavaScriptにトランスパイルする必要があります)
const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const url = require("url");
const fs = require("fs"); // Node.jsのファイルシステムモジュール

let win;

function createWindow() {
  win = new BrowserWindow({
    width: 1000,
    height: 800,
    minWidth: 400,
    minHeight: 300,
    webPreferences: {
      nodeIntegration: false, // セキュリティのためにfalseを推奨
      contextIsolation: true, // セキュリティのためにtrueを推奨
      preload: path.join(__dirname, "preload.js"), // プリロードスクリプトを指定
    },
  });

  // Angularアプリケーションをロード
  // 開発時はng serveのURLを、ビルド後はAngularのdistディレクトリのindex.htmlをロードします
  // 開発モード
  if (process.env.NODE_ENV === "development") {
    win.loadURL("http://localhost:4200"); // Angular開発サーバーのポート
    win.webContents.openDevTools(); // 開発ツールを開く
  } else {
    // プロダクションビルド後
    win.loadFile(
      path.join(__dirname, "dist", "gint-chart", "browser", "index.html"),
    );
  }

  win.on("closed", () => {
    win = null;
  });

  /**
     * XXX miyoshi:
     * Electronアプリを起動したときに、カレンダーがきちんと表示されないバグがあった。（issue #91）
     *カレンダーの日付が一番左の戦闘の日付しか表示されない。また、縦線が表示されない。
     * しかし端末依存で、パソコンによっては再現しない。
     *
     * このバグの原因は分からず。
     * Electronの仕組みの根深いところにある、
     * 端末によってDOMの取得と監視のタイミングが違うことがある、
     * などが考えられる。
     *
     * この問題を回避するために、起動後しばらくしてからウィンドウを拡大することにした。
     * これによってカレンダーのHTML要素幅の変更検知を強引に発火させる。
     * 
     * ただし汚い手段であることは承知。
     * 真の原因の解明ときれいな問題解決を望む。
     */
  setTimeout(() => {
    win.maximize();
  }, 100);
}

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

ipcMain.handle('read-config', async () => {
  const configPath = path.join(__dirname, 'gitlab.config.json');
  const data = fs.readFileSync(configPath, 'utf-8');
  return JSON.parse(data);
});
