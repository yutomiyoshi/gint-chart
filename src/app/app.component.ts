import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

declare global {
  interface Window {
    electronAPI: {
      readTextFile: (filePath: string) => Promise<string>;
      writeTextFile: (filePath: string, content: string) => Promise<string>;
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
  filePath: string = './mydata.txt'; // アプリケーションのルートからの相対パスなどを指定
  fileContent: string = '';

  constructor() {}

  async readFile() {
    try {
      this.fileContent = await window.electronAPI.readTextFile(this.filePath);
      alert('ファイルが読み込まれました！');
    } catch (error: any) {
      if (error instanceof Error) {
        alert('ファイルの読み込みに失敗しました: ' + error.message);
      } else {
        alert('ファイルの読み込みに失敗しました: 不明なエラー');
      }
    }
  }

  async writeFile() {
    try {
      await window.electronAPI.writeTextFile(this.filePath, this.fileContent);
      alert('ファイルが書き込まれました！');
    } catch (error: any) {
      if (error instanceof Error) {
        alert('ファイルの書き込みに失敗しました: ' + error.message);
      } else {
        alert('ファイルの書き込みに失敗しました: 不明なエラー');
      }
    }
  }
}
