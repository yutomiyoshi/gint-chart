const { app, BrowserWindow, ipcMain, shell } = require('electron');
// const { autoUpdater } = require('electron-updater');
const path = require('path');
const fs = require('fs');

let mainWindow;

const args = process.argv.slice(1),
  serve = args.some(val => val === '--serve');

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
      /**
       * XXX
       * セキュリティ上の問題について要検討
       * - allowRunningInsecureContent
       * - webSecurity
       */
      allowRunningInsecureContent: serve,
      webSecurity: !serve,
    },
  });

  if (serve) {
    // 開発用モジュールを動的に読み込み
    const electronDebug = require('electron-debug');
    const electronReloader = require('electron-reloader');

    electronDebug({ isEnabled: true, showDevTools: true });
    electronReloader(module);
    mainWindow.loadURL('http://localhost:4200');
  } else {
    // パッケージ化後のパス設定
    let pathIndex = './index.html';

    // 開発ビルド時のパス
    if (fs.existsSync(path.join(__dirname, '../dist/gint-chart/browser/index.html'))) {
      pathIndex = '../dist/gint-chart/browser/index.html';
    }
    // パッケージ化後のパス（app.asar内）
    else if (fs.existsSync(path.join(__dirname, './dist/gint-chart/browser/index.html'))) {
      pathIndex = './dist/gint-chart/browser/index.html';
    }

    const fullPath = path.join(__dirname, pathIndex);
    mainWindow.loadFile(fullPath);
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // // アプリケーション起動時にアップデートをチェック
  // mainWindow.once('ready-to-show', () => {
  //   autoUpdater.checkForUpdatesAndNotify();
  // });

  /**
   * GitLab構成ファイルの取り込みを許可する
   */
  ipcMain.handle("read-config", async () => {
    const config = path.join(__dirname, 'gitlab.config.json');
    const data = fs.readFileSync(config, 'utf8');
    return JSON.parse(data);
  });

  /**
   * 外部リンクを開く
   */
  ipcMain.handle("open-external", async (event, url) => {
    shell.openExternal(url);
  });

  return mainWindow;
}

try {
  // This method will be called when Electron has finished
  // initialization and is ready to create browser windows.
  // Some APIs can only be used after this event occurs.
  // Added 400 ms to fix the black background issue while using transparent window. More detais at https://github.com/electron/electron/issues/15947
  app.on('ready', () => {
    setTimeout(createWindow, 4000);
  });

  // Quit when all windows are closed.
  app.on('window-all-closed', () => {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
      app.quit();
    }
  });

  app.on('activate', () => {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (mainWindow === null) {
      createWindow();
    }
  });
} catch (error) {
  console.error(error);
}

// アップデートイベントのハンドリング
// autoUpdater.on('update-available', (info) => {
//   dialog.showMessageBox({
//     type: 'info',
//     title: 'アップデートがあります',
//     message: '新しいバージョンが利用可能です。ダウンロードを開始しますか？',
//     buttons: ['はい', 'いいえ'],
//   }).then(result => {
//     if (result.response === 0) { // はい
//       autoUpdater.downloadUpdate();
//     }
//   });
// });

// autoUpdater.on('update-downloaded', (info) => {
//   dialog.showMessageBox({
//     type: 'info',
//     title: 'アップデート完了',
//     message: '新しいバージョンがダウンロードされました。アプリケーションを再起動してアップデートを適用しますか？',
//     buttons: ['再起動', '後で'],
//   }).then(result => {
//     if (result.response === 0) { // 再起動
//       autoUpdater.quitAndInstall();
//     }
//   });
// });

// autoUpdater.on('error', (err) => {
//   dialog.showErrorBox('アップデートエラー', 'アップデート中にエラーが発生しました: ' + err.message);
// });