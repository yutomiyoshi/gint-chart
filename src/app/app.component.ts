import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

declare global {
  interface Window {
    electronAPI: {
      readTextFile: (filePath: string) => Promise<string>;
      writeTextFile: (filePath: string, content: string) => Promise<string>;
    };
    electron: {
      ipcRenderer: {
        invoke: (channel: string, ...args: any[]) => Promise<any>;
      };
    };
  }
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  async readConfig() {
    try {
      const config = await window.electron.ipcRenderer.invoke('read-config');
      console.log(config.gitlabUrl, config.accessToken);
      alert('設定ファイルが読み込まれました！');
    } catch (error: unknown) {
      if (error instanceof Error) {
        alert('設定ファイルの読み込みに失敗しました: ' + error.message);
      } else {
        alert('設定ファイルの読み込みに失敗しました: 不明なエラー');
      }
    }
  }
}
