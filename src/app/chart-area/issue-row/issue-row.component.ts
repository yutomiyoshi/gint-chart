import {
  Component,
  Input,
  Output,
  EventEmitter,
  ElementRef,
  ViewChild,
  HostListener,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { CdkDragMove } from '@angular/cdk/drag-drop';
import { Subscription } from 'rxjs';
import {
  assigneeWidthDefault,
  statusWidthDefault,
  titleWidthDefault,
} from '@src/app/chart-area/issue-column/issue-column-view.const';
import { isUndefined } from '@src/app/utils/utils';
import { getBarStyle } from '@src/app/chart-area/issue-row/issue-bar-style-handler';
import { IssueDetailDialogExpansionService } from '@src/app/issue-detail-dialog/issue-detail-dialog-expansion.service';
import {
  newEndDateCreateOffsetDays,
  undefinedDuration,
} from '@src/app/chart-area/issue-row/issue-row-logic.const';
import { Assertion } from '@src/app/utils/assertion';
import { CalendarRangeService } from '@src/app/chart-area/calendar-range.service';
import { CalendarWidthService } from '@src/app/chart-area/calendar-width.service';
import { LabelStoreService } from '@src/app/store/label-store.service';
import { StatusSelectorDialogExpansionService } from '@src/app/status-selector-dialog/status-selector-dialog-expansion.service';

@Component({
  selector: 'app-issue-row',
  standalone: false,
  templateUrl: './issue-row.component.html',
  styleUrl: './issue-row.component.scss',
})
export class IssueRowComponent implements OnInit, OnDestroy {
  /**
   * イシューID
   */
  @Input() id = 0;

  /**
   * イシュータイトル
   */
  @Input() title = 'dummy title';

  /**
   * イシューステータス
   */
  @Input() status: number | undefined;

  /**
   * 担当者
   */
  @Input() assignee: string | undefined;

  /**
   * 開始日
   */
  @Input() startDate: Date | undefined;

  /**
   * 終了日
   */
  @Input() endDate: Date | undefined;

  /**
   * スケジュール変更イベント（開始日・終了日）
   */
  @Output() scheduleChange = new EventEmitter<{
    startDate: Date | undefined;
    endDate: Date | undefined;
  }>();

  /**
   * ステータス変更イベント
   */
  @Output() statusChange = new EventEmitter<number | undefined>();

  /**
   * タイトル幅
   */
  @Input() titleWidth: number = titleWidthDefault;

  /**
   * ステータス幅
   */
  @Input() statusWidth: number = statusWidthDefault;

  /**
   * 担当者幅
   */
  @Input() assigneeWidth: number = assigneeWidthDefault;

  /**
   * カレンダーエリアの参照
   */
  @ViewChild('calendarArea') calendarArea!: ElementRef<HTMLDivElement>;

  /**
   * ホバー状態を管理するフラグ
   */
  isHovered = false;

  private subscription = new Subscription();

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

  constructor(
    private readonly issueDetailDialogExpansionService: IssueDetailDialogExpansionService,
    private readonly calendarRangeService: CalendarRangeService,
    private readonly calendarWidthService: CalendarWidthService,
    private readonly labelStore: LabelStoreService,
    private readonly statusSelectorDialogExpansionService: StatusSelectorDialogExpansionService
  ) {}

  ngOnInit(): void {
    // StatusSelectorDialogExpansionServiceからの変更通知を監視
    this.subscription.add(
      this.statusSelectorDialogExpansionService.status$.subscribe(
        (statusData) => {
          if (isUndefined(statusData)) {
            return;
          }

          if (statusData.issueId !== this.id) {
            return;
          }

          if (statusData.statusId === this.status) {
            return;
          }

          // コンポーネントに紐づいたidと通知のissueIdが一致し、
          // ステータスIDに変化があった場合にEventEmitterで通知
          this.status = statusData.statusId;
          this.statusChange.emit(this.status);
        }
      )
    );
  }

  /**
   * コンポーネント破棄時にサブスクリプションを解除
   */
  ngOnDestroy() {
    this.subscription.unsubscribe();
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

    const totalDays = this.calendarRangeService.totalDays;
    const calendarWidth = this.calendarWidthService.currentWidth;
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
    this.scheduleChange.emit({
      startDate: this.startDate,
      endDate: this.endDate,
    });
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

    const totalDays = this.calendarRangeService.totalDays;
    const calendarWidth = this.calendarWidthService.currentWidth;
    const daysPerWidth = calendarWidth / totalDays;

    // startDateがundefinedの場合は、endDateのみを移動させる
    if (isUndefined(startDate)) {
      if (isUndefined(endDate)) {
        Assertion.assert('endDate is undefined.', Assertion.no(11));
        return;
      }

      this.updateSchedule = (distance: number) => {
        const movedDays = Math.round(distance / daysPerWidth);
        const newEndDate = new Date(endDate);
        newEndDate.setDate(newEndDate.getDate() + movedDays);
        this.endDate = newEndDate;
      };
      return;
    }

    this.updateSchedule = (distance: number) => {
      const movedDays = Math.round(distance / daysPerWidth);
      const newStartDate = new Date(startDate);
      newStartDate.setDate(newStartDate.getDate() + movedDays);

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
    this.scheduleChange.emit({
      startDate: this.startDate,
      endDate: this.endDate,
    });
    this.updateSchedule = undefined;
  }

  /**
   * 開始日のハンドルがダブルクリックされた時に呼ばれる関数
   */
  onStartDateDoubleClick() {
    if (!isUndefined(this.startDate)) {
      // startDateが設定されている場合、undefinedに設定
      this.startDate = undefined;
      this.scheduleChange.emit({
        startDate: this.startDate,
        endDate: this.endDate,
      });
      return;
    }

    if (!isUndefined(this.endDate)) {
      // startDateが設定されていない場合、終了日の1日前に設定
      const newStartDate = new Date(this.endDate);
      newStartDate.setDate(newStartDate.getDate() - undefinedDuration + 1);
      this.startDate = newStartDate;
      this.scheduleChange.emit({
        startDate: this.startDate,
        endDate: this.endDate,
      });
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
      this.scheduleChange.emit({
        startDate: this.startDate,
        endDate: this.endDate,
      });
      return;
    }

    if (!isUndefined(this.startDate)) {
      this.endDate = new Date(this.startDate);
      this.endDate.setDate(this.endDate.getDate() + undefinedDuration - 1);
      this.scheduleChange.emit({
        startDate: this.startDate,
        endDate: this.endDate,
      });
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
    this.scheduleChange.emit({
      startDate: this.startDate,
      endDate: this.endDate,
    });
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
   * バーの位置と幅を計算する
   */
  get barStyle(): Record<string, string | undefined> {
    const { startDate: displayStartDate, endDate: displayEndDate } =
      this.calendarRangeService.currentRange;
    return getBarStyle(
      displayStartDate,
      displayEndDate,
      this.startDate,
      this.endDate
    );
  }

  /**
   * 開始日と終了日が未設定の場合は、終了日作成ボタンを表示する
   */
  get showEndDateCreateButton(): boolean {
    return isUndefined(this.startDate) && isUndefined(this.endDate);
  }

  /**
   * ステータス名を取得する
   */
  getStatusName(status: number | undefined): string {
    if (isUndefined(status)) {
      return 'undefined';
    }

    const matchedLabel = this.labelStore.findStatusLabel(status);

    if (isUndefined(matchedLabel)) {
      return 'not found';
    }

    return matchedLabel.name;
  }

  /**
   * ステータスクリック時に呼ばれる関数
   */
  onStatusClick() {
    this.statusSelectorDialogExpansionService.expand(this.id, this.status);
  }
}
