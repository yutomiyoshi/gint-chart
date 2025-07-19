import { Injectable } from '@angular/core';
import { Observable, Subject, from } from 'rxjs';
import {
  ASSIGNEE_WIDTH_DEFAULT,
  IS_ASSIGNEE_SHOW_DEFAULT,
  IS_FILTERED_BY_ASSIGNEE_DEFAULT,
  IS_FILTERED_BY_LABEL_DEFAULT,
  IS_FILTERED_BY_RESOURCE_DEFAULT,
  IS_FILTERED_BY_STATUS_DEFAULT,
  IS_HIGHLIGHTED_HOLIDAY_DEFAULT,
  IS_HIGHLIGHTED_TODAY_DEFAULT,
  IS_MILESTONE_INLINE_MODE_DEFAULT,
  IS_MILESTONE_SHOW_ONLY_OPENED_DEFAULT,
  IS_MILESTONE_SHOW_ONLY_WITH_ISSUE_DEFAULT,
  IS_STATUS_SHOW_DEFAULT,
  IS_TITLE_SHOW_DEFAULT,
  ISSUE_ROW_HEIGHT_DEFAULT,
  STATUS_WIDTH_DEFAULT,
  TITLE_WIDTH_DEFAULT,
} from './view.const';
// XXX ↑　ここら辺のマネジメントもサービスの管轄としたい
import { MemberStoreService } from '../store/member-store.service';
import { LabelStoreService } from '../store/label-store.service';
import { isNull, isUndefined } from '../utils/utils';
import { ViewConfig } from '../model/view-config.model';

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
  private _isTitleShow = IS_TITLE_SHOW_DEFAULT;
  private _titleWidth = TITLE_WIDTH_DEFAULT; //px
  private _isStatusShow = IS_STATUS_SHOW_DEFAULT;
  private _statusWidth = STATUS_WIDTH_DEFAULT; //px
  private _isAssigneeShow = IS_ASSIGNEE_SHOW_DEFAULT;
  private _assigneeWidth = ASSIGNEE_WIDTH_DEFAULT; //px

  /**
   * フィルターの選択
   */
  private _isFilteredByStatus = IS_FILTERED_BY_STATUS_DEFAULT;
  private _isFilteredByAssignee = IS_FILTERED_BY_ASSIGNEE_DEFAULT;
  private _isFilteredByResource = IS_FILTERED_BY_RESOURCE_DEFAULT;
  private _isFilteredByLabel = IS_FILTERED_BY_LABEL_DEFAULT;
  // フィルターを通過する（表示する）IDを格納する
  private _filteredStatusIDs: number[] = [];
  private _filteredAssigneeIDs: number[] = [];
  private _filteredResourceIDs: number[] = [];
  private _filteredLabelIDs: number[] = [];

  /**
   * 行の高さ
   */
  private _issueRowHeight = ISSUE_ROW_HEIGHT_DEFAULT; //px

  /**
   * 強調表示
   */
  private _isHighlightedToday = IS_HIGHLIGHTED_TODAY_DEFAULT;
  private _isHighlightedHoliday = IS_HIGHLIGHTED_HOLIDAY_DEFAULT;

  /**
   * 特殊な表示
   * - issueのあるマイルストーンだけ表示する
   * - 開いているマイルストーンだけ表示する
   * - マイルストーンの縦線をカレンダーの縦線として表示する
   */
  private _isMilestoneShowOnlyWithIssue = IS_MILESTONE_SHOW_ONLY_WITH_ISSUE_DEFAULT;
  private _isMilestoneShowOnlyOpened = IS_MILESTONE_SHOW_ONLY_OPENED_DEFAULT;
  private _isMilestoneInlineMode = IS_MILESTONE_INLINE_MODE_DEFAULT;

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
  readViewConfig(): Observable<void> {
    return from(
      window.electronAPI.readViewConfig().then((config) => {
        if (isNull(config)) {
          return;
        }
        // 設定を適用
        this._isTitleShow = config.isTitleShow ?? IS_TITLE_SHOW_DEFAULT;
        this._titleWidth = config.titleWidth ?? TITLE_WIDTH_DEFAULT;
        this._isStatusShow = config.isStatusShow ?? IS_STATUS_SHOW_DEFAULT;
        this._statusWidth = config.statusWidth ?? STATUS_WIDTH_DEFAULT;
        this._isAssigneeShow = config.isAssigneeShow ?? IS_ASSIGNEE_SHOW_DEFAULT;
        this._assigneeWidth = config.assigneeWidth ?? ASSIGNEE_WIDTH_DEFAULT;
        
        this._isFilteredByStatus = config.isFilteredByStatus ?? IS_FILTERED_BY_STATUS_DEFAULT;
        this._isFilteredByAssignee = config.isFilteredByAssignee ?? IS_FILTERED_BY_ASSIGNEE_DEFAULT;
        this._isFilteredByResource = config.isFilteredByResource ?? IS_FILTERED_BY_RESOURCE_DEFAULT;
        this._isFilteredByLabel = config.isFilteredByLabel ?? IS_FILTERED_BY_LABEL_DEFAULT;
        if (isUndefined(config.filteredStatusIDs)) {
          this._filteredStatusIDs = [];
        } else {
          // 設定にないIDがあったら配列を空にする
          const validStatusIDs = this.labelStore.statusLabels.map(label => label.id);
          validStatusIDs.push(-1); // 未設定を表す
          const hasInvalidStatusID = config.filteredStatusIDs.some(id => !validStatusIDs.includes(id));
          this._filteredStatusIDs = hasInvalidStatusID ? [] : config.filteredStatusIDs;
        }
        if (isUndefined(config.filteredAssigneeIDs)) {
          this._filteredAssigneeIDs = [];
        } else {
          // 設定にないIDがあったら配列を空にする
          const memberIds = this.memberStore.membersId;
          const validAssigneeIDs = [...memberIds, -1]; // 未設定を表す
          const hasInvalidAssigneeID = config.filteredAssigneeIDs.some(id => !validAssigneeIDs.includes(id));
          this._filteredAssigneeIDs = hasInvalidAssigneeID ? [] : config.filteredAssigneeIDs;
        }
        
        this._issueRowHeight = config.issueRowHeight ?? ISSUE_ROW_HEIGHT_DEFAULT;
        
        this._isHighlightedToday = config.isHighlightedToday ?? IS_HIGHLIGHTED_TODAY_DEFAULT;
        this._isHighlightedHoliday = config.isHighlightedHoliday ?? IS_HIGHLIGHTED_HOLIDAY_DEFAULT;
        
        this._isMilestoneShowOnlyWithIssue = config.isMilestoneShowOnlyWithIssue ?? IS_MILESTONE_SHOW_ONLY_WITH_ISSUE_DEFAULT;
        this._isMilestoneShowOnlyOpened = config.isMilestoneShowOnlyOpened ?? IS_MILESTONE_SHOW_ONLY_OPENED_DEFAULT;
        this._isMilestoneInlineMode = config.isMilestoneInlineMode ?? IS_MILESTONE_INLINE_MODE_DEFAULT;
        
        // 設定変更を通知
        this.notifyViewConfigChange();
      })
    );
  }

  /**
   * 見た目にかかわる設定をjsonに反映する
   */
  writeViewConfig(): Observable<boolean> {
    const config: ViewConfig = {
      // カラムの選択
      isTitleShow: this._isTitleShow,
      titleWidth: this._titleWidth,
      isStatusShow: this._isStatusShow,
      statusWidth: this._statusWidth,
      isAssigneeShow: this._isAssigneeShow,
      assigneeWidth: this._assigneeWidth,

      // フィルターの選択
      isFilteredByStatus: this._isFilteredByStatus,
      isFilteredByAssignee: this._isFilteredByAssignee,
      isFilteredByResource: this._isFilteredByResource,
      isFilteredByLabel: this._isFilteredByLabel,
      filteredStatusIDs: this._filteredStatusIDs,
      filteredAssigneeIDs: this._filteredAssigneeIDs,
      filteredResourceIDs: this._filteredResourceIDs,
      filteredLabelIDs: this._filteredLabelIDs,

      // 行の高さ
      issueRowHeight: this._issueRowHeight,

      // 強調表示
      isHighlightedToday: this._isHighlightedToday,
      isHighlightedHoliday: this._isHighlightedHoliday,

      // 特殊な表示
      isMilestoneShowOnlyWithIssue: this._isMilestoneShowOnlyWithIssue,
      isMilestoneShowOnlyOpened: this._isMilestoneShowOnlyOpened,
      isMilestoneInlineMode: this._isMilestoneInlineMode,
    };

    return from(window.electronAPI.writeViewConfig(config));
  }

  /**
   * 設定変更を通知
   */
  private notifyViewConfigChange(): void {
    this.viewConfigChange$.next();
  }
}
