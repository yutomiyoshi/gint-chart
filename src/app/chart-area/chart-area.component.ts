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

/**
 * チャート行のアイテムを表現するインターフェース
 */
export interface ChartRowItem {
  type: 'project' | 'milestone' | 'issue';
  data: any;
}

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
      // プロジェクト行を追加
      this.chartRowItems.push({
        type: 'project',
        data: projectTree.project,
      });

      // マイルストーン行を追加
      projectTree.milestones.forEach((milestoneTree) => {
        this.chartRowItems.push({
          type: 'milestone',
          data: milestoneTree.milestone,
        });

        // イシュー行を追加
        milestoneTree.issues.forEach((issue) => {
          this.chartRowItems.push({
            type: 'issue',
            data: issue,
          });
        });
      });
    });
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
}
