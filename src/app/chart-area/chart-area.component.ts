import { Component, OnInit } from '@angular/core';
import { IssuesStoreService } from '@src/app/store/issues-store.service';
import { Issue } from '@src/app/model/issue.model';
import {
  calendarEndDateOffset,
  calendarStartDateOffset,
} from './calendar-view-default';
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
  titleWidth: number = titleWidthDefault;

  // ステータスの幅
  statusWidth: number = statusWidthDefault;

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
