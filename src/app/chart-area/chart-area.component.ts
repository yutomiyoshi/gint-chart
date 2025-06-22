import {
  Component,
  Input,
  OnInit,
  ViewChild,
  ElementRef,
  AfterViewInit,
  ChangeDetectorRef,
} from '@angular/core';
import { DatePipe } from '@angular/common';
import { ProjectTreeStoreService } from '@src/app/store/project-tree-store.service';
import { ProjectTree } from '@src/app/model/project-tree.model';
import {
  calendarEndDateOffset,
  calendarStartDateOffset,
} from '@src/app/chart-area/chat-area-view.const';
import {
  assigneeWidthDefault,
  statusWidthDefault,
  titleWidthDefault,
} from '@src/app/chart-area/issue-column/issue-column-view.const';
import { DateHandler } from '@src/app/utils/time';
import {
  CalendarDisplayService,
  CalendarVerticalLine,
} from '@src/app/chart-area/calendar-vertical-line.service';
import { CalendarPositionService } from '@src/app/chart-area/calendar-position.service';
import { CalendarRangeService } from '@src/app/chart-area/calendar-range.service';
import { CalendarWidthService } from '@src/app/chart-area/calendar-width.service';
import { Subscription } from 'rxjs';
import { Project } from '../model/project.model';
import { Milestone } from '../model/milestone.model';
import { Issue } from '../model/issue.model';
import { IssuesUpdateService } from '@src/app/update/issues-update.service';
import { Assertion } from '../utils/assertion';

/**
 * チャート行のアイテムを表現するインターフェース
 */
export type ChartRowItem =
  | {
      type: 'project';
      data: Project;
      isCollapsed: boolean;
    }
  | {
      type: 'milestone';
      data: Milestone;
      isCollapsed: boolean;
      parentId: string;
    }
  | {
      type: 'issue';
      data: Issue;
      parentId: string;
    };

@Component({
  selector: 'app-chart-area',
  standalone: false,
  templateUrl: './chart-area.component.html',
  styleUrls: ['./chart-area.component.scss'],
  providers: [DatePipe],
})
export class ChartAreaComponent implements OnInit, AfterViewInit {
  /**
   * タイトルの表示状態
   */
  @Input() isShowTitle = true;

  /**
   * ステータスの表示状態
   */
  @Input() isShowStatus = true;

  /**
   * 担当者の表示状態
   */
  @Input() isShowAssignee = true;

  /**
   * プロジェクトツリー
   */
  projectTrees: ProjectTree[] = [];

  /**
   * チャート行のアイテム（プロジェクト、マイルストーン、イシューを階層的に配置）
   */
  chartRowItems: ChartRowItem[] = [];

  /**
   * 折り畳み状態を管理するMap
   */
  private collapsedStates = new Map<string, boolean>();

  /**
   * カレンダーの縦線
   */
  calendarVerticalLines: CalendarVerticalLine[] = [];

  /**
   * スクロールバーの表示状態
   */
  isScrollBarActive = false;

  @ViewChild('issueRowArea') issueRowArea!: ElementRef;

  /**
   * 非同期処理の購読まとめ
   */
  private subscription = new Subscription();

  /**
   * タイトルの幅
   */
  private _titleWidth: number = titleWidthDefault;

  /**
   * ステータスの幅
   */
  private _statusWidth: number = statusWidthDefault;

  /**
   * 担当者の幅
   */
  private _assigneeWidth: number = assigneeWidthDefault;

  constructor(
    private readonly projectTreeStore: ProjectTreeStoreService,
    private readonly calendarDisplayService: CalendarDisplayService,
    private readonly calendarPositionService: CalendarPositionService,
    private readonly calendarRangeService: CalendarRangeService,
    private readonly calendarWidthService: CalendarWidthService,
    private readonly issuesUpdateService: IssuesUpdateService,
    private readonly cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.subscription.add(
      this.projectTreeStore.projectTree$.subscribe((projectTrees) => {
        this.projectTrees = projectTrees;
        this.buildChartRowItems();
      })
    );

    // カレンダーの縦線を監視
    this.subscription.add(
      this.calendarDisplayService.calendarVerticalLines$.subscribe((lines) => {
        this.calendarVerticalLines = lines;

        /**
         * カレンダーの領域が更新された時に
         * すぐに描画に更新されないことがあったため
         * 強制的にChange Detectionを実行
         */
        this.cdr.detectChanges();
      })
    );

    this.calendarRangeService.setRange(
      DateHandler.getTodayOffsetDate(calendarStartDateOffset),
      DateHandler.getTodayOffsetDate(calendarEndDateOffset)
    );
  }

  /**
   * プロジェクトツリーからチャート行アイテムを構築
   */
  private buildChartRowItems(): void {
    this.chartRowItems = [];

    this.projectTrees.forEach((projectTree) => {
      const projectId = `project-${projectTree.project.id}`;
      const isProjectCollapsed = this.collapsedStates.get(projectId) || false;

      // プロジェクト行を追加
      this.chartRowItems.push({
        type: 'project',
        data: projectTree.project,
        isCollapsed: isProjectCollapsed,
      });

      // プロジェクトが折り畳まれていない場合のみ、マイルストーンとイシューを表示
      if (!isProjectCollapsed) {
        projectTree.milestones.forEach((milestoneTree) => {
          const milestoneId = `milestone-${milestoneTree.milestone.id}`;
          const isMilestoneCollapsed =
            this.collapsedStates.get(milestoneId) || false;

          // マイルストーン行を追加
          this.chartRowItems.push({
            type: 'milestone',
            data: milestoneTree.milestone,
            isCollapsed: isMilestoneCollapsed,
            parentId: projectId,
          });

          // マイルストーンが折り畳まれていない場合のみ、イシューを表示
          if (!isMilestoneCollapsed) {
            milestoneTree.issues.forEach((issue) => {
              this.chartRowItems.push({
                type: 'issue',
                data: issue,
                parentId: milestoneId,
              });
            });
          }
        });
      }
    });
  }

  /**
   * 折り畳みボタンのクリックイベントハンドラー
   */
  onToggleCollapse(item: ChartRowItem): void {
    if (item.type === 'project') {
      const projectId = `project-${item.data.id}`;
      const currentState = this.collapsedStates.get(projectId) || false;
      this.collapsedStates.set(projectId, !currentState);
    } else if (item.type === 'milestone') {
      const milestoneId = `milestone-${item.data.id}`;
      const currentState = this.collapsedStates.get(milestoneId) || false;
      this.collapsedStates.set(milestoneId, !currentState);
    }

    // チャート行アイテムを再構築
    this.buildChartRowItems();
  }

  /**
   * アイテムが折り畳まれているかどうかを判定
   */
  isItemCollapsed(item: ChartRowItem): boolean {
    if (item.type === 'project') {
      const projectId = `project-${item.data.id}`;
      return this.collapsedStates.get(projectId) || false;
    } else if (item.type === 'milestone') {
      const milestoneId = `milestone-${item.data.id}`;
      return this.collapsedStates.get(milestoneId) || false;
    }
    return false;
  }

  /**
   * アイテムの子要素数を取得
   */
  getChildCount(item: ChartRowItem): number {
    if (item.type === 'project') {
      const projectTree = this.projectTrees.find(
        (pt) => pt.project.id === item.data.id
      );
      if (projectTree) {
        return projectTree.milestones.length;
      }
    } else if (item.type === 'milestone') {
      const projectTree = this.projectTrees.find(
        (pt) =>
          pt.project.id === parseInt(item.parentId.replace('project-', ''))
      );
      if (projectTree) {
        const milestoneTree = projectTree.milestones.find(
          (mt) => mt.milestone.id === item.data.id
        );
        if (milestoneTree) {
          return milestoneTree.issues.length;
        }
      }
    }
    return 0;
  }

  ngAfterViewInit(): void {
    const element = this.issueRowArea.nativeElement;
    const checkScroll = () => {
      this.isScrollBarActive = element.scrollHeight > element.clientHeight;
    };

    // 初期チェック
    checkScroll();

    // リサイズイベントの監視
    const resizeObserver = new ResizeObserver(checkScroll);
    resizeObserver.observe(element);
  }

  /**
   * 1日あたりの幅を取得
   */
  get dayPerWidth(): number {
    return (
      this.calendarWidthService.currentWidth /
      this.calendarRangeService.totalDays
    );
  }

  /**
   * カレンダーのオフセットを取得
   */
  get calendarOffset(): number {
    return this.calendarPositionService.currentOffset;
  }

  /**
   * タイトルの幅を取得
   */
  get titleWidth() {
    return this.isShowTitle ? this._titleWidth : 0;
  }

  /**
   * タイトルの幅を設定
   */
  set titleWidth(value: number) {
    this._titleWidth = value;
  }

  /**
   * ステータスの幅を取得
   */
  get statusWidth() {
    return this.isShowStatus ? this._statusWidth : 0;
  }

  /**
   * ステータスの幅を設定
   */
  set statusWidth(value: number) {
    this._statusWidth = value;
  }

  /**
   * 担当者の幅を取得
   */
  get assigneeWidth() {
    return this.isShowAssignee ? this._assigneeWidth : 0;
  }

  /**
   * 担当者の幅を設定
   */
  set assigneeWidth(value: number) {
    this._assigneeWidth = value;
  }

  /**
   * issueの開始日変更時の処理
   */
  onIssueStartDateChange(issue: Issue, newStartDate: Date | undefined): void {
    issue.start_date = newStartDate;
    // サーバーに更新を送信
    this.updateIssueOnServer(issue);
  }

  /**
   * issueの終了日変更時の処理
   */
  onIssueEndDateChange(issue: Issue, newEndDate: Date | undefined): void {
    issue.end_date = newEndDate;
    // サーバーに更新を送信
    this.updateIssueOnServer(issue);
  }

  /**
   * サーバーにissueの更新を送信する
   */
  private updateIssueOnServer(issue: Issue): void {
    this.issuesUpdateService
      .updateIssueDates(issue, issue.start_date, issue.end_date)
      .subscribe({
        next: (updatedIssue) => {
          // 更新されたissueで古いissueを置き換える
          Object.assign(issue, updatedIssue);
        },
        error: (error) => {
          // エラーが発生した場合は、元の値に戻すか、ユーザーに通知
          Assertion.assert(
            `Failed to update issue on server: ${error}`,
            Assertion.no(21)
          );
        },
      });
  }
}
