import {
  Component,
  Input,
  OnInit,
  ViewChild,
  ElementRef,
  AfterViewInit,
} from '@angular/core';
import { IssuesStoreService } from '@src/app/store/issues-store.service';
import { Issue } from '@src/app/model/issue.model';
import {
  calendarEndDateOffset,
  calendarStartDateOffset,
} from '@src/app/chart-area/chat-area-view.default';
import {
  assigneeWidthDefault,
  statusWidthDefault,
  titleWidthDefault,
} from '@src/app/chart-area/issue-column/issue-column-view.default';
import { DateHandler } from '@src/app/utils/time';
import {
  CalendarDisplayService,
  CalendarVerticalLine,
} from './calendar-vertical-line.service';
import { CalendarPositionService } from './calendar-position.service';
import { CalendarRangeService } from './calendar-range.service';
import { CalendarWidthService } from './calendar-width.service';

@Component({
  selector: 'app-chart-area',
  standalone: false,
  templateUrl: './chart-area.component.html',
  styleUrls: ['./chart-area.component.scss'],
})
export class ChartAreaComponent implements OnInit, AfterViewInit {
  @Input() isShowTitle = true;
  @Input() isShowStatus = true;
  @Input() isShowAssignee = true;

  /**
   * Logic fields
   */
  issues: Issue[] = [];

  /**
   * カレンダーの縦線
   */
  calendarVerticalLines: CalendarVerticalLine[] = [];

  /**
   * 日付の表示パターン
   * - 日付ごとに隠すかどうかのパターン
   */
  isHiddenDatePattern: boolean[] = [];

  get dayPerWidth(): number {
    return (
      this.calendarWidthService.currentWidth /
      this.calendarRangeService.totalDays
    );
  }

  // タイトルの幅
  get titleWidth() {
    return this.isShowTitle ? this._titleWidth : 0;
  }

  set titleWidth(value: number) {
    this._titleWidth = value;
  }

  private _titleWidth: number = titleWidthDefault;

  // ステータスの幅
  get statusWidth() {
    return this.isShowStatus ? this._statusWidth : 0;
  }

  set statusWidth(value: number) {
    this._statusWidth = value;
  }

  private _statusWidth: number = statusWidthDefault;

  // 担当者の幅
  get assigneeWidth() {
    return this.isShowAssignee ? this._assigneeWidth : 0;
  }

  set assigneeWidth(value: number) {
    this._assigneeWidth = value;
  }

  private _assigneeWidth: number = assigneeWidthDefault;

  @ViewChild('issueRowArea') issueRowArea!: ElementRef;
  isScrollBarActive = false;

  constructor(
    private issueStore: IssuesStoreService,
    private calendarDisplayService: CalendarDisplayService,
    private calendarPositionService: CalendarPositionService,
    private calendarRangeService: CalendarRangeService,
    private calendarWidthService: CalendarWidthService
  ) {}

  get calendarOffset(): number {
    return this.calendarPositionService.currentOffset;
  }

  ngOnInit(): void {
    this.issueStore.issues$.subscribe((issues) => {
      // TODO: ここでissuesをソートする
      // TODO: ここでissuesをグループ化する
      // TODO: ここでissuesをフィルターする
      this.issues = issues;
    });

    // カレンダーの縦線を監視
    this.calendarDisplayService.calendarVerticalLines$.subscribe((lines) => {
      this.calendarVerticalLines = lines;
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
}
