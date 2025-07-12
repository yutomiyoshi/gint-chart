const { app, BrowserWindow, dialog } = require('electron');
const { autoUpdater } = require('electron-updater');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false, // 必要に応じて変更
    },
  });

  mainWindow.loadFile('index.html');

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // アプリケーション起動時にアップデートをチェック
  mainWindow.once('ready-to-show', () => {
    autoUpdater.checkForUpdatesAndNotify();
  });
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});

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