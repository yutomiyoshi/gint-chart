import { Component } from '@angular/core';
import { IssuesStoreService } from '../store/issues-store.service';

@Component({
  selector: 'app-chart-area',
  standalone: false,
  templateUrl: './chart-area.component.html',
  styleUrls: ['./chart-area.component.scss'],
})
export class ChartAreaComponent {
  issues$ = this.issuesStore.issues$;

  constructor(private issuesStore: IssuesStoreService) {}
}
