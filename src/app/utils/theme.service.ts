import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type Theme = 'light' | 'dark';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private currentThemeSubject = new BehaviorSubject<Theme>('dark');
  public currentTheme$ = this.currentThemeSubject.asObservable();

  constructor() {
    // ローカルストレージから保存されたテーマを読み込み
    const savedTheme = localStorage.getItem('theme') as Theme;
    if (savedTheme) {
      this.setTheme(savedTheme);
    } else {
      this.setTheme('dark'); // デフォルトはダークモード
    }
  }

  getCurrentTheme(): Theme {
    return this.currentThemeSubject.value;
  }

  setTheme(theme: Theme): void {
    this.currentThemeSubject.next(theme);
    localStorage.setItem('theme', theme);
    this.applyTheme(theme);
  }

  toggleTheme(): void {
    const newTheme = this.getCurrentTheme() === 'dark' ? 'light' : 'dark';
    this.setTheme(newTheme);
  }

  private applyTheme(theme: Theme): void {
    const root = document.documentElement;

    if (theme === 'dark') {
      this.applyDarkTheme(root);
    } else {
      this.applyLightTheme(root);
    }
  }

  private applyDarkTheme(root: HTMLElement): void {
    root.style.setProperty('--primary-color', '#3b82f6');
    root.style.setProperty('--primary-dark', '#1d4ed8');
    root.style.setProperty('--secondary-color', '#64748b');
    root.style.setProperty('--accent-color', '#10b981');
    root.style.setProperty('--warning-color', '#f59e0b');
    root.style.setProperty('--error-color', '#ef4444');
    root.style.setProperty('--text-primary', '#f8fafc');
    root.style.setProperty('--text-secondary', '#cbd5e1');
    root.style.setProperty('--text-muted', '#94a3b8');
    root.style.setProperty('--border-color', '#475569');
    root.style.setProperty('--border-color-dark', '#334155');
    root.style.setProperty('--background-primary', '#1e293b');
    root.style.setProperty('--background-secondary', '#334155');
    root.style.setProperty('--background-tertiary', '#475569');
    root.style.setProperty('--shadow-sm', '0 1px 2px 0 rgba(0, 0, 0, 0.3)');
    root.style.setProperty(
      '--shadow-md',
      '0 4px 6px -1px rgba(0, 0, 0, 0.4), 0 2px 4px -1px rgba(0, 0, 0, 0.3)'
    );
    root.style.setProperty(
      '--shadow-lg',
      '0 10px 15px -3px rgba(0, 0, 0, 0.5), 0 4px 6px -2px rgba(0, 0, 0, 0.3)'
    );
    root.style.setProperty(
      '--shadow-xl',
      '0 20px 25px -5px rgba(0, 0, 0, 0.6), 0 10px 10px -5px rgba(0, 0, 0, 0.4)'
    );
    // カレンダーの背景色（ダークテーマ）
    root.style.setProperty('--calendar-saturday', 'rgba(59, 130, 246, 0.3)');
    root.style.setProperty('--calendar-sunday', 'rgba(239, 68, 68, 0.3)');
    root.style.setProperty('--calendar-today', 'rgba(245, 158, 11, 0.4)');
  }

  private applyLightTheme(root: HTMLElement): void {
    root.style.setProperty('--primary-color', '#1a73e8');
    root.style.setProperty('--primary-dark', '#0d47a1');
    root.style.setProperty('--secondary-color', '#5f6368');
    root.style.setProperty('--accent-color', '#34a853');
    root.style.setProperty('--warning-color', '#fbbc04');
    root.style.setProperty('--error-color', '#ea4335');
    root.style.setProperty('--text-primary', '#202124');
    root.style.setProperty('--text-secondary', '#5f6368');
    root.style.setProperty('--text-muted', '#9aa0a6');
    root.style.setProperty('--border-color', '#dadce0');
    root.style.setProperty('--border-color-dark', '#bdc1c6');
    root.style.setProperty('--background-primary', '#ffffff');
    root.style.setProperty('--background-secondary', '#f8f9fa');
    root.style.setProperty('--background-tertiary', '#f1f3f4');
    root.style.setProperty('--shadow-sm', '0 1px 2px 0 rgba(0, 0, 0, 0.05)');
    root.style.setProperty(
      '--shadow-md',
      '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
    );
    root.style.setProperty(
      '--shadow-lg',
      '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
    );
    root.style.setProperty(
      '--shadow-xl',
      '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
    );
    // カレンダーの背景色（ライトテーマ）
    root.style.setProperty('--calendar-saturday', 'rgba(173, 216, 230, 0.4)');
    root.style.setProperty('--calendar-sunday', 'rgba(255, 182, 193, 0.4)');
    root.style.setProperty('--calendar-today', 'rgba(136, 136, 136, 0.4)');
  }
}
