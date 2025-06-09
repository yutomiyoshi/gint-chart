import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AppComponent } from './app.component';
import { HeaderComponent } from './header/header.component';
import { ChartAreaComponent } from './chart-area/chart-area.component';
import { IssueRowComponent } from './chart-area/issue-row/issue-row.component';
import { CalendarComponent } from './chart-area/calendar/calendar.component';

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    ChartAreaComponent,
    IssueRowComponent,
    CalendarComponent,
  ],
  imports: [BrowserModule, FormsModule, CommonModule],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
