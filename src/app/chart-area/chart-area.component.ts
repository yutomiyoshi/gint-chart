import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IssuesStoreService } from '../store/issues-store.service';
import { Issue } from '../issue';
import { NgxGanttModule, GanttItem } from '@worktile/gantt';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-chart-area',
  standalone: true,
  imports: [CommonModule, NgxGanttModule],
  templateUrl: './chart-area.component.html',
  styleUrl: './chart-area.component.scss',
})
export class ChartAreaComponent implements OnInit, OnDestroy {
  ganttItems: GanttItem[] = [];
  private subscription = new Subscription();

  constructor(private issuesStore: IssuesStoreService) {}

  ngOnInit(): void {
    this.subscription.add(
      this.issuesStore.issues$.subscribe((issues) => {
        this.ganttItems = issues.map((issue) => ({
          id: String(issue.id),
          title: issue.title,
          start: issue.created_at
            ? new Date(issue.created_at).getTime() / 1000
            : undefined,
          end: issue.due_date
            ? new Date(issue.due_date).getTime() / 1000
            : undefined,
        }));
      })
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
