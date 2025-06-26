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
import { SwitchToggleComponent } from './design/switch-toggle/switch-toggle.component';
import { ToastComponent } from './toast/toast.component';
import { ToastHistoryDialogComponent } from './toast-history-dialog/toast-history-dialog.component';

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
  ],
  imports: [
    BrowserModule,
    FormsModule,
    CommonModule,
    DragDropModule,
    SwitchToggleComponent,
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
