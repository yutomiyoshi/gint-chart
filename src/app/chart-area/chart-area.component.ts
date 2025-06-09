import { Component, OnInit } from '@angular/core';
import { IssuesStoreService } from '../store/issues-store.service';
import { Issue } from '../issue';

@Component({
  selector: 'app-chart-area',
  standalone: false,
  templateUrl: './chart-area.component.html',
  styleUrls: ['./chart-area.component.scss'],
})
export class ChartAreaComponent implements OnInit {
  issues: Issue[] = [];

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
