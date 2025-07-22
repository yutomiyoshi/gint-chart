export interface ViewConfig {
  // カラムの選択
  isTitleShow?: boolean;
  titleWidth?: number;
  isStatusShow?: boolean;
  statusWidth?: number;
  isAssigneeShow?: boolean;
  assigneeWidth?: number;

  // フィルターの選択
  isFilteredByStatus?: boolean;
  isFilteredByAssignee?: boolean;
  isFilteredByResource?: boolean;
  isFilteredByLabel?: boolean;
  filteredStatusIDs?: number[];
  filteredAssigneeIDs?: number[];
  filteredResourceIDs?: number[];
  filteredLabelIDs?: number[];

  // 行の高さ
  issueRowHeight?: number;

  // 強調表示
  isHighlightedToday?: boolean;
  isHighlightedHoliday?: boolean;

  // 特殊な表示
  isMilestoneShowOnlyWithIssue?: boolean;
  isMilestoneShowOnlyOpened?: boolean;
  isMilestoneInlineMode?: boolean;
} 