import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import {
  assigneeWidthDefault,
  statusWidthDefault,
  titleWidthDefault,
} from '../chart-area/issue-column/issue-column-view.const';
// XXX ↑　ここら辺のマネジメントもサービスの管轄としたい
import { MemberStoreService } from '../store/member-store.service';
import { LabelStoreService } from '../store/label-store.service';

@Injectable({
  providedIn: 'root',
})
export class ViewService {
  constructor(
    private readonly memberStore: MemberStoreService,
    private readonly labelStore: LabelStoreService
  ) {
    this.memberStore.members$.subscribe(members => {
      // メンバーの数が変わったときはとりあえず、全部表示する状態にする
      this._filteredAssigneeIDs = members.map(member => member.id);
      this._filteredAssigneeIDs.push(-1); // 未設定を表す
    });

    this.labelStore.labels$.subscribe(labels => {
      // ラベルの数が変わったときはとりあえず、全部表示する状態にする
      this._filteredLabelIDs = labels.map(label => label.id);
    });

    this.labelStore.classifiedLabels$.subscribe(() => {
      // ラベルの数が変わったときはとりあえず、全部表示する状態にする
      this._filteredStatusIDs = this.labelStore.statusLabels.map(label => label.id);
      this._filteredStatusIDs.push(-1); // 未設定を表す

      this._filteredResourceIDs = this.labelStore.resourceLabels.map(label => label.id);
    });
  }
  /**
   * 設定変更を通知するSubject
   */
  private viewConfigChange$ = new Subject<void>();

  /**
   * 設定変更通知のObservable
   */
  public readonly viewConfigChanged$ = this.viewConfigChange$.asObservable();

  /**
   * カラムの選択
   */
  private _isTitleShow = true;
  private _titleWidth = titleWidthDefault; //px
  private _isStatusShow = true;
  private _statusWidth = statusWidthDefault; //px
  private _isAssigneeShow = true;
  private _assigneeWidth = assigneeWidthDefault; //px

  /**
   * フィルターの選択
   */
  private _isFilteredByStatus = false;
  private _isFilteredByAssignee = false;
  private _isFilteredByResource = false;
  private _isFilteredByLabel = false;
  // フィルターを通過する（表示する）IDを格納する
  private _filteredStatusIDs: number[] = [];
  private _filteredAssigneeIDs: number[] = [];
  private _filteredResourceIDs: number[] = [];
  private _filteredLabelIDs: number[] = [];

  /**
   * 行の高さ
   */
  private _issueRowHeight = 30; //px

  /**
   * 強調表示
   */
  private _isHighlightedToday = true;
  private _isHighlightedHoliday = true;

  /**
   * 特殊な表示
   * - issueのあるマイルストーンだけ表示する
   * - 開いているマイルストーンだけ表示する
   * - マイルストーンの縦線をカレンダーの縦線として表示する
   */
  private _isMilestoneShowOnlyWithIssue = false;
  private _isMilestoneShowOnlyOpened = false;
  private _isMilestoneInlineMode = false;

  // ゲッターとセッター
  get isTitleShow(): boolean {
    return this._isTitleShow;
  }
  set isTitleShow(value: boolean) {
    if (this._isTitleShow !== value) {
      this._isTitleShow = value;
      this.notifyViewConfigChange();
    }
  }

  get titleWidth(): number {
    return this._titleWidth;
  }
  set titleWidth(value: number) {
    if (this._titleWidth !== value) {
      this._titleWidth = value;
      this.notifyViewConfigChange();
    }
  }

  get isStatusShow(): boolean {
    return this._isStatusShow;
  }
  set isStatusShow(value: boolean) {
    if (this._isStatusShow !== value) {
      this._isStatusShow = value;
      this.notifyViewConfigChange();
    }
  }

  get statusWidth(): number {
    return this._statusWidth;
  }
  set statusWidth(value: number) {
    if (this._statusWidth !== value) {
      this._statusWidth = value;
      this.notifyViewConfigChange();
    }
  }

  get isAssigneeShow(): boolean {
    return this._isAssigneeShow;
  }
  set isAssigneeShow(value: boolean) {
    if (this._isAssigneeShow !== value) {
      this._isAssigneeShow = value;
      this.notifyViewConfigChange();
    }
  }

  get assigneeWidth(): number {
    return this._assigneeWidth;
  }
  set assigneeWidth(value: number) {
    if (this._assigneeWidth !== value) {
      this._assigneeWidth = value;
      this.notifyViewConfigChange();
    }
  }

  get isFilteredByStatus(): boolean {
    return this._isFilteredByStatus;
  }
  set isFilteredByStatus(value: boolean) {
    if (this._isFilteredByStatus !== value) {
      this._isFilteredByStatus = value;
      this.notifyViewConfigChange();
    }
  }

  get filteredStatusIDs(): number[] {
    return this._filteredStatusIDs;
  }
  set filteredStatusIDs(value: number[]) {
    this._filteredStatusIDs = value;
    this.notifyViewConfigChange();
  }

  get isFilteredByAssignee(): boolean {
    return this._isFilteredByAssignee;
  }
  set isFilteredByAssignee(value: boolean) {
    if (this._isFilteredByAssignee !== value) {
      this._isFilteredByAssignee = value;
      this.notifyViewConfigChange();
    }
  }

  get filteredAssigneeIDs(): number[] {
    return this._filteredAssigneeIDs;
  }
  set filteredAssigneeIDs(value: number[]) {
    this._filteredAssigneeIDs = value;
    this.notifyViewConfigChange();
  }

  get isFilteredByResource(): boolean {
    return this._isFilteredByResource;
  }
  set isFilteredByResource(value: boolean) {
    this._isFilteredByResource = value;
  }

  get filteredResourceIDs(): number[] {
    return this._filteredResourceIDs;
  }
  set filteredResourceIDs(value: number[]) {
    this._filteredResourceIDs = value;
  }

  get isFilteredByLabel(): boolean {
    return this._isFilteredByLabel;
  }
  set isFilteredByLabel(value: boolean) {
    if (this._isFilteredByLabel !== value) {
      this._isFilteredByLabel = value;
      this.notifyViewConfigChange();
    }
  }

  get filteredLabelIDs(): number[] {
    return this._filteredLabelIDs;
  }
  set filteredLabelIDs(value: number[]) {
    this._filteredLabelIDs = value;
  }

  get issueRowHeight(): number {
    return this._issueRowHeight;
  }
  set issueRowHeight(value: number) {
    if (this._issueRowHeight !== value) {
      this._issueRowHeight = value;
      this.notifyViewConfigChange();
    }
  }

  get isHighlightedToday(): boolean {
    return this._isHighlightedToday;
  }
  set isHighlightedToday(value: boolean) {
    if (this._isHighlightedToday !== value) {
      this._isHighlightedToday = value;
      this.notifyViewConfigChange();
    }
  }

  get isHighlightedHoliday(): boolean {
    return this._isHighlightedHoliday;
  }
  set isHighlightedHoliday(value: boolean) {
    if (this._isHighlightedHoliday !== value) {
      this._isHighlightedHoliday = value;
      this.notifyViewConfigChange();
    }
  }

  get isMilestoneShowOnlyWithIssue(): boolean {
    return this._isMilestoneShowOnlyWithIssue;
  }
  set isMilestoneShowOnlyWithIssue(value: boolean) {
    if (this._isMilestoneShowOnlyWithIssue !== value) {
      this._isMilestoneShowOnlyWithIssue = value;
      this.notifyViewConfigChange();
    }
  }

  get isMilestoneShowOnlyOpened(): boolean {
    return this._isMilestoneShowOnlyOpened;
  }
  set isMilestoneShowOnlyOpened(value: boolean) {
    if (this._isMilestoneShowOnlyOpened !== value) {
      this._isMilestoneShowOnlyOpened = value;
      this.notifyViewConfigChange();
    }
  }

  get isMilestoneInlineMode(): boolean {
    return this._isMilestoneInlineMode;
  }
  set isMilestoneInlineMode(value: boolean) {
    if (this._isMilestoneInlineMode !== value) {
      this._isMilestoneInlineMode = value;
      this.notifyViewConfigChange();
    }
  }

  /**
   * 見た目にかかわる設定をjsonから読み込む
   */
  readViewConfig() {
    // TODO: ここにjsonの読み込みを書く
  }

  /**
   * 見た目にかかわる設定をjsonに反映する
   */
  writeViewConfig() {
    // TODO: ここにjsonの上書きを書く
  }

  /**
   * 設定変更を通知
   */
  private notifyViewConfigChange(): void {
    this.viewConfigChange$.next();
  }
}
