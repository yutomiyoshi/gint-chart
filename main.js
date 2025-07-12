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
    try {
      const electronDebug = require('electron-debug');
      const electronReloader = require('electron-reloader');

      // electron-debugの正しい使用方法（複数のパターンに対応）
      if (typeof electronDebug === 'function') {
        electronDebug({
          isEnabled: true,
          showDevTools: true
        });
      } else if (electronDebug.default && typeof electronDebug.default === 'function') {
        electronDebug.default({
          isEnabled: true,
          showDevTools: true
        });
      }

      // electron-reloaderの設定
      electronReloader(module, {
        debug: true,
        watchRenderer: true
      });
    } catch (error) {
      console.warn('Development modules not available:', error.message);
    }

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
    let configPath;

    if (serve) {
      // 開発環境では現在のディレクトリから読み込み
      configPath = path.join(__dirname, 'gitlab.config.json');
    } else {
      // パッケージ化された環境では実行ファイルと同じディレクトリから読み込み
      const exePath = process.execPath;
      const exeDir = path.dirname(exePath);
      configPath = path.join(exeDir, 'gitlab.config.json');
    }

    console.log('Attempting to read config from:', configPath);

    try {
      // ファイルの存在確認
      if (!fs.existsSync(configPath)) {
        throw new Error(`Configuration file not found at: ${configPath}`);
      }

      const data = fs.readFileSync(configPath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error('Error reading config file:', error.message);
      throw error;
    }
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