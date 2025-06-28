import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ToastHistoryDialogComponent } from './toast-history-dialog.component';

describe('ToastHistoryDialogComponent', () => {
  let component: ToastHistoryDialogComponent;
  let fixture: ComponentFixture<ToastHistoryDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ToastHistoryDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ToastHistoryDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
