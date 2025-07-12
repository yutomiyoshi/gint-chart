import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { GitLabConfigStoreService } from '@src/app/store/git-lab-config-store.service';
import { Subject, takeUntil, switchMap, forkJoin, catchError, of } from 'rxjs';
import { IssueDetailDialogExpansionService } from '@src/app/issue-detail-dialog/issue-detail-dialog-expansion.service';
import { ToastHistoryDialogExpansionService } from '@src/app/toast-history-dialog/toast-history-dialog-expansion.service';
import { StatusSelectorDialogExpansionService } from '@src/app/status-selector-dialog/status-selector-dialog-expansion.service';
import { AssigneeSelectorDialogExpansionService } from '@src/app/assignee-selector-dialog/assignee-selector-dialog-expansion.service';
import { isNull, isUndefined } from '@src/app/utils/utils';
import { DIALOG_ANIMATION_DURATION } from '@src/app/app-view.default';
import { Assertion } from '@src/app/utils/assertion';
import { ProjectTreeStoreService } from '@src/app/store/project-tree-store.service';
import { ToastService } from '@src/app/utils/toast.service';
import { GitLabApiService } from '@src/app/git-lab-api/git-lab-api.service';
import { LabelStoreService } from '@src/app/store/label-store.service';
import { MemberStoreService } from '@src/app/store/member-store.service';
import { TOAST_DURATION_LONG } from '@src/app/toast/toast.const';
import { isDebug } from '@src/app/debug';
import { ViewSettingsDialogExpansionService } from './view-settings-dialog/view-settings-dialog-expansion.service';
import { FilterSettingsDialogExpansionService } from './filter-settings-dialog/filter-settings-dialog-expansion.service';

@Component({
  selector: 'app-root',
  standalone: false,
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit, OnDestroy, AfterViewInit {
  loadingOverlay = true;
  isIssueDetailDialogExpanded = false;
  isToastHistoryDialogExpanded = false;
  isStatusSelectorDialogExpanded = false;
  isAssigneeSelectorDialogExpanded = false;
  isViewSettingsDialogExpanded = false;
  isFilterSettingsDialogExpanded = false;
  isDialogClosing = false;
  isToastHistoryDialogClosing = false;
  isStatusSelectorDialogClosing = false;
  isAssigneeSelectorDialogClosing = false;
  isViewSettingsDialogClosing = false;
  isFilterSettingsDialogClosing = false;
  private destroy$ = new Subject<void>();

  /**
   * トーストの表示情報
   */
  isShowToast = false;

  constructor(
    private readonly gitLabConfigStore: GitLabConfigStoreService,
    private readonly issueDetailDialogExpansionService: IssueDetailDialogExpansionService,
    private readonly toastHistoryDialogExpansionService: ToastHistoryDialogExpansionService,
    private readonly statusSelectorDialogExpansionService: StatusSelectorDialogExpansionService,
    private readonly assigneeSelectorDialogExpansionService: AssigneeSelectorDialogExpansionService,
    private readonly projectTreeStore: ProjectTreeStoreService,
    private readonly toastService: ToastService,
    private readonly gitLabApiService: GitLabApiService,
    private readonly labelStore: LabelStoreService,
    private readonly memberStore: MemberStoreService,
    private readonly cdr: ChangeDetectorRef,
    private readonly viewSettingsDialogExpansionService: ViewSettingsDialogExpansionService,
    private readonly filterSettingsDialogExpansionService: FilterSettingsDialogExpansionService
  ) {}

  ngOnInit() {
    this.issueDetailDialogExpansionService.expandedIssueId$
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (issueId: number | undefined) => {
          this.isIssueDetailDialogExpanded = !isUndefined(issueId);
        },
        error: (error) => {
          Assertion.assert(
            'Issue detail dialog expansion error: ' + error,
            Assertion.no(16)
          );
          this.isIssueDetailDialogExpanded = false;
        },
      });

    this.toastHistoryDialogExpansionService.isExpanded$
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (isExpanded: boolean) => {
          this.isToastHistoryDialogExpanded = isExpanded;
        },
        error: (error) => {
          Assertion.assert(
            'Toast history dialog expansion error: ' + error,
            Assertion.no(32)
          );
          this.isToastHistoryDialogExpanded = false;
        },
      });

    this.statusSelectorDialogExpansionService.isExpanded$
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (isExpanded: boolean) => {
          this.isStatusSelectorDialogExpanded = isExpanded;
        },
        error: (error) => {
          Assertion.assert(
            'Status selector dialog expansion error: ' + error,
            Assertion.no(33)
          );
          this.isStatusSelectorDialogExpanded = false;
        },
      });

    this.assigneeSelectorDialogExpansionService.isExpanded$
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (isExpanded: boolean) => {
          this.isAssigneeSelectorDialogExpanded = isExpanded;
        },
        error: (error) => {
          Assertion.assert(
            'Assignee selector dialog expansion error: ' + error,
            Assertion.no(34)
          );
          this.isAssigneeSelectorDialogExpanded = false;
        },
      });

    this.viewSettingsDialogExpansionService.dialog$
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (isExpanded: boolean) => {
          this.isViewSettingsDialogExpanded = isExpanded;
        },
        error: (error) => {
          Assertion.assert(
            'View settings dialog expansion error: ' + error,
            Assertion.no(43)
          );
          this.isViewSettingsDialogExpanded = false;
        },
      });

    this.filterSettingsDialogExpansionService.dialog$
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (isExpanded: boolean) => {
          this.isFilterSettingsDialogExpanded = isExpanded;
        },
        error: (error) => {
          Assertion.assert(
            'Filter settings dialog expansion error: ' + error,
            Assertion.no(45)
          );
          this.isFilterSettingsDialogExpanded = false;
        },
      });

    this.gitLabConfigStore
      .loadConfig()
      .pipe(
        catchError((error) => {
          this.toastService.show(
            Assertion.no(15),
            `Failed to load config. Place gitlab.config.json in the same directory as the executable file. error: ${error}`,
            'error',
            TOAST_DURATION_LONG
          );
          throw error;
        }),
        takeUntil(this.destroy$),
        switchMap((config) => {
          // GitLabApiServiceを使用してGitLab APIを初期化
          if (!isNull(config)) {
            this.gitLabApiService.initialize();
          }

          // ラベルとメンバーを同時に取得し、その後プロジェクト、マイルストーン、イシューを同期
          return forkJoin({
            labels: this.labelStore.syncLabels(),
            members: this.memberStore.syncMembers(),
          }).pipe(
            catchError((error) => {
              this.toastService.show(
                Assertion.no(44),
                `Failed to sync labels and members. error: ${error}`,
                'error',
                TOAST_DURATION_LONG
              );
              throw error;
            }),
            switchMap(() => this.projectTreeStore.syncProjectMilestoneIssues())
          );
        })
      )
      .subscribe({
        error: (error) => {
          this.toastService.show(
            Assertion.no(31),
            `Failed to sync project, milestone, issue. error: ${error}`,
            'error',
            TOAST_DURATION_LONG
          );
          this.loadingOverlay = false;
        },
        next: () => {
          this.loadingOverlay = false;
          this.toastService.show(
            Assertion.no(1),
            'Complete to pull issues, labels, and members!!!',
            'success',
            TOAST_DURATION_LONG
          );
        },
      });

    this.toastService.isShow$.pipe(takeUntil(this.destroy$)).subscribe({
      next: (isShow: boolean) => {
        this.isShowToast = isShow;
      },
    });

    if (isDebug) {
      this.toastService.show(
        Assertion.no(2),
        'This is Debuging Mode. Your fetch and update of issues is executed without GitLab Server, showing just dummy-data. So, it is waste of time to compare with GitLab Home Page and this page.',
        'info',
        TOAST_DURATION_LONG
      );
    }

    // if (isDebug) {
    //   setInterval(() => {
    //     this.toastService.show(
    //       1,
    //       'This is Debuging Mode. Your fetch and update of issues is executed without GitLab Server, showing just dummy-data. So, it is waste of time to compare with GitLab Home Page and this page.',
    //       'success',
    //       1000
    //     );
    //   }, 2000);

    //   setInterval(() => {
    //     this.toastService.show(
    //       1,
    //       "It's a dummy Text. Just looking. Good buy. Ohtani-san, 25th-homerun!",
    //       'error',
    //       1000
    //     );
    //   }, 4000);

    //   setInterval(() => {
    //     this.toastService.show(
    //       1,
    //       "It's a dummy Text. Just looking. Good buy. Ohtani-san, 25th-homerun!",
    //       'info',
    //       1000
    //     );
    //   }, 5000);

    //   setInterval(() => {
    //     this.toastService.show(
    //       1,
    //       "It's a dummy Text. Just looking. Good buy. Ohtani-san, 25th-homerun!",
    //       'warning',
    //       1000
    //     );
    //   }, 8000);
    // }
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  ngAfterViewInit(): void {
    /**
     * XXX miyoshi:
     * Electronアプリを起動したときに、カレンダーがきちんと表示されないバグがあった。（issue #91）
     *カレンダーの日付が一番左の戦闘の日付しか表示されない。また、縦線が表示されない。
     * しかし端末依存で、パソコンによっては再現しない。
     * このバグの原因は分からず。Electronの仕組みの根深いところにある。
     *
     * この問題を回避するために、起動後しばらく100msしてからカレンダーのDOMを検知させる。
     * これによって、カレンダーのHTML要素幅の変更検知を強引に発火させる。
     * ただし汚い手段であることは承知。
     * 真の原因の解明ときれいな問題解決を望む。
     */
    setTimeout(() => {
      this.cdr.detectChanges();
    }, 100);
  }

  onIssueDetailDialogOverlayClick(event: MouseEvent): void {
    // クリックされた要素がオーバーレイ自体の場合のみダイアログを閉じる
    if (event.target === event.currentTarget) {
      this.isDialogClosing = true;
      // アニメーション完了後にダイアログを閉じる
      setTimeout(() => {
        this.issueDetailDialogExpansionService.setExpandedIssueId(undefined);
        this.isDialogClosing = false;
      }, DIALOG_ANIMATION_DURATION);
    }
  }

  onToastHistoryDialogOverlayClick(event: MouseEvent): void {
    // クリックされた要素がオーバーレイ自体の場合のみダイアログを閉じる
    if (event.target === event.currentTarget) {
      this.isToastHistoryDialogClosing = true;
      // アニメーション完了後にダイアログを閉じる
      setTimeout(() => {
        this.toastHistoryDialogExpansionService.setExpanded(false);
        this.isToastHistoryDialogClosing = false;
      }, DIALOG_ANIMATION_DURATION);
    }
  }

  onStatusSelectorDialogOverlayClick(event: MouseEvent): void {
    // クリックされた要素がオーバーレイ自体の場合のみダイアログを閉じる
    if (event.target === event.currentTarget) {
      this.isStatusSelectorDialogClosing = true;
      // アニメーション完了後にダイアログを閉じる
      setTimeout(() => {
        this.statusSelectorDialogExpansionService.collapse();
        this.isStatusSelectorDialogClosing = false;
      }, DIALOG_ANIMATION_DURATION);
    }
  }

  onAssigneeSelectorDialogOverlayClick(event: MouseEvent): void {
    // クリックされた要素がオーバーレイ自体の場合のみダイアログを閉じる
    if (event.target === event.currentTarget) {
      this.isAssigneeSelectorDialogClosing = true;
      // アニメーション完了後にダイアログを閉じる
      setTimeout(() => {
        this.assigneeSelectorDialogExpansionService.collapse();
        this.isAssigneeSelectorDialogClosing = false;
      }, DIALOG_ANIMATION_DURATION);
    }
  }

  /**
   * ビュー設定ダイアログを開く
   */
  onViewSettingsDialogOverlayClick(event: MouseEvent): void {
    // クリックされた要素がオーバーレイ自体の場合のみダイアログを閉じる
    if (event.target === event.currentTarget) {
      this.isViewSettingsDialogClosing = true;
      // アニメーション完了後にダイアログを閉じる
      setTimeout(() => {
        this.viewSettingsDialogExpansionService.collapse();
        this.isViewSettingsDialogClosing = false;
      }, DIALOG_ANIMATION_DURATION);
    }
  }

  /**
   * フィルター設定ダイアログのオーバーレイクリック
   */
  onFilterSettingsDialogOverlayClick(event: MouseEvent): void {
    // クリックされた要素がオーバーレイ自体の場合のみダイアログを閉じる
    if (event.target === event.currentTarget) {
      this.isFilterSettingsDialogClosing = true;
      // アニメーション完了後にダイアログを閉じる
      setTimeout(() => {
        this.filterSettingsDialogExpansionService.collapse();
        this.isFilterSettingsDialogClosing = false;
      }, DIALOG_ANIMATION_DURATION);
    }
  }

  /**
   * ログ履歴ダイアログを開く
   */
  onLogHistoryClick(): void {
    this.toastHistoryDialogExpansionService.setExpanded(true);
  }
}
