// main.js (TypeScriptで書く場合は、tscでJavaScriptにトランスパイルする必要があります)
const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const url = require("url");
const fs = require("fs"); // Node.jsのファイルシステムモジュール

let win;

function createWindow() {
  win = new BrowserWindow({
    width: 800,
    height: 600,
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
