import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AppComponent } from './app.component';
import { HeaderComponent } from './header/header.component';
import { FooterComponent } from './footer/footer.component';
import { ChartAreaComponent } from './chart-area/chart-area.component';
import { NgxGanttModule } from '@worktile/gantt';

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    FooterComponent,
    ChartAreaComponent,
  ],
  imports: [BrowserModule, CommonModule, FormsModule, NgxGanttModule],
  bootstrap: [AppComponent],
})
export class AppModule {}
