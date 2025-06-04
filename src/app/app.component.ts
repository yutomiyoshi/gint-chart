import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Project, adaptProjects } from 'app/projects';

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
  styleUrl: './app.component.scss'
})
export class AppComponent {
    filePath: string = './issues.json'; // アプリケーションのルートからの相対パスなどを指定
    fileContent: Project[] = [];

    constructor() {}

    async readFile() {
        try {
            const text = await window.electronAPI.readTextFile(this.filePath);
            this.fileContent = adaptProjects(JSON.parse(text));
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
            const text = JSON.stringify(this.fileContent, null, 2);
            await window.electronAPI.writeTextFile(this.filePath, text);
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
