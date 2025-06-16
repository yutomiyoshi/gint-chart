import { Component, Input, OnInit } from '@angular/core';
import { IssuesStoreService } from '@src/app/store/issues-store.service';
import { Issue } from '@src/app/model/issue.model';
import {
  calendarEndDateOffset,
  calendarStartDateOffset,
} from '@src/app/chart-area/chat-area-view.default';
import {
  statusWidthDefault,
  titleWidthDefault,
} from '@src/app/chart-area/issue-column/issue-column-view.default';

@Component({
  selector: 'app-chart-area',
  standalone: false,
  templateUrl: './chart-area.component.html',
  styleUrls: ['./chart-area.component.scss'],
})
export class ChartAreaComponent implements OnInit {
  @Input() isShowTitle = true;
  @Input() isShowStatus = true;

  /**
   * Logic fields
   */
  issues: Issue[] = [];

  // 日付の表示範囲、カレンダーとIssueRowで同期する
  dispStartDate: Date = new Date(
    new Date().setDate(new Date().getDate() - calendarStartDateOffset)
  );

  dispEndDate: Date = new Date(
    new Date().setDate(new Date().getDate() + calendarEndDateOffset)
  );

  // タイトルの幅
  get titleWidth() {
    return this.isShowTitle ? 0 : this._titleWidth;
  }

  set titleWidth(value: number) {
    this._titleWidth = value;
  }

  private _titleWidth: number = titleWidthDefault;

  // ステータスの幅
  get statusWidth() {
    return this.isShowStatus ? 0 : this._statusWidth;
  }

  set statusWidth(value: number) {
    this._statusWidth = value;
  }

  private _statusWidth: number = statusWidthDefault;

  constructor(private issueStore: IssuesStoreService) {}

  ngOnInit(): void {
    this.issueStore.issues$.subscribe((issues) => {
      // TODO: ここでissuesをソートする
      // TODO: ここでissuesをグループ化する
      // TODO: ここでissuesをフィルターする
      this.issues = issues;
    });
  }
}
