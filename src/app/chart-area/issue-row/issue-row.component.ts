import {
  Component,
  Input,
  Output,
  EventEmitter,
  ElementRef,
  ViewChild,
  HostListener,
  OnInit,
  OnDestroy,
} from '@angular/core';
import { CdkDragMove } from '@angular/cdk/drag-drop';
import {
  calendarEndDateOffset,
  calendarStartDateOffset,
} from '@src/app/chart-area/chat-area-view.default';
import {
  assigneeWidthDefault,
  statusWidthDefault,
  titleWidthDefault,
} from '@src/app/chart-area/issue-column/issue-column-view.default';
import { isUndefined } from '@src/app/utils/utils';
import { DateHandler } from '@src/app/utils/time';
import { getBarStyle } from '@src/app/chart-area/issue-row/issue-bar-style-handler';
import { IssueDetailDialogExpansionService } from '@src/app/issue-detail-dialog/issue-detail-dialog-expansion.service';
import {
  newEndDateCreateOffsetDays,
  undefinedDuration,
} from '@src/app/chart-area/issue-row/issue-row-logic.default';
import { Assertion } from '@src/app/utils/assertion';
import { CalendarRangeService } from '../calendar-range.service';
import { Subscription } from 'rxjs';
import {
  CalendarDisplayService,
  DateDisplay,
} from '../calendar-display.service';

@Component({
  selector: 'app-issue-row',
  standalone: false,
  templateUrl: './issue-row.component.html',
  styleUrl: './issue-row.component.scss',
})
export class IssueRowComponent implements OnInit, OnDestroy {
  private subscription = new Subscription();

  dateData: DateDisplay[] = [];

  constructor(
    private issueDetailDialogExpansionService: IssueDetailDialogExpansionService,
    private calendarRangeService: CalendarRangeService,
    private calendarDisplayService: CalendarDisplayService
  ) {}

  ngOnInit(): void {
    this.subscription.add(
      this.calendarDisplayService.calendarDisplay$.subscribe((display) => {
        this.dateData = display.dateData;
      })
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  @ViewChild('calendarArea') calendarArea!: ElementRef<HTMLDivElement>;

  /**
   * ホバー状態を管理するフラグ
   */
  isHovered = false;

  /**
   * Logic fields
   */
  @Input() id = 0;
  @Input() title = 'dummy title';
  @Input() state = 'dummy state';
  @Input() assignee: string | undefined;
  @Input() startDate: Date | undefined;
  @Input() endDate: Date | undefined;
  @Output() startDateChange = new EventEmitter<Date | undefined>();
  @Output() endDateChange = new EventEmitter<Date | undefined>();

  /**
   * 終了日のドラッグ中に呼ばれる関数
   * ドラッグ中に終了日を更新する
   */
  private updateEndDate: ((distance: number) => void) | undefined;

  /**
   * 開始日のドラッグ中に呼ばれる関数
   * ドラッグ中に開始日・終了日を更新する
   */
  private updateSchedule: ((distance: number) => void) | undefined;

  get titleStyle(): Record<string, string> {
    if (this.titleWidth === 0) {
      return {
        display: 'none',
      };
    }
    return {
      width: this.titleWidth + 'px',
      flex: '0 0 ' + this.titleWidth + 'px',
    };
  }

  get statusStyle(): Record<string, string> {
    if (this.statusWidth === 0) {
      return {
        display: 'none',
      };
    }
    return {
      width: this.statusWidth + 'px',
      flex: '0 0 ' + this.statusWidth + 'px',
    };
  }

  get assigneeStyle(): Record<string, string> {
    if (this.assigneeWidth === 0) {
      return {
        display: 'none',
      };
    }
    return {
      width: this.assigneeWidth + 'px',
      flex: '0 0 ' + this.assigneeWidth + 'px',
    };
  }

  @Input() titleWidth: number = titleWidthDefault;

  @Input() statusWidth: number = statusWidthDefault;

  @Input() assigneeWidth: number = assigneeWidthDefault;

  /**
   * バーの位置と幅を計算する
   */
  get barStyle(): Record<string, string | undefined> {
    const { startDate, endDate } = this.calendarRangeService.getCalendarRange();
    return getBarStyle(startDate, endDate, this.startDate, this.endDate);
  }

  /**
   * 開始日と終了日が未設定の場合は、終了日作成ボタンを表示する
   */
  get showEndDateCreateButton(): boolean {
    return isUndefined(this.startDate) && isUndefined(this.endDate);
  }

  /**
   * 終了日のドラッグ開始時に呼ばれる関数
   * 終了日のドラッグ中に呼ばれる関数を設定する
   */
  onEndDateDragStart() {
    if (
      isUndefined(this.calendarArea) ||
      isUndefined(this.calendarArea.nativeElement)
    ) {
      Assertion.assert('calendarArea is undefined.', Assertion.no(8));
      return;
    }

    let endDate = this.endDate;

    if (isUndefined(endDate)) {
      if (isUndefined(this.startDate)) {
        Assertion.assert('startDate is undefined.', Assertion.no(9));
        return;
      }
      endDate = new Date(this.startDate.getTime());
      endDate.setDate(endDate.getDate() + 2);
    }

    const { startDate: calendarStartDate, endDate: calendarEndDate } =
      this.calendarRangeService.getCalendarRange();
    const totalDays = DateHandler.countDateBetween(
      calendarStartDate,
      calendarEndDate
    );
    const calendarWidth = this.calendarArea.nativeElement.offsetWidth;
    const daysPerPixel = calendarWidth / totalDays;

    this.updateEndDate = (distance: number) => {
      const movedDays = Math.round(distance / daysPerPixel);
      const newEndDate = new Date(endDate);
      newEndDate.setDate(newEndDate.getDate() + movedDays);

      // 開始日が設定されている場合、終了日が開始日より前にならないようにする
      if (!isUndefined(this.startDate) && newEndDate < this.startDate) {
        return;
      }

      this.endDate = newEndDate;
    };
  }

  /**
   * 終了日のドラッグ中に呼ばれる関数
   * ドラッグ中に終了日を更新する
   */
  onEndDateDragMoved(event: CdkDragMove) {
    if (isUndefined(this.updateEndDate)) return;
    this.updateEndDate(event.distance.x);
  }

  /**
   * 終了日のドラッグ終了時に呼ばれる関数
   * 終了日を更新し、変更を通知する
   * ドラッグ中に呼ばれる関数を削除する
   */
  onEndDateDragEnd() {
    this.endDateChange.emit(this.endDate);
    this.updateEndDate = undefined;
  }

  /**
   * 開始日のドラッグ開始時に呼ばれる関数
   * 開始日のドラッグ中に呼ばれる関数を設定する
   */
  onStartDateDragStart() {
    if (
      isUndefined(this.calendarArea) ||
      isUndefined(this.calendarArea.nativeElement)
    ) {
      Assertion.assert('calendarArea is undefined.', Assertion.no(10));
      return;
    }

    const endDate = this.endDate;
    const startDate = this.startDate;

    const { startDate: calendarStartDate, endDate: calendarEndDate } =
      this.calendarRangeService.getCalendarRange();
    const totalDays = DateHandler.countDateBetween(
      calendarStartDate,
      calendarEndDate
    );

    const calendarWidth = this.calendarArea.nativeElement.offsetWidth;
    const daysPerPixel = calendarWidth / totalDays;

    // startDateがundefinedの場合は、endDateのみを移動させる
    if (isUndefined(startDate)) {
      if (isUndefined(endDate)) {
        Assertion.assert('endDate is undefined.', Assertion.no(11));
        return;
      }

      this.updateSchedule = (distance: number) => {
        const movedDays = Math.round(distance / daysPerPixel);
        const newEndDate = new Date(endDate);
        newEndDate.setDate(newEndDate.getDate() + movedDays);
        this.endDate = newEndDate;
      };
      return;
    }

    this.updateSchedule = (distance: number) => {
      const movedDays = Math.round(distance / daysPerPixel);
      const newStartDate = new Date(startDate);
      newStartDate.setDate(newStartDate.getDate() + movedDays);

      // 終了日が設定されている場合、開始日が終了日より後にならないようにする
      if (!isUndefined(endDate) && newStartDate > endDate) {
        return;
      }

      this.startDate = newStartDate;

      // 終了日が設定されている場合、終了日も更新する
      if (!isUndefined(endDate)) {
        const newEndDate = new Date(endDate);
        newEndDate.setDate(newEndDate.getDate() + movedDays);
        this.endDate = newEndDate;
      }
    };
  }

  /**
   * 開始日のドラッグ中に呼ばれる関数
   * ドラッグ中に開始日を更新する
   */
  onStartDateDragMoved(event: CdkDragMove) {
    if (isUndefined(this.updateSchedule)) return;
    this.updateSchedule(event.distance.x);
  }

  /**
   * 開始日のドラッグ終了時に呼ばれる関数
   * 開始日を更新し、変更を通知する
   * ドラッグ中に呼ばれる関数を削除する
   */
  onStartDateDragEnd() {
    this.startDateChange.emit(this.startDate);
    this.updateSchedule = undefined;
  }

  /**
   * 開始日のハンドルがダブルクリックされた時に呼ばれる関数
   */
  onStartDateDoubleClick() {
    if (!isUndefined(this.startDate)) {
      // startDateが設定されている場合、undefinedに設定
      this.startDate = undefined;
      this.startDateChange.emit(undefined);
      return;
    }

    if (!isUndefined(this.endDate)) {
      // startDateが設定されていない場合、終了日の1日前に設定
      const newStartDate = new Date(this.endDate);
      newStartDate.setDate(newStartDate.getDate() - undefinedDuration + 1);
      this.startDate = newStartDate;
      this.startDateChange.emit(newStartDate);
      return;
    }

    /**
     * 開始日も終了日も設定されていない場合、何もしない
     */
  }

  /**
   * 終了日のダブルクリック時に呼ばれる関数
   * 終了日が未設定の場合は開始日+1日に設定
   * 終了日が設定済みの場合は未設定に変更
   */
  onEndDateDoubleClick() {
    if (!isUndefined(this.endDate)) {
      this.endDate = undefined;
      this.endDateChange.emit(undefined);
      return;
    }

    if (!isUndefined(this.startDate)) {
      this.endDate = new Date(this.startDate);
      this.endDate.setDate(this.endDate.getDate() + undefinedDuration - 1);
      this.endDateChange.emit(this.endDate);
      return;
    }

    /**
     * 開始日も終了日も設定されていない場合、何もしない
     */
  }

  /**
   * 終了日作成ボタンがクリックされたときに呼ばれる関数
   * 今日から5日後の日付を終了日として設定する
   */
  onEndDateCreateClick() {
    const newEndDate = new Date();
    newEndDate.setDate(newEndDate.getDate() + newEndDateCreateOffsetDays);
    this.endDate = newEndDate;
    this.endDateChange.emit(this.endDate);
  }

  /**
   * タイトルクリック時に呼ばれる関数
   */
  onTitleClick() {
    this.issueDetailDialogExpansionService.setExpandedIssueId(this.id);
  }

  /**
   * マウスが要素に入った時のイベントハンドラー
   */
  @HostListener('mouseenter')
  onMouseEnter() {
    this.isHovered = true;
  }

  /**
   * マウスが要素から出た時のイベントハンドラー
   */
  @HostListener('mouseleave')
  onMouseLeave() {
    this.isHovered = false;
  }

  /**
   * ngForのトラッキング関数
   * 日付をキーとして使用して、不要なDOMの再レンダリングを防ぐ
   */
  trackByDate(_index: number, date: DateDisplay): string {
    return date.date.toISOString();
  }

  getDayStyle(index: number): { [key: string]: string } {
    return {
      width: this.dateData[index].width + 'px',
      'border-left':
        this.dateData[index].monthDisplay || this.dateData[index].dayDisplay
          ? '1px dashed #9c9c9c'
          : 'none',
    };
  }
}
