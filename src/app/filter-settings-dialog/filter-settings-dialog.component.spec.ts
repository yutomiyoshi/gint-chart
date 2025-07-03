import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FilterSettingsDialogComponent } from './filter-settings-dialog.component';

describe('FilterSettingsDialogComponent', () => {
  let component: FilterSettingsDialogComponent;
  let fixture: ComponentFixture<FilterSettingsDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FilterSettingsDialogComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(FilterSettingsDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
