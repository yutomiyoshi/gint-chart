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
   * マイルストーンカレンダー内表示
   * マイルストーンを行としてではなく、カレンダーの縦線として表示する
   */
  private _isMilestoneInlineMode = false;

  /**
   * 強調表示
   */
  private _isHighlightedToday = true;
  private _isHighlightedHoliday = true;
}
