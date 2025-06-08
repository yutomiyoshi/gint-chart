import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IssuesStoreService } from '../store/issues-store.service';
import { NgxGanttModule } from '@worktile/gantt';

@Component({
  selector: 'app-chart-area',
  standalone: true,
  imports: [CommonModule, NgxGanttModule],
  templateUrl: './chart-area.component.html',
  styleUrl: './chart-area.component.scss',
})
export class ChartAreaComponent {
  issues$ = this.issuesStore.issues$;

  constructor(private issuesStore: IssuesStoreService) {}
}
