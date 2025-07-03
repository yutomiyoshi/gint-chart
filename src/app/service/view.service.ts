import { Injectable } from '@angular/core';
import {
  assigneeWidthDefault,
  statusWidthDefault,
  titleWidthDefault,
} from '../chart-area/issue-column/issue-column-view.const';
// XXX ↑　ここら辺のマネジメントもサービスの管轄としたい

@Injectable({
  providedIn: 'root',
})
export class ViewService {
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
  private _filteredStatusIDs: number[] = [];
  private _isFilteredByAssignee = false;
  private _filteredAssigneeIDs: number[] = [];
  private _isFilteredByResource = false;
  private _filteredResourceIDs: number[] = [];
  private _isFilteredByLabel = false;
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
   * - マイルストーンの縦線をカレンダーの縦線として表示する
   */
  private _isMilestoneShowOnlyWithIssue = false;
  private _isMilestoneInlineMode = false;

  // ゲッターとセッター
  get isTitleShow(): boolean {
    return this._isTitleShow;
  }
  set isTitleShow(value: boolean) {
    this._isTitleShow = value;
  }

  get titleWidth(): number {
    return this._titleWidth;
  }
  set titleWidth(value: number) {
    this._titleWidth = value;
  }

  get isStatusShow(): boolean {
    return this._isStatusShow;
  }
  set isStatusShow(value: boolean) {
    this._isStatusShow = value;
  }

  get statusWidth(): number {
    return this._statusWidth;
  }
  set statusWidth(value: number) {
    this._statusWidth = value;
  }

  get isAssigneeShow(): boolean {
    return this._isAssigneeShow;
  }
  set isAssigneeShow(value: boolean) {
    this._isAssigneeShow = value;
  }

  get assigneeWidth(): number {
    return this._assigneeWidth;
  }
  set assigneeWidth(value: number) {
    this._assigneeWidth = value;
  }

  get isFilteredByStatus(): boolean {
    return this._isFilteredByStatus;
  }
  set isFilteredByStatus(value: boolean) {
    this._isFilteredByStatus = value;
  }

  get filteredStatusIDs(): number[] {
    return this._filteredStatusIDs;
  }
  set filteredStatusIDs(value: number[]) {
    this._filteredStatusIDs = value;
  }

  get isFilteredByAssignee(): boolean {
    return this._isFilteredByAssignee;
  }
  set isFilteredByAssignee(value: boolean) {
    this._isFilteredByAssignee = value;
  }

  get filteredAssigneeIDs(): number[] {
    return this._filteredAssigneeIDs;
  }
  set filteredAssigneeIDs(value: number[]) {
    this._filteredAssigneeIDs = value;
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
    this._isFilteredByLabel = value;
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
    this._issueRowHeight = value;
  }

  get isHighlightedToday(): boolean {
    return this._isHighlightedToday;
  }
  set isHighlightedToday(value: boolean) {
    this._isHighlightedToday = value;
  }

  get isHighlightedHoliday(): boolean {
    return this._isHighlightedHoliday;
  }
  set isHighlightedHoliday(value: boolean) {
    this._isHighlightedHoliday = value;
  }

  get isMilestoneShowOnlyWithIssue(): boolean {
    return this._isMilestoneShowOnlyWithIssue;
  }
  set isMilestoneShowOnlyWithIssue(value: boolean) {
    this._isMilestoneShowOnlyWithIssue = value;
  }

  get isMilestoneInlineMode(): boolean {
    return this._isMilestoneInlineMode;
  }
  set isMilestoneInlineMode(value: boolean) {
    this._isMilestoneInlineMode = value;
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
}
