// main.js (TypeScriptで書く場合は、tscでJavaScriptにトランスパイルする必要があります)
const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const url = require('url');
const fs = require('fs'); // Node.jsのファイルシステムモジュール

let win;

function createWindow() {
    win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: false, // セキュリティのためにfalseを推奨
            contextIsolation: true, // セキュリティのためにtrueを推奨
            preload: path.join(__dirname, 'preload.js') // プリロードスクリプトを指定
        }
    });

    // Angularアプリケーションをロード
    // 開発時はng serveのURLを、ビルド後はAngularのdistディレクトリのindex.htmlをロードします
    // 開発モード
    if (process.env.NODE_ENV === 'development') {
        win.loadURL('http://localhost:4200'); // Angular開発サーバーのポート
        win.webContents.openDevTools(); // 開発ツールを開く
    } else {
        // プロダクションビルド後
        win.loadURL(url.format({
            pathname: path.join(__dirname, 'dist', 'my-electron-angular-app', 'index.html'), // Angularのビルドパス
            protocol: 'file:',
            slashes: true
        }));
    }

    win.on('closed', () => {
        win = null;
    });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});

// --- ファイル読み書きの例 (メインプロセス) ---
ipcMain.handle('read-text-file', async (event, filePath) => {
    try {
        const data = fs.readFileSync(filePath, 'utf8');
        return data;
    } catch (error) {
        console.error('Error reading file:', error);
        throw error;
    }
});

ipcMain.handle('write-text-file', async (event, filePath, content) => {
    try {
        fs.writeFileSync(filePath, content, 'utf8');
        return 'File written successfully';
    } catch (error) {
        console.error('Error writing file:', error);
        throw error;
    }
});