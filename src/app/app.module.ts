import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { AppComponent } from '@src/app/app.component';
import { HeaderComponent } from '@src/app/header/header.component';
import { ChartAreaComponent } from '@src/app/chart-area/chart-area.component';
import { IssueRowComponent } from '@src/app/chart-area/issue-row/issue-row.component';
import { IssueColumnComponent } from '@src/app/chart-area/issue-column/issue-column.component';
import { IssueDetailDialogComponent } from '@src/app/issue-detail-dialog/issue-detail-dialog.component';
import { SwitchToggleComponent } from '@src/app/design/switch-toggle/switch-toggle.component';
import { ToastComponent } from '@src/app/toast/toast.component';
import { ToastHistoryDialogComponent } from '@src/app/toast-history-dialog/toast-history-dialog.component';
import { StatusSelectorDialogComponent } from '@src/app/status-selector-dialog/status-selector-dialog.component';
import { AssigneeSelectorDialogComponent } from '@src/app/assignee-selector-dialog/assignee-selector-dialog.component';
import { IssueIidPipe } from '@src/app/chart-area/issue-row/issue-iid.pipe';

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    ChartAreaComponent,
    IssueRowComponent,
    IssueColumnComponent,
    IssueDetailDialogComponent,
    ToastComponent,
    ToastHistoryDialogComponent,
    StatusSelectorDialogComponent,
    AssigneeSelectorDialogComponent,
  ],
  imports: [
    BrowserModule,
    FormsModule,
    CommonModule,
    DragDropModule,
    SwitchToggleComponent,
    IssueIidPipe,
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
