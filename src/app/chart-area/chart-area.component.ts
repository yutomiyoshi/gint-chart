import { Component, OnInit } from '@angular/core';
import { IssuesStoreService } from '../store/issues-store.service';
import { Issue } from '../issue';
import {
  calendarEndDateOffset,
  calendarStartDateOffset,
} from './calendar-view-default';
import { statusWidthDefault, titleWidthDefault } from './column-view-default';

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
