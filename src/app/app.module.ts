import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { AppComponent } from './app.component';
import { HeaderComponent } from './header/header.component';
import { ChartAreaComponent } from './chart-area/chart-area.component';
import { IssueRowComponent } from './chart-area/issue-row/issue-row.component';
import { IssueColumnComponent } from './chart-area/issue-column/issue-column.component';
import { IssueDetailDialogComponent } from './issue-detail-dialog/issue-detail-dialog.component';

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    ChartAreaComponent,
    IssueRowComponent,
    IssueColumnComponent,
    IssueDetailDialogComponent,
  ],
  imports: [BrowserModule, FormsModule, CommonModule, DragDropModule],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
