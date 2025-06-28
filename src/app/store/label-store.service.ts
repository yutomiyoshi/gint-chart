import { Injectable } from '@angular/core';
import { GitLabApiService } from '../git-lab-api/git-lab-api.service';
import { Label, convertGitLabLabelToLabel } from '../model/label.model';
import { GitLabLabel } from '../git-lab-api/git-lab-label.model';
import { BehaviorSubject, from, Observable, tap } from 'rxjs';
import { isDebug } from '../debug';
import { GitLabConfigStoreService } from './git-lab-config-store.service';
import { isNull } from '../utils/utils';
import { SAMPLE_LABELS } from '../model/sample-labels';

@Injectable({
  providedIn: 'root',
})
export class LabelStoreService {
  private labelsSubject = new BehaviorSubject<Label[]>([]);
  public labels$: Observable<Label[]> = this.labelsSubject.asObservable();

  constructor(
    private readonly gitlabApi: GitLabApiService,
    private readonly gitlabConfigStore: GitLabConfigStoreService
  ) {}

  syncLabels(): Observable<Label[]> {
    if (isDebug) {
      this.labelsSubject.next(SAMPLE_LABELS);
      return from([SAMPLE_LABELS]);
    }

    const config = this.gitlabConfigStore.getConfig();
    const groupId = config.groupId;
    if (isNull(groupId)) {
      this.labelsSubject.next([]);
      return from([[]]);
    }

    // グループラベル取得
    return this.gitlabApi
      .fetchGroup<GitLabLabel, Label>(
        groupId,
        'labels',
        convertGitLabLabelToLabel
      )
      .pipe(tap((labels) => this.labelsSubject.next(labels)));
  }
}
