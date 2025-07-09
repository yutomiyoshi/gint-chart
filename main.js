const { app, BrowserWindow, ipcMain, shell, dialog, autoUpdater } = require("electron");
const path = require("path");
const fs = require("fs");

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

ipcMain.handle('open-external', async (event, url) => {
  await shell.openExternal(url);
});

const server = 'https://update.electronjs.org';
const owner = 'yutomiyoshi'
const repo = 'gint-chart'
const feed = `${server}/${owner}/${repo}/${process.platform}-${process.arch}/${app.getVersion()}`;

if (app.isPackaged) {
  autoUpdater.setFeedURL({
    url: feed,
  });
  autoUpdater.checkForUpdates();

  /**
   * アップデートのダウンロードが完了したとき
   */
  autoUpdater.on("update-downloaded", async () => {
    const returnValue = await dialog.showMessageBox({
      message: "アップデータあり",
      detail: "再起動してインストールできます。",
      buttons: ["再起動", "後で"],
    });
    if (returnValue.response === 0) {
      autoUpdater.quitAndInstall();
    }
  });

  autoUpdater.on('update-available', () => {
    dialog.showMessageBox({
      message: "アップデートが利用可能です。",
      buttons: ["OK"],
    });
  });

  autoUpdater.on('error', (error) => {
    dialog.showMessageBox({
      message: "アップデートの確認に失敗しました。",
      detail: `エラー: ${error.message}`,
      buttons: ["OK"],
    });
  });
}